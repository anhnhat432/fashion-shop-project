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
  CANCELLED: ['CANCELLED'],
};

const statusClassMap = {
  PENDING: 'status-pending',
  CONFIRMED: 'status-confirmed',
  SHIPPING: 'status-shipping',
  DELIVERED: 'status-delivered',
  CANCELLED: 'status-cancelled',
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
  PENDING: 'Chưa thanh toán',
  PAID: 'Đã thanh toán',
};

const paymentMethodLabelMap = {
  COD: 'COD',
  BANK_TRANSFER: 'Chuyển khoản',
};

const formatDateTime = (value) => {
  if (!value) return '';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  return date.toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
  });
};

const getPaymentStatusLabel = (order) => {
  if ((order.paymentStatus || 'PENDING') === 'PAID') {
    return 'Đã thanh toán';
  }

  return order.paymentMethod === 'BANK_TRANSFER'
    ? 'Chờ xác nhận CK'
    : 'Thu khi nhận hàng';
};

const getPaymentBadgeClass = (order) => {
  if ((order.paymentStatus || 'PENDING') === 'PAID') {
    return 'payment-paid';
  }

  return order.paymentMethod === 'BANK_TRANSFER'
    ? 'status-pending'
    : 'payment-cod';
};

const getPaymentActionLabel = (order) => {
  if ((order.paymentStatus || 'PENDING') === 'PAID') {
    return 'Chuyển về chờ xác nhận';
  }

  return order.paymentMethod === 'BANK_TRANSFER'
    ? 'Xác nhận đã nhận tiền'
    : 'Đánh dấu đã thanh toán';
};

const getPaymentActionNote = (order) => {
  if (order.status === 'CANCELLED') {
    return (order.paymentStatus || 'PENDING') === 'PAID'
      ? 'Đơn đã hủy nhưng đang mang trạng thái đã thanh toán. Bạn có thể đưa về chờ xác nhận để chỉnh dữ liệu.'
      : 'Đơn đã hủy nên không thể đánh dấu đã thanh toán.';
  }

  if ((order.paymentStatus || 'PENDING') === 'PAID') {
    return 'Dùng khi cần trả đơn về trạng thái chờ xác nhận.';
  }

  return order.paymentMethod === 'BANK_TRANSFER'
    ? 'Dùng sau khi đối chiếu đúng mã giao dịch.'
    : 'Dùng khi khách đã thanh toán trực tiếp.';
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

      if (!name.includes(q) && !email.includes(q) && !ref.includes(q) && !shortId.includes(q)) {
        return false;
      }
    }

    return true;
  });

  const exportCSV = () => {
    const headers = ['STT', 'Khách hàng', 'Tổng tiền', 'Thanh toán', 'TT thanh toán', 'Trạng thái', 'Ngày tạo'];
    const rows = filteredOrders.map((order, idx) => [
      idx + 1,
      order.userId?.name || 'N/A',
      Number(order.totalAmount || 0),
      paymentMethodLabelMap[order.paymentMethod] || order.paymentMethod || 'COD',
      getPaymentStatusLabel(order),
      statusLabelMap[order.status] || order.status,
      new Date(order.createdAt).toLocaleDateString('vi-VN'),
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
      <p className="helper">Theo dõi thanh toán chuyển khoản mô phỏng, đối chiếu mã giao dịch và cập nhật trạng thái đơn ngay trên bảng.</p>

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
                placeholder="Tìm theo tên, ID đơn, mã giao dịch..."
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
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {statusLabelMap[status] || status}
                  </option>
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
                <tr>
                  <th>Mã đơn</th>
                  <th>Khách hàng</th>
                  <th>Tổng tiền</th>
                  <th>Phương thức</th>
                  <th>Thanh toán</th>
                  <th>Xử lý thanh toán</th>
                  <th>Trạng thái</th>
                  <th>Cập nhật đơn</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order, idx) => (
                  <tr key={order._id}>
                    <td className="order-id-cell">#{String(idx + 1).padStart(3, '0')}</td>
                    <td>{order.userId?.name || 'N/A'}</td>
                    <td className="order-total-cell">{Number(order.totalAmount || 0).toLocaleString()} đ</td>
                    <td>{paymentMethodLabelMap[order.paymentMethod] || order.paymentMethod || 'COD'}</td>
                    <td>
                      <div className="payment-cell">
                        <span className={`status-badge ${getPaymentBadgeClass(order)}`}>
                          {getPaymentStatusLabel(order)}
                        </span>
                        <div className="payment-meta">
                          {order.transferReference ? <div className="helper">Mã GD: {order.transferReference}</div> : null}
                          {order.paymentDeadlineAt && (order.paymentStatus || 'PENDING') !== 'PAID' ? (
                            <div className="helper">Hạn xác nhận: {formatDateTime(order.paymentDeadlineAt)}</div>
                          ) : null}
                          {order.paidAt ? <div className="helper">Đã duyệt lúc: {formatDateTime(order.paidAt)}</div> : null}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="payment-action-stack">
                        <button
                          className={`${(order.paymentStatus || 'PENDING') === 'PAID' ? 'btn-ghost' : 'btn-edit'} payment-action-btn`}
                          title={order.status === 'CANCELLED' && (order.paymentStatus || 'PENDING') !== 'PAID' ? 'Đơn đã hủy không thể đánh dấu đã thanh toán.' : ''}
                          onClick={() =>
                            updatePaymentStatus(
                              order._id,
                              (order.paymentStatus || 'PENDING') === 'PAID' ? 'PENDING' : 'PAID',
                            )
                          }
                          disabled={
                            updatingPaymentId === order._id ||
                            (order.status === 'CANCELLED' && (order.paymentStatus || 'PENDING') !== 'PAID')
                          }
                        >
                          {updatingPaymentId === order._id ? 'Đang cập nhật...' : getPaymentActionLabel(order)}
                        </button>
                        <div className="helper payment-action-note">{getPaymentActionNote(order)}</div>
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge ${statusClassMap[order.status] || ''}`}>
                        {statusLabelMap[order.status] || order.status}
                      </span>
                    </td>
                    <td>
                      <select
                        className="order-status-select"
                        value={order.status}
                        onChange={(e) => updateStatus(order._id, e.target.value)}
                        disabled={updatingId === order._id}
                      >
                        {getStatusOptions(order.status).map((status) => (
                          <option key={status} value={status}>
                            {statusLabelMap[status] || status}
                          </option>
                        ))}
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
