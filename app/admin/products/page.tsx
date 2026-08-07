"use client";

import { FormEvent, useEffect, useState, type ChangeEvent } from "react";
import { createClientComponentSupabaseClient } from "@/lib/supabase-client";

type Product = {
  id: string;
  name: string;
  slug: string;
  sku: string;
  description: string | null;
  category_id: string;
  category_name: string;
  regular_price: number;
  sale_price: number | null;
  image_urls?: string[];
};

type ProductFormValues = {
  name: string;
  description: string;
  category: string;
  regular_price: number;
  sale_price: number;
  image_urls: string[];
};

const BAG_TYPES = [
  "Handbags",
  "Tote bags",
  "Crossbags",
  "Purse",
  "Wallet",
  "Accessories"
];

const emptyProduct: ProductFormValues = {
  name: "",
  description: "",
  category: "",
  regular_price: 0,
  sale_price: 0,
  image_urls: [""]
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const supabase = createClientComponentSupabaseClient();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [formValues, setFormValues] = useState<ProductFormValues>({ ...emptyProduct });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<string[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const loadProducts = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/products");
    if (!res.ok) {
      setMessage("Unable to load products.");
      setLoading(false);
      return;
    }
    const data = await res.json();
    setProducts(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const resetForm = () => {
    setSelectedProduct(null);
    setFormValues({ ...emptyProduct });
    setShowForm(false);
    setMessage(null);
  };

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setFormValues({
      name: product.name,
      description: product.description ?? "",
      category: product.category_name,
      regular_price: product.regular_price,
      sale_price: product.sale_price ?? 0,
      image_urls: product.image_urls ?? []
    });
    setSelectedFiles([]);
    setFilePreviews([]);
    setShowForm(true);
    setMessage(null);
  };

  const handleImageSelection = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []).filter((file) => file.type.startsWith("image/"));
    if (!files.length) {
      return;
    }

    setSelectedFiles((current) => [...current, ...files]);
    setFilePreviews((current) => [
      ...current,
      ...files.map((file) => URL.createObjectURL(file))
    ]);
  };

  const removeSelectedFile = (index: number) => {
    setSelectedFiles((current) => current.filter((_, i) => i !== index));
    setFilePreviews((current) => current.filter((_, i) => i !== index));
  };

  const removeSavedImage = (index: number) => {
    setFormValues((current) => {
      const nextUrls = [...current.image_urls];
      nextUrls.splice(index, 1);
      return { ...current, image_urls: nextUrls };
    });
  };

  const uploadProductImages = async (files: File[]) => {
    const STORAGE_BUCKET = "product-images";
    const uploadedUrls: string[] = [];

    for (const file of files) {
      const filePath = `${STORAGE_BUCKET}/${Date.now()}-${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(filePath, file, { cacheControl: "3600", upsert: true });

      if (uploadError || !uploadData?.path) {
        setMessage(uploadError?.message ?? "Unable to upload selected image.");
        return null;
      }

      const { data: publicUrlData } = supabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(uploadData.path);

      if (!publicUrlData?.publicUrl) {
        setMessage("Unable to generate image URL.");
        return null;
      }

      uploadedUrls.push(publicUrlData.publicUrl);
    }

    return uploadedUrls;
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product? This action cannot be undone.")) {
      return;
    }

    setDeletingId(id);
    const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    setDeletingId(null);
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setMessage(data?.message ?? "Unable to delete product.");
      return;
    }
    setMessage("Product deleted successfully.");
    await loadProducts();
  };

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setMessage(null);

    const savedUrls = formValues.image_urls.filter((url) => url.trim().length > 0);
    let uploadedUrls: string[] = [];

    if (selectedFiles.length > 0) {
      const uploaded = await uploadProductImages(selectedFiles);
      if (!uploaded) {
        setSaving(false);
        return;
      }
      uploadedUrls = uploaded;
    }

    const payload = {
      name: formValues.name,
      slug: selectedProduct?.slug || formValues.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
      sku: selectedProduct?.sku || `SKU-${formValues.name.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6)}-${Date.now()}`,
      description: formValues.description || null,
      category_name: formValues.category,
      regular_price: Number(formValues.regular_price),
      sale_price: formValues.sale_price > 0 ? Number(formValues.sale_price) : null,
      image_urls: [...savedUrls, ...uploadedUrls]
    };

    const url = selectedProduct ? `/api/admin/products/${selectedProduct.id}` : "/api/admin/products";
    const method = selectedProduct ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    setSaving(false);
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setMessage(data?.message ?? "Unable to save product.");
      return;
    }

    setMessage(selectedProduct ? "Product updated successfully." : "Product created successfully.");
    resetForm();
    await loadProducts();
  };

  return (
    <section className="mx-auto max-w-7xl px-6 py-20 sm:px-8 lg:px-12">
      <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-soft">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-brand-700">Products</p>
            <h1 className="mt-4 text-3xl font-semibold text-slate-950">Manage inventory</h1>
            <p className="mt-2 text-slate-600">Create, update, and delete products for your online store.</p>
          </div>
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="rounded-full bg-brand-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-800"
          >
            Add new product
          </button>
        </div>

        {message ? <p className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">{message}</p> : null}

        {showForm ? (
          <form onSubmit={handleSave} className="mt-8 space-y-6 rounded-[2rem] border border-slate-200 bg-slate-50 p-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <label className="block text-sm text-slate-700">
                Bag type
                <select
                  value={formValues.category}
                  onChange={(event) => setFormValues({ ...formValues, category: event.target.value })}
                  className="mt-3 w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-brand-300"
                >
                  <option value="">Select bag type</option>
                  {BAG_TYPES.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </label>
              <label className="block text-sm text-slate-700">
                Bag name
                <input
                  value={formValues.name}
                  onChange={(event) => setFormValues({ ...formValues, name: event.target.value })}
                  className="mt-3 w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-brand-300"
                />
              </label>
              <label className="block text-sm text-slate-700">
                Regular price
                <input
                  type="number"
                  value={formValues.regular_price}
                  onChange={(event) => setFormValues({ ...formValues, regular_price: Number(event.target.value) })}
                  className="mt-3 w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-brand-300"
                />
              </label>
              <label className="block text-sm text-slate-700">
                Sale price
                <input
                  type="number"
                  value={formValues.sale_price}
                  onChange={(event) => setFormValues({ ...formValues, sale_price: Number(event.target.value) })}
                  className="mt-3 w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-brand-300"
                />
              </label>
              <label className="block text-sm text-slate-700 lg:col-span-2">
                Product description
                <textarea
                  value={formValues.description}
                  onChange={(event) => setFormValues({ ...formValues, description: event.target.value })}
                  className="mt-3 w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-brand-300"
                  rows={4}
                />
              </label>
              <div className="lg:col-span-2">
                <p className="text-sm font-semibold text-slate-800">Product images</p>
                <p className="mt-1 text-xs text-slate-500">Select image files directly from your device. These files will be uploaded when you save.</p>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageSelection}
                  className="mt-3 w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none file:mr-4 file:rounded-full file:border-0 file:bg-brand-700 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-brand-800"
                />
                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {formValues.image_urls.filter((url) => url.trim().length > 0).map((imageUrl, index) => (
                    <div key={`saved-${index}`} className="group overflow-hidden rounded-3xl border border-slate-200 bg-white relative">
                      <img
                        src={imageUrl}
                        alt={`Saved image ${index + 1}`}
                        className="h-28 w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeSavedImage(index)}
                        className="absolute right-2 top-2 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-red-700 shadow-sm transition hover:bg-white"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  {filePreviews.map((preview, index) => (
                    <div key={`preview-${index}`} className="group overflow-hidden rounded-3xl border border-slate-200 bg-white relative">
                      <img src={preview} alt={`Selected image ${index + 1}`} className="h-28 w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeSelectedFile(index)}
                        className="absolute right-2 top-2 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-red-700 shadow-sm transition hover:bg-white"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
                {selectedFiles.length > 0 ? (
                  <p className="mt-3 text-xs text-slate-500">{selectedFiles.length} file(s) selected for upload.</p>
                ) : null}
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={resetForm}
                className="rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-full bg-brand-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? "Saving..." : selectedProduct ? "Update product" : "Create product"}
              </button>
            </div>
          </form>
        ) : null}

        <div className="mt-8 overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead>
              <tr className="bg-slate-50">
                <th className="px-4 py-4 font-semibold text-slate-500">Image</th>
                <th className="px-4 py-4 font-semibold text-slate-500">Name</th>
                <th className="px-4 py-4 font-semibold text-slate-500">Bag type</th>
                <th className="px-4 py-4 font-semibold text-slate-500">Price</th>
                <th className="px-4 py-4 font-semibold text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6">
                    Loading products...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-slate-600">
                    No products found.
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="bg-white">
                    <td className="px-4 py-4">
                      {product.image_urls?.[0] ? (
                        <img
                          src={product.image_urls[0]}
                          alt={product.name}
                          className="h-16 w-20 rounded-2xl object-cover"
                        />
                      ) : (
                        <div className="flex h-16 w-20 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-xs text-slate-500">
                          No image
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4 text-slate-900">{product.name}</td>
                    <td className="px-4 py-4 text-slate-600">{product.category_name}</td>
                    <td className="px-4 py-4 text-slate-900">GHS {product.sale_price ?? product.regular_price}</td>
                    <td className="px-4 py-4 space-x-2">
                      <button
                        type="button"
                        onClick={() => handleEdit(product)}
                        className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(product.id)}
                        disabled={deletingId === product.id}
                        className="rounded-full border border-red-300 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {deletingId === product.id ? "Deleting..." : "Delete"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
