import { NextResponse } from "next/server";
import { products } from "@/lib/products";

export function GET() {
  return NextResponse.json({
    count: products.length,
    products,
  });
}
