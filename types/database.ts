export type UserRole = "CUSTOMER" | "ADMIN";
export type OrderStatus = "PENDING" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "CANCELLED";
export type PaymentMethod = "CASH_ON_DELIVERY";

export type Product = {
  id: number;
  name: string;
  description: string;
  price: number | string;
  image_url: string;
  created_at: string;
  updated_at: string;
};

export type Profile = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
};

export type Order = {
  id: string;
  user_id: string;
  total_amount: number | string;
  status: OrderStatus;
  payment_method: PaymentMethod;
  phone: string;
  address: string;
  created_at: string;
  updated_at: string;
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: number;
  quantity: number;
  unit_price: number | string;
};

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, "created_at" | "updated_at"> & Partial<Pick<Profile, "created_at" | "updated_at">>;
        Update: Partial<Omit<Profile, "id" | "created_at" | "updated_at">> & Partial<Pick<Profile, "updated_at">>;
        Relationships: [];
      };
      products: {
        Row: Product;
        Insert: Omit<Product, "id" | "created_at" | "updated_at"> & Partial<Pick<Product, "id" | "created_at" | "updated_at">>;
        Update: Partial<Omit<Product, "id" | "created_at" | "updated_at">> & Partial<Pick<Product, "updated_at">>;
        Relationships: [];
      };
      orders: {
        Row: Order;
        Insert: Omit<Order, "id" | "created_at" | "updated_at"> & Partial<Pick<Order, "id" | "created_at" | "updated_at">>;
        Update: Partial<Omit<Order, "id" | "user_id" | "created_at" | "updated_at">> & Partial<Pick<Order, "updated_at">>;
        Relationships: [];
      };
      order_items: {
        Row: OrderItem;
        Insert: Omit<OrderItem, "id"> & Partial<Pick<OrderItem, "id">>;
        Update: Partial<Omit<OrderItem, "id" | "order_id">>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      create_order: {
        Args: { p_items: Array<{ product_id: number; quantity: number }>; p_phone: string; p_address: string };
        Returns: string;
      };
    };
    Enums: {
      user_role: UserRole;
      order_status: OrderStatus;
      payment_method: PaymentMethod;
    };
    CompositeTypes: Record<string, never>;
  };
};
