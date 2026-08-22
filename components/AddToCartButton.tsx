"use client";

import { addToCart } from "@/components/CartDrawer";

export function AddToCartButton({ productId }: { productId: number }) {
  return <button onClick={() => addToCart(productId)} className="rounded-xl bg-gray-900 px-4 py-2.5 font-medium text-white">Add to cart</button>;
}
