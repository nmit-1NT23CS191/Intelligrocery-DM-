import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';

export default function Register() {
    const [form, setForm] = useState({ name: '', email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const { data } = await api.post('/auth/register', form);
            login(data.token, data.user);
            navigate('/products');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #0f172a 0%, #0d2137 100%)', padding: '20px' }}>
            <div style={{ position: 'fixed', top: '30%', right: '20%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(16,185,129,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />

            <div className="glass fade-in" style={{ width: '100%', maxWidth: '420px', padding: '40px' }}>
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div style={{ fontSize: '40px', marginBottom: '8px' }}>🌿</div>
                    <h1 className="gradient-text" style={{ fontSize: '26px', fontWeight: '800' }}>Create Account</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>Join IntelliGrocery-Pro today</p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                        <label style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>Full Name</label>
                        <input className="input" type="text" placeholder="John Doe" value={form.name}
                            onChange={e => setForm({ ...form, name: e.target.value })} required />
                    </div>
                    <div>
                        <label style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>Email Address</label>
                        <input className="input" type="email" placeholder="you@example.com" value={form.email}
                            onChange={e => setForm({ ...form, email: e.target.value })} required />
                    </div>
                    <div>
                        <label style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>Password</label>
                        <input className="input" type="password" placeholder="Min 6 characters" value={form.password}
                            onChange={e => setForm({ ...form, password: e.target.value })} required minLength={6} />
                    </div>
                    {error && <div style={{ color: '#f87171', fontSize: '13px', textAlign: 'center', background: 'rgba(239,68,68,0.1)', padding: '8px', borderRadius: '8px' }}>{error}</div>}
                    <button className="btn-primary" type="submit" disabled={loading} style={{ width: '100%', padding: '12px', fontSize: '15px', marginTop: '4px' }}>
                        {loading ? '⏳ Creating account...' : '✨ Create Account'}
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: '24px', color: 'var(--text-muted)', fontSize: '14px' }}>
                    Already have an account?{' '}
                    <Link to="/login" style={{ color: '#6366f1', textDecoration: 'none', fontWeight: '600' }}>Sign In →</Link>
                </p>
            </div>
        </div>
    );
}
