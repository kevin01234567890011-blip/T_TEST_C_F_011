import { requireAdmin } from "@/lib/auth";
import { AdminDashboard } from "@/components/AdminDashboard";
import type { Product, Profile, Order, OrderItem } from "@/types/database";

export default async function AdminPage() {
  const { supabase } = await requireAdmin();
  const [{ data: productsData, error: productsError }, { data: profilesData, error: profilesError }, { data: ordersData, error: ordersError }] = await Promise.all([
    supabase.from("products").select("*").order("id"),
    supabase.from("profiles").select("*").order("created_at", { ascending: false }),
    supabase.from("orders").select("*").order("created_at", { ascending: false })
  ]);
  if (productsError) throw new Error(productsError.message);
  if (profilesError) throw new Error(profilesError.message);
  if (ordersError) throw new Error(ordersError.message);
  const orders = (ordersData ?? []) as Order[];
  const orderIds = orders.map((order) => order.id);
  const { data: itemsData, error: itemsError } = orderIds.length ? await supabase.from("order_items").select("*").in("order_id", orderIds) : { data: [], error: null };
  if (itemsError) throw new Error(itemsError.message);
  const items = (itemsData ?? []) as OrderItem[];
  const productIds = [...new Set(items.map((item) => item.product_id))];
  const { data: itemProducts, error: itemProductsError } = productIds.length ? await supabase.from("products").select("id,name").in("id", productIds) : { data: [], error: null };
  if (itemProductsError) throw new Error(itemProductsError.message);
  const products = (productsData ?? []) as Product[];
  const profiles = (profilesData ?? []) as Profile[];
  const orderRows = orders.map((order) => {
    const profile = profiles.find((row) => row.id === order.user_id);
    const orderItems = items
      .filter((item) => item.order_id === order.id)
      .map((item) => ({
        ...item,
        product: (itemProducts ?? []).find((product) => product.id === item.product_id) ?? null
      }));
    return {
      ...order,
      profile: profile ? { first_name: profile.first_name, last_name: profile.last_name, email: profile.email } : null,
      items: orderItems
    };
  });
  return <div className="space-y-6"><div><p className="text-sm text-gray-500">Administration</p><h1 className="text-3xl font-bold">Dashboard</h1></div><AdminDashboard initialProducts={products} initialProfiles={profiles} initialOrders={orderRows} /></div>;
}
