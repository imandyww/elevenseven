export type Category =
  | "Verification"
  | "Memory"
  | "Reasoning"
  | "Tools"
  | "Prompting"
  | "Testing"
  | "Debugging"
  | "Speed"
  | "Reputation"
  | "Personality"
  | "Trust"
  | "Evaluation"
  | "Observability"
  | "Compliance"
  | "Procurement"
  | "Data"
  | "Reliability"
  | "Security"
  | "Integration";

export interface ProductManifest {
  upgrade_type: string;
  allowed_uses: number;
  expires: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  price: number;
  category: Category;
  description: string;
  longDescription: string;
  icon: string;
  useCase: string;
  buyerSignal?: string;
  revenueTier?: "micro" | "growth" | "fleet";
  manifest: ProductManifest;
}

export interface CartItem {
  productId: string;
  quantity: number;
}

export type OrderStatus = "completed" | "pending" | "failed";

export interface OrderItem {
  sku: string;
  name: string;
  quantity: number;
  unit_price: number;
}

export interface OrderManifest {
  upgrade_type: string;
  allowed_uses: number;
  expires: string;
}

export interface Order {
  orderId: string;
  agentId: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  createdAt: string;
  manifest: OrderManifest;
}

/** Snake_case order shape returned by the public agent API. */
export interface WireOrder {
  order_id: string;
  agent_id: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  created_at: string;
  manifest: OrderManifest;
}
