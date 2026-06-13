import type { MetadataRoute } from "next";
import { products } from "@/lib/products";
import { revenueOffers } from "@/lib/revenue-offers";
import { absoluteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), lastModified, changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl("/start"), lastModified, changeFrequency: "weekly", priority: 0.95 },
    {
      url: absoluteUrl("/.well-known/agent-commerce.json"),
      lastModified,
      changeFrequency: "weekly",
      priority: 0.95,
    },
    {
      url: absoluteUrl("/.well-known/agent-catalog.json"),
      lastModified,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: absoluteUrl("/.well-known/openapi.json"),
      lastModified,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    { url: absoluteUrl("/products"), lastModified, changeFrequency: "weekly", priority: 0.95 },
    { url: absoluteUrl("/products.json"), lastModified, changeFrequency: "weekly", priority: 0.95 },
    { url: absoluteUrl("/shop"), lastModified, changeFrequency: "weekly", priority: 0.7 },
    { url: absoluteUrl("/pilot"), lastModified, changeFrequency: "weekly", priority: 0.9 },
    { url: absoluteUrl("/docs"), lastModified, changeFrequency: "monthly", priority: 0.8 },
    { url: absoluteUrl("/about"), lastModified, changeFrequency: "monthly", priority: 0.5 },
    { url: absoluteUrl("/terms"), lastModified, changeFrequency: "monthly", priority: 0.3 },
    { url: absoluteUrl("/privacy"), lastModified, changeFrequency: "monthly", priority: 0.3 },
    { url: absoluteUrl("/refunds"), lastModified, changeFrequency: "monthly", priority: 0.3 },
    { url: absoluteUrl("/contact"), lastModified, changeFrequency: "monthly", priority: 0.3 },
  ];

  const productPages: MetadataRoute.Sitemap = products.map((product) => ({
    url: absoluteUrl(`/products/${product.slug}`),
    lastModified,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const offerPages: MetadataRoute.Sitemap = revenueOffers().map((offer) => ({
    url: offer.url,
    lastModified,
    changeFrequency: "weekly",
    priority: 0.95,
  }));

  return [...staticPages, ...offerPages, ...productPages];
}
