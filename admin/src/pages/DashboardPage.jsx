import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';

export default function DashboardPage() {
  const [stats, setStats] = useState({ products: 0, categories: 0, orders: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError('');
      try {
        const [pRes, cRes, oRes] = await Promise.all([
          api.get('/products'),
          api.get('/categories'),
          api.get('/orders')
        ]);

        setStats({
          products: (pRes.data.data || []).length,
          categories: (cRes.data.data || []).length,
          orders: (oRes.data.data || []).length
        });
      } catch (err) {
        setError(err.response?.data?.message || 'Khong tai duoc thong ke dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <Layout>
      <h1>Fashion Shop Dashboard</h1>
      <p className="helper">Tong quan nhanh de demo va quan ly du lieu.</p>

      {loading ? <p className="page-card">Dang tai thong ke...</p> : null}
      {error ? <p className="error">{error}</p> : null}

      {!loading && !error ? (
        <div className="stats-grid">
          <div className="stat-card">
            <p className="stat-label">Products</p>
            <p className="stat-value">{stats.products}</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Categories</p>
            <p className="stat-value">{stats.categories}</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Orders</p>
            <p className="stat-value">{stats.orders}</p>
          </div>
        </div>
      ) : null}
    </Layout>
  );
}
