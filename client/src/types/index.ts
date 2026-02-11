export interface Product {
  id: number;
  name: string;
  base_price: number;
  image_url: string | null;
  category: string;
  stock: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: number;
  username: string;
  role: "admin" | "customer";
}

export interface ProductOption {
  name: string;
  price: number;
  group: string;
}

export interface CartItem extends Product {
  cartId: string;
  selectedOptions: ProductOption[];
  quantity: number;
  totalPrice: number;
}
