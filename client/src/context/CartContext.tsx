import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from "react";
import { Product, ProductOption, CartItem } from "../types";
import api from "../api/axios";

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product, options: ProductOption[], quantity: number) => void;
  removeFromCart: (cartId: string) => void;
  updateQuantity: (cartId: string, delta: number) => void;
  clearCart: () => void;
  checkout: (customerName?: string) => Promise<{ id: number; total_price: number; status: string }>;
  cartTotal: number;
  cartCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

function generateCartId(productId: number, options: ProductOption[]): string {
  const optionKey = options
    .map((o) => `${o.group}:${o.name}`)
    .sort()
    .join("|");
  return `${productId}_${optionKey}`;
}

export function calcItemTotal(basePrice: number, options: ProductOption[], quantity: number): number {
  const optionsPrice = options.reduce((sum, o) => sum + o.price, 0);
  return (basePrice + optionsPrice) * quantity;
}

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    const stored = localStorage.getItem("cart");
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = useCallback(
    (product: Product, options: ProductOption[], quantity: number) => {
      const cartId = generateCartId(product.id, options);

      setCartItems((prev) => {
        const existing = prev.find((item) => item.cartId === cartId);
        if (existing) {
          return prev.map((item) =>
            item.cartId === cartId
              ? {
                ...item,
                quantity: item.quantity + quantity,
                totalPrice: calcItemTotal(
                  item.base_price,
                  item.selectedOptions,
                  item.quantity + quantity
                ),
              }
              : item
          );
        }

        const newItem: CartItem = {
          ...product,
          cartId,
          selectedOptions: options,
          quantity,
          totalPrice: calcItemTotal(product.base_price, options, quantity),
        };
        return [...prev, newItem];
      });
    },
    []
  );

  const removeFromCart = useCallback((cartId: string) => {
    setCartItems((prev) => prev.filter((item) => item.cartId !== cartId));
  }, []);

  const updateQuantity = useCallback((cartId: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.cartId !== cartId) return item;
          const newQty = item.quantity + delta;
          if (newQty <= 0) return null;
          return {
            ...item,
            quantity: newQty,
            totalPrice: calcItemTotal(item.base_price, item.selectedOptions, newQty),
          };
        })
        .filter(Boolean) as CartItem[]
    );
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  // ✅ แก้ฟังก์ชันนี้: รับ customerName แล้วส่งไปให้ API
  const checkout = useCallback(async (customerName?: string) => {
    const payload = cartItems.map((item) => ({
      id: item.id,
      quantity: item.quantity,
      selectedOptions: item.selectedOptions,
      base_price: item.base_price,
      totalPrice: item.totalPrice,
    }));

    // ส่งทั้ง items และ customerName (ถ้ามี)
    const res = await api.post("/api/orders", {
      items: payload,
      customerName
    });

    setCartItems([]);
    return res.data.order;
  }, [cartItems]);

  const cartTotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.totalPrice, 0),
    [cartItems]
  );

  const cartCount = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.quantity, 0),
    [cartItems]
  );

  return (
    <CartContext.Provider
      value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart, checkout, cartTotal, cartCount }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
};