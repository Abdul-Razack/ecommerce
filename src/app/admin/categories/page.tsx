'use client';

import { useState, useEffect } from 'react';
import Card from '@/shared/ui/Card';
import Button from '@/shared/ui/Button';
import Input from '@/shared/ui/Input';
import Skeleton from '@/shared/ui/Skeleton';
import { useToast } from '@/shared/ui/Toast';
import Pagination, { usePagination } from '@/shared/ui/Pagination';

export default function CategoriesPage() {
  const { showToast } = useToast();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form state
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/admin/categories');
      const json = await res.json();
      if (json.success) setCategories(json.categories);
    } catch (err) {
      showToast('Error loading categories', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenNew = () => {
    setEditingId(null);
    setName('');
    setSlug('');
    setDescription('');
    setIsModalOpen(true);
  };

  const handleEdit = (cat: any) => {
    setEditingId(cat._id);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description || '');
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    
    try {
      const res = await fetch(`/api/admin/categories?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setCategories(categories.filter((c) => c._id !== id));
        showToast('Category deleted', 'success');
      }
    } catch (err) {
      showToast('Failed to delete category', 'error');
    }
  };

  const handleSave = async () => {
    if (!name || !slug) return showToast('Name and Slug are required', 'error');
    setSaving(true);
    
    const isEditing = !!editingId;
    const method = isEditing ? 'PATCH' : 'POST';
    const body = { _id: editingId, name, slug, description };

    try {
      const res = await fetch('/api/admin/categories', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      
      if (json.success) {
        showToast(`Category ${isEditing ? 'updated' : 'created'}!`, 'success');
        fetchCategories();
        setIsModalOpen(false);
      } else {
        showToast(json.error || 'Failed to save', 'error');
      }
    } catch (err) {
      showToast('An error occurred', 'error');
    } finally {
      setSaving(false);
    }
  };

  const filteredCategories = categories.filter((cat) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      cat.name?.toLowerCase().includes(term) ||
      cat.slug?.toLowerCase().includes(term) ||
      cat.description?.toLowerCase().includes(term)
    );
  });

  const {
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    totalPages,
    paginatedItems: paginatedCategories,
    totalItems,
  } = usePagination({
    items: filteredCategories,
    initialPageSize: 10,
  });

  return (
    <div suppressHydrationWarning className="p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8 md:space-y-12 bg-white min-h-screen">
      <header className="flex flex-col gap-3 sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-black">Categories</h1>
          <p className="text-xs sm:text-sm text-zinc-500">Manage your product categories.</p>
        </div>
        <Button onClick={handleOpenNew} className="w-full sm:w-auto">+ Add Category</Button>
      </header>

      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h3 className="text-[11px] uppercase tracking-widest font-black text-black">
          All Categories <span className="text-zinc-400 ml-2">({filteredCategories.length} Categories)</span>
        </h3>
        <input
          type="text"
          placeholder="Search categories by name or slug..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full sm:w-80 h-10 px-4 bg-zinc-50 border border-zinc-200 text-xs font-medium uppercase tracking-wider focus:outline-none focus:border-black transition-colors"
        />
      </div>

      {loading ? (
        <Skeleton className="h-64 w-full" />
      ) : (
        <Card padding="p-0" className="overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-100">
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-zinc-500">Name</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-zinc-500">Slug</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-zinc-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {paginatedCategories.map((cat) => (
                <tr key={cat._id} className="hover:bg-zinc-50 transition-colors">
                  <td className="px-6 py-4 text-xs font-bold text-black">{cat.name}</td>
                  <td className="px-6 py-4 text-[10px] font-mono text-zinc-500">{cat.slug}</td>
                  <td className="px-6 py-4 text-right space-x-4">
                    <button onClick={() => handleEdit(cat)} className="text-[10px] uppercase font-bold text-blue-600 hover:text-blue-800">Edit</button>
                    <button onClick={() => handleDelete(cat._id)} className="text-[10px] uppercase font-bold text-red-600 hover:text-red-800">Delete</button>
                  </td>
                </tr>
              ))}
              {filteredCategories.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-xs text-zinc-400 italic">No categories found.</td>
                </tr>
              )}
            </tbody>
          </table>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            pageSize={pageSize}
            pageSizeOptions={[10, 20, 50]}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
            itemLabel="categories"
          />
        </Card>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <Card className="w-full max-w-md space-y-6 animate-fade-in-up">
            <h2 className="text-xl font-bold">{editingId ? 'Edit Category' : 'New Category'}</h2>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 mb-2 block">Name</label>
                <Input value={name} onChange={(e) => {
                  setName(e.target.value);
                  if (!editingId) setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
                }} placeholder="e.g. Sarees" />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 mb-2 block">Slug</label>
                <Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="e.g. sarees" />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 mb-2 block">Description</label>
                <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional description" />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
