import { productCatalogPayload } from "@/lib/product-catalog";

export const dynamic = "force-static";

export function GET() {
  return Response.json(productCatalogPayload());
}
