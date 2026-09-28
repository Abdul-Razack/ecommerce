'use client';

import { useState, useEffect, useMemo } from 'react';
import Card from '@/shared/ui/Card';
import Button from '@/shared/ui/Button';
import Skeleton from '@/shared/ui/Skeleton';
import { useToast } from '@/shared/ui/Toast';
import Pagination, { usePagination } from '@/shared/ui/Pagination';

const COUPON_TYPES = [
  { value: 'flat', label: 'Flat Amount Off' },
  { value: 'percentage', label: 'Percentage Off' },
  { value: 'flatPerItem', label: 'Flat Amount Per Item' },
  { value: 'buyXgetY', label: 'Buy X Get Y Free' },
  { value: 'freeGift', label: 'Free Gift Product' },
  { value: 'freeShipping', label: 'Free Shipping' },
];

const BLANK_FORM = {
  code: '',
  title: '',
  description: '',
  type: 'percentage',
  value: '',
  maxDiscount: '',
  buyQuantity: '2',
  getQuantity: '1',
  giftProductId: '',
  targetCategoryId: '',
  targetProductId: '',
  targetSize: '',
  targetColor: '',
  minOrderValue: '0',
  minQuantity: '0',
  isFirstOrderOnly: false,
  isActive: true,
  isAutoApply: false,
  isStackable: false,
  showOnProductPage: true,
  validFrom: '',
  validUntil: '',
  usageLimit: '',
  perUserLimit: '',
};

/** Mirrors describeCoupon() in the discount engine, for the table view. */
function offerLabel(c: any) {
  switch (c.type) {
    case 'flat':
      return `₹${c.value} off`;
    case 'percentage':
      return c.maxDiscount ? `${c.value}% off (max ₹${c.maxDiscount})` : `${c.value}% off`;
    case 'flatPerItem':
      return `₹${c.value} off each`;
    case 'buyXgetY':
      return `Buy ${c.buyQuantity || 1} get ${c.getQuantity || 1} free`;
    case 'freeGift':
      return c.giftProductName ? `Free gift: ${c.giftProductName}` : 'Free gift (not configured)';
    case 'freeShipping':
      return 'Free delivery';
    default:
      return '—';
  }
}

function scopeLabel(c: any) {
  const parts: string[] = [];
  if (c.targetProductName) parts.push(c.targetProductName);
  else if (c.targetCategoryName) parts.push(`${c.targetCategoryName} only`);
  if (c.targetSize) parts.push(`Size ${c.targetSize}`);
  if (c.targetColor) parts.push(c.targetColor);
  if (c.minOrderValue > 0) parts.push(`Min ₹${c.minOrderValue}`);
  if (c.minQuantity > 0) parts.push(`Min ${c.minQuantity} item(s)`);
  if (c.isFirstOrderOnly) parts.push('First order only');
  return parts.length ? parts.join(' · ') : 'Whole cart';
}

const toDateTimeLocal = (iso?: string | null) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const inputClass =
  'w-full h-11 px-4 bg-zinc-50 border border-zinc-200 text-xs font-bold uppercase tracking-wider focus:outline-none focus:border-black transition-colors';
const labelClass = 'block text-[9px] uppercase tracking-widest font-black text-zinc-400 mb-2';
const sectionClass = 'text-[10px] uppercase tracking-widest font-black text-black pt-4 border-t border-zinc-100';

