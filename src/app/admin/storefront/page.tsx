'use client';

import { useState, useEffect } from 'react';
import Card from '@/shared/ui/Card';
import Button from '@/shared/ui/Button';
import Input from '@/shared/ui/Input';
import Skeleton from '@/shared/ui/Skeleton';
import { useToast } from '@/shared/ui/Toast';

export default function AdminStorefrontPage() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<any>(null);
  const [allCategories, setAllCategories] = useState<any[]>([]);

  // Form States
  const [heroHeading, setHeroHeading] = useState('');
  const [heroSubtext, setHeroSubtext] = useState('');
  const [heroButtonText, setHeroButtonText] = useState('');
  const [heroImages, setHeroImages] = useState<any[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [promoActive, setPromoActive] = useState(true);
  const [promoHeading, setPromoHeading] = useState('');
  const [promoSubtext, setPromoSubtext] = useState('');
  const [promoDiscount, setPromoDiscount] = useState('');
  const [ctaHeading, setCtaHeading] = useState('');
  const [ctaButtonText, setCtaButtonText] = useState('');
  const [ctaButtonLink, setCtaButtonLink] = useState('');
  
  const [dynamicRows, setDynamicRows] = useState<any[]>([]);

  useEffect(() => {
    fetchStorefront();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/admin/categories');
      const json = await res.json();
      if (json.success) setAllCategories(json.categories);
    } catch (e) {
      console.error('Failed to load categories', e);
    }
  };

  const fetchStorefront = async () => {
    try {
      const res = await fetch('/api/admin/storefront');
      const json = await res.json();
      if (json.success && json.data) {
        setData(json.data);
        setHeroHeading(json.data.hero?.heading || '');
        setHeroSubtext(json.data.hero?.subtext || '');
        setHeroButtonText(json.data.hero?.buttonText || '');
        setHeroImages(json.data.hero?.images || []);
        
        setPromoActive(json.data.promotionalBanner?.isActive ?? true);
        setPromoHeading(json.data.promotionalBanner?.heading || '');
        setPromoSubtext(json.data.promotionalBanner?.subtext || '');
        setPromoDiscount(json.data.promotionalBanner?.discount || '');

        setCtaHeading(json.data.globalCta?.heading || '');
        setCtaButtonText(json.data.globalCta?.buttonText || '');
        setCtaButtonLink(json.data.globalCta?.buttonLink || '');
        
        setDynamicRows(json.data.dynamicProductRows || []);
      }
    } catch (error) {
      console.error('Failed to load storefront data', error);
      showToast('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (section: string) => {
    if (!data?._id) return showToast('No document found. Please initialize in Sanity first.', 'error');
    setSaving(true);
    
    let updates = {};
    if (section === 'hero') {
      const sanitizedImages = heroImages.map((img) => ({
        _type: 'image',
        _key: img._key || Math.random().toString(36).substring(7),
        asset: { _type: 'reference', _ref: img.assetId || img.asset._ref }
      }));
      updates = { hero: { ...data.hero, heading: heroHeading, subtext: heroSubtext, buttonText: heroButtonText, images: sanitizedImages } };
    } else if (section === 'promo') {
      updates = { promotionalBanner: { ...data.promotionalBanner, isActive: promoActive, heading: promoHeading, subtext: promoSubtext, discount: promoDiscount } };
    } else if (section === 'cta') {
      updates = { globalCta: { ...data.globalCta, heading: ctaHeading, buttonText: ctaButtonText, buttonLink: ctaButtonLink } };
    } else if (section === 'rows') {
      const sanitizedRows = dynamicRows.map((r) => ({
        _key: r._key || Math.random().toString(36).substring(7),
        title: r.title,
        category: r.categoryId ? { _type: 'reference', _ref: r.categoryId } : undefined
      })).filter(r => r.title && r.category); // Ensure valid data
      updates = { dynamicProductRows: sanitizedRows };
    }

    try {
      const res = await fetch('/api/admin/storefront', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ _id: data._id, ...updates }),
      });
      const json = await res.json();
      if (json.success) {
        showToast(`${section.toUpperCase()} updated successfully`, 'success');
      } else {
        showToast(json.error || 'Failed to update', 'error');
      }
    } catch (err) {
      showToast('An error occurred', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });
      const json = await res.json();
      if (json.success) {
        setHeroImages([...heroImages, { url: json.asset.url, assetId: json.asset._id }]);
        showToast('Image uploaded', 'success');
      } else {
        showToast(json.error || 'Failed to upload image', 'error');
      }
    } catch (err) {
      showToast('Error uploading image', 'error');
    } finally {
      setUploadingImage(false);
    }
  };

  const removeHeroImage = (indexToRemove: number) => {
    setHeroImages(heroImages.filter((_, i) => i !== indexToRemove));
  };

  const addRow = () => {
    setDynamicRows([...dynamicRows, { _key: Math.random().toString(36).substring(7), title: '', categoryId: '' }]);
  };

  const updateRow = (index: number, field: string, value: string) => {
    const newRows = [...dynamicRows];
    newRows[index][field] = value;
    setDynamicRows(newRows);
  };

  const removeRow = (index: number) => {
    setDynamicRows(dynamicRows.filter((_, i) => i !== index));
  };

  if (loading) {
    return (
      <div className="p-8 space-y-8">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-12 bg-white min-h-screen pb-32">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-black">Storefront Management</h1>
        <p className="text-sm text-zinc-500">Control the content and layout of your homepage.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* HERO SECTION */}
        <Card className="space-y-6">
          <div className="flex justify-between items-center border-b border-zinc-100 pb-4">
            <h2 className="text-[11px] uppercase tracking-widest font-bold text-black">Hero Section</h2>
            <Button size="sm" onClick={() => handleSave('hero')} disabled={saving}>Save Hero</Button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 mb-2 block">Heading</label>
              <Input value={heroHeading} onChange={(e) => setHeroHeading(e.target.value)} placeholder="WEAR YOUR confidence" />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 mb-2 block">Subtext</label>
              <Input value={heroSubtext} onChange={(e) => setHeroSubtext(e.target.value)} placeholder="Trendy pieces. Timeless style." />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 mb-2 block">Button Text</label>
              <Input value={heroButtonText} onChange={(e) => setHeroButtonText(e.target.value)} placeholder="SHOP NEW IN" />
            </div>
            <div className="pt-4 border-t border-zinc-100">
              <label className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 mb-4 block">Background Slider Images</label>
              <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
                {heroImages.map((img, i) => (
                  <div key={i} className="relative shrink-0 w-32 h-32 rounded-lg border border-zinc-200 overflow-hidden group">
                    <img src={img.url || ''} className="w-full h-full object-cover" alt="Hero Background" />
                    <button 
                      onClick={() => removeHeroImage(i)}
                      className="absolute top-2 right-2 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <label className="shrink-0 w-32 h-32 rounded-lg border-2 border-dashed border-zinc-200 flex flex-col items-center justify-center cursor-pointer hover:bg-zinc-50 transition-colors">
                  <span className="text-2xl text-zinc-300 mb-2">+</span>
                  <span className="text-[10px] font-bold text-zinc-500">{uploadingImage ? 'UPLOADING...' : 'ADD IMAGE'}</span>
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploadingImage} />
                </label>
              </div>
            </div>
          </div>
        </Card>

        {/* PROMO BANNER SECTION */}
        <Card className="space-y-6">
          <div className="flex justify-between items-center border-b border-zinc-100 pb-4">
            <h2 className="text-[11px] uppercase tracking-widest font-bold text-black">Promotional Banner</h2>
            <Button size="sm" onClick={() => handleSave('promo')} disabled={saving}>Save Promo</Button>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <input type="checkbox" checked={promoActive} onChange={(e) => setPromoActive(e.target.checked)} id="promoActive" />
              <label htmlFor="promoActive" className="text-sm font-bold text-black cursor-pointer">Enable Promo Banner</label>
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 mb-2 block">Heading</label>
              <Input value={promoHeading} onChange={(e) => setPromoHeading(e.target.value)} placeholder="Spring Sale is Live!" />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 mb-2 block">Subtext</label>
              <Input value={promoSubtext} onChange={(e) => setPromoSubtext(e.target.value)} placeholder="Enjoy up to 40% off" />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 mb-2 block">Discount Badge Text</label>
              <Input value={promoDiscount} onChange={(e) => setPromoDiscount(e.target.value)} placeholder="40%" />
            </div>
          </div>
        </Card>

        {/* CTA SECTION */}
        <Card className="space-y-6">
          <div className="flex justify-between items-center border-b border-zinc-100 pb-4">
            <h2 className="text-[11px] uppercase tracking-widest font-bold text-black">Global CTA (Bottom)</h2>
            <Button size="sm" onClick={() => handleSave('cta')} disabled={saving}>Save CTA</Button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 mb-2 block">Heading</label>
              <Input value={ctaHeading} onChange={(e) => setCtaHeading(e.target.value)} placeholder="JOIN THE COLLECTION" />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 mb-2 block">Button Text</label>
              <Input value={ctaButtonText} onChange={(e) => setCtaButtonText(e.target.value)} placeholder="EXPLORE SHOP" />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 mb-2 block">Button Link</label>
              <Input value={ctaButtonLink} onChange={(e) => setCtaButtonLink(e.target.value)} placeholder="/shop" />
            </div>
          </div>
        </Card>
        
        {/* Dynamic Rows Info */}
        <Card className="space-y-6">
          <div className="flex justify-between items-center border-b border-zinc-100 pb-4">
            <h2 className="text-[11px] uppercase tracking-widest font-bold text-black">Dynamic Product Rows</h2>
            <Button size="sm" onClick={() => handleSave('rows')} disabled={saving}>Save Rows</Button>
          </div>
          <div className="space-y-6">
            {dynamicRows.map((row, index) => (
              <div key={row._key || index} className="flex gap-4 items-end bg-zinc-50 p-4 rounded-lg border border-zinc-100">
                <div className="flex-1">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 mb-2 block">Row Title</label>
                  <Input value={row.title} onChange={(e) => updateRow(index, 'title', e.target.value)} placeholder="e.g. Trending Leggings" />
                </div>
                <div className="flex-1">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 mb-2 block">Category</label>
                  <select 
                    className="w-full h-10 px-3 bg-white border border-zinc-200 text-sm focus:outline-none focus:border-black transition-colors"
                    value={row.categoryId} 
                    onChange={(e) => updateRow(index, 'categoryId', e.target.value)}
                  >
                    <option value="">Select Category</option>
                    {allCategories.map(cat => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <Button variant="outline" size="sm" onClick={() => removeRow(index)} className="text-red-600 border-red-200 hover:bg-red-50">
                  Remove
                </Button>
              </div>
            ))}
            <Button variant="outline" onClick={addRow} className="w-full border-dashed">+ Add Product Row</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
