import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';

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

function makeOrder(items) {
  const total = items.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.qty || 1), 0);
  return {
    id: `ORD-${Date.now()}`,
    created_at: new Date().toISOString(),
    status: 'paid',
    payment_status: 'done',
    items,
    total_amount: Number(total.toFixed(2)),
    tracking_steps: [
      { key: 'paid', label: 'Payment Confirmed', done: true },
      { key: 'processing', label: 'Preparing Items', done: true },
      { key: 'shipped', label: 'Shipped', done: false },
      { key: 'delivered', label: 'Delivered', done: false },
    ],
  };
}

export function CommerceProvider({ children }) {
  const [cart, setCart] = useState(() => readJson(CART_KEY, []));
  const [orders, setOrders] = useState(() => readJson(ORDERS_KEY, []));
  const lastPointerRef = useRef(null);

  useEffect(() => {
    function capturePointer(event) {
      lastPointerRef.current = {
        x: Number(event.clientX || 0),
        y: Number(event.clientY || 0),
        ts: Date.now(),
      };
    }

    window.addEventListener('pointerdown', capturePointer, { passive: true });
    return () => {
      window.removeEventListener('pointerdown', capturePointer);
    };
  }, []);

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
    const idx = next.findIndex((i) => i.entry_type !== 'bundle' && Number(i.id) === Number(product.id));
    if (idx >= 0) {
      next[idx] = { ...next[idx], qty: next[idx].qty + safeQty };
    } else {
      next.push({
        id: product.id,
        entry_type: 'item',
        name: product.name,
        price: Number(product.price || 0),
        image_path: product.image_path || null,
        category: product.category || null,
        qty: safeQty,
      });
    }
    persistCart(next);

    const pointer = lastPointerRef.current;
    if (pointer && Date.now() - Number(pointer.ts || 0) < 2000) {
      window.dispatchEvent(new CustomEvent('optimall:cart-add', {
        detail: {
          x: pointer.x,
          y: pointer.y,
        },
      }));
    }
  }

  function addBundleToCart(bundleItems, options = {}) {
    if (!Array.isArray(bundleItems) || !bundleItems.length) return null;
    const normalizedItems = bundleItems
      .map((item) => ({
        id: Number(item?.id || 0),
        name: String(item?.name || 'Bundle Item'),
        price: Number(item?.price || 0),
        image_path: item?.image_path || null,
        category: item?.category || null,
        qty: Math.max(1, Number(item?.qty || 1)),
      }))
      .filter((item) => item.id > 0 && item.price >= 0);

    if (!normalizedItems.length) return null;

    const fallbackTotal = normalizedItems.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.qty || 1), 0);
    const declaredTotal = Number(options?.total || 0);
    const bundleTotal = declaredTotal > 0 ? declaredTotal : fallbackTotal;
    const bundleName = String(options?.name || 'Smart Bundle');
    const bundleId = `BND-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    const entry = {
      id: bundleId,
      entry_type: 'bundle',
      name: bundleName,
      price: Number(bundleTotal.toFixed(2)),
      image_path: normalizedItems[0]?.image_path || null,
      category: 'Bundle',
      qty: 1,
      bundle_items: normalizedItems,
      bundle_meta: {
        scenario_key: options?.scenarioKey || null,
      },
    };

    persistCart([...cart, entry]);

    const pointer = lastPointerRef.current;
    if (pointer && Date.now() - Number(pointer.ts || 0) < 2000) {
      window.dispatchEvent(new CustomEvent('optimall:cart-add', {
        detail: {
          x: pointer.x,
          y: pointer.y,
        },
      }));
    }
    return entry;
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
    const order = makeOrder(cart);
    const nextOrders = [order, ...orders];
    persistOrders(nextOrders);
    clearCart();
    return order;
  }

  function checkoutItem(productId) {
    const targetId = Number(productId);
    const item = cart.find((entry) => Number(entry.id) === targetId);
    if (!item) return null;

    const total = Number(item.price || 0) * Number(item.qty || 1);
    const order = {
      ...makeOrder([item]),
      total_amount: Number(total.toFixed(2)),
    };

    persistOrders([order, ...orders]);
    persistCart(cart.filter((entry) => Number(entry.id) !== targetId));
    return order;
  }

  function checkoutSelection(entryId) {
    if (!entryId || entryId === '__all__') {
      return checkout();
    }
    const target = cart.find((entry) => String(entry.id) === String(entryId));
    if (!target) return null;

    let orderItems;
    if (target.entry_type === 'bundle' && Array.isArray(target.bundle_items) && target.bundle_items.length) {
      orderItems = target.bundle_items.map((item) => ({
        ...item,
        qty: Math.max(1, Number(item.qty || 1)),
      }));
    } else {
      orderItems = [target];
    }

    const order = makeOrder(orderItems);
    persistOrders([order, ...orders]);
    persistCart(cart.filter((entry) => String(entry.id) !== String(entryId)));
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
      addBundleToCart,
      updateQty,
      removeFromCart,
      clearCart,
      checkout,
      checkoutItem,
      checkoutSelection,
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