export default function CouponsPage() {
  const { showToast, showConfirm } = useToast();
  const [coupons, setCoupons] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<any>({ ...BLANK_FORM });
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchCoupons = async () => {
    try {
      const res = await fetch('/api/admin/coupons');
      const json = await res.json();
      if (json.success) {
        setCoupons(json.coupons || []);
        setProducts(json.products || []);
        setCategories(json.categories || []);
      }
    } catch (err) {
      showToast('Error loading coupons', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const set = (key: string, value: any) => setForm((prev: any) => ({ ...prev, [key]: value }));

  const handleOpenNew = () => {
    setEditingId(null);
    setForm({ ...BLANK_FORM });
    setIsModalOpen(true);
  };

  const handleEdit = (coupon: any) => {
    setEditingId(coupon._id);
    setForm({
      code: coupon.code || '',
      title: coupon.title || '',
      description: coupon.description || '',
      type: coupon.type || 'percentage',
      value: coupon.value ?? '',
      maxDiscount: coupon.maxDiscount ?? '',
      buyQuantity: coupon.buyQuantity ?? '2',
      getQuantity: coupon.getQuantity ?? '1',
      giftProductId: coupon.giftProductId || '',
      targetCategoryId: coupon.targetCategoryId || '',
      targetProductId: coupon.targetProductId || '',
      targetSize: coupon.targetSize || '',
      targetColor: coupon.targetColor || '',
      minOrderValue: coupon.minOrderValue ?? '0',
      minQuantity: coupon.minQuantity ?? '0',
      isFirstOrderOnly: Boolean(coupon.isFirstOrderOnly),
      isActive: coupon.isActive !== false,
      isAutoApply: Boolean(coupon.isAutoApply),
      isStackable: Boolean(coupon.isStackable),
      showOnProductPage: coupon.showOnProductPage !== false,
      validFrom: toDateTimeLocal(coupon.validFrom),
      validUntil: toDateTimeLocal(coupon.validUntil),
      usageLimit: coupon.usageLimit ?? '',
      perUserLimit: coupon.perUserLimit ?? '',
    });
    setIsModalOpen(true);
  };

  const handleToggleActive = async (coupon: any) => {
    try {
      const res = await fetch('/api/admin/coupons', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...coupon, isActive: !coupon.isActive }),
      });
      const json = await res.json();
      if (json.success) {
        showToast(`${coupon.code} ${coupon.isActive ? 'paused' : 'activated'}`, 'success');
        fetchCoupons();
      } else {
        showToast(json.error || 'Failed to update coupon', 'error');
      }
    } catch (err) {
      showToast('Failed to update coupon', 'error');
    }
  };

  const handleDelete = async (id: string, code: string) => {
    const isConfirmed = await showConfirm({
      title: 'Delete Coupon',
      message: `Delete ${code}? Past orders keep their discount snapshot, but the code stops working immediately.`,
      confirmLabel: 'Delete',
      cancelLabel: 'Cancel',
      isDestructive: true,
    });
    if (!isConfirmed) return;

    try {
      const res = await fetch(`/api/admin/coupons?id=${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        showToast('Coupon deleted', 'success');
        fetchCoupons();
      } else {
        showToast(json.error || 'Failed to delete coupon', 'error');
      }
    } catch (err) {
      showToast('Failed to delete coupon', 'error');
    }
  };

  const handleSave = async () => {
    if (!form.code.trim()) {
      return showToast('Promo code is required', 'error');
    }

    setSaving(true);
    const isEditing = !!editingId;

    // Blank inputs become null so the discount engine treats them as "no limit"
    // rather than as a real value of zero.
    const body = {
      ...form,
      _id: editingId,
      code: form.code.trim().toUpperCase(),
      value: form.value === '' ? null : Number(form.value),
      maxDiscount: form.maxDiscount === '' ? null : Number(form.maxDiscount),
      buyQuantity: form.type === 'buyXgetY' ? Number(form.buyQuantity) : null,
      getQuantity: form.type === 'buyXgetY' ? Number(form.getQuantity) : null,
      giftProductId: form.type === 'freeGift' ? form.giftProductId : null,
      targetCategoryId: form.type !== 'freeGift' ? form.targetCategoryId : null,
      targetProductId: form.type !== 'freeGift' ? form.targetProductId : null,
      minOrderValue: Number(form.minOrderValue) || 0,
      minQuantity: Number(form.minQuantity) || 0,
      usageLimit: form.usageLimit === '' ? null : Number(form.usageLimit),
      perUserLimit: form.perUserLimit === '' ? null : Number(form.perUserLimit),
      validFrom: form.validFrom ? new Date(form.validFrom).toISOString() : null,
      validUntil: form.validUntil ? new Date(form.validUntil).toISOString() : null,
    };

    try {
      const res = await fetch('/api/admin/coupons', {
        method: isEditing ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const json = await res.json();

      if (json.success) {
        showToast(`Coupon ${isEditing ? 'updated' : 'created'}!`, 'success');
        setIsModalOpen(false);
        fetchCoupons();
      } else {
        showToast(json.error || 'Failed to save coupon', 'error');
      }
    } catch (err) {
      showToast('An error occurred while saving', 'error');
    } finally {
      setSaving(false);
    }
  };

  const filteredCoupons = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return coupons.filter((c) => {
      if (statusFilter === 'active' && c.isActive === false) return false;
      if (statusFilter === 'paused' && c.isActive !== false) return false;
      if (!term) return true;
      return (
        c.code?.toLowerCase().includes(term) ||
        c.title?.toLowerCase().includes(term) ||
        c.description?.toLowerCase().includes(term) ||
        c.targetProductName?.toLowerCase().includes(term) ||
        c.targetCategoryName?.toLowerCase().includes(term)
      );
    });
  }, [coupons, searchTerm, statusFilter]);

  const {
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    totalPages,
    paginatedItems: paginatedCoupons,
    totalItems,
  } = usePagination({ items: filteredCoupons, initialPageSize: 10 });

  const needsValue = ['flat', 'percentage', 'flatPerItem'].includes(form.type);
  const productsByCategory = form.targetCategoryId
    ? products.filter((p) => p.categoryId === form.targetCategoryId)
    : products;

  return (
    <div suppressHydrationWarning className="p-8 space-y-12 bg-white min-h-screen">
      <header className="flex flex-col gap-2 flex-wrap sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-black">Coupons</h1>
          <p className="text-sm text-zinc-500">
            Create and manage promo codes, discount rules and redemption limits.
          </p>
        </div>
        <Button onClick={handleOpenNew}>+ Add Coupon</Button>
      </header>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h3 className="text-[11px] uppercase tracking-widest font-black text-black">
          All Coupons <span className="text-zinc-400 ml-2">({filteredCoupons.length})</span>
        </h3>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full sm:w-40 h-10 px-4 bg-zinc-50 border border-zinc-200 text-xs font-black uppercase tracking-wider focus:outline-none focus:border-black transition-colors"
          >
            <option value="all">All Status</option>
            <option value="active">Active Only</option>
            <option value="paused">Paused Only</option>
          </select>
          <input
            type="text"
            placeholder="Search by code, title or scope..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full sm:w-72 h-10 px-4 bg-zinc-50 border border-zinc-200 text-xs font-medium uppercase tracking-wider focus:outline-none focus:border-black transition-colors"
          />
        </div>
      </div>

      {loading ? (
        <Skeleton className="h-64 w-full" />
      ) : (
        <Card padding="p-0" className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-100">
                  <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-zinc-500">Code</th>
                  <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-zinc-500">Offer</th>
                  <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-zinc-500">Scope</th>
                  <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-zinc-500">Usage</th>
                  <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-zinc-500">Status</th>
                  <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-zinc-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {paginatedCoupons.map((coupon) => (
                  <tr key={coupon._id} className="hover:bg-zinc-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-xs font-black font-mono text-black">{coupon.code}</p>
                      {coupon.title && (
                        <p className="text-[10px] text-zinc-400 mt-1">{coupon.title}</p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs font-bold text-black whitespace-nowrap">
                      {offerLabel(coupon)}
                    </td>
                    <td className="px-6 py-4 text-[10px] text-zinc-500 font-medium">
                      {scopeLabel(coupon)}
                    </td>
                    <td className="px-6 py-4 text-[10px] font-mono text-zinc-500 whitespace-nowrap">
                      {coupon.usageCount || 0}
                      {coupon.usageLimit ? ` / ${coupon.usageLimit}` : ' / ∞'}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg ${
                          coupon.isActive === false
                            ? 'bg-zinc-100 text-zinc-500'
                            : 'bg-green-50 text-green-700'
                        }`}
                      >
                        {coupon.isActive === false ? 'Paused' : 'Active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleActive(coupon)}
                        className="text-[10px] uppercase font-bold text-zinc-600 hover:text-black"
                      >
                        {coupon.isActive === false ? 'Activate' : 'Pause'}
                      </button>
                      <button
                        onClick={() => handleEdit(coupon)}
                        className="text-[10px] uppercase font-bold text-blue-600 hover:text-blue-800"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(coupon._id, coupon.code)}
                        className="text-[10px] uppercase font-bold text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredCoupons.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-xs text-zinc-400 italic">
                      No coupons found. Click &quot;Add Coupon&quot; to create one.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            pageSize={pageSize}
            pageSizeOptions={[10, 20, 50]}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
            itemLabel="coupons"
          />
        </Card>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <Card className="w-full max-w-3xl space-y-8 animate-fade-in-up my-8">
            <h2 className="text-xl font-bold">
              {editingId ? 'Edit Coupon' : 'New Coupon'}
            </h2>

            <div className="space-y-8">
              {/* Identity */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Promo Code *</label>
                  <input
                    className={inputClass}
                    value={form.code}
                    onChange={(e) => set('code', e.target.value.toUpperCase())}
                    placeholder="e.g. FESTIVE20"
                  />
                </div>
                <div>
                  <label className={labelClass}>Internal Title</label>
                  <input
                    className={inputClass}
                    value={form.title}
                    onChange={(e) => set('title', e.target.value)}
                    placeholder="e.g. Diwali campaign"
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>Customer Facing Description</label>
                <input
                  className={inputClass}
                  value={form.description}
                  onChange={(e) => set('description', e.target.value)}
                  placeholder="e.g. 20% off on all sarees"
                />
              </div>

              {/* Discount rules */}
              <div className={sectionClass}>Discount</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className={labelClass}>Type *</label>
                  <select
                    className={inputClass}
                    value={form.type}
                    onChange={(e) => set('type', e.target.value)}
                  >
                    {COUPON_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>

                {needsValue && (
                  <div>
                    <label className={labelClass}>
                      {form.type === 'percentage' ? 'Percent Off *' : 'Rupees Off *'}
                    </label>
                    <input
                      type="number"
                      min="0"
                      max={form.type === 'percentage' ? '100' : undefined}
                      className={inputClass}
                      value={form.value}
                      onChange={(e) => set('value', e.target.value)}
                      placeholder="e.g. 20"
                    />
                  </div>
                )}

                {form.type === 'buyXgetY' && (
                  <>
                    <div>
                      <label className={labelClass}>Buy Quantity *</label>
                      <input
                        type="number"
                        min="1"
                        className={inputClass}
                        value={form.buyQuantity}
                        onChange={(e) => set('buyQuantity', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Free Quantity *</label>
                      <input
                        type="number"
                        min="1"
                        className={inputClass}
                        value={form.getQuantity}
                        onChange={(e) => set('getQuantity', e.target.value)}
                      />
                    </div>
                  </>
                )}

                {(form.type === 'percentage' || form.type === 'buyXgetY') && (
                  <div>
                    <label className={labelClass}>Max Discount Cap</label>
                    <input
                      type="number"
                      min="0"
                      className={inputClass}
                      value={form.maxDiscount}
                      onChange={(e) => set('maxDiscount', e.target.value)}
                      placeholder="Optional"
                    />
                  </div>
                )}

                {form.type === 'freeGift' && (
                  <div className="sm:col-span-2">
                    <label className={labelClass}>Free Gift Product *</label>
                    <select
                      className={inputClass}
                      value={form.giftProductId}
                      onChange={(e) => set('giftProductId', e.target.value)}
                    >
                      <option value="">Select a product...</option>
                      {products.map((p) => (
                        <option key={p._id} value={p._id}>
                          {p.name} (₹{p.price})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Eligibility */}
              <div className={sectionClass}>Eligibility</div>
              {form.type !== 'freeGift' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Limit to Category</label>
                    <select
                      className={inputClass}
                      value={form.targetCategoryId}
                      onChange={(e) => {
                        set('targetCategoryId', e.target.value);
                        set('targetProductId', '');
                      }}
                    >
                      <option value="">Whole cart</option>
                      {categories.map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Limit to Product</label>
                    <select
                      className={inputClass}
                      value={form.targetProductId}
                      onChange={(e) => {
                        set('targetProductId', e.target.value);
                        if (e.target.value) set('targetCategoryId', '');
                      }}
                    >
                      <option value="">Whole cart</option>
                      {productsByCategory.map((p) => (
                        <option key={p._id} value={p._id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className={labelClass}>Size</label>
                  <input
                    className={inputClass}
                    value={form.targetSize}
                    onChange={(e) => set('targetSize', e.target.value)}
                    placeholder="Any"
                  />
                </div>
                <div>
                  <label className={labelClass}>Colour</label>
                  <input
                    className={inputClass}
                    value={form.targetColor}
                    onChange={(e) => set('targetColor', e.target.value)}
                    placeholder="Any"
                  />
                </div>
                <div>
                  <label className={labelClass}>Min Order Value</label>
                  <input
                    type="number"
                    min="0"
                    className={inputClass}
                    value={form.minOrderValue}
                    onChange={(e) => set('minOrderValue', e.target.value)}
                  />
                </div>
                <div>
                  <label className={labelClass}>Min Quantity</label>
                  <input
                    type="number"
                    min="0"
                    className={inputClass}
                    value={form.minQuantity}
                    onChange={(e) => set('minQuantity', e.target.value)}
                  />
                </div>
              </div>

              {/* Limits and window */}
              <div className={sectionClass}>Limits &amp; Validity</div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className={labelClass}>Valid From</label>
                  <input
                    type="datetime-local"
                    className={inputClass}
                    value={form.validFrom}
                    onChange={(e) => set('validFrom', e.target.value)}
                  />
                </div>
                <div>
                  <label className={labelClass}>Valid Until</label>
                  <input
                    type="datetime-local"
                    className={inputClass}
                    value={form.validUntil}
                    onChange={(e) => set('validUntil', e.target.value)}
                  />
                </div>
                <div>
                  <label className={labelClass}>Redemption Limit</label>
                  <input
                    type="number"
                    min="0"
                    className={inputClass}
                    value={form.usageLimit}
                    onChange={(e) => set('usageLimit', e.target.value)}
                    placeholder="Unlimited"
                  />
                </div>
                <div>
                  <label className={labelClass}>Per Customer Limit</label>
                  <input
                    type="number"
                    min="0"
                    className={inputClass}
                    value={form.perUserLimit}
                    onChange={(e) => set('perUserLimit', e.target.value)}
                    placeholder="Unlimited"
                  />
                </div>
              </div>

              {/* Toggles */}
              <div className={sectionClass}>Behaviour</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  ['isActive', 'Active', 'Pause without deleting'],
                  ['isAutoApply', 'Auto Apply', 'Silently applied at checkout'],
                  ['showOnProductPage', 'Show on Product Pages', 'Surface in the promo tray'],
                  ['isFirstOrderOnly', 'First Order Only', 'New customers only'],
                  ['isStackable', 'Stackable', 'Reserved for multi-code release'],
                ].map(([key, label, hint]) => (
                  <label
                    key={key}
                    className="flex items-start gap-3 border border-zinc-200 p-4 cursor-pointer hover:border-black transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={Boolean(form[key])}
                      onChange={(e) => set(key, e.target.checked)}
                      className="mt-0.5 w-4 h-4 accent-black"
                    />
                    <span>
                      <span className="block text-[10px] uppercase tracking-widest font-black text-black">
                        {label}
                      </span>
                      <span className="block text-[10px] text-zinc-400 mt-1 font-medium">{hint}</span>
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-zinc-100">
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : editingId ? 'Update Coupon' : 'Create Coupon'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
