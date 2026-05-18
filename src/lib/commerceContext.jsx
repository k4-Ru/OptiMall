import { createContext, useContext, useMemo, useState } from 'react';

const CART_KEY = 'optimall_cart_v1';
const ORDERS_KEY = 'optimall_orders_v1';

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore storage failures
  }
}

const CommerceContext = createContext(null);

export function CommerceProvider({ children }) {
  const [cart, setCart] = useState(() => readJson(CART_KEY, []));
  const [orders, setOrders] = useState(() => readJson(ORDERS_KEY, []));

  function persistCart(next) {
    setCart(next);
    writeJson(CART_KEY, next);
  }

  function persistOrders(next) {
    setOrders(next);
    writeJson(ORDERS_KEY, next);
  }

  function addToCart(product, qty = 1) {
    const safeQty = Math.max(1, Number(qty) || 1);
    const next = [...cart];
    const idx = next.findIndex((i) => Number(i.id) === Number(product.id));
    if (idx >= 0) {
      next[idx] = { ...next[idx], qty: next[idx].qty + safeQty };
    } else {
      next.push({
        id: product.id,
        name: product.name,
        price: Number(product.price || 0),
        image_path: product.image_path || null,
        category: product.category || null,
        qty: safeQty,
      });
    }
    persistCart(next);
  }

  function updateQty(productId, qty) {
    const nextQty = Math.max(1, Number(qty) || 1);
    const next = cart.map((item) => (Number(item.id) === Number(productId) ? { ...item, qty: nextQty } : item));
    persistCart(next);
  }

  function removeFromCart(productId) {
    persistCart(cart.filter((item) => Number(item.id) !== Number(productId)));
  }

  function clearCart() {
    persistCart([]);
  }

  function checkout() {
    if (!cart.length) return null;
    const total = cart.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.qty || 1), 0);
    const order = {
      id: `ORD-${Date.now()}`,
      created_at: new Date().toISOString(),
      status: 'paid',
      payment_status: 'done',
      items: cart,
      total_amount: Number(total.toFixed(2)),
      tracking_steps: [
        { key: 'paid', label: 'Payment Confirmed', done: true },
        { key: 'processing', label: 'Preparing Items', done: true },
        { key: 'shipped', label: 'Shipped', done: false },
        { key: 'delivered', label: 'Delivered', done: false },
      ],
    };
    const nextOrders = [order, ...orders];
    persistOrders(nextOrders);
    clearCart();
    return order;
  }

  const cartCount = cart.reduce((sum, item) => sum + Number(item.qty || 1), 0);
  const cartTotal = cart.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.qty || 1), 0);

  const value = useMemo(
    () => ({
      cart,
      orders,
      cartCount,
      cartTotal,
      addToCart,
      updateQty,
      removeFromCart,
      clearCart,
      checkout,
    }),
    [cart, orders, cartCount, cartTotal]
  );

  return <CommerceContext.Provider value={value}>{children}</CommerceContext.Provider>;
}

export function useCommerce() {
  const ctx = useContext(CommerceContext);
  if (!ctx) throw new Error('useCommerce must be used inside CommerceProvider');
  return ctx;
}
