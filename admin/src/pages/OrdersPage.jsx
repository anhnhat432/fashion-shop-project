import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';

const statuses = ['PENDING', 'CONFIRMED', 'SHIPPING', 'DELIVERED', 'CANCELLED'];

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);

  const fetchOrders = () => api.get('/orders').then((res) => setOrders(res.data.data));
  useEffect(() => { fetchOrders(); }, []);

  const updateStatus = async (id, status) => {
    await api.put(`/orders/${id}/status`, { status });
    fetchOrders();
  };

  return (
    <Layout>
      <h1>Orders</h1>
      <table>
        <thead><tr><th>Khách hàng</th><th>Tổng tiền</th><th>Trạng thái</th><th>Cập nhật</th></tr></thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o._id}>
              <td>{o.userId?.name || 'N/A'}</td>
              <td>{o.totalAmount}</td>
              <td>{o.status}</td>
              <td>
                <select defaultValue={o.status} onChange={(e) => updateStatus(o._id, e.target.value)}>
                  {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Layout>
  );
}
