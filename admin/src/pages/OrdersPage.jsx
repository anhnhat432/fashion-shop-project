import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';

const statuses = ['PENDING', 'CONFIRMED', 'SHIPPING', 'DELIVERED', 'CANCELLED'];

const statusClassMap = {
  PENDING: 'status-pending',
  CONFIRMED: 'status-confirmed',
  SHIPPING: 'status-shipping',
  DELIVERED: 'status-delivered',
  CANCELLED: 'status-cancelled'
};

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState('');
  const [error, setError] = useState('');

  const fetchOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/orders');
      setOrders(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Khong tai duoc danh sach don hang');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateStatus = async (id, status) => {
    setUpdatingId(id);
    try {
      await api.put(`/orders/${id}/status`, { status });
      fetchOrders();
    } catch (err) {
      setError(err.response?.data?.message || 'Khong cap nhat duoc trang thai don');
    } finally {
      setUpdatingId('');
    }
  };

  return (
    <Layout>
      <h1>Orders</h1>
      <p className="helper">Cap nhat trang thai don ngay tren bang.</p>

      {loading ? <p className="page-card">Dang tai don hang...</p> : null}
      {error ? <p className="error">{error}</p> : null}
      {!loading && !orders.length ? <p className="page-card">Chua co don hang nao</p> : null}

      {!!orders.length && (
        <div className="page-card table-wrap">
          <table className="orders-table">
            <thead>
              <tr><th>Order ID</th><th>Khach hang</th><th>Tong tien</th><th>Trang thai</th><th>Cap nhat</th></tr>
            </thead>
            <tbody>
              {orders.map((o, idx) => (
                <tr key={o._id}>
                  <td className="order-id-cell">#{String(idx + 1).padStart(3, '0')}</td>
                  <td>{o.userId?.name || 'N/A'}</td>
                  <td className="order-total-cell">{Number(o.totalAmount || 0).toLocaleString()} d</td>
                  <td><span className={`status-badge ${statusClassMap[o.status] || ''}`}>{o.status}</span></td>
                  <td>
                    <select
                      className="order-status-select"
                      value={o.status}
                      onChange={(e) => updateStatus(o._id, e.target.value)}
                      disabled={updatingId === o._id}
                    >
                      {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  );
}
