import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
    const { user, logout, isAdmin } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

    const navStyle = {
        background: 'rgba(15, 23, 42, 0.9)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(99,102,241,0.2)',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '64px',
        position: 'sticky' as const,
        top: 0,
        zIndex: 100,
    };

    const linkStyle = (active: boolean) => ({
        color: active ? '#6366f1' : 'var(--text-muted)',
        textDecoration: 'none',
        fontWeight: 500,
        fontSize: '14px',
        padding: '6px 14px',
        borderRadius: '8px',
        background: active ? 'rgba(99,102,241,0.1)' : 'transparent',
        border: active ? '1px solid rgba(99,102,241,0.3)' : '1px solid transparent',
        transition: 'all 0.2s',
    });

    return (
        <nav style={navStyle}>
            {/* Logo */}
            <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '22px' }}>🛒</span>
                <span className="gradient-text" style={{ fontWeight: '800', fontSize: '16px' }}>IntelliGrocery-Pro</span>
            </Link>

            {/* Links */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                {isAdmin ? (
                    <>
                        <Link to="/admin/dashboard" style={linkStyle(isActive('/admin/dashboard'))}>📊 Dashboard</Link>
                        <Link to="/admin/products" style={linkStyle(isActive('/admin/products'))}>📦 Products</Link>
                        <Link to="/admin/analytics" style={linkStyle(isActive('/admin/analytics'))}>🤖 AI Analytics</Link>
                    </>
                ) : (
                    <>
                        <Link to="/products" style={linkStyle(isActive('/products'))}>🛍 Shop</Link>
                        <Link to="/cart" style={linkStyle(isActive('/cart'))}>🛒 Cart</Link>
                        <Link to="/orders" style={linkStyle(isActive('/orders'))}>📦 Orders</Link>
                    </>
                )}
            </div>

            {/* User info + logout */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>{user?.name}</div>
                    <div className={user?.role === 'admin' ? 'badge badge-admin' : 'badge badge-customer'} style={{ fontSize: '10px', padding: '2px 8px' }}>
                        {user?.role}
                    </div>
                </div>
                <button onClick={handleLogout} className="btn-danger" style={{ padding: '6px 14px', fontSize: '13px' }}>
                    Logout
                </button>
            </div>
        </nav>
    );
}
