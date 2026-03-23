import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const menus = [
  { to: '/', label: 'Dashboard', mark: 'DB' },
  { to: '/products', label: 'Products', mark: 'PR' },
  { to: '/categories', label: 'Categories', mark: 'CT' },
  { to: '/orders', label: 'Orders', mark: 'OD' }
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
              <span className="menu-mark">{item.mark}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <button className="logout-btn" onClick={logout}>Đăng xuất</button>
      </aside>
      <main className="content">{children}</main>
    </div>
  );
}
