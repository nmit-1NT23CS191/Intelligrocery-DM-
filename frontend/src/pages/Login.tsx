import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';

export default function Login() {
    const [form, setForm] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const { data } = await api.post('/auth/login', form);
            login(data.token, data.user);
            navigate(data.user.role === 'admin' ? '/admin/dashboard' : '/products');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)', padding: '20px' }}>
            {/* Background glow */}
            <div style={{ position: 'fixed', top: '20%', left: '50%', transform: 'translateX(-50%)', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />

            <div className="glass fade-in" style={{ width: '100%', maxWidth: '420px', padding: '40px' }}>
                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div style={{ fontSize: '40px', marginBottom: '8px' }}>🛒</div>
                    <h1 className="gradient-text" style={{ fontSize: '26px', fontWeight: '800', letterSpacing: '-0.5px' }}>IntelliGrocery-Pro</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>Sign in to your account</p>
                </div>

                {/* Quick login hint */}
                <div style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: '10px', padding: '10px 14px', marginBottom: '24px', fontSize: '12px', color: '#a5b4fc' }}>
                    <strong>Admin:</strong> admin@intelligrocery.com / admin123
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                        <label style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>Email Address</label>
                        <input className="input" type="email" placeholder="you@example.com" value={form.email}
                            onChange={e => setForm({ ...form, email: e.target.value })} required />
                    </div>
                    <div>
                        <label style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>Password</label>
                        <input className="input" type="password" placeholder="••••••••" value={form.password}
                            onChange={e => setForm({ ...form, password: e.target.value })} required />
                    </div>
                    {error && <div style={{ color: '#f87171', fontSize: '13px', textAlign: 'center', background: 'rgba(239,68,68,0.1)', padding: '8px', borderRadius: '8px' }}>{error}</div>}
                    <button className="btn-primary pulse-glow" type="submit" disabled={loading} style={{ width: '100%', padding: '12px', fontSize: '15px', marginTop: '4px' }}>
                        {loading ? '⏳ Signing in...' : '🚀 Sign In'}
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: '24px', color: 'var(--text-muted)', fontSize: '14px' }}>
                    Don't have an account?{' '}
                    <Link to="/register" style={{ color: '#6366f1', textDecoration: 'none', fontWeight: '600' }}>Register →</Link>
                </p>
            </div>
        </div>
    );
}
