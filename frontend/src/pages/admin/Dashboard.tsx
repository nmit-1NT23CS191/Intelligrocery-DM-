import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { io } from 'socket.io-client';
import api from '../../api';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

interface Analytics {
    kpis: { totalUsers: number; totalProducts: number; totalOrders: number; totalRevenue: number };
    salesTrend: { date: string; orders: number; revenue: string }[];
    topProducts: { name: string; sales_count: number; category: string }[];
    categoryDistribution: { category: string; count: number; total_sales: number }[];
    lowStockAlerts: { id: number; name: string; stock: number; category: string }[];
    recentOrders: { id: number; customer: string; total_amount: string; created_at: string }[];
}

export default function Dashboard() {
    const [data, setData] = useState<Analytics | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchData = async () => {
        try {
            const { data: d } = await api.get('/analytics');
            setData(d);
        } catch { /* ignore */ }
        finally { setLoading(false); }
    };

    useEffect(() => {
        fetchData();
        const socket = io('http://localhost:5000');
        socket.on('new_order', () => { fetchData(); });
        return () => { socket.disconnect(); };
    }, []);

    if (loading) return <div style={{ textAlign: 'center', padding: '80px', color: 'var(--text-muted)' }}>⏳ Loading dashboard...</div>;
    if (!data) return null;

    const kpiCards = [
        { label: 'Total Users', value: data.kpis.totalUsers, icon: '👥', color: '#6366f1' },
        { label: 'Total Products', value: data.kpis.totalProducts, icon: '📦', color: '#10b981' },
        { label: 'Total Orders', value: data.kpis.totalOrders, icon: '🛒', color: '#f59e0b' },
        { label: 'Total Revenue', value: `$${data.kpis.totalRevenue.toFixed(2)}`, icon: '💰', color: '#ec4899' },
    ];

    return (
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '4px' }}>📊 Analytics Dashboard</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Real-time business insights • Updates live via WebSocket</p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <a href="/api/reports/csv" download style={{ textDecoration: 'none' }}>
                        <button className="btn-secondary">📥 Export CSV</button>
                    </a>
                    <a href="/api/reports/pdf" download style={{ textDecoration: 'none' }}>
                        <button className="btn-primary">📄 Export PDF</button>
                    </a>
                    <button className="btn-secondary" onClick={() => navigate('/admin/analytics')}>🤖 AI Analytics</button>
                </div>
            </div>

            {/* KPI Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
                {kpiCards.map((card) => (
                    <div key={card.label} className="glass" style={{ padding: '20px', borderLeft: `3px solid ${card.color}`, transition: 'transform 0.2s' }}
                        onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-3px)')}
                        onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '6px' }}>{card.label}</p>
                                <p style={{ fontSize: '28px', fontWeight: '800', color: card.color }}>{card.value}</p>
                            </div>
                            <span style={{ fontSize: '28px' }}>{card.icon}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Row 1 */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px', marginBottom: '16px' }}>
                {/* Sales Trend */}
                <div className="glass" style={{ padding: '20px' }}>
                    <h3 style={{ marginBottom: '16px', fontWeight: '700' }}>📈 Sales Trend (Last 30 Days)</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={data.salesTrend}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.1)" />
                            <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={v => v.slice(5)} />
                            <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
                            <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                            <Legend />
                            <Line type="monotone" dataKey="orders" stroke="#6366f1" strokeWidth={2} dot={false} name="Orders" />
                            <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} dot={false} name="Revenue ($)" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
                {/* Category Pie */}
                <div className="glass" style={{ padding: '20px' }}>
                    <h3 style={{ marginBottom: '16px', fontWeight: '700' }}>🥧 Category Distribution</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie data={data.categoryDistribution} dataKey="total_sales" nameKey="category" cx="50%" cy="50%" outerRadius={85} label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}>
                                {data.categoryDistribution.map((_, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                            </Pie>
                            <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Charts Row 2 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                {/* Top Products Bar */}
                <div className="glass" style={{ padding: '20px' }}>
                    <h3 style={{ marginBottom: '16px', fontWeight: '700' }}>🏆 Top Selling Products</h3>
                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={data.topProducts.slice(0, 8)} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.1)" />
                            <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                            <YAxis type="category" dataKey="name" width={130} tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={v => v.length > 18 ? v.slice(0, 18) + '…' : v} />
                            <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                            <Bar dataKey="sales_count" name="Sales" radius={[0, 6, 6, 0]}>
                                {data.topProducts.slice(0, 8).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Low Stock + Recent Orders */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {/* Low Stock */}
                    <div className="glass" style={{ padding: '20px', flex: 1 }}>
                        <h3 style={{ marginBottom: '12px', fontWeight: '700' }}>⚠️ Low Stock Alerts</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '120px', overflowY: 'auto' }}>
                            {data.lowStockAlerts.length === 0
                                ? <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>✅ All products well stocked</p>
                                : data.lowStockAlerts.map(p => (
                                    <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '6px 10px', background: 'rgba(239,68,68,0.08)', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.2)' }}>
                                        <span>{p.name}</span>
                                        <span className="badge badge-low">{p.stock} left</span>
                                    </div>
                                ))
                            }
                        </div>
                    </div>
                    {/* Recent Orders */}
                    <div className="glass" style={{ padding: '20px', flex: 1 }}>
                        <h3 style={{ marginBottom: '12px', fontWeight: '700' }}>🕐 Recent Orders</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '130px', overflowY: 'auto' }}>
                            {data.recentOrders.map(o => (
                                <div key={o.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', padding: '6px 0', borderBottom: '1px solid rgba(51,65,85,0.5)' }}>
                                    <span style={{ color: 'var(--text-muted)' }}>#{o.id} {o.customer}</span>
                                    <span style={{ color: '#10b981', fontWeight: '700' }}>${parseFloat(o.total_amount).toFixed(2)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
