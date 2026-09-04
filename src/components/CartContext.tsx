"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type CartItem = {
  id: string; // unique item id in cart
  productId?: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  selectedColor?: string;
  selectedSize?: string;
  selectedModel?: string;
};

type CartContextType = {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, "quantity">) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("7ouro_cart");
    if (saved) {
      try {
        setItems(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse cart", e);
      }
    }
  }, []);

  // Save to localStorage when items change
  useEffect(() => {
    localStorage.setItem("7ouro_cart", JSON.stringify(items));
  }, [items]);

  const addToCart = (product: Omit<CartItem, "quantity">) => {
    // Unique key considering variants
    const productId = product.productId || product.id;
    const variantKey = `${productId}${product.selectedColor ? `_c:${product.selectedColor}` : ""}${product.selectedSize ? `_s:${product.selectedSize}` : ""}${product.selectedModel ? `_m:${product.selectedModel}` : ""}`;

    setItems((prev) => {
      const existing = prev.find((item) => item.id === variantKey);
      if (existing) {
        return prev.map((item) =>
          item.id === variantKey
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [
        ...prev,
        {
          ...product,
          id: variantKey,
          productId,
          quantity: 1,
        },
      ];
    });
  };

  const removeFromCart = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(id);
      return;
    }
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        total,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    return {
      items: [] as CartItem[],
      addToCart: () => {},
      removeFromCart: () => {},
      updateQuantity: () => {},
      clearCart: () => {},
      total: 0,
    };
  }
  return context;
}
