import { useState, useEffect } from 'react';
import api from '../../api';

interface Product {
    id: number; name: string; category: string;
    price: number; stock: number; image: string | null; sales_count: number;
}

const CATEGORIES = ['Dairy', 'Bakery', 'Grains', 'Oils', 'Meat', 'Seafood', 'Vegetables', 'Fruits', 'Snacks', 'Beverages', 'Canned'];

export default function ProductManager() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<Product | null>(null);
    const [form, setForm] = useState({ name: '', category: 'Dairy', price: '', stock: '' });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState('');
    const [search, setSearch] = useState('');

    const fetchProducts = async () => {
        const { data } = await api.get('/products');
        setProducts(data);
        setLoading(false);
    };
    useEffect(() => { fetchProducts(); }, []);

    const openAdd = () => { setEditing(null); setForm({ name: '', category: 'Dairy', price: '', stock: '' }); setImageFile(null); setShowModal(true); };
    const openEdit = (p: Product) => { setEditing(p); setForm({ name: p.name, category: p.category, price: String(p.price), stock: String(p.stock) }); setImageFile(null); setShowModal(true); };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        const fd = new FormData();
        fd.append('name', form.name);
        fd.append('category', form.category);
        fd.append('price', form.price);
        fd.append('stock', form.stock);
        if (imageFile) fd.append('image', imageFile);
        try {
            if (editing) {
                const { data } = await api.put(`/products/${editing.id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
                setProducts(prev => prev.map(p => p.id === editing.id ? data : p));
                setMsg('✅ Product updated');
            } else {
                const { data } = await api.post('/products', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
                setProducts(prev => [data, ...prev]);
                setMsg('✅ Product added');
            }
            setShowModal(false);
        } catch (err: any) {
            setMsg(`❌ ${err.response?.data?.error || 'Save failed'}`);
        } finally {
            setSaving(false);
            setTimeout(() => setMsg(''), 3000);
        }
    };

    const handleDelete = async (id: number, name: string) => {
        if (!confirm(`Delete "${name}"?`)) return;
        await api.delete(`/products/${id}`);
        setProducts(prev => prev.filter(p => p.id !== id));
        setMsg('🗑 Product deleted');
        setTimeout(() => setMsg(''), 2000);
    };

    const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase()));

    if (loading) return <div style={{ textAlign: 'center', padding: '80px', color: 'var(--text-muted)' }}>Loading...</div>;

    return (
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: '800' }}>📦 Product Manager</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Manage your product catalog</p>
                </div>
                <button className="btn-primary" onClick={openAdd} style={{ fontSize: '15px', padding: '10px 24px' }}>+ Add Product</button>
            </div>

            {msg && <div style={{ background: msg.startsWith('✅') ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', border: `1px solid ${msg.startsWith('✅') ? '#10b981' : '#ef4444'}`, color: msg.startsWith('✅') ? '#10b981' : '#f87171', padding: '10px 16px', borderRadius: '10px', marginBottom: '16px' }}>{msg}</div>}

            <input className="input" placeholder="🔍 Search products..." value={search} onChange={e => setSearch(e.target.value)} style={{ marginBottom: '16px', maxWidth: '400px' }} />

            {/* Table */}
            <div className="glass" style={{ overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--border)' }}>
                            {['Image', 'Name', 'Category', 'Price', 'Stock', 'Sales', 'Actions'].map(h => (
                                <th key={h} style={{ padding: '14px 16px', textAlign: 'left', fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map(p => (
                            <tr key={p.id} style={{ borderBottom: '1px solid rgba(51,65,85,0.5)', transition: 'background 0.15s' }}
                                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(99,102,241,0.05)')}
                                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                                <td style={{ padding: '12px 16px' }}>
                                    <div style={{ width: '44px', height: '44px', borderRadius: '8px', background: 'linear-gradient(135deg, #1e293b, #263352)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', overflow: 'hidden' }}>
                                        {p.image ? <img src={`/uploads/${p.image}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '🛒'}
                                    </div>
                                </td>
                                <td style={{ padding: '12px 16px', fontWeight: '600', maxWidth: '200px' }}>{p.name}</td>
                                <td style={{ padding: '12px 16px' }}>
                                    <span style={{ background: 'rgba(99,102,241,0.15)', color: '#a5b4fc', padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>{p.category}</span>
                                </td>
                                <td style={{ padding: '12px 16px', color: '#10b981', fontWeight: '700' }}>${parseFloat(String(p.price)).toFixed(2)}</td>
                                <td style={{ padding: '12px 16px' }}>
                                    <span className={`badge ${p.stock < 20 ? 'badge-low' : ''}`} style={p.stock >= 20 ? { background: 'rgba(16,185,129,0.15)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)' } : {}}>{p.stock}</span>
                                </td>
                                <td style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>{p.sales_count}</td>
                                <td style={{ padding: '12px 16px' }}>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button onClick={() => openEdit(p)} className="btn-secondary" style={{ padding: '5px 12px', fontSize: '12px' }}>✏️ Edit</button>
                                        <button onClick={() => handleDelete(p.id, p.name)} className="btn-danger" style={{ padding: '5px 12px', fontSize: '12px' }}>🗑 Delete</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filtered.length === 0 && <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No products found</div>}
            </div>

            {/* Modal */}
            {showModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="glass" style={{ width: '480px', padding: '32px', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                            <h2 style={{ fontWeight: '800', fontSize: '20px' }}>{editing ? '✏️ Edit Product' : '➕ Add Product'}</h2>
                            <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '20px' }}>×</button>
                        </div>
                        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div>
                                <label style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Product Name *</label>
                                <input className="input" placeholder="e.g. Whole Milk (1L)" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                            </div>
                            <div>
                                <label style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Category *</label>
                                <select className="input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div>
                                    <label style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Price ($) *</label>
                                    <input className="input" type="number" step="0.01" min="0" placeholder="0.00" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required />
                                </div>
                                <div>
                                    <label style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Stock</label>
                                    <input className="input" type="number" min="0" placeholder="0" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} />
                                </div>
                            </div>
                            <div>
                                <label style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Product Image</label>
                                <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files?.[0] || null)}
                                    style={{ color: 'var(--text-muted)', fontSize: '13px', width: '100%' }} />
                            </div>
                            <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)} style={{ flex: 1 }}>Cancel</button>
                                <button type="submit" className="btn-primary" disabled={saving} style={{ flex: 1 }}>
                                    {saving ? '⏳ Saving...' : editing ? '✅ Update' : '➕ Add Product'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
