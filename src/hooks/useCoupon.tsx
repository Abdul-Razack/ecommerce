'use client';

import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import type { CartLine, DiscountResult } from '@/domains/coupons/lib/discount';

/**
 * Applied promo code state, shared across the cart page, cart drawer and
 * checkout so a code applied in one place is reflected everywhere.
 *
 * The browser only ever stores the *code*. The discount itself always comes
 * back from `POST /api/coupons/validate`, which re-prices the cart from Sanity
 * before evaluating. Nothing here is trusted at payment time: `POST /api/orders`
 * repeats the whole evaluation server-side.
 */

const STORAGE_KEY = 'appliedCoupon';

export interface AppliedCoupon {
  code: string;
  type: string;
  description?: string | null;
  discount: number;
  freeShipping: boolean;
  giftItems: CartLine[];
  /** Sum of free units per line id, used to badge buyXgetY lines. */
  freeUnitsByLine: Record<string, number>;
  affectedLineIds: string[];
}

interface CouponContextValue {
  applied: AppliedCoupon | null;
  isApplied: boolean;
  applying: boolean;
  error: string | null;
  discount: number;
  freeShipping: boolean;
  giftItems: CartLine[];
  freeUnitsByLine: Record<string, number>;
  applyCode: (code: string, lines: any[], opts?: { email?: string | null; paymentType?: string }) => Promise<boolean>;
  removeCoupon: () => void;
  clearError: () => void;
  tryAutoApply: (lines: any[], opts?: { email?: string | null }) => Promise<void>;
  /**
   * Re-checks the currently applied code against the cart as it is *now*.
   *
   * The stored discount is a snapshot taken when the code was applied, so it
   * silently goes stale the moment a line is removed, a size is swapped or a
   * minimum-spend gate is no longer met. Callers invoke this whenever their
   * totals could have moved; a code that no longer qualifies is dropped rather
   * than left to fail at payment time.
   */
  revalidate: (lines: any[], opts?: { email?: string | null; paymentType?: string }) => Promise<void>;
}

const CouponContext = createContext<CouponContextValue | undefined>(undefined);

/** Strips the client-only fields Sanity cart items carry, keeping the wire shape. */
const toWireItems = (lines: any[]) =>
  (lines || []).map((l) => ({
    _id: l._id,
    quantity: l.quantity,
    color: l.color || null,
    size: l.size || null,
  }));

