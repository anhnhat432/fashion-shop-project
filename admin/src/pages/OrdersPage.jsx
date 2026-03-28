import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';

const statuses = ['PENDING', 'CONFIRMED', 'SHIPPING', 'DELIVERED', 'CANCELLED'];
const paymentStatuses = ['ALL', 'PENDING', 'PAID'];
const allowedStatusTransitions = {
  PENDING: ['PENDING', 'CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['CONFIRMED', 'SHIPPING', 'CANCELLED'],
  SHIPPING: ['SHIPPING', 'DELIVERED', 'CANCELLED'],
  DELIVERED: ['DELIVERED'],
  CANCELLED: ['CANCELLED']
};

const statusClassMap = {
  PENDING: 'status-pending',
  CONFIRMED: 'status-confirmed',
  SHIPPING: 'status-shipping',
  DELIVERED: 'status-delivered',
  CANCELLED: 'status-cancelled'
};

const statusLabelMap = {
  ALL: 'Tất cả',
  PENDING: 'Chờ xác nhận',
  CONFIRMED: 'Đã xác nhận',
  SHIPPING: 'Đang giao',
  DELIVERED: 'Đã giao',
  CANCELLED: 'Đã hủy',
};

const paymentStatusLabelMap = {
  ALL: 'Tất cả',
  PENDING: 'Chờ thanh toán',
  PAID: 'Đã thanh toán',
};

const paymentMethodLabelMap = {
  COD: 'COD',
  BANK_TRANSFER: 'Chuyển khoản',
};

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState('');
  const [updatingPaymentId, setUpdatingPaymentId] = useState('');
  const [error, setError] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

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
    if (paymentFilter !== 'ALL' && (order.paymentStatus || 'PENDING') !== paymentFilter) return false;
    if (statusFilter !== 'ALL' && order.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      const name = (order.userId?.name || '').toLowerCase();
      const email = (order.userId?.email || '').toLowerCase();
      const ref = (order.transferReference || '').toLowerCase();
      const shortId = order._id.slice(-8).toLowerCase();
      if (!name.includes(q) && !email.includes(q) && !ref.includes(q) && !shortId.includes(q)) return false;
    }
    return true;
  });

  const exportCSV = () => {
    const headers = ['STT', 'Khách hàng', 'Tổng tiền', 'Thanh toán', 'TT thanh toán', 'Trạng thái', 'Ngày tạo'];
    const rows = filteredOrders.map((o, idx) => [
      idx + 1,
      o.userId?.name || 'N/A',
      Number(o.totalAmount || 0),
      paymentMethodLabelMap[o.paymentMethod] || o.paymentMethod || 'COD',
      paymentStatusLabelMap[o.paymentStatus || 'PENDING'] || (o.paymentStatus || 'PENDING'),
      statusLabelMap[o.status] || o.status,
      new Date(o.createdAt).toLocaleDateString('vi-VN')
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getStatusOptions = (currentStatus) => allowedStatusTransitions[currentStatus] || statuses;

  return (
    <Layout>
      <h1>Đơn hàng</h1>
      <p className="helper">Cập nhật trạng thái đơn và trạng thái thanh toán ngay trên bảng.</p>

      {loading ? <p className="page-card">Đang tải đơn hàng...</p> : null}
      {error ? <p className="error">{error}</p> : null}
      {!loading && !filteredOrders.length ? <p className="page-card">Không có đơn hàng phù hợp bộ lọc</p> : null}

      {!!orders.length && (
        <>
          <div className="table-toolbar order-toolbar">
            <div className="filter-group">
              <input
                className="order-search-input"
                type="text"
                placeholder="Tìm theo tên, ID đơn, mã CK..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="filter-group">
              <span className="helper">Lọc trạng thái đơn</span>
              <select
                className="order-status-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="ALL">Tất cả</option>
                {statuses.map((s) => (
                  <option key={s} value={s}>{statusLabelMap[s] || s}</option>
                ))}
              </select>
            </div>
            <div className="filter-group">
              <span className="helper">Lọc thanh toán</span>
              <select
                className="order-status-select payment-filter-select"
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
              >
                {paymentStatuses.map((status) => (
                  <option key={status} value={status}>
                    {paymentStatusLabelMap[status] || status}
                  </option>
                ))}
              </select>
            </div>
            <button className="export-csv-btn" onClick={exportCSV}>
              ↓ Xuất CSV ({filteredOrders.length})
            </button>
          </div>

          <div className="page-card table-wrap">
          <table className="orders-table">
            <thead>
              <tr><th>Mã đơn</th><th>Khách hàng</th><th>Tổng tiền</th><th>Phương thức</th><th>Thanh toán</th><th>Cập nhật thanh toán</th><th>Trạng thái</th><th>Cập nhật đơn</th></tr>
            </thead>
            <tbody>
              {filteredOrders.map((o, idx) => (
                <tr key={o._id}>
                  <td className="order-id-cell">#{String(idx + 1).padStart(3, '0')}</td>
                  <td>{o.userId?.name || 'N/A'}</td>
                  <td className="order-total-cell">{Number(o.totalAmount || 0).toLocaleString()} đ</td>
                  <td>{paymentMethodLabelMap[o.paymentMethod] || o.paymentMethod || 'COD'}</td>
                  <td>
                    <span className={`status-badge ${o.paymentStatus === 'PAID' ? 'payment-paid' : 'status-pending'}`}>
                      {paymentStatusLabelMap[o.paymentStatus || 'PENDING'] || (o.paymentStatus || 'PENDING')}
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
                        <option key={status} value={status}>{paymentStatusLabelMap[status] || status}</option>
                      ))}
                    </select>
                  </td>
                  <td><span className={`status-badge ${statusClassMap[o.status] || ''}`}>{statusLabelMap[o.status] || o.status}</span></td>
                  <td>
                    <select
                      className="order-status-select"
                      value={o.status}
                      onChange={(e) => updateStatus(o._id, e.target.value)}
                      disabled={updatingId === o._id}
                    >
                      {getStatusOptions(o.status).map((s) => <option key={s} value={s}>{statusLabelMap[s] || s}</option>)}
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
