import { NextResponse } from "next/server";
import { productCatalogPayload } from "@/lib/product-catalog";

export function GET() {
  const catalog = productCatalogPayload();
  return NextResponse.json({
    ...catalog,
    count: catalog.products.length,
  });
}