export function CouponProvider({ children }) {
  const [applied, setApplied] = useState<AppliedCoupon | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const autoApplyTried = useRef(false);

  /**
   * Mirrors of state needed inside callbacks, so `revalidate` and
   * `tryAutoApply` do not have to be re-created on every keystroke in the
   * checkout form.
   */
  const appliedRef = useRef<AppliedCoupon | null>(null);
  const lastValidated = useRef<string | null>(null);

  useEffect(() => {
    appliedRef.current = applied;
    // A newly applied or removed code invalidates the memo below.
    lastValidated.current = null;
  }, [applied]);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setApplied(JSON.parse(saved));
      } catch (e) {
        console.error('Error loading applied coupon:', e);
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      if (applied) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(applied));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, [applied, isLoaded]);

  const removeCoupon = useCallback(() => {
    setApplied(null);
    setError(null);
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const applyCode = useCallback(
    async (
      code: string,
      lines: any[],
      opts: { email?: string | null; paymentType?: string; quiet?: boolean } = {}
    ) => {
      if (!code || !code.trim()) {
        setError('Enter a promo code');
        return false;
      }
      if (!lines || lines.length === 0) {
        setError('Add something to your cart before applying a promo code');
        return false;
      }

      // A revalidation must not blank out the totals the customer is currently
      // looking at, so it stays invisible unless something actually breaks.
      if (!opts.quiet) setApplying(true);
      setError(null);

      try {
        const res = await fetch('/api/coupons/validate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code,
            items: toWireItems(lines),
            email: opts.email || null,
            paymentType: opts.paymentType || 'online',
          }),
        });

        const json = await res.json();

        if (!json.success) {
          // A re-check that no longer passes is dropped, not surfaced as a
          // failed "apply": the customer never asked to apply anything this
          // time round, and a stale code silently vanishing is the correct
          // outcome.
          if (opts.quiet) {
            setApplied(null);
          }
          setError(json.error || 'This promo code cannot be applied');
          return false;
        }

        setApplied({
          code: json.coupon.code,
          type: json.coupon.type,
          description: json.coupon.description,
          discount: json.discount || 0,
          freeShipping: Boolean(json.freeShipping),
          giftItems: json.giftItems || [],
          freeUnitsByLine: json.freeUnitsByLine || {},
          affectedLineIds: json.affectedLineIds || [],
        });

        return true;
      } catch (err) {
        console.error('Coupon apply error:', err);
        // Offline or server trouble is not evidence the coupon is invalid, so
        // the existing discount is left in place rather than discarded.
        if (!opts.quiet) setError('Could not reach the server. Please try again.');
        return false;
      } finally {
        if (!opts.quiet) setApplying(false);
      }
    },
    []
  );

  /**
   * Signature of the inputs a coupon verdict depends on.
   *
   * Keyed on identity, quantity and variant only: prices and coupon rules are
   * re-fetched and re-evaluated server-side, so hashing them here would only
   * cause redundant round trips.
   */
  const cartSignature = useCallback(
    (lines: any[]) =>
      (lines || [])
        .map((l) => `${l._id}:${l.quantity}:${l.color || ''}:${l.size || ''}`)
        .sort()
        .join('|'),
    []
  );

  const revalidate = useCallback(
    async (lines: any[], opts: { email?: string | null; paymentType?: string } = {}) => {
      const current = appliedRef.current;
      if (!current) return;

      // An emptied cart has nothing to discount, so drop the code immediately
      // rather than spending a request to be told the same thing.
      if (!lines || lines.length === 0) {
        setApplied(null);
        return;
      }

      const signature = `${cartSignature(lines)}|${opts.email || ''}|${opts.paymentType || ''}`;
      if (signature === lastValidated.current) return;
      lastValidated.current = signature;

      await applyCode(current.code, lines, { ...opts, quiet: true });
    },
    [applyCode, cartSignature]
  );

  const tryAutoApply = useCallback(async (lines: any[], opts: { email?: string | null } = {}) => {
    if (autoApplyTried.current || !lines || lines.length === 0) return;
    autoApplyTried.current = true;

    try {
      const params = new URLSearchParams({
        items: JSON.stringify(toWireItems(lines)),
      });
      if (opts.email) params.set('email', opts.email);

      const res = await fetch(`/api/coupons/validate?${params.toString()}`);
      const json = await res.json();

      if (json.success && json.coupon) {
        setApplied({
          code: json.coupon.code,
          type: json.coupon.type,
          description: json.coupon.description,
          discount: json.discount || 0,
          freeShipping: Boolean(json.freeShipping),
          giftItems: json.giftItems || [],
          freeUnitsByLine: json.freeUnitsByLine || {},
          affectedLineIds: json.affectedLineIds || [],
        });
      }
    } catch (err) {
      // Auto-apply is a convenience, never a hard failure.
      console.error('Auto-apply coupon error:', err);
    }
  }, []);

  return (
    <CouponContext.Provider
      value={{
        applied,
        isApplied: Boolean(applied),
        applying,
        error,
        discount: applied?.discount || 0,
        freeShipping: applied?.freeShipping || false,
        giftItems: applied?.giftItems || [],
        freeUnitsByLine: applied?.freeUnitsByLine || {},
        applyCode,
        removeCoupon,
        clearError,
        tryAutoApply,
        revalidate,
      }}
    >
      {children}
    </CouponContext.Provider>
  );
}

export function useCoupon() {
  const context = useContext(CouponContext);
  if (!context) {
    throw new Error('useCoupon must be used within a CouponProvider');
  }
  return context;
}
