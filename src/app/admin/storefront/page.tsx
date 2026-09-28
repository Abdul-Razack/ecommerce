'use client';

import { useState, useEffect } from 'react';
import Card from '@/shared/ui/Card';
import Button from '@/shared/ui/Button';
import Input from '@/shared/ui/Input';
import Skeleton from '@/shared/ui/Skeleton';
import { useToast } from '@/shared/ui/Toast';

export interface PromoBannerItem {
  _key: string;
  isActive: boolean;
  tag: string;
  heading: string;
  subtext: string;
  discount: string;
  buttonText: string;
  buttonLink: string;
  image?: string;
  imageAssetId?: string;
  customImageUrl?: string;
}

export default function AdminStorefrontPage() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<any>(null);
  const [allCategories, setAllCategories] = useState<any[]>([]);

  // Hero States
  const [heroHeading, setHeroHeading] = useState('');
  const [heroSubtext, setHeroSubtext] = useState('');
  const [heroButtonText, setHeroButtonText] = useState('');
  const [heroImages, setHeroImages] = useState<any[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Promo Banners States
  const [promoBanners, setPromoBanners] = useState<PromoBannerItem[]>([]);
  const [activeBannerIdx, setActiveBannerIdx] = useState(0);
  const [previewSlideIdx, setPreviewSlideIdx] = useState(0);
  const [uploadingBannerImage, setUploadingBannerImage] = useState(false);

  // CTA States
  const [ctaHeading, setCtaHeading] = useState('');
  const [ctaButtonText, setCtaButtonText] = useState('');
  const [ctaButtonLink, setCtaButtonLink] = useState('');

  // Dynamic Rows
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

        // Load promo banners (or seed defaults)
        if (json.data.promotionalBanners && json.data.promotionalBanners.length > 0) {
          setPromoBanners(
            json.data.promotionalBanners.map((b: any) => ({
              _key: b._key || Math.random().toString(36).substring(7),
              isActive: b.isActive ?? true,
              tag: b.tag || "✦ EXCLUSIVE WOMEN'S FESTIVES",
              heading: b.heading || 'SPRING SALE IS LIVE!',
              subtext: b.subtext || 'Enjoy up to 40% off on selected clothing collections.',
              discount: b.discount || '40%',
              buttonText: b.buttonText || 'Explore Deals →',
              buttonLink: b.buttonLink || '/shop',
              image: b.image || b.customImageUrl || '/images/poster-image.png',
              imageAssetId: b.imageAssetId,
              customImageUrl: b.customImageUrl,
            }))
          );
        } else {
          setPromoBanners([
            {
              _key: 'banner_spring_sale',
              isActive: json.data.promotionalBanner?.isActive ?? true,
              tag: "✦ EXCLUSIVE WOMEN'S FESTIVES",
              heading: json.data.promotionalBanner?.heading || 'SPRING SALE IS LIVE!',
              subtext: json.data.promotionalBanner?.subtext || 'Enjoy up to 40% off on selected clothing collections.',
              discount: json.data.promotionalBanner?.discount || '40%',
              buttonText: 'Explore Deals →',
              buttonLink: '/shop',
              image: '/images/poster-image.png',
            },
            {
              _key: 'banner_children_silk_skirt',
              isActive: true,
              tag: "✦ CHILDREN'S SPECIAL COLLECTION",
              heading: 'GIRLS SILK SKIRT (PATTUPAVADAI)',
              subtext: 'Traditional handcrafted silk skirts for little girls with pure zari borders & festive grace.',
              discount: '30%',
              buttonText: 'Shop Kids Wear →',
              buttonLink: '/shop?category=children-silk-skirt',
              image: '/images/banner-child.png',
            },
          ]);
        }

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

    let updates: any = {};
    if (section === 'hero') {
      const sanitizedImages = heroImages.map((img) => ({
        _type: 'image',
        _key: img._key || Math.random().toString(36).substring(7),
        asset: { _type: 'reference', _ref: img.assetId || img.asset._ref },
      }));
      updates = {
        hero: {
          ...data.hero,
          heading: heroHeading,
          subtext: heroSubtext,
          buttonText: heroButtonText,
          images: sanitizedImages,
        },
      };
    } else if (section === 'promo') {
      const sanitizedBanners = promoBanners.map((b) => ({
        _key: b._key || Math.random().toString(36).substring(7),
        isActive: b.isActive ?? true,
        tag: b.tag || '',
        heading: b.heading || '',
        subtext: b.subtext || '',
        discount: b.discount || '',
        buttonText: b.buttonText || 'Explore Deals →',
        buttonLink: b.buttonLink || '/shop',
        customImageUrl: b.customImageUrl || (typeof b.image === 'string' && b.image.startsWith('/') ? b.image : ''),
        ...(b.imageAssetId
          ? {
              image: {
                _type: 'image',
                asset: {
                  _type: 'reference',
                  _ref: b.imageAssetId,
                },
              },
            }
          : {}),
      }));

      const primary = sanitizedBanners.find((b) => b.isActive) || sanitizedBanners[0];
      const legacyBanner = {
        isActive: primary ? primary.isActive : true,
        heading: primary ? primary.heading : '',
        subtext: primary ? primary.subtext : '',
        discount: primary ? primary.discount : '',
      };

      updates = {
        promotionalBanners: sanitizedBanners,
        promotionalBanner: legacyBanner,
      };
    } else if (section === 'cta') {
      updates = {
        globalCta: {
          ...data.globalCta,
          heading: ctaHeading,
          buttonText: ctaButtonText,
          buttonLink: ctaButtonLink,
        },
      };
    } else if (section === 'rows') {
      const sanitizedRows = dynamicRows
        .map((r) => ({
          _key: r._key || Math.random().toString(36).substring(7),
          title: r.title,
          category: r.categoryId ? { _type: 'reference', _ref: r.categoryId } : undefined,
        }))
        .filter((r) => r.title && r.category);
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

  // Hero Image Upload
  const handleHeroImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
        showToast('Hero image uploaded', 'success');
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

  // Promo Banner Helpers
  const addPromoBanner = () => {
    const newBanner: PromoBannerItem = {
      _key: 'banner_' + Date.now(),
      isActive: true,
      tag: '✦ NEW SPECIAL OFFER',
      heading: 'SPECIAL FESTIVE COLLECTION',
      subtext: 'Discover handcrafted ethnic styles with limited-time festive deals.',
      discount: '25%',
      buttonText: 'Shop Collection →',
      buttonLink: '/shop',
      image: '/images/banner-child.png',
    };
    const updated = [...promoBanners, newBanner];
    setPromoBanners(updated);
    setActiveBannerIdx(updated.length - 1);
    setPreviewSlideIdx(updated.length - 1);
    showToast('New promotional banner slide added', 'success');
  };

  const updateActiveBanner = (field: keyof PromoBannerItem, value: any) => {
    if (!promoBanners[activeBannerIdx]) return;
    const updated = [...promoBanners];
    updated[activeBannerIdx] = { ...updated[activeBannerIdx], [field]: value };
    setPromoBanners(updated);
  };

  const removePromoBanner = (index: number) => {
    if (promoBanners.length <= 1) {
      return showToast('You must keep at least one promotional banner', 'error');
    }
    const updated = promoBanners.filter((_, i) => i !== index);
    setPromoBanners(updated);
    const nextIdx = Math.max(0, Math.min(activeBannerIdx, updated.length - 1));
    setActiveBannerIdx(nextIdx);
    setPreviewSlideIdx(nextIdx);
    showToast('Banner slide removed', 'success');
  };

  const movePromoBanner = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= promoBanners.length) return;
    const updated = [...promoBanners];
    const [removed] = updated.splice(index, 1);
    updated.splice(targetIdx, 0, removed);
    setPromoBanners(updated);
    setActiveBannerIdx(targetIdx);
    setPreviewSlideIdx(targetIdx);
  };

  const handleBannerImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingBannerImage(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });
      const json = await res.json();
      if (json.success) {
        updateActiveBanner('image', json.asset.url);
        updateActiveBanner('imageAssetId', json.asset._id);
        showToast('Banner image uploaded successfully', 'success');
      } else {
        showToast(json.error || 'Failed to upload image', 'error');
      }
    } catch (err) {
      showToast('Error uploading image', 'error');
    } finally {
      setUploadingBannerImage(false);
    }
  };

  // Dynamic Row Helpers
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

  const currentEditBanner = promoBanners[activeBannerIdx] || promoBanners[0];
  const currentPreviewBanner = promoBanners[previewSlideIdx] || promoBanners[0];

  return (
    <div className="p-8 space-y-12 bg-white min-h-screen pb-32">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-black">Storefront Management</h1>
        <p className="text-sm text-zinc-500">Control the content, promotional ad carousels, and layout of your homepage.</p>
      </header>

      {/* 01. PROMOTIONAL AD BANNER CAROUSEL MANAGER (Full Width) */}
      <Card className="space-y-6 border border-zinc-200 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#DCA095] inline-block animate-pulse" />
              <h2 className="text-xs uppercase tracking-widest font-black text-black">
                Promotional Ad Banners (Carousel Slider)
              </h2>
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              Configure multi-slide rotating ad banners with live preview. Left side text content and right side images are fully customizable.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              size="sm"
              variant="outline"
              onClick={addPromoBanner}
              className="border-dashed border-zinc-300 font-bold text-xs"
            >
              + Add New Banner
            </Button>
            <Button
              size="sm"
              onClick={() => handleSave('promo')}
              disabled={saving}
              className="bg-black hover:bg-zinc-800 text-white font-bold"
            >
              {saving ? 'Saving...' : 'Save Promo Banners'}
            </Button>
          </div>
        </div>

        {/* Banner Tabs Navigation */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-zinc-100">
          {promoBanners.map((banner, index) => {
            const isSelected = index === activeBannerIdx;
            return (
              <button
                key={banner._key || index}
                onClick={() => {
                  setActiveBannerIdx(index);
                  setPreviewSlideIdx(index);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap border ${
                  isSelected
                    ? 'bg-black text-white border-black shadow-sm'
                    : 'bg-zinc-50 text-zinc-600 border-zinc-200 hover:bg-zinc-100'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    banner.isActive ? 'bg-emerald-400' : 'bg-zinc-400'
                  }`}
                />
                <span>
                  Slide {index + 1}: {banner.heading ? banner.heading.slice(0, 18) + (banner.heading.length > 18 ? '...' : '') : 'Banner ' + (index + 1)}
                </span>
                {promoBanners.length > 1 && (
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      removePromoBanner(index);
                    }}
                    className="hover:text-red-400 ml-1 text-xs px-1"
                    title="Delete slide"
                  >
                    ✕
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Split Grid: Editor (Left) & Live Preview (Right) */}
        {currentEditBanner && (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start pt-2">
            {/* LEFT: EDITING FIELDS */}
            <div className="xl:col-span-6 space-y-5 bg-zinc-50/70 p-6 rounded-2xl border border-zinc-100">
              <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
                <span className="text-[11px] font-black uppercase tracking-wider text-black">
                  Slide {activeBannerIdx + 1} Settings
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={`active-${currentEditBanner._key}`}
                    checked={currentEditBanner.isActive}
                    onChange={(e) => updateActiveBanner('isActive', e.target.checked)}
                    className="w-4 h-4 accent-black cursor-pointer"
                  />
                  <label
                    htmlFor={`active-${currentEditBanner._key}`}
                    className="text-xs font-bold text-black cursor-pointer"
                  >
                    Active in Store Carousel
                  </label>
                </div>
              </div>

              {/* Tag / Eyebrow */}
              <div>
                <label className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 mb-1.5 block">
                  Eyebrow Tag (Small Header)
                </label>
                <Input
                  value={currentEditBanner.tag}
                  onChange={(e) => updateActiveBanner('tag', e.target.value)}
                  placeholder="✦ EXCLUSIVE WOMEN'S FESTIVES or ✦ CHILDREN'S SPECIAL"
                />
              </div>

              {/* Main Heading */}
              <div>
                <label className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 mb-1.5 block">
                  Main Headline
                </label>
                <Input
                  value={currentEditBanner.heading}
                  onChange={(e) => updateActiveBanner('heading', e.target.value)}
                  placeholder="SPRING SALE IS LIVE! or GIRLS SILK SKIRT"
                />
              </div>

              {/* Subtext Description */}
              <div>
                <label className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 mb-1.5 block">
                  Description Subtext
                </label>
                <textarea
                  rows={3}
                  value={currentEditBanner.subtext}
                  onChange={(e) => updateActiveBanner('subtext', e.target.value)}
                  placeholder="Details about discount, fabrics, occasions, or collections..."
                  className="w-full px-3 py-2 text-sm bg-white border border-zinc-200 rounded-lg focus:outline-none focus:border-black transition-colors resize-none"
                />
              </div>

              {/* Discount Badge & CTA Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 mb-1.5 block">
                    Circular Badge
                  </label>
                  <Input
                    value={currentEditBanner.discount}
                    onChange={(e) => updateActiveBanner('discount', e.target.value)}
                    placeholder="40% or 30% or NEW"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 mb-1.5 block">
                    Button Label
                  </label>
                  <Input
                    value={currentEditBanner.buttonText}
                    onChange={(e) => updateActiveBanner('buttonText', e.target.value)}
                    placeholder="Explore Deals →"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 mb-1.5 block">
                    Button Link
                  </label>
                  <Input
                    value={currentEditBanner.buttonLink}
                    onChange={(e) => updateActiveBanner('buttonLink', e.target.value)}
                    placeholder="/shop or /shop?category=children-silk-skirt"
                  />
                </div>
              </div>

              {/* Right Side Image Upload & Preset Selector */}
              <div className="pt-2 border-t border-zinc-200">
                <label className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 mb-2 block">
                  Right-Side Banner Image
                </label>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  {/* Thumbnail */}
                  <div className="w-28 h-20 rounded-xl border border-zinc-200 overflow-hidden bg-black/10 shrink-0 relative">
                    <img
                      src={currentEditBanner.image || currentEditBanner.customImageUrl || '/images/poster-image.png'}
                      alt="Banner Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 space-y-2 w-full">
                    {/* File Upload Button */}
                    <label className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-zinc-300 bg-white hover:bg-zinc-50 cursor-pointer text-xs font-bold text-black transition-colors w-full sm:w-auto shadow-xs">
                      <span>📁</span>
                      <span>{uploadingBannerImage ? 'Uploading Image to Sanity...' : 'Upload New Image'}</span>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleBannerImageUpload}
                        disabled={uploadingBannerImage}
                      />
                    </label>

                    {/* Quick Presets */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[9px] text-zinc-400 uppercase font-bold mr-1">Presets:</span>
                      <button
                        type="button"
                        onClick={() => {
                          updateActiveBanner('image', '/images/banner-child.png');
                          updateActiveBanner('customImageUrl', '/images/banner-child.png');
                        }}
                        className="text-[10px] px-2.5 py-1 rounded-md bg-white border border-zinc-200 hover:bg-zinc-100 font-medium text-zinc-700"
                      >
                        👧 Kids Silk Skirt (banner-child.png)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          updateActiveBanner('image', '/images/poster-image.png');
                          updateActiveBanner('customImageUrl', '/images/poster-image.png');
                        }}
                        className="text-[10px] px-2.5 py-1 rounded-md bg-white border border-zinc-200 hover:bg-zinc-100 font-medium text-zinc-700"
                      >
                        🛋️ Women's Leggings (poster-image.png)
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order / Position Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-zinc-200 text-xs">
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={activeBannerIdx === 0}
                    onClick={() => movePromoBanner(activeBannerIdx, 'up')}
                    className="text-xs"
                  >
                    ↑ Move Slide Earlier
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={activeBannerIdx === promoBanners.length - 1}
                    onClick={() => movePromoBanner(activeBannerIdx, 'down')}
                    className="text-xs"
                  >
                    ↓ Move Slide Later
                  </Button>
                </div>

                {promoBanners.length > 1 && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => removePromoBanner(activeBannerIdx)}
                    className="text-xs text-red-600 border-red-200 hover:bg-red-50"
                  >
                    Delete Slide
                  </Button>
                )}
              </div>
            </div>

            {/* RIGHT: LIVE REAL-TIME PREVIEW */}
            <div className="xl:col-span-6 space-y-4 sticky top-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  <span className="text-[10px] uppercase tracking-widest font-black text-black">
                    Live Storefront Preview
                  </span>
                </div>
                {promoBanners.length > 1 && (
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-zinc-400 font-bold uppercase">
                      Slide {previewSlideIdx + 1} of {promoBanners.length}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setPreviewSlideIdx((prev) => (prev - 1 + promoBanners.length) % promoBanners.length)
                      }
                      className="w-6 h-6 rounded-full bg-zinc-100 hover:bg-zinc-200 text-black flex items-center justify-center text-xs font-bold"
                    >
                      ‹
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setPreviewSlideIdx((prev) => (prev + 1) % promoBanners.length)
                      }
                      className="w-6 h-6 rounded-full bg-zinc-100 hover:bg-zinc-200 text-black flex items-center justify-center text-xs font-bold"
                    >
                      ›
                    </button>
                  </div>
                )}
              </div>

              {/* Exact Storefront Banner Card Container */}
              <div className="relative bg-onyx rounded-2xl overflow-hidden shadow-2xl min-h-[300px] border border-zinc-800 text-white">
                <div className="grid grid-cols-1 md:grid-cols-12 items-stretch h-full">
                  {/* Left Column Text */}
                  <div className="md:col-span-5 p-6 md:p-8 flex flex-col justify-center space-y-3 z-10 bg-onyx">
                    <span className="text-amber-400 font-black text-[8px] tracking-[0.2em] uppercase">
                      {currentPreviewBanner?.tag || "✦ EXCLUSIVE WOMEN'S FESTIVES"}
                    </span>
                    <h3 className="text-xl md:text-2xl font-black uppercase tracking-tight leading-tight text-white">
                      {currentPreviewBanner?.heading || 'SPRING SALE IS LIVE!'}
                    </h3>
                    <p className="text-[11px] text-white/70 font-medium leading-relaxed">
                      {currentPreviewBanner?.subtext || 'Enjoy up to 40% off on selected clothing collections.'}
                    </p>
                    <div className="pt-1">
                      <span className="inline-block text-[8px] bg-[#DCA095] text-zinc-950 font-black px-4 py-2 rounded-full uppercase tracking-wider shadow-sm">
                        {currentPreviewBanner?.buttonText || 'Explore Deals →'}
                      </span>
                    </div>
                  </div>

                  {/* Center Circular Badge */}
                  {currentPreviewBanner?.discount && (
                    <div className="hidden md:flex absolute left-[38%] top-1/2 -translate-y-1/2 z-20 w-16 h-16 bg-[#DCA095] text-white rounded-full border-[3px] border-[#18181B] flex flex-col items-center justify-center shadow-lg pointer-events-none">
                      <span className="text-[7px] uppercase tracking-widest font-black opacity-80 leading-none">
                        Up To
                      </span>
                      <span className="text-sm font-black leading-none my-0.5">
                        {currentPreviewBanner.discount}
                      </span>
                      <span className="text-[7px] uppercase tracking-widest font-black opacity-80 leading-none">
                        Off
                      </span>
                    </div>
                  )}

                  {/* Right Column Image */}
                  <div className="md:col-span-7 relative min-h-[160px] md:min-h-[280px] bg-black/50">
                    <img
                      src={
                        currentPreviewBanner?.image ||
                        currentPreviewBanner?.customImageUrl ||
                        '/images/poster-image.png'
                      }
                      alt="Banner Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* Preview Dots */}
                {promoBanners.length > 1 && (
                  <div className="absolute left-6 bottom-3 z-30 flex items-center gap-1.5">
                    {promoBanners.map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setPreviewSlideIdx(i)}
                        className={`h-1.5 rounded-full transition-all ${
                          i === previewSlideIdx ? 'w-5 bg-[#DCA095]' : 'w-1.5 bg-white/40'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-amber-50 border border-amber-200/60 p-3 rounded-xl text-amber-900 text-xs">
                💡 <strong>Live Tip:</strong> Clicking the tabs or the navigation arrows above previews each slide in the carousel. Once saved, these slides will automatically rotate one-by-one on the landing page!
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* OTHER SECTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* HERO SECTION */}
        <Card className="space-y-6">
          <div className="flex justify-between items-center border-b border-zinc-100 pb-4">
            <h2 className="text-[11px] uppercase tracking-widest font-bold text-black">Hero Slider Section</h2>
            <Button size="sm" onClick={() => handleSave('hero')} disabled={saving}>
              Save Hero
            </Button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 mb-2 block">
                Heading
              </label>
              <Input
                value={heroHeading}
                onChange={(e) => setHeroHeading(e.target.value)}
                placeholder="WEAR YOUR confidence"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 mb-2 block">
                Subtext
              </label>
              <Input
                value={heroSubtext}
                onChange={(e) => setHeroSubtext(e.target.value)}
                placeholder="Trendy pieces. Timeless style."
              />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 mb-2 block">
                Button Text
              </label>
              <Input
                value={heroButtonText}
                onChange={(e) => setHeroButtonText(e.target.value)}
                placeholder="SHOP NEW IN"
              />
            </div>
            <div className="pt-4 border-t border-zinc-100">
              <label className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 mb-4 block">
                Background Slider Images
              </label>
              <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
                {heroImages.map((img, i) => (
                  <div
                    key={i}
                    className="relative shrink-0 w-32 h-32 rounded-lg border border-zinc-200 overflow-hidden group"
                  >
                    <img
                      src={img.url || ''}
                      className="w-full h-full object-cover"
                      alt="Hero Background"
                    />
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
                  <span className="text-[10px] font-bold text-zinc-500">
                    {uploadingImage ? 'UPLOADING...' : 'ADD IMAGE'}
                  </span>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleHeroImageUpload}
                    disabled={uploadingImage}
                  />
                </label>
              </div>
            </div>
          </div>
        </Card>

        {/* CTA SECTION */}
        <Card className="space-y-6">
          <div className="flex justify-between items-center border-b border-zinc-100 pb-4">
            <h2 className="text-[11px] uppercase tracking-widest font-bold text-black">Global CTA (Bottom)</h2>
            <Button size="sm" onClick={() => handleSave('cta')} disabled={saving}>
              Save CTA
            </Button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 mb-2 block">
                Heading
              </label>
              <Input
                value={ctaHeading}
                onChange={(e) => setCtaHeading(e.target.value)}
                placeholder="JOIN THE COLLECTION"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 mb-2 block">
                Button Text
              </label>
              <Input
                value={ctaButtonText}
                onChange={(e) => setCtaButtonText(e.target.value)}
                placeholder="EXPLORE SHOP"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 mb-2 block">
                Button Link
              </label>
              <Input
                value={ctaButtonLink}
                onChange={(e) => setCtaButtonLink(e.target.value)}
                placeholder="/shop"
              />
            </div>
          </div>
        </Card>

        {/* Dynamic Rows Info */}
        <Card className="space-y-6 lg:col-span-2">
          <div className="flex justify-between items-center border-b border-zinc-100 pb-4">
            <h2 className="text-[11px] uppercase tracking-widest font-bold text-black">Dynamic Product Rows</h2>
            <Button size="sm" onClick={() => handleSave('rows')} disabled={saving}>
              Save Rows
            </Button>
          </div>
          <div className="space-y-6">
            {dynamicRows.map((row, index) => (
              <div
                key={row._key || index}
                className="flex gap-4 items-end bg-zinc-50 p-4 rounded-lg border border-zinc-100"
              >
                <div className="flex-1">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 mb-2 block">
                    Row Title
                  </label>
                  <Input
                    value={row.title}
                    onChange={(e) => updateRow(index, 'title', e.target.value)}
                    placeholder="e.g. Trending Leggings"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 mb-2 block">
                    Category
                  </label>
                  <select
                    className="w-full h-10 px-3 bg-white border border-zinc-200 text-sm focus:outline-none focus:border-black transition-colors"
                    value={row.categoryId}
                    onChange={(e) => updateRow(index, 'categoryId', e.target.value)}
                  >
                    <option value="">Select Category</option>
                    {allCategories.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeRow(index)}
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  Remove
                </Button>
              </div>
            ))}
            <Button variant="outline" onClick={addRow} className="w-full border-dashed">
              + Add Product Row
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
