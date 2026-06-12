import { NextResponse } from "next/server";
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
        message: `No product with id or sku "${id}". Try GET /api/products for the full catalog.`,
      },
      { status: 404 },
    );
  }

  return NextResponse.json(product);
}
