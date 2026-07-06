'use client';

import { useState, useEffect } from 'react';
import Card from '@/shared/ui/Card';
import Badge from '@/shared/ui/Badge';
import Button from '@/shared/ui/Button';
import Skeleton from '@/shared/ui/Skeleton';

interface Variant {
  _key?: string;
  sku?: string;
  color: string;
  size: string;
  stock: number;
  price?: number;
}

interface Product {
  _id: string;
  name: string;
  slug: string;
  price: number;
  comparePrice?: number;
  stock: number;
  description: string;
  imageUrl?: string;
  externalImageUrl?: string;
  externalGalleryUrls?: string[];
  category: string;
  categoryId: string;
  variants?: Variant[];
}

interface Category {
  _id: string;
  name: string;
}

const AVAILABLE_SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Drawer/Modal State
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  // Form State
  const [formName, setFormName] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formStock, setFormStock] = useState('0'); // Fallback quantity
  const [formCategory, setFormCategory] = useState('');
  const [formDescription, setFormDescription] = useState('');
  
  // Image states
  const [formImageAssetId, setFormImageAssetId] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formExternalImageUrl, setFormExternalImageUrl] = useState('');
  const [formExternalGalleryUrls, setFormExternalGalleryUrls] = useState<string[]>([]);
  
  // Variants (Color + Size Stock) state
  const [formVariants, setFormVariants] = useState<Variant[]>([]);

  // Local helper states
  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/admin/products');
      const data = await res.json();
      if (data.success) {
        setProducts(data.products || []);
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormName('');
    setFormPrice('');
    setFormStock('0');
    setFormCategory(categories[0]?._id || '');
    setFormDescription('');
    setFormImageAssetId('');
    setFormImageUrl('');
    setFormExternalImageUrl('');
    setFormExternalGalleryUrls([]);
    setFormVariants([]);
    setIsDrawerOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setFormName(product.name);
    setFormPrice(product.price.toString());
    setFormStock(product.stock.toString());
    setFormCategory(product.categoryId || '');
    setFormDescription(product.description || '');
    setFormImageAssetId('');
    setFormImageUrl(product.imageUrl || '');
    setFormExternalImageUrl(product.externalImageUrl || '');
    setFormExternalGalleryUrls(product.externalGalleryUrls || []);
    setFormVariants(product.variants || []);
    setIsDrawerOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/admin/products/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setFormImageAssetId(data.assetId);
        setFormImageUrl(data.url);
      } else {
        alert('Upload failed: ' + data.error);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Upload failed');
    } finally {
      setUploadingImage(false);
    }
  };

  // Gallery URLs Management
  const addGalleryUrlField = () => {
    setFormExternalGalleryUrls([...formExternalGalleryUrls, '']);
  };

  const updateGalleryUrlField = (index: number, val: string) => {
    const updated = [...formExternalGalleryUrls];
    updated[index] = val;
    setFormExternalGalleryUrls(updated);
  };

  const removeGalleryUrlField = (index: number) => {
    const updated = [...formExternalGalleryUrls];
    updated.splice(index, 1);
    setFormExternalGalleryUrls(updated);
  };

  // Variants Management
  const addVariantField = () => {
    setFormVariants([...formVariants, { color: '', size: 'M', stock: 10 }]);
  };

  const updateVariantField = (index: number, field: keyof Variant, val: any) => {
    const updated = [...formVariants];
    updated[index] = {
      ...updated[index],
      [field]: val
    };
    setFormVariants(updated);
  };

  const removeVariantField = (index: number) => {
    const updated = [...formVariants];
    updated.splice(index, 1);
    setFormVariants(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formPrice || !formCategory) {
      alert('Please fill out all required fields.');
      return;
    }

    setSubmitLoading(true);

    const payload = {
      id: editingProduct?._id,
      name: formName,
      price: parseFloat(formPrice),
      stock: parseInt(formStock) || 0,
      description: formDescription,
      categoryId: formCategory,
      imageAssetId: formImageAssetId || undefined,
      externalImageUrl: formExternalImageUrl,
      externalGalleryUrls: formExternalGalleryUrls.filter(Boolean),
      variants: formVariants.filter(v => v.color && v.size),
    };

    try {
      const res = await fetch('/api/admin/products', {
        method: editingProduct ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setIsDrawerOpen(false);
        fetchProducts();
      } else {
        alert('Failed to save: ' + data.error);
      }
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Failed to save product');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const res = await fetch(`/api/admin/products?id=${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        fetchProducts();
      } else {
        alert('Delete failed: ' + data.error);
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Delete failed');
    }
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-8 space-y-8">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-[500px] w-full" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-12 bg-white min-h-screen relative">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-zinc-100 pb-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-black uppercase">Products</h1>
          <p className="text-sm text-zinc-500 font-medium">Manage your product catalog, sizes/colors inventory, and photo galleries.</p>
        </div>
        <Button 
          onClick={handleOpenAdd}
          className="h-12 px-6 uppercase tracking-widest text-[10px] font-black"
        >
          Add Product
        </Button>
      </header>

      {/* Filter and List */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h3 className="text-[11px] uppercase tracking-widest font-black text-black">
            Product Catalogue <span className="text-zinc-400 ml-2">({filteredProducts.length} Items)</span>
          </h3>
          <input
            type="text"
            placeholder="Search products or categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-80 h-10 px-4 bg-zinc-50 border border-zinc-200 text-xs font-medium uppercase tracking-wider focus:outline-none focus:border-black transition-colors"
          />
        </div>

        <Card padding={false} className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-100">
                  <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-black text-zinc-500 whitespace-nowrap">Product</th>
                  <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-black text-zinc-500 whitespace-nowrap">Category</th>
                  <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-black text-zinc-500 whitespace-nowrap">Price</th>
                  <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-black text-zinc-500 whitespace-nowrap">Sizes & Inventory</th>
                  <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-black text-zinc-500 whitespace-nowrap text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredProducts.map((product) => (
                  <tr key={product._id} className="hover:bg-zinc-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-15 bg-zinc-100 overflow-hidden flex-shrink-0 flex items-center justify-center border border-zinc-100">
                          {product.imageUrl || product.externalImageUrl ? (
                            <img src={product.imageUrl || product.externalImageUrl} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-zinc-300 text-xs">📷</span>
                          )}
                        </div>
                        <div>
                          <p className="text-xs font-black text-black uppercase">{product.name}</p>
                          <p className="text-[10px] font-mono text-zinc-400 mt-1">ID: {product._id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="outline" className="text-[9px] uppercase tracking-widest font-bold border-zinc-200">
                        {product.category || 'General'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-xs font-black text-black">
                      ₹{product.price.toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <p className="text-xs font-black text-black">Total Stock: {product.stock}</p>
                        {product.variants && product.variants.length > 0 ? (
                          <div className="flex flex-wrap gap-1 mt-1 max-w-[280px]">
                            {product.variants.map((v, idx) => (
                              <span key={idx} className="inline-block text-[8px] bg-zinc-100 text-zinc-600 px-1.5 py-0.5 rounded font-medium">
                                {v.color}-{v.size}: <strong>{v.stock}</strong>
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-[9px] text-zinc-400 italic">No variants configured</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-3">
                        <button
                          onClick={() => handleOpenEdit(product)}
                          className="text-[9px] font-black uppercase tracking-widest text-zinc-600 hover:text-black transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(product._id)}
                          className="text-[9px] font-black uppercase tracking-widest text-red-600 hover:text-red-800 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredProducts.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-24 text-center text-xs text-zinc-400 italic uppercase tracking-wider font-bold">
                      No products found. Click "Add Product" to create one.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Drawer Overlay & Content */}
      {isDrawerOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[200] flex justify-end animate-in fade-in duration-300">
          <div className="w-full max-w-xl bg-white h-full p-8 shadow-2xl overflow-y-auto flex flex-col justify-between animate-in slide-in-from-right duration-300">
            <div className="space-y-8 pb-10">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-zinc-100 pb-6">
                <h2 className="text-lg font-black uppercase tracking-tight">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h2>
                <button 
                  onClick={() => setIsDrawerOpen(false)}
                  className="text-zinc-400 hover:text-black font-black text-sm uppercase tracking-widest"
                >
                  Close ×
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* 1. Basic Info */}
                <div className="space-y-4">
                  <h4 className="text-[10px] uppercase tracking-widest font-black text-black border-b border-zinc-100 pb-2">1. Basic Details</h4>
                  
                  <div className="space-y-2">
                    <label className="block text-[9px] uppercase tracking-widest font-black text-zinc-400">Product Name *</label>
                    <input
                      type="text"
                      required
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="e.g. Silk Blend Saree"
                      className="w-full h-11 px-4 bg-zinc-50 border border-zinc-200 text-xs font-bold uppercase tracking-wider focus:outline-none focus:border-black transition-colors"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-[9px] uppercase tracking-widest font-black text-zinc-400">Price (INR) *</label>
                      <input
                        type="number"
                        required
                        min="0"
                        value={formPrice}
                        onChange={(e) => setFormPrice(e.target.value)}
                        placeholder="1499"
                        className="w-full h-11 px-4 bg-zinc-50 border border-zinc-200 text-xs font-bold uppercase tracking-wider focus:outline-none focus:border-black transition-colors"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[9px] uppercase tracking-widest font-black text-zinc-400">Category *</label>
                      <select
                        value={formCategory}
                        onChange={(e) => setFormCategory(e.target.value)}
                        className="w-full h-11 px-4 bg-zinc-50 border border-zinc-200 text-xs font-black uppercase tracking-widest focus:outline-none focus:border-black transition-colors"
                      >
                        {categories.map((cat) => (
                          <option key={cat._id} value={cat._id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* 2. Inventory & Size Breakdown */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
                    <h4 className="text-[10px] uppercase tracking-widest font-black text-black">2. Sizes & Stock Quantities</h4>
                    <button
                      type="button"
                      onClick={addVariantField}
                      className="text-[9px] font-black uppercase tracking-widest text-zinc-500 hover:text-black transition-colors"
                    >
                      + Add Size/Color
                    </button>
                  </div>

                  {formVariants.length > 0 ? (
                    <div className="space-y-3">
                      {formVariants.map((v, idx) => (
                        <div key={idx} className="flex gap-2 items-center bg-zinc-50 p-3 border border-zinc-100 rounded-lg">
                          <input
                            type="text"
                            required
                            placeholder="Color (e.g. Red)"
                            value={v.color}
                            onChange={(e) => updateVariantField(idx, 'color', e.target.value)}
                            className="w-1/3 h-10 px-3 bg-white border border-zinc-200 text-xs font-bold uppercase tracking-wider focus:outline-none focus:border-black"
                          />
                          <select
                            value={v.size}
                            onChange={(e) => updateVariantField(idx, 'size', e.target.value)}
                            className="w-1/4 h-10 px-2 bg-white border border-zinc-200 text-[10px] font-black uppercase tracking-widest"
                          >
                            {AVAILABLE_SIZES.map(sz => <option key={sz} value={sz}>{sz}</option>)}
                          </select>
                          <input
                            type="number"
                            required
                            min="0"
                            placeholder="Stock"
                            value={v.stock}
                            onChange={(e) => updateVariantField(idx, 'stock', parseInt(e.target.value) || 0)}
                            className="w-1/4 h-10 px-3 bg-white border border-zinc-200 text-xs font-bold focus:outline-none focus:border-black"
                          />
                          <button
                            type="button"
                            onClick={() => removeVariantField(idx)}
                            className="text-red-500 hover:text-red-700 font-bold px-2 text-sm"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="block text-[9px] uppercase tracking-widest font-black text-zinc-400">Total Stock (No Variants Fallback)</label>
                        <input
                          type="number"
                          min="0"
                          value={formStock}
                          onChange={(e) => setFormStock(e.target.value)}
                          placeholder="50"
                          className="w-full h-11 px-4 bg-zinc-50 border border-zinc-200 text-xs font-bold uppercase tracking-wider focus:outline-none focus:border-black transition-colors"
                        />
                      </div>
                      <p className="text-[9px] text-zinc-400 uppercase tracking-wide">
                        💡 Click "+ Add Size/Color" to configure stock levels for specific colors and sizes.
                      </p>
                    </div>
                  )}
                </div>

                {/* 3. Product Photos & Multiple Option */}
                <div className="space-y-6">
                  <h4 className="text-[10px] uppercase tracking-widest font-black text-black border-b border-zinc-100 pb-2">3. Product Photos</h4>
                  
                  {/* Main image options */}
                  <div className="space-y-4 bg-zinc-50 p-4 border border-zinc-100 rounded-xl">
                    <span className="block text-[9px] uppercase tracking-widest font-black text-zinc-500">Featured Image Option</span>
                    
                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-2">
                        <label className="block text-[8px] uppercase tracking-widest font-black text-zinc-400">Image Address Link (URL)</label>
                        <input
                          type="text"
                          value={formExternalImageUrl}
                          onChange={(e) => setFormExternalImageUrl(e.target.value)}
                          placeholder="https://example.com/image.jpg"
                          className="w-full h-10 px-4 bg-white border border-zinc-200 text-xs font-medium focus:outline-none focus:border-black transition-colors"
                        />
                      </div>

                      <div className="text-center text-[10px] text-zinc-300 font-bold uppercase tracking-widest">OR</div>

                      <div className="space-y-2">
                        <label className="block text-[8px] uppercase tracking-widest font-black text-zinc-400">Upload Image File</label>
                        <div className="border border-dashed border-zinc-200 p-4 text-center bg-white hover:border-black transition-colors relative">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                          />
                          {uploadingImage ? (
                            <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest animate-pulse">Uploading...</p>
                          ) : formImageUrl ? (
                            <div className="space-y-1">
                              <img src={formImageUrl} alt="Uploaded File Preview" className="h-16 mx-auto object-cover border border-zinc-100" />
                              <p className="text-[8px] font-black text-green-600 uppercase tracking-widest">✓ File uploaded</p>
                            </div>
                          ) : (
                            <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Click to select file</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Multiple Gallery Photos */}
                  <div className="space-y-4 bg-zinc-50 p-4 border border-zinc-100 rounded-xl">
                    <div className="flex items-center justify-between border-b border-zinc-200 pb-2">
                      <span className="block text-[9px] uppercase tracking-widest font-black text-zinc-500">Image Gallery Links</span>
                      <button
                        type="button"
                        onClick={addGalleryUrlField}
                        className="text-[8px] font-black uppercase tracking-widest text-zinc-500 hover:text-black transition-colors"
                      >
                        + Add Image Link
                      </button>
                    </div>

                    {formExternalGalleryUrls.length > 0 ? (
                      <div className="space-y-3">
                        {formExternalGalleryUrls.map((url, idx) => (
                          <div key={idx} className="flex gap-2 items-center">
                            <input
                              type="text"
                              value={url}
                              onChange={(e) => updateGalleryUrlField(idx, e.target.value)}
                              placeholder="https://example.com/gallery-image.jpg"
                              className="flex-grow h-10 px-4 bg-white border border-zinc-200 text-xs font-medium focus:outline-none focus:border-black"
                            />
                            {url && (
                              <div className="w-10 h-10 overflow-hidden flex-shrink-0 bg-white border border-zinc-150 rounded">
                                <img src={url} className="w-full h-full object-cover" alt="Preview" onError={(e)=>{(e.target as any).style.display='none'}}/>
                              </div>
                            )}
                            <button
                              type="button"
                              onClick={() => removeGalleryUrlField(idx)}
                              className="text-red-500 hover:text-red-700 font-bold px-2 text-sm"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[9px] text-zinc-400 italic uppercase tracking-wider">No additional gallery photos added.</p>
                    )}
                  </div>
                </div>

                {/* 4. Description */}
                <div className="space-y-2">
                  <h4 className="text-[10px] uppercase tracking-widest font-black text-black border-b border-zinc-100 pb-2">4. Description</h4>
                  <textarea
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    rows={4}
                    placeholder="Enter product details..."
                    className="w-full p-4 bg-zinc-50 border border-zinc-200 text-xs font-medium focus:outline-none focus:border-black transition-colors resize-none"
                  />
                </div>
              </form>
            </div>

            {/* Footer Actions */}
            <div className="flex gap-4 border-t border-zinc-100 pt-6 mt-8">
              <Button
                variant="outline"
                onClick={() => setIsDrawerOpen(false)}
                className="w-1/2 h-12 uppercase tracking-widest text-[9px] font-black"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={submitLoading || uploadingImage}
                className="w-1/2 h-12 uppercase tracking-widest text-[9px] font-black"
              >
                {submitLoading ? 'Saving...' : 'Save Product'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
