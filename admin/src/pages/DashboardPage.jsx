import { useEffect, useMemo, useState } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';

const statusOrder = ['PENDING', 'CONFIRMED', 'SHIPPING', 'DELIVERED', 'CANCELLED'];

const currency = (value) => `${Number(value || 0).toLocaleString()} đ`;

export default function DashboardPage() {
  const [dashboard, setDashboard] = useState({ products: [], categories: [], orders: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError('');

      try {
        const [productsResponse, categoriesResponse, ordersResponse] = await Promise.all([
          api.get('/products'),
          api.get('/categories'),
          api.get('/orders')
        ]);

        setDashboard({
          products: productsResponse.data.data || [],
          categories: categoriesResponse.data.data || [],
          orders: ordersResponse.data.data || []
        });
      } catch (err) {
        setError(err.response?.data?.message || 'Không tải được thống kê dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const summary = useMemo(() => {
    const { products, categories, orders } = dashboard;
    const activeOrders = orders.filter((item) => item.status !== 'CANCELLED');
    const deliveredOrders = orders.filter((item) => item.status === 'DELIVERED');
    const revenue = activeOrders.reduce((sum, item) => sum + Number(item.totalAmount || 0), 0);
    const averageOrderValue = activeOrders.length ? revenue / activeOrders.length : 0;
    const lowStockProducts = products.filter((item) => Number(item.stock || 0) > 0 && Number(item.stock || 0) <= 5);
    const soldOutProducts = products.filter((item) => Number(item.stock || 0) === 0);
    const totalStock = products.reduce((sum, item) => sum + Number(item.stock || 0), 0);
    const deliveryRate = orders.length ? Math.round((deliveredOrders.length / orders.length) * 100) : 0;

    const statusCounts = statusOrder.map((status) => ({
      status,
      count: orders.filter((item) => item.status === status).length,
    }));

    const recentOrders = [...orders].slice(0, 5);

    const categoryCountMap = categories
      .map((category) => ({
        id: category._id,
        name: category.name,
        count: products.filter((item) => item.categoryId?._id === category._id).length,
      }))
      .sort((left, right) => right.count - left.count);

    const bestSellingIndicator = [...products]
      .sort((left, right) => Number(left.stock || 0) - Number(right.stock || 0))
      .slice(0, 4);

    return {
      productsCount: products.length,
      categoriesCount: categories.length,
      ordersCount: orders.length,
      revenue,
      averageOrderValue,
      lowStockProducts,
      soldOutProducts,
      totalStock,
      deliveryRate,
      statusCounts,
      recentOrders,
      categoryCountMap,
      bestSellingIndicator,
    };
  }, [dashboard]);

  return (
    <Layout>
      <h1>Fashion Shop Dashboard</h1>
      <p className="helper">Tổng quan nhanh để demo và quản lý dữ liệu.</p>

      {loading ? <p className="page-card">Đang tải thống kê...</p> : null}
      {error ? <p className="error">{error}</p> : null}

      {!loading && !error ? (
        <>
          <section className="dashboard-hero">
            <div>
              <p className="dashboard-kicker">Operations overview</p>
              <h2 className="dashboard-title">Theo dõi đơn hàng, tồn kho và doanh thu trong một màn hình.</h2>
              <p className="dashboard-copy">
                Dashboard này gom các số liệu quan trọng nhất để khi demo nhìn vào là thấy hệ thống đang sống,
                không chỉ là vài trang CRUD rời rạc.
              </p>
            </div>
            <div className="hero-metric-card">
              <p className="hero-metric-label">Doanh thu hiện tại</p>
              <p className="hero-metric-value">{currency(summary.revenue)}</p>
              <p className="hero-metric-footnote">Giá trị trung bình mỗi đơn: {currency(summary.averageOrderValue)}</p>
            </div>
          </section>

          <div className="stats-grid stats-grid-4">
            <div className="stat-card accent-dark">
              <p className="stat-label">Products</p>
              <p className="stat-value">{summary.productsCount}</p>
              <p className="stat-footnote">Tổng stock: {summary.totalStock}</p>
            </div>
            <div className="stat-card accent-warm">
              <p className="stat-label">Categories</p>
              <p className="stat-value">{summary.categoriesCount}</p>
              <p className="stat-footnote">Tổ chức catalog rõ ràng</p>
            </div>
            <div className="stat-card accent-soft">
              <p className="stat-label">Orders</p>
              <p className="stat-value">{summary.ordersCount}</p>
              <p className="stat-footnote">Tỷ lệ giao thành công: {summary.deliveryRate}%</p>
            </div>
            <div className="stat-card accent-alert">
              <p className="stat-label">Risk</p>
              <p className="stat-value">{summary.lowStockProducts.length + summary.soldOutProducts.length}</p>
              <p className="stat-footnote">Sắp hết hoặc đã hết hàng</p>
            </div>
          </div>

          <section className="dashboard-layout-grid">
            <div className="page-card analytics-card">
              <div className="section-head">
                <h3>Trạng thái đơn hàng</h3>
                <p className="helper">Phân bổ theo workflow xử lý.</p>
              </div>
              <div className="status-stack">
                {summary.statusCounts.map((item) => {
                  const width = summary.ordersCount
                    ? `${Math.max((item.count / summary.ordersCount) * 100, item.count ? 10 : 0)}%`
                    : '0%';

                  return (
                    <div className="status-row" key={item.status}>
                      <div className="status-row-head">
                        <span className={`status-badge ${`status-${item.status.toLowerCase()}`}`}>{item.status}</span>
                        <strong>{item.count}</strong>
                      </div>
                      <div className="status-bar-track">
                        <div className={`status-bar-fill ${`status-fill-${item.status.toLowerCase()}`}`} style={{ width }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="page-card analytics-card">
              <div className="section-head">
                <h3>Cảnh báo tồn kho</h3>
                <p className="helper">Ưu tiên nhập thêm các item này.</p>
              </div>
              {summary.lowStockProducts.length || summary.soldOutProducts.length ? (
                <div className="inventory-list">
                  {[...summary.soldOutProducts, ...summary.lowStockProducts].slice(0, 6).map((item) => (
                    <div className="inventory-row" key={item._id}>
                      <div>
                        <p className="inventory-name">{item.name}</p>
                        <p className="inventory-meta">{item.categoryId?.name || 'Danh mục chưa rõ'}</p>
                      </div>
                      <span className={`stock-badge ${Number(item.stock || 0) === 0 ? 'low' : 'mid'}`}>
                        {Number(item.stock || 0) === 0 ? 'Hết hàng' : `Còn ${item.stock}`}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="helper">Hiện chưa có sản phẩm nào ở mức tồn kho rủi ro.</p>
              )}
            </div>
          </section>

          <section className="dashboard-layout-grid dashboard-layout-grid-bottom">
            <div className="page-card analytics-card">
              <div className="section-head">
                <h3>Danh mục nổi bật</h3>
                <p className="helper">Số sản phẩm hiện có theo danh mục.</p>
              </div>
              <div className="category-rank-list">
                {summary.categoryCountMap.slice(0, 5).map((item, index) => (
                  <div className="category-rank-row" key={item.id}>
                    <div className="category-rank-info">
                      <span className="rank-chip">#{String(index + 1).padStart(2, '0')}</span>
                      <div>
                        <p className="category-rank-name">{item.name}</p>
                        <p className="category-rank-meta">{item.count} sản phẩm</p>
                      </div>
                    </div>
                    <div className="mini-bar-track">
                      <div
                        className="mini-bar-fill"
                        style={{ width: `${summary.productsCount ? (item.count / summary.productsCount) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="page-card analytics-card">
              <div className="section-head">
                <h3>Recent orders</h3>
                <p className="helper">5 đơn gần nhất để theo dõi nhanh.</p>
              </div>
              <div className="recent-orders-list">
                {summary.recentOrders.map((order) => (
                  <div className="recent-order-row" key={order._id}>
                    <div>
                      <p className="recent-order-user">{order.userId?.name || 'Khách lẻ'}</p>
                      <p className="recent-order-meta">
                        {new Date(order.createdAt).toLocaleDateString('vi-VN')} • {currency(order.totalAmount)}
                      </p>
                    </div>
                    <span className={`status-badge ${`status-${order.status.toLowerCase()}`}`}>{order.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="page-card analytics-card best-seller-card">
            <div className="section-head">
              <h3>Top sản phẩm cần chú ý</h3>
              <p className="helper">Tạm suy ra từ các item có tồn kho giảm mạnh hơn phần còn lại.</p>
            </div>
            <div className="best-seller-grid">
              {summary.bestSellingIndicator.map((item) => (
                <div className="best-seller-tile" key={item._id}>
                  <p className="best-seller-category">{item.categoryId?.name || 'Fashion'}</p>
                  <h4>{item.name}</h4>
                  <p className="best-seller-price">{currency(item.price)}</p>
                  <p className="best-seller-stock">Tồn kho hiện tại: {item.stock}</p>
                </div>
              ))}
            </div>
          </section>
        </>
      ) : null}
    </Layout>
  );
}
