import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { useCommerce } from '../lib/commerceContext';

export default function Header({ mode, onModeChange }) {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const { cartCount } = useCommerce();
  const cartBadgeRef = useRef(null);
  const prevCartCountRef = useRef(cartCount);
  const modeIndex = mode === 'smart' ? 1 : 0;
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let active = true;
    async function run() {
      if (!isLoaded || !isSignedIn) {
        if (active) setIsAdmin(false);
        return;
      }
      try {
        const token = await getToken();
        if (!token) {
          if (active) setIsAdmin(false);
          return;
        }
        const response = await fetch('/api/auth/access', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json().catch(() => ({}));
        if (active) setIsAdmin(Boolean(data?.is_admin || String(data?.role || '').toLowerCase() === 'admin'));
      } catch {
        if (active) setIsAdmin(false);
      }
    }
    run();
    return () => {
      active = false;
    };
  }, [isLoaded, isSignedIn, getToken]);

  useEffect(() => {
    function handleFlyToCart(event) {
      const badge = cartBadgeRef.current;
      if (!badge) return;
      const detail = event?.detail || {};
      const startX = Number(detail.x || 0);
      const startY = Number(detail.y || 0);
      if (!startX && !startY) return;

      const rect = badge.getBoundingClientRect();
      const endX = rect.left + rect.width / 2;
      const endY = rect.top + rect.height / 2;

      const token = document.createElement('span');
      token.className = 'opti-cart-fly-token';
      token.style.left = `${startX}px`;
      token.style.top = `${startY}px`;
      document.body.appendChild(token);

      requestAnimationFrame(() => {
        token.style.transform = `translate(${endX - startX}px, ${endY - startY}px) scale(0.35)`;
        token.style.opacity = '0.2';
      });

      const cleanup = () => {
        token.removeEventListener('transitionend', cleanup);
        token.remove();
      };
      token.addEventListener('transitionend', cleanup);
      setTimeout(cleanup, 900);
    }

    window.addEventListener('optimall:cart-add', handleFlyToCart);
    return () => {
      window.removeEventListener('optimall:cart-add', handleFlyToCart);
    };
  }, []);

  useEffect(() => {
    if (cartCount <= prevCartCountRef.current) {
      prevCartCountRef.current = cartCount;
      return;
    }
    const badge = cartBadgeRef.current;
    if (!badge) {
      prevCartCountRef.current = cartCount;
      return;
    }
    badge.classList.remove('opti-cart-badge-pop');
    // force reflow to restart animation class cleanly
    void badge.offsetWidth;
    badge.classList.add('opti-cart-badge-pop');
    prevCartCountRef.current = cartCount;
  }, [cartCount]);

  return (
    <header className="sticky top-0 z-40 bg-[#1A2A54] text-white">
      <div className="mx-auto flex max-w-[1320px] flex-wrap items-center justify-between gap-y-3 px-4 py-3 sm:px-6 sm:py-4">
        <Link to="/home" className="group shrink-0">
          <span className="block text-xl font-extrabold leading-none tracking-[-0.04em] sm:text-2xl">
            Opti<span className="text-[#FF6B00]">Mall</span>
          </span>
          <span className="block text-[9px] font-semibold uppercase tracking-[0.16em] text-[#B8C7EB] sm:text-[10px] sm:tracking-[0.2em]">Smart Commerce</span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          {!isAdmin && (
            <Link
              to="/cart"
              className="relative rounded-full bg-white/10 px-3 py-2 text-[11px] font-bold uppercase tracking-[0.11em] transition-colors hover:bg-white/20 sm:px-4 sm:text-xs"
            >
              Cart
              <span ref={cartBadgeRef} className="absolute -right-2 -top-2 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#FF6B00] px-1 text-[10px] text-white">
                {cartCount}
              </span>
            </Link>
          )}

          <Link
            to="/account"
            className="rounded-full bg-white/10 px-3 py-2 text-[11px] font-bold uppercase tracking-[0.11em] transition-colors hover:bg-white/20 sm:px-4 sm:text-xs"
          >
            Profile
          </Link>
        </div>
      </div>

      {typeof onModeChange === 'function' && (
        <div className="mx-auto flex max-w-[1320px] justify-center px-4 sm:px-6">
          <div className="relative grid w-full max-w-[980px] grid-cols-2 gap-4 rounded-2xl">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute bottom-0 top-0 w-[calc(50%-0.5rem)] rounded-t-xl rounded-b-none bg-white transition-transform duration-200 ease-out"
              style={{ transform: `translateX(calc(${modeIndex * 100}% + ${modeIndex * 1}rem))` }}
            />
            <button
              type="button"
              onClick={() => onModeChange('normal')}
              className={`relative z-10 rounded-t-xl rounded-b-none px-3 py-2.5 text-sm font-bold uppercase transition sm:px-8 sm:py-3 sm:text-base ${
                mode === 'normal' ? 'text-[#1A2A54]' : 'text-white hover:bg-white/10'
              }`}
              style={{ letterSpacing: 'clamp(0.09em, 0.35vw, 0.22em)' }}
            >
              Browse
            </button>
            <button
              type="button"
              onClick={() => onModeChange('smart')}
              className={`relative z-10 rounded-t-xl rounded-b-none px-3 py-2.5 text-sm font-bold uppercase transition sm:px-8 sm:py-3 sm:text-base ${
                mode === 'smart' ? 'text-[#1A2A54]' : 'text-white hover:bg-white/10'
              }`}
              style={{ letterSpacing: 'clamp(0.09em, 0.35vw, 0.22em)' }}
            >
              Smart mode
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
