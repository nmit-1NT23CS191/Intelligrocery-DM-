import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';

interface CartItem {
    productId: number;
    quantity: number;
    product: { id: number; name: string; price: number; category: string; image: string | null; stock: number };
}

export default function Cart() {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [checking, setChecking] = useState(false);
    const [msg, setMsg] = useState('');
    const navigate = useNavigate();

    const fetchCart = async () => {
        try {
            const { data } = await api.get('/cart');
            setCart(data);
        } catch { /* ignore */ }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchCart(); }, []);

    const removeItem = async (productId: number) => {
        await api.delete(`/cart/${productId}`);
        setCart(c => c.filter(i => i.productId !== productId));
    };

    const updateQty = async (productId: number, qty: number) => {
        if (qty <= 0) { removeItem(productId); return; }
        await api.put(`/cart/${productId}`, { quantity: qty });
        setCart(c => c.map(i => i.productId === productId ? { ...i, quantity: qty } : i));
    };

    const checkout = async () => {
        setChecking(true);
        try {
            const { data } = await api.post('/orders');
            setMsg(`✅ Order #${data.order.id} placed! Total: $${data.order.total_amount}`);
            setCart([]);
            setTimeout(() => navigate('/orders'), 2000);
        } catch (err: any) {
            setMsg(`❌ ${err.response?.data?.error || 'Checkout failed'}`);
        } finally { setChecking(false); }
    };

    const total = cart.reduce((sum, i) => sum + (i.product?.price || 0) * i.quantity, 0);

    if (loading) return <div style={{ textAlign: 'center', padding: '80px', color: 'var(--text-muted)' }}>Loading cart...</div>;

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '24px' }}>
            <h1 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '24px' }}>🛒 Your Cart</h1>

            {msg && <div style={{ background: msg.startsWith('✅') ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.1)', border: `1px solid ${msg.startsWith('✅') ? '#10b981' : '#ef4444'}`, color: msg.startsWith('✅') ? '#10b981' : '#f87171', padding: '12px 16px', borderRadius: '10px', marginBottom: '20px' }}>{msg}</div>}

            {cart.length === 0 ? (
                <div className="glass" style={{ textAlign: 'center', padding: '60px' }}>
                    <div style={{ fontSize: '64px', marginBottom: '16px' }}>🛒</div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '16px' }}>Your cart is empty</p>
                    <button className="btn-primary" onClick={() => navigate('/products')} style={{ marginTop: '20px' }}>Browse Products</button>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '20px', alignItems: 'start' }}>
                    {/* Items */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {cart.map(item => (
                            <div key={item.productId} className="glass" style={{ padding: '16px', display: 'flex', gap: '16px', alignItems: 'center' }}>
                                <div style={{ width: '60px', height: '60px', background: 'linear-gradient(135deg, #1e293b, #263352)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', flexShrink: 0 }}>
                                    {item.product?.image ? <img src={`/uploads/${item.product.image}`} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '10px' }} /> : '🛒'}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <h3 style={{ fontSize: '15px', fontWeight: '600' }}>{item.product?.name}</h3>
                                    <p style={{ color: '#10b981', fontWeight: '700', fontSize: '16px' }}>${item.product?.price?.toFixed(2)}</p>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <button onClick={() => updateQty(item.productId, item.quantity - 1)} style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid var(--border)', background: 'transparent', color: 'white', cursor: 'pointer', fontSize: '18px' }}>−</button>
                                    <span style={{ fontWeight: '700', fontSize: '16px', minWidth: '24px', textAlign: 'center' }}>{item.quantity}</span>
                                    <button onClick={() => updateQty(item.productId, item.quantity + 1)} style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid var(--border)', background: 'transparent', color: 'white', cursor: 'pointer', fontSize: '18px' }}>+</button>
                                </div>
                                <div style={{ fontWeight: '800', color: '#6366f1', minWidth: '60px', textAlign: 'right' }}>${(item.product?.price * item.quantity).toFixed(2)}</div>
                                <button onClick={() => removeItem(item.productId)} style={{ background: 'rgba(239,68,68,0.15)', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: '18px', width: '36px', height: '36px', borderRadius: '8px' }}>×</button>
                            </div>
                        ))}
                    </div>
                    {/* Summary */}
                    <div className="glass" style={{ padding: '24px', position: 'sticky', top: '85px' }}>
                        <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px' }}>Order Summary</h2>
                        {cart.map(item => (
                            <div key={item.productId} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px', color: 'var(--text-muted)' }}>
                                <span>{item.product?.name} ×{item.quantity}</span>
                                <span>${(item.product?.price * item.quantity).toFixed(2)}</span>
                            </div>
                        ))}
                        <div style={{ borderTop: '1px solid var(--border)', margin: '16px 0', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', fontWeight: '800', fontSize: '20px' }}>
                            <span>Total</span>
                            <span style={{ color: '#10b981' }}>${total.toFixed(2)}</span>
                        </div>
                        <button className="btn-primary pulse-glow" onClick={checkout} disabled={checking} style={{ width: '100%', padding: '14px', fontSize: '16px' }}>
                            {checking ? '⏳ Processing...' : '✅ Checkout'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
