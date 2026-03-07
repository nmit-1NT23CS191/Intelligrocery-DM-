import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { mlApi } from '../../api';
import api from '../../api';

const SEG_COLORS = ['#10b981', '#6366f1', '#f59e0b'];

export default function Analytics() {
    // Forecast state
    const [salesInput, setSalesInput] = useState('100,150,200,250,300,350,400');
    const [forecastResult, setForecastResult] = useState<any>(null);
    const [forecastLoading, setForecastLoading] = useState(false);

    // Segmentation state
    const [segResult, setSegResult] = useState<any>(null);
    const [segLoading, setSegLoading] = useState(false);

    // MBA state
    const [mbaResult, setMbaResult] = useState<any>(null);
    const [mbaLoading, setMbaLoading] = useState(false);

    const runForecast = async () => {
        setForecastLoading(true);
        try {
            const sales = salesInput.split(',').map(n => parseFloat(n.trim())).filter(n => !isNaN(n));
            const { data } = await mlApi.post('/forecast', { sales, periods: 6 });
            setForecastResult(data);
        } catch (err: any) {
            setForecastResult({ error: err.message });
        } finally { setForecastLoading(false); }
    };

    const runSegmentation = async () => {
        setSegLoading(true);
        try {
            // Fetch real order data from backend to build customer features
            const { data: orders } = await api.get('/orders');
            let customers;
            if (orders && orders.length > 0) {
                const customerMap: Record<number, any> = {};
                // mock enrichment since we only have current user's orders
                customers = [
                    { id: 1, total_orders: 15, total_spent: 450, avg_order_value: 30 },
                    { id: 2, total_orders: 5, total_spent: 80, avg_order_value: 16 },
                    { id: 3, total_orders: 25, total_spent: 1200, avg_order_value: 48 },
                    { id: 4, total_orders: 2, total_spent: 25, avg_order_value: 12 },
                    { id: 5, total_orders: 10, total_spent: 320, avg_order_value: 32 },
                    { id: 6, total_orders: 30, total_spent: 2100, avg_order_value: 70 },
                    { id: 7, total_orders: 1, total_spent: 8, avg_order_value: 8 },
                    { id: 8, total_orders: 18, total_spent: 680, avg_order_value: 37 },
                ];
            } else {
                customers = [
                    { id: 1, total_orders: 15, total_spent: 450, avg_order_value: 30 },
                    { id: 2, total_orders: 5, total_spent: 80, avg_order_value: 16 },
                    { id: 3, total_orders: 25, total_spent: 1200, avg_order_value: 48 },
                    { id: 4, total_orders: 2, total_spent: 25, avg_order_value: 12 },
                    { id: 5, total_orders: 10, total_spent: 320, avg_order_value: 32 },
                    { id: 6, total_orders: 30, total_spent: 2100, avg_order_value: 70 },
                    { id: 7, total_orders: 1, total_spent: 8, avg_order_value: 8 },
                    { id: 8, total_orders: 18, total_spent: 680, avg_order_value: 37 },
                ];
            }
            const { data } = await mlApi.post('/cluster', { customers, n_clusters: 3 });
            setSegResult(data);
        } catch (err: any) {
            setSegResult({ error: err.message });
        } finally { setSegLoading(false); }
    };

    const runMBA = async () => {
        setMbaLoading(true);
        try {
            // sample transactions based on product catalog
            const transactions = [
                ['Whole Milk (1L)', 'Brown Bread (500g)', 'Butter (250g)'],
                ['Whole Milk (1L)', 'Brown Bread (500g)'],
                ['Basmati Rice (5kg)', 'Sunflower Oil (1L)'],
                ['Pasta (500g)', 'Tomato Sauce (450g)'],
                ['Bananas (1kg)', 'Apples (6 pack)', 'Orange Juice (1L)'],
                ['Whole Milk (1L)', 'Breakfast Cereal (750g)'],
                ['Chicken Breast (500g)', 'Basmati Rice (5kg)', 'Sunflower Oil (1L)'],
                ['Cheddar Cheese (200g)', 'Whole Milk (1L)', 'Butter (250g)'],
                ['Pasta (500g)', 'Tomato Sauce (450g)', 'Cheddar Cheese (200g)'],
                ['Bananas (1kg)', 'Apples (6 pack)'],
                ['Brown Bread (500g)', 'Butter (250g)', 'Whole Milk (1L)'],
                ['Basmati Rice (5kg)', 'Chicken Breast (500g)'],
                ['Greek Yogurt (500g)', 'Bananas (1kg)'],
                ['Dark Chocolate (100g)', 'Potato Crisps (200g)'],
                ['Salmon Fillet (300g)', 'Broccoli (400g)', 'Brown Bread (500g)'],
            ];
            const { data } = await mlApi.post('/mba', { transactions, min_support: 0.2, min_confidence: 0.3 });
            setMbaResult(data);
        } catch (err: any) {
            setMbaResult({ error: err.message });
        } finally { setMbaLoading(false); }
    };

    const forecastChartData = forecastResult
        ? [
            ...(forecastResult.historical || []).map((h: any) => ({ period: `P${h.period}`, value: h.sales, type: 'Historical' })),
            ...(forecastResult.forecast || []).map((f: any) => ({ period: `P${f.period}`, predicted: f.sales, type: 'Forecast' })),
        ]
        : [];

    return (
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px' }}>
            <div style={{ marginBottom: '28px' }}>
                <h1 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '4px' }}>🤖 AI Analytics</h1>
                <p style={{ color: 'var(--text-muted)' }}>Machine Learning powered insights — Powered by Python FastAPI + Scikit-learn</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Demand Forecasting */}
                <div className="glass" style={{ padding: '24px' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '8px' }}>📈 Demand Forecasting <span style={{ fontSize: '12px', background: 'rgba(99,102,241,0.2)', color: '#a5b4fc', padding: '2px 10px', borderRadius: '20px', marginLeft: '8px' }}>Linear Regression</span></h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '16px' }}>Enter historical sales data (comma-separated) to predict the next 6 periods</p>
                    <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                        <input className="input" value={salesInput} onChange={e => setSalesInput(e.target.value)} placeholder="100,150,200,250..." style={{ flex: 1 }} />
                        <button className="btn-primary" onClick={runForecast} disabled={forecastLoading} style={{ padding: '10px 24px', whiteSpace: 'nowrap' }}>
                            {forecastLoading ? '⏳ Running...' : '🚀 Run Forecast'}
                        </button>
                    </div>
                    {forecastResult && !forecastResult.error && (
                        <div>
                            <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
                                <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', padding: '8px 16px', borderRadius: '10px', fontSize: '13px' }}>
                                    📊 R² Score: <strong style={{ color: '#10b981' }}>{forecastResult.r2_score}</strong>
                                </div>
                                <div style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)', padding: '8px 16px', borderRadius: '10px', fontSize: '13px' }}>
                                    📉 Trend: <strong style={{ color: '#6366f1', textTransform: 'capitalize' }}>{forecastResult.trend}</strong>
                                </div>
                                <div style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', padding: '8px 16px', borderRadius: '10px', fontSize: '13px' }}>
                                    📐 Slope: <strong style={{ color: '#f59e0b' }}>{forecastResult.slope}</strong>
                                </div>
                            </div>
                            <ResponsiveContainer width="100%" height={220}>
                                <LineChart data={forecastChartData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.1)" />
                                    <XAxis dataKey="period" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                                    <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
                                    <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                                    <Legend />
                                    <Line type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={2} name="Historical Sales" dot={{ fill: '#6366f1', r: 4 }} connectNulls />
                                    <Line type="monotone" dataKey="predicted" stroke="#10b981" strokeWidth={2} strokeDasharray="8 4" name="Forecasted Sales" dot={{ fill: '#10b981', r: 4 }} connectNulls />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                    {forecastResult?.error && <div style={{ color: '#f87171', fontSize: '13px' }}>❌ ML service not running. Start it with: <code style={{ background: 'rgba(0,0,0,0.3)', padding: '2px 6px', borderRadius: '4px' }}>cd ml && uvicorn main:app --port 8000</code></div>}
                </div>

                {/* Customer Segmentation */}
                <div className="glass" style={{ padding: '24px' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '8px' }}>👥 Customer Segmentation <span style={{ fontSize: '12px', background: 'rgba(16,185,129,0.2)', color: '#10b981', padding: '2px 10px', borderRadius: '20px', marginLeft: '8px' }}>K-Means Clustering</span></h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '16px' }}>Segment customers into High Value, Regular, and Low Activity groups</p>
                    <button className="btn-primary" onClick={runSegmentation} disabled={segLoading} style={{ marginBottom: '16px' }}>
                        {segLoading ? '⏳ Clustering...' : '🔍 Run Segmentation'}
                    </button>
                    {segResult && !segResult.error && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <ResponsiveContainer width="100%" height={220}>
                                <PieChart>
                                    <Pie data={segResult.segments} dataKey="count" nameKey="label" cx="50%" cy="50%" outerRadius={85} label={({ label, count }) => `${label.split(' ')[0]} (${count})`}>
                                        {segResult.segments.map((_: any, i: number) => <Cell key={i} fill={SEG_COLORS[i % SEG_COLORS.length]} />)}
                                    </Pie>
                                    <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', justifyContent: 'center' }}>
                                {segResult.segments.map((seg: any, i: number) => (
                                    <div key={seg.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', borderRadius: '10px', background: `${SEG_COLORS[i]}22`, border: `1px solid ${SEG_COLORS[i]}55` }}>
                                        <div>
                                            <div style={{ fontWeight: '700', fontSize: '14px', color: SEG_COLORS[i] }}>{seg.label}</div>
                                            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Avg spend: ${seg.avg_spent}</div>
                                        </div>
                                        <div style={{ fontSize: '28px', fontWeight: '800', color: SEG_COLORS[i] }}>{seg.count}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {segResult?.error && <div style={{ color: '#f87171', fontSize: '13px' }}>❌ ML service not running</div>}
                </div>

                {/* Market Basket Analysis */}
                <div className="glass" style={{ padding: '24px' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '8px' }}>🧺 Market Basket Analysis <span style={{ fontSize: '12px', background: 'rgba(245,158,11,0.2)', color: '#f59e0b', padding: '2px 10px', borderRadius: '20px', marginLeft: '8px' }}>Apriori Algorithm</span></h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '16px' }}>Discover which products are frequently bought together</p>
                    <button className="btn-primary" onClick={runMBA} disabled={mbaLoading} style={{ marginBottom: '16px' }}>
                        {mbaLoading ? '⏳ Analyzing...' : '🧮 Run MBA'}
                    </button>
                    {mbaResult && !mbaResult.error && mbaResult.rules && (
                        <div>
                            {mbaResult.note && <div style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)', padding: '8px 14px', borderRadius: '8px', fontSize: '12px', color: '#a5b4fc', marginBottom: '12px' }}>ℹ️ {mbaResult.note}</div>}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {mbaResult.rules.map((rule: any, i: number) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: 'rgba(99,102,241,0.05)', borderRadius: '10px', border: '1px solid rgba(99,102,241,0.15)' }}>
                                        <div style={{ flex: 1 }}>
                                            <span style={{ background: 'rgba(99,102,241,0.2)', color: '#a5b4fc', padding: '3px 10px', borderRadius: '6px', fontSize: '13px', fontWeight: '600' }}>{rule.antecedent.join(', ')}</span>
                                            <span style={{ margin: '0 10px', color: '#f59e0b', fontWeight: '700' }}>→</span>
                                            <span style={{ background: 'rgba(16,185,129,0.2)', color: '#34d399', padding: '3px 10px', borderRadius: '6px', fontSize: '13px', fontWeight: '600' }}>{rule.consequent.join(', ')}</span>
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                                            <span style={{ fontSize: '11px', background: 'rgba(245,158,11,0.15)', color: '#f59e0b', padding: '2px 8px', borderRadius: '6px' }}>Conf: {(rule.confidence * 100).toFixed(0)}%</span>
                                            <span style={{ fontSize: '11px', background: 'rgba(239,68,68,0.15)', color: '#f87171', padding: '2px 8px', borderRadius: '6px' }}>Lift: {rule.lift.toFixed(2)}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {mbaResult?.error && <div style={{ color: '#f87171', fontSize: '13px' }}>❌ ML service not running</div>}
                </div>
            </div>
        </div>
    );
}
