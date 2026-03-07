import { useState, useEffect, useRef, useMemo } from 'react';
import api from '../../api';

interface Product {
    id: number; name: string; category: string;
    price: number; stock: number; image: string | null; sales_count: number;
}

// Trie implementation
class TrieNode { children: Record<string, TrieNode> = {}; isEnd = false; products: Product[] = []; }
class Trie {
    root = new TrieNode();
    insert(product: Product) {
        const words = product.name.toLowerCase().split(' ');
        for (const word of words) {
            let node = this.root;
            for (const ch of word) {
                if (!node.children[ch]) node.children[ch] = new TrieNode();
                node = node.children[ch];
                if (!node.products.find(p => p.id === product.id)) node.products.push(product);
            }
            node.isEnd = true;
        }
    }
    search(prefix: string): Product[] {
        let node = this.root;
        for (const ch of prefix.toLowerCase()) {
            if (!node.children[ch]) return [];
            node = node.children[ch];
        }
        const seen = new Set<number>();
        return node.products.filter(p => { if (seen.has(p.id)) return false; seen.add(p.id); return true; });
    }
}

export default function Products() {
    const [products, setProducts] = useState<Product[]>([]);
    const [search, setSearch] = useState('');
    const [suggestions, setSuggestions] = useState<Product[]>([]);
    const [category, setCategory] = useState('All');
    const [addedId, setAddedId] = useState<number | null>(null);
    const [cartMsg, setCartMsg] = useState('');
    const trie = useRef(new Trie());

    useEffect(() => {
        api.get('/products').then(({ data }) => {
            setProducts(data);
            trie.current = new Trie();
            data.forEach((p: Product) => trie.current.insert(p));
        });
    }, []);

    const categories = useMemo(() => ['All', ...Array.from(new Set(products.map(p => p.category)))], [products]);

    const handleSearch = (val: string) => {
        setSearch(val);
        setSuggestions(val.length > 0 ? trie.current.search(val).slice(0, 6) : []);
    };

    const displayed = useMemo(() => {
        let list = search.length > 0 ? trie.current.search(search) : products;
        if (category !== 'All') list = list.filter(p => p.category === category);
        return list;
    }, [search, products, category]);

    const addToCart = async (productId: number) => {
        try {
            await api.post('/cart', { productId, quantity: 1 });
            setAddedId(productId);
            setCartMsg('Added to cart!');
            setTimeout(() => { setAddedId(null); setCartMsg(''); }, 1500);
        } catch (err: any) {
            setCartMsg(err.response?.data?.error || 'Failed');
        }
    };

    return (
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px' }}>
            {/* Header */}
            <div style={{ marginBottom: '28px' }}>
                <h1 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '4px' }}>🛍 Shop</h1>
                <p style={{ color: 'var(--text-muted)' }}>Discover fresh groceries at great prices</p>
            </div>

            {/* Search + Filter Bar */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: '1', minWidth: '280px' }}>
                    <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>🔍</span>
                    <input className="input" style={{ paddingLeft: '36px' }} placeholder="Search products... (Trie search)"
                        value={search} onChange={e => handleSearch(e.target.value)} />
                    {suggestions.length > 0 && search && (
                        <div style={{ position: 'absolute', top: '110%', left: 0, right: 0, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '10px', zIndex: 50, overflow: 'hidden' }}>
                            {suggestions.map(s => (
                                <div key={s.id} onClick={() => { setSearch(s.name); setSuggestions([]); }}
                                    style={{ padding: '10px 16px', cursor: 'pointer', fontSize: '14px', borderBottom: '1px solid var(--border)', transition: 'background 0.15s' }}
                                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(99,102,241,0.1)')}
                                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                                    🔹 {s.name} <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>— {s.category}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {categories.map(cat => (
                        <button key={cat} onClick={() => setCategory(cat)}
                            style={{ padding: '8px 16px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '600', background: category === cat ? '#6366f1' : 'rgba(99,102,241,0.1)', color: category === cat ? 'white' : '#a5b4fc', transition: 'all 0.2s' }}>
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {cartMsg && <div style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid #10b981', color: '#10b981', padding: '10px 16px', borderRadius: '10px', marginBottom: '16px', textAlign: 'center' }}>{cartMsg}</div>}

            {/* Product Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
                {displayed.map(product => (
                    <div key={product.id} className="glass fade-in" style={{ overflow: 'hidden', transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'default' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 12px 40px rgba(99,102,241,0.2)'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow = ''; }}>
                        {/* Image */}
                        <div style={{ height: '140px', background: 'linear-gradient(135deg, #1e293b, #263352)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px' }}>
                            {product.image ? (
                                <img src={`/uploads/${product.image}`} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                { 'Dairy': '🥛', 'Bakery': '🍞', 'Grains': '🌾', 'Oils': '🫙', 'Meat': '🥩', 'Seafood': '🐟', 'Vegetables': '🥦', 'Fruits': '🍎', 'Snacks': '🍪', 'Beverages': '🥤', 'Canned': '🥫' }[product.category] || '🛒'
                            )}
                        </div>
                        <div style={{ padding: '14px' }}>
                            <div style={{ fontSize: '11px', color: '#6366f1', fontWeight: '600', textTransform: 'uppercase', marginBottom: '4px' }}>{product.category}</div>
                            <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', lineHeight: '1.3' }}>{product.name}</h3>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                <span style={{ fontSize: '20px', fontWeight: '800', color: '#10b981' }}>${product.price.toFixed(2)}</span>
                                <span style={{ fontSize: '11px', color: product.stock < 20 ? '#f59e0b' : 'var(--text-muted)' }}>
                                    {product.stock < 20 ? '⚠️' : '✅'} {product.stock} left
                                </span>
                            </div>
                            <button className="btn-primary" onClick={() => addToCart(product.id)} disabled={product.stock === 0 || addedId === product.id}
                                style={{ width: '100%', padding: '8px', fontSize: '13px', opacity: product.stock === 0 ? 0.5 : 1 }}>
                                {addedId === product.id ? '✅ Added!' : product.stock === 0 ? '❌ Out of Stock' : '🛒 Add to Cart'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            {displayed.length === 0 && (
                <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
                    <div style={{ fontSize: '48px', marginBottom: '12px' }}>🔍</div>
                    <p>No products found for "{search}"</p>
                </div>
            )}
        </div>
    );
}
