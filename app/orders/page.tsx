import { requireUser } from "@/lib/auth";
import { dateTime, money } from "@/lib/format";
import type { Order, OrderItem, Product } from "@/types/database";
import { CancelOrderButton } from "@/components/CancelOrderButton";

export default async function OrdersPage() {
  const { supabase, user } = await requireUser();
  const { data: ordersData, error } = await supabase.from("orders").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  const orders = (ordersData ?? []) as Order[];
  const ids = orders.map((order) => order.id);
  const { data: itemsData, error: itemsError } = ids.length ? await supabase.from("order_items").select("*").in("order_id", ids) : { data: [], error: null };
  if (itemsError) throw new Error(itemsError.message);
  const items = (itemsData ?? []) as OrderItem[];
  const productIds = [...new Set(items.map((item) => item.product_id))];
  const { data: productsData, error: productsError } = productIds.length ? await supabase.from("products").select("id,name").in("id", productIds) : { data: [], error: null };
  if (productsError) throw new Error(productsError.message);
  const products = (productsData ?? []) as Pick<Product, "id" | "name">[];
  return <div className="space-y-6"><h1 className="text-3xl font-bold">Your orders</h1>{!orders.length ? <div className="rounded-xl bg-white p-6 ring-1 ring-gray-200">No orders yet.</div> : <div className="space-y-5">{orders.map((order) => <article key={order.id} className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200"><div className="flex flex-col justify-between gap-2 sm:flex-row"><div><p className="font-semibold">Order {order.id.slice(0, 8)}</p><p className="text-sm text-gray-500">{dateTime(order.created_at)}</p></div><div className="flex items-center gap-3"><span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium">{order.status}</span><span className="font-semibold">{money(order.total_amount)}</span></div></div><div className="mt-4 space-y-2">{items.filter((item) => item.order_id === order.id).map((item) => <div key={item.id} className="flex justify-between text-sm"><span>{products.find((product) => product.id === item.product_id)?.name ?? `Product #${item.product_id}`} × {item.quantity}</span><span>{money(Number(item.unit_price) * item.quantity)}</span></div>)}</div><div className="mt-4 border-t pt-4 text-sm text-gray-600"><p><span className="font-medium">Phone:</span> {order.phone}</p><p><span className="font-medium">Address:</span> {order.address}</p></div>{order.status === "PENDING" && <div className="mt-4"><CancelOrderButton orderId={order.id} /></div>}</article>)}</div>}</div>;
}
