import { useState, useEffect } from 'react';
import api from '../../api';

interface Order {
    id: number;
    total_amount: number;
    created_at: string;
    items: { id: number; product_id: number; product_name: string; quantity: number; price: number }[];
}

export default function Orders() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState<number | null>(null);

    useEffect(() => {
        api.get('/orders').then(({ data }) => setOrders(data)).finally(() => setLoading(false));
    }, []);

    if (loading) return <div style={{ textAlign: 'center', padding: '80px', color: 'var(--text-muted)' }}>Loading orders...</div>;

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '24px' }}>
            <h1 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '24px' }}>📦 My Orders</h1>
            {orders.length === 0 ? (
                <div className="glass" style={{ textAlign: 'center', padding: '60px' }}>
                    <div style={{ fontSize: '64px', marginBottom: '16px' }}>📦</div>
                    <p style={{ color: 'var(--text-muted)' }}>No orders yet. Start shopping!</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {orders.map(order => (
                        <div key={order.id} className="glass" style={{ overflow: 'hidden' }}>
                            <div onClick={() => setExpanded(expanded === order.id ? null : order.id)}
                                style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                                <div>
                                    <span style={{ fontWeight: '700', fontSize: '16px' }}>Order #{order.id}</span>
                                    <span style={{ color: 'var(--text-muted)', fontSize: '13px', marginLeft: '12px' }}>{new Date(order.created_at).toLocaleDateString()}</span>
                                </div>
                                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                    <span style={{ fontWeight: '800', color: '#10b981', fontSize: '18px' }}>${parseFloat(String(order.total_amount)).toFixed(2)}</span>
                                    <span style={{ color: 'var(--text-muted)', transition: 'transform 0.2s', transform: expanded === order.id ? 'rotate(180deg)' : 'none', display: 'inline-block' }}>▼</span>
                                </div>
                            </div>
                            {expanded === order.id && order.items && (
                                <div style={{ padding: '0 20px 16px', borderTop: '1px solid var(--border)' }}>
                                    {order.items.filter(i => i && i.product_name).map(item => (
                                        <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: '14px', borderBottom: '1px solid rgba(51,65,85,0.5)', color: 'var(--text-muted)' }}>
                                            <span>🛍 {item.product_name}</span>
                                            <span>×{item.quantity} — <strong style={{ color: 'var(--text-primary)' }}>${(item.price * item.quantity).toFixed(2)}</strong></span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
