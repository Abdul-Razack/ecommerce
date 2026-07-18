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

interface ColorVariantGroup {
  id: string;
  color: string;
  imageAssetIds: string[];
  uploadedImages: Array<{ assetId: string; url: string }>;
  externalImageUrls: string[];
  sizes: { [size: string]: { stock: number; price?: number } };
}

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
  const [formUploadedGallery, setFormUploadedGallery] = useState<Array<{ assetId: string; url: string }>>([]);
  const [formExternalGalleryUrls, setFormExternalGalleryUrls] = useState<string[]>([]);
  
  // Color-wise Grouped Variants state
  const [formColorGroups, setFormColorGroups] = useState<ColorVariantGroup[]>([]);

  // Local helper states
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [uploadingColorId, setUploadingColorId] = useState<string | null>(null);
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

  const parseFlatVariantsToGroups = (flat: any[] | undefined): ColorVariantGroup[] => {
    if (!flat || flat.length === 0) return [];
    const groupsMap: { [color: string]: ColorVariantGroup } = {};
    
    flat.forEach((v) => {
      const color = v.color || '';
      if (!groupsMap[color]) {
        const uploadedImages = (v.images || []).map((img: any) => ({
          assetId: img.assetId || '',
          url: img.url || ''
        }));
        const imageAssetIds = uploadedImages.map((img: any) => img.assetId).filter(Boolean);
        const externalImageUrls = v.externalImageUrls || [];
        
        groupsMap[color] = {
          id: Math.random().toString(36).substring(2, 9),
          color,
          imageAssetIds,
          uploadedImages,
          externalImageUrls,
          sizes: {}
        };
        // Populate all AVAILABLE_SIZES with default 0 stock
        AVAILABLE_SIZES.forEach(sz => {
          groupsMap[color].sizes[sz] = { stock: 0 };
        });
      }
      
      groupsMap[color].sizes[v.size] = {
        stock: v.stock || 0,
        price: v.price || undefined
      };
    });
    
    return Object.values(groupsMap);
  };

  const serializeGroupsToFlatVariants = (groups: ColorVariantGroup[]): any[] => {
    const flat: any[] = [];
    groups.forEach((g) => {
      if (!g.color) return; // Skip groups without a color name
      Object.entries(g.sizes).forEach(([size, data]) => {
        flat.push({
          color: g.color,
          size: size,
          stock: data.stock || 0,
          price: data.price || undefined,
          imageAssetIds: g.imageAssetIds,
          externalImageUrls: g.externalImageUrls.filter(Boolean)
        });
      });
    });
    return flat;
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
    setFormUploadedGallery([]);
    setFormExternalGalleryUrls([]);
    setFormColorGroups([]);
    setIsDrawerOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setFormName(product.name);
    setFormPrice(product.price.toString());
    setFormStock(product.stock.toString());
    setFormCategory(product.categoryId || '');
    setFormDescription(product.description || '');
    setFormImageAssetId((product as any).imageAssetId || '');
    setFormImageUrl(product.imageUrl || '');
    setFormExternalImageUrl(product.externalImageUrl || '');
    setFormUploadedGallery((product as any).gallery || []);
    setFormExternalGalleryUrls(product.externalGalleryUrls || []);
    setFormColorGroups(parseFlatVariantsToGroups(product.variants));
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

  const handleGalleryImagesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingGallery(true);
    const newUploads: Array<{ assetId: string; url: string }> = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch('/api/admin/products/upload', {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();
        if (data.success) {
          newUploads.push({ assetId: data.assetId, url: data.url });
        } else {
          console.error('Failed to upload gallery file:', file.name, data.error);
        }
      }

      if (newUploads.length > 0) {
        setFormUploadedGallery([...formUploadedGallery, ...newUploads]);
      }
    } catch (error) {
      console.error('Error uploading gallery files:', error);
      alert('Error uploading one or more files');
    } finally {
      setUploadingGallery(false);
    }
  };

  const removeUploadedGalleryItem = (assetId: string) => {
    setFormUploadedGallery(formUploadedGallery.filter(item => item.assetId !== assetId));
  };

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

  // Color Group Variant Handlers
  const addColorGroup = () => {
    const initialSizes: { [size: string]: { stock: number; price?: number } } = {};
    AVAILABLE_SIZES.forEach(sz => {
      initialSizes[sz] = { stock: 0 };
    });

    setFormColorGroups([...formColorGroups, {
      id: Math.random().toString(36).substring(2, 9),
      color: '',
      imageAssetIds: [],
      uploadedImages: [],
      externalImageUrls: [],
      sizes: initialSizes
    }]);
  };

  const removeColorGroup = (id: string) => {
    setFormColorGroups(formColorGroups.filter(g => g.id !== id));
  };

  const updateColorName = (id: string, color: string) => {
    setFormColorGroups(formColorGroups.map(g => g.id === id ? { ...g, color } : g));
  };

  const updateColorSizeStock = (groupId: string, size: string, stock: number) => {
    setFormColorGroups(formColorGroups.map(g => {
      if (g.id === groupId) {
        const currentSize = g.sizes[size] || { stock: 0 };
        return {
          ...g,
          sizes: {
            ...g.sizes,
            [size]: { ...currentSize, stock }
          }
        };
      }
      return g;
    }));
  };

  const updateColorSizePrice = (groupId: string, size: string, price: number | undefined) => {
    setFormColorGroups(formColorGroups.map(g => {
      if (g.id === groupId) {
        const currentSize = g.sizes[size] || { stock: 0 };
        return {
          ...g,
          sizes: {
            ...g.sizes,
            [size]: { ...currentSize, price }
          }
        };
      }
      return g;
    }));
  };

  const handleColorImagesUpload = async (groupId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingColorId(groupId);
    const newUploads: Array<{ assetId: string; url: string }> = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch('/api/admin/products/upload', {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();
        if (data.success) {
          newUploads.push({ assetId: data.assetId, url: data.url });
        } else {
          console.error('Failed to upload variant file:', file.name, data.error);
        }
      }

      if (newUploads.length > 0) {
        setFormColorGroups(formColorGroups.map(g => {
          if (g.id === groupId) {
            const uploaded = [...g.uploadedImages, ...newUploads];
            const assetIds = uploaded.map(u => u.assetId);
            return {
              ...g,
              uploadedImages: uploaded,
              imageAssetIds: assetIds
            };
          }
          return g;
        }));
      }
    } catch (error) {
      console.error('Error uploading variant files:', error);
      alert('Error uploading one or more files');
    } finally {
      setUploadingColorId(null);
    }
  };

  const removeColorImage = (groupId: string, assetId: string) => {
    setFormColorGroups(formColorGroups.map(g => {
      if (g.id === groupId) {
        const uploaded = g.uploadedImages.filter(img => img.assetId !== assetId);
        const assetIds = uploaded.map(u => u.assetId);
        return {
          ...g,
          uploadedImages: uploaded,
          imageAssetIds: assetIds
        };
      }
      return g;
    }));
  };

  const addColorExternalUrl = (groupId: string) => {
    setFormColorGroups(formColorGroups.map(g => {
      if (g.id === groupId) {
        return { ...g, externalImageUrls: [...g.externalImageUrls, ''] };
      }
      return g;
    }));
  };

  const updateColorExternalUrl = (groupId: string, index: number, val: string) => {
    setFormColorGroups(formColorGroups.map(g => {
      if (g.id === groupId) {
        const updated = [...g.externalImageUrls];
        updated[index] = val;
        return { ...g, externalImageUrls: updated };
      }
      return g;
    }));
  };

  const removeColorExternalUrl = (groupId: string, index: number) => {
    setFormColorGroups(formColorGroups.map(g => {
      if (g.id === groupId) {
        const updated = [...g.externalImageUrls];
        updated.splice(index, 1);
        return { ...g, externalImageUrls: updated };
      }
      return g;
    }));
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
      galleryImageIds: formUploadedGallery.map(img => img.assetId).filter(Boolean),
      externalGalleryUrls: formExternalGalleryUrls.filter(Boolean),
      variants: serializeGroupsToFlatVariants(formColorGroups),
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

        <Card padding="p-0" className="overflow-hidden">
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

      {/* Modal Overlay & Content */}
      {isDrawerOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[200] flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-300">
          <div className="w-full max-w-4xl bg-white rounded-2xl p-8 shadow-2xl max-h-[90vh] overflow-y-auto flex flex-col justify-between animate-in zoom-in-95 duration-300">
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

                {/* 2. Color-wise Variants breakdown */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
                    <h4 className="text-[10px] uppercase tracking-widest font-black text-black">2. Color Variant Configurations</h4>
                    <button
                      type="button"
                      onClick={addColorGroup}
                      className="text-[9px] font-black uppercase tracking-widest text-zinc-500 hover:text-black transition-colors"
                    >
                      + Add Color Option
                    </button>
                  </div>

                  {formColorGroups.length > 0 ? (
                    <div className="space-y-8">
                      {formColorGroups.map((group) => (
                        <div key={group.id} className="border border-zinc-200 rounded-xl p-6 bg-zinc-50/50 space-y-6 relative">
                          <button
                            type="button"
                            onClick={() => removeColorGroup(group.id)}
                            className="absolute top-4 right-4 text-[9px] font-black uppercase tracking-widest text-red-655 hover:text-red-700 transition-colors"
                          >
                            Remove Color
                          </button>

                          {/* Color input */}
                          <div className="space-y-2 max-w-xs">
                            <label className="block text-[9px] uppercase tracking-widest font-black text-zinc-400">Color Name *</label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. Ruby Red"
                              value={group.color}
                              onChange={(e) => updateColorName(group.id, e.target.value)}
                              className="w-full h-10 px-3 bg-white border border-zinc-200 text-xs font-bold uppercase tracking-wider focus:outline-none focus:border-black"
                            />
                          </div>

                          {/* Color wise images */}
                          <div className="space-y-4 bg-white p-4 border border-zinc-100 rounded-lg">
                            <span className="block text-[9px] uppercase tracking-widest font-black text-zinc-500">Color-Wise Images</span>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {/* Color uploads */}
                              <div className="space-y-2">
                                <label className="block text-[8px] uppercase tracking-widest font-black text-zinc-400">Upload Images for {group.color || 'this color'}</label>
                                <div className="border border-dashed border-zinc-200 p-4 text-center bg-zinc-50 hover:border-black transition-colors relative rounded">
                                  <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={(e) => handleColorImagesUpload(group.id, e)}
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                    disabled={uploadingColorId === group.id}
                                  />
                                  {uploadingColorId === group.id ? (
                                    <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest animate-pulse">Uploading variant images...</p>
                                  ) : (
                                    <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Click to upload multiple files</p>
                                  )}
                                </div>
                              </div>

                              {/* Color manual external links */}
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <label className="block text-[8px] uppercase tracking-widest font-black text-zinc-400">Manual Image URLs</label>
                                  <button
                                    type="button"
                                    onClick={() => addColorExternalUrl(group.id)}
                                    className="text-[8px] font-black uppercase tracking-widest text-zinc-500 hover:text-black transition-colors"
                                  >
                                    + Add URL
                                  </button>
                                </div>
                                {group.externalImageUrls.length > 0 ? (
                                  <div className="space-y-2">
                                    {group.externalImageUrls.map((url, urlIdx) => (
                                      <div key={urlIdx} className="flex gap-2 items-center">
                                        <input
                                          type="text"
                                          placeholder="https://example.com/image.jpg"
                                          value={url}
                                          onChange={(e) => updateColorExternalUrl(group.id, urlIdx, e.target.value)}
                                          className="flex-grow h-9 px-3 bg-zinc-50 border border-zinc-200 text-xs font-medium focus:outline-none focus:border-black"
                                        />
                                        <button
                                          type="button"
                                          onClick={() => removeColorExternalUrl(group.id, urlIdx)}
                                          className="text-red-500 hover:text-red-700 font-bold px-1 text-sm"
                                        >
                                          ×
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-[8px] text-zinc-400 italic">No manual URLs added.</p>
                                )}
                              </div>
                            </div>

                            {/* Color uploaded thumbnails display - NO text inputs showing Sanity URL! */}
                            {group.uploadedImages.length > 0 && (
                              <div className="pt-4 border-t border-zinc-100 mt-2">
                                <span className="block text-[8px] uppercase tracking-widest font-black text-zinc-400 mb-2">Uploaded Images</span>
                                <div className="flex flex-wrap gap-3">
                                  {group.uploadedImages.map((img) => (
                                    <div key={img.assetId} className="relative w-16 h-20 bg-zinc-100 border border-zinc-200 overflow-hidden group rounded">
                                      <img src={img.url} alt="Variant image" className="w-full h-full object-cover" />
                                      <button
                                        type="button"
                                        onClick={() => removeColorImage(group.id, img.assetId)}
                                        className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white font-bold text-xs transition-opacity"
                                      >
                                        Delete
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Size-wise stock and prices */}
                          <div className="space-y-3 bg-white p-4 border border-zinc-100 rounded-lg">
                            <span className="block text-[9px] uppercase tracking-widest font-black text-zinc-500 font-bold">Sizes & Stock Breakdown</span>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                              {AVAILABLE_SIZES.map((sz) => {
                                const sizeData = group.sizes[sz] || { stock: 0 };
                                return (
                                  <div key={sz} className="border border-zinc-150 rounded p-3 bg-zinc-50/30 flex flex-col gap-2">
                                    <span className="text-[10px] font-black text-black uppercase tracking-wider">{sz} Size</span>
                                    
                                    <div className="space-y-1">
                                      <label className="block text-[7px] uppercase font-bold text-zinc-400">Stock</label>
                                      <input
                                        type="number"
                                        min="0"
                                        value={sizeData.stock}
                                        onChange={(e) => updateColorSizeStock(group.id, sz, parseInt(e.target.value) || 0)}
                                        className="w-full h-8 px-2 bg-white border border-zinc-200 text-xs font-bold"
                                      />
                                    </div>
                                    <div className="space-y-1">
                                      <label className="block text-[7px] uppercase font-bold text-zinc-400">Price Override (INR)</label>
                                      <input
                                        type="number"
                                        min="0"
                                        placeholder="Use Base Price"
                                        value={sizeData.price || ''}
                                        onChange={(e) => updateColorSizePrice(group.id, sz, e.target.value ? parseFloat(e.target.value) : undefined)}
                                        className="w-full h-8 px-2 bg-white border border-zinc-200 text-xs font-bold"
                                      />
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
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
                        💡 Click "+ Add Color Option" to configure variants with color-wise images, sizes, stock, and custom prices.
                      </p>
                    </div>
                  )}
                </div>

                {/* 3. Description */}
                <div className="space-y-2">
                  <h4 className="text-[10px] uppercase tracking-widest font-black text-black border-b border-zinc-100 pb-2">3. Description</h4>
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
