import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const menus = [
  { to: '/', label: 'Dashboard', icon: '⎈' },
  { to: '/products', label: 'Products', icon: '🛍' },
  { to: '/categories', label: 'Categories', icon: '◈' },
  { to: '/orders', label: 'Orders', icon: '📦' },
  { to: '/vouchers', label: 'Vouchers', icon: '🎫' },
  { to: '/users', label: 'Users', icon: '👤' }
];

export default function Layout({ children }) {
  const { logout } = useAuth();

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-head">
          <h2>Fashion Admin</h2>
          <p className="helper">Quản lý nhanh cho demo môn học</p>
        </div>

        <nav className="sidebar-nav">
          {menus.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.to === '/'} className={({ isActive }) => (isActive ? 'active' : '')}>
              <span className="menu-mark">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <button className="logout-btn" onClick={logout}>
          <span>⬡</span>
          Đăng xuất
        </button>
      </aside>
      <main className="content">{children}</main>
    </div>
  );
}
