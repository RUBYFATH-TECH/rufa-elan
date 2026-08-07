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

const productSchema = z
  .object({
    name: z.string().min(1),
    slug: z.string().min(1),
    sku: z.string().min(1),
    description: z.string().optional().nullable(),
    category_id: z.string().uuid().optional(),
    category_name: z.string().min(1).optional(),
    regular_price: z.number().gte(0),
    sale_price: z.number().gte(0).nullable().optional(),
    featured: z.boolean().default(false),
    status: z.enum(["active", "draft", "archived"]).default("active"),
    image_urls: z.array(z.string().url()).optional()
  })
  .refine((data) => !!data.category_id || !!data.category_name, {
    message: "Category id or category name is required",
    path: ["category_name"]
  });

export async function GET() {
  const adminResult = await getAdminSupabase();
  if ("error" in adminResult) {
    const status = adminResult.error === "unauthorized" ? 401 : 403;
    return NextResponse.json({ admin: false }, { status });
  }

  const { supabase } = adminResult;
  const { data, error } = await supabase
    .from("products")
    .select(
      `id, name, slug, sku, description, regular_price, sale_price, featured, status, category_id, categories(name), product_images(url, position)`
    )
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  return NextResponse.json(
    data?.map((product: any) => ({
      ...product,
      category_name: product.categories?.name ?? "Uncategorized",
      image_urls: (product.product_images ?? [])
        .sort((a: any, b: any) => a.position - b.position)
        .map((image: any) => image.url)
    })) ?? []
  );
}

export async function POST(request: Request) {
  const adminResult = await getAdminSupabase();
  if ("error" in adminResult) {
    const status = adminResult.error === "unauthorized" ? 401 : 403;
    return NextResponse.json({ admin: false }, { status });
  }

  const body = await request.json().catch(() => null);
  const parsed = productSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.errors[0].message }, { status: 400 });
  }

  const { supabase } = adminResult;
  const { image_urls, category_id, category_name, ...productData } = parsed.data;
  const resolvedCategoryId = await categoryResolver(supabase, category_id, category_name);

  if (!resolvedCategoryId) {
    return NextResponse.json({ message: "Unable to resolve category." }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("products")
    .insert({ ...productData, category_id: resolvedCategoryId })
    .select()
    .single();

  if (error || !data) {
    return NextResponse.json({ message: error?.message ?? "Unable to create product." }, { status: 500 });
  }

  if (image_urls?.length) {
    const images = image_urls.map((url, index) => ({
      product_id: data.id,
      url,
      position: index
    }));
    await supabase.from("product_images").insert(images);
  }

  return NextResponse.json(data, { status: 201 });
}
