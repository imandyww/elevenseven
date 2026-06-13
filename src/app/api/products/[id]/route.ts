import { NextResponse } from "next/server";
import { serializeProduct, storeMetadata } from "@/lib/product-catalog";
import { getProduct } from "@/lib/products";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const product = getProduct(id);

  if (!product) {
    return NextResponse.json(
      {
        error: "PRODUCT_NOT_FOUND",
        message: `No product with id, slug, or sku "${id}". Try GET /products.json for the full catalog.`,
      },
      { status: 404 },
    );
  }

  return NextResponse.json({
    store: storeMetadata,
    product: serializeProduct(product),
  });
}
