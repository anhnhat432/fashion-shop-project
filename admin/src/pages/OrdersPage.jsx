import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';

const statuses = ['PENDING', 'CONFIRMED', 'SHIPPING', 'DELIVERED', 'CANCELLED'];
const paymentStatuses = ['ALL', 'PENDING', 'PAID'];

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
  const [updatingPaymentId, setUpdatingPaymentId] = useState('');
  const [error, setError] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('ALL');

  const fetchOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/orders');
      setOrders(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Không tải được danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateStatus = async (id, status) => {
    setUpdatingId(id);
    setError('');
    try {
      await api.put(`/orders/${id}/status`, { status });
      fetchOrders();
    } catch (err) {
      setError(err.response?.data?.message || 'Không cập nhật được trạng thái đơn');
    } finally {
      setUpdatingId('');
    }
  };

  const updatePaymentStatus = async (id, paymentStatus) => {
    setUpdatingPaymentId(id);
    setError('');
    try {
      await api.put(`/orders/${id}/payment-status`, { paymentStatus });
      fetchOrders();
    } catch (err) {
      setError(err.response?.data?.message || 'Không cập nhật được trạng thái thanh toán');
    } finally {
      setUpdatingPaymentId('');
    }
  };

  const filteredOrders = orders.filter((order) => {
    if (paymentFilter === 'ALL') {
      return true;
    }

    return (order.paymentStatus || 'PENDING') === paymentFilter;
  });

  return (
    <Layout>
      <h1>Orders</h1>
      <p className="helper">Cập nhật trạng thái đơn và trạng thái thanh toán ngay trên bảng.</p>

      {loading ? <p className="page-card">Đang tải đơn hàng...</p> : null}
      {error ? <p className="error">{error}</p> : null}
      {!loading && !filteredOrders.length ? <p className="page-card">Không có đơn hàng phù hợp bộ lọc</p> : null}

      {!!orders.length && (
        <>
          <div className="table-toolbar order-toolbar">
            <div className="filter-group">
              <span className="helper">Lọc thanh toán</span>
              <select
                className="order-status-select payment-filter-select"
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
              >
                {paymentStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="page-card table-wrap">
          <table className="orders-table">
            <thead>
              <tr><th>Order ID</th><th>Khách hàng</th><th>Tổng tiền</th><th>Thanh toán</th><th>TT thanh toán</th><th>Cập nhật TT</th><th>Trạng thái</th><th>Cập nhật</th></tr>
            </thead>
            <tbody>
              {filteredOrders.map((o, idx) => (
                <tr key={o._id}>
                  <td className="order-id-cell">#{String(idx + 1).padStart(3, '0')}</td>
                  <td>{o.userId?.name || 'N/A'}</td>
                  <td className="order-total-cell">{Number(o.totalAmount || 0).toLocaleString()} đ</td>
                  <td>{o.paymentMethod || 'COD'}</td>
                  <td>
                    <span className={`status-badge ${o.paymentStatus === 'PAID' ? 'payment-paid' : 'status-pending'}`}>
                      {o.paymentStatus || 'PENDING'}
                    </span>
                    {o.transferReference ? <div className="helper">{o.transferReference}</div> : null}
                  </td>
                  <td>
                    <select
                      className="order-status-select"
                      value={o.paymentStatus || 'PENDING'}
                      onChange={(e) => updatePaymentStatus(o._id, e.target.value)}
                      disabled={updatingPaymentId === o._id}
                    >
                      {paymentStatuses.filter((status) => status !== 'ALL').map((status) => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </td>
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
        </>
      )}
    </Layout>
  );
}
