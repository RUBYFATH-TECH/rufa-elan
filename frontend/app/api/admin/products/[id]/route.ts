import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSupabase } from "@/lib/admin-server";

const categoryResolver = async (supabase: any, category_id?: string, category_name?: string) => {
  if (category_id) {
    return category_id;
  }

  if (!category_name) {
    return null;
  }

  const existing = await supabase
    .from("categories")
    .select("id")
    .ilike("name", category_name)
    .maybeSingle();

  if (existing.error) {
    return null;
  }

  if (existing.data?.id) {
    return existing.data.id;
  }

  const slug = category_name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const { data: created, error: createError } = await supabase
    .from("categories")
    .insert({ name: category_name, slug })
    .select("id")
    .single();

  if (createError || !created?.id) {
    return null;
  }

  return created.id;
};

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  sku: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  category_id: z.string().uuid().optional(),
  category_name: z.string().min(1).optional(),
  regular_price: z.number().gte(0).optional(),
  sale_price: z.union([z.number().gte(0), z.null()]).optional(),
  featured: z.boolean().optional(),
  status: z.enum(["active", "draft", "archived"]).optional(),
  image_urls: z.array(z.string().url()).optional()
});

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ message: "Product ID is required." }, { status: 400 });
  }

  const adminResult = await getAdminSupabase();
  if ("error" in adminResult) {
    const status = adminResult.error === "unauthorized" ? 401 : 403;
    return NextResponse.json({ admin: false }, { status });
  }

  const body = await request.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.errors[0].message }, { status: 400 });
  }

  const { supabase } = adminResult;
  const { image_urls, category_id, category_name, ...updateData } = parsed.data;
  const resolvedCategoryId = await categoryResolver(supabase, category_id, category_name);

  if (category_name && !resolvedCategoryId) {
    return NextResponse.json({ message: "Unable to resolve category." }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("products")
    .update({ ...updateData, ...(resolvedCategoryId ? { category_id: resolvedCategoryId } : {}) })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  if (image_urls) {
    await supabase.from("product_images").delete().eq("product_id", id);
    if (image_urls.length) {
      const images = image_urls.map((url, index) => ({
        product_id: id,
        url,
        position: index
      }));
      await supabase.from("product_images").insert(images);
    }
  }

  if (!data) {
    return NextResponse.json({ message: "Product not found." }, { status: 404 });
  }

  return NextResponse.json(data);
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ message: "Product ID is required." }, { status: 400 });
  }

  const adminResult = await getAdminSupabase();
  if ("error" in adminResult) {
    const status = adminResult.error === "unauthorized" ? 401 : 403;
    return NextResponse.json({ admin: false }, { status });
  }

  const { supabase } = adminResult;
  await supabase.from("product_images").delete().eq("product_id", id);
  const { error } = await supabase.from("products").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
