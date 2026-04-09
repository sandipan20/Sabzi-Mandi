import { createContext, useContext, useState, ReactNode } from 'react';

export interface CartItem {
  id: string;
  name: string;
  nameHi: string;
  price: number;
  unit: string;
  quantity: number;
  image: string;
  type: 'retail' | 'bulk';
  farmer: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string, type: 'retail' | 'bulk') => void;
  updateQty: (id: string, type: 'retail' | 'bulk', qty: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType>({
  items: [],
  addItem: () => {},
  removeItem: () => {},
  updateQty: () => {},
  clearCart: () => {},
  totalItems: 0,
  totalPrice: 0,
});

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = (item: CartItem) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === item.id && i.type === item.type);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id && i.type === item.type
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        );
      }
      return [...prev, item];
    });
  };

  const removeItem = (id: string, type: 'retail' | 'bulk') => {
    setItems((prev) => prev.filter((i) => !(i.id === id && i.type === type)));
  };

  const updateQty = (id: string, type: 'retail' | 'bulk', qty: number) => {
    if (qty <= 0) {
      removeItem(id, type);
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.id === id && i.type === type ? { ...i, quantity: qty } : i))
    );
  };

  const clearCart = () => setItems([]);

  const totalItems = items.length; // count of distinct line items, not quantity units
  const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQty, clearCart, totalItems, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
