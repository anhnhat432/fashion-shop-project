import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const menus = [
  { to: '/', label: 'Tổng quan', icon: '⎈' },
  { to: '/products', label: 'Sản phẩm', icon: '🛍' },
  { to: '/categories', label: 'Danh mục', icon: '◈' },
  { to: '/orders', label: 'Đơn hàng', icon: '📦' },
  { to: '/vouchers', label: 'Mã giảm giá', icon: '🎫' },
  { to: '/users', label: 'Người dùng', icon: '👤' },
];

export default function Layout({ children }) {
  const { logout } = useAuth();

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-head">
          <h2>Quản trị Fashion Shop</h2>
          <p className="helper">Quản lý nhanh cho buổi demo môn học</p>
        </div>

        <nav className="sidebar-nav">
          {menus.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) => (isActive ? 'active' : '')}
            >
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
