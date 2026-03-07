import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout({ children }) {
  const { logout } = useAuth();
  return (
    <div className="layout">
      <aside className="sidebar">
        <h2>Admin</h2>
        <Link to="/">Dashboard</Link>
        <Link to="/products">Products</Link>
        <Link to="/categories">Categories</Link>
        <Link to="/orders">Orders</Link>
        <button onClick={logout}>Logout</button>
      </aside>
      <main className="content">{children}</main>
    </div>
  );
}
