import { useEffect, useMemo, useState } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';

const initialForm = {
  code: '',
  type: 'PERCENT',
  value: '',
  minOrderValue: '',
  maxDiscount: '',
  isActive: true,
};

const formatCurrency = (value) => `${Number(value || 0).toLocaleString()} đ`;
const HEAVY_USAGE_THRESHOLD = 3;
const FILTER_OPTIONS = [
  { key: 'ALL', label: 'All' },
  { key: 'ACTIVE', label: 'Active' },
  { key: 'ARCHIVED', label: 'Archived' },
];
const SECONDARY_FILTER_OPTIONS = [
  { key: 'NONE', label: 'All types' },
  { key: 'USED_MANY', label: 'Used many' },
  { key: 'INACTIVE', label: 'Inactive' },
  { key: 'PERCENT', label: 'Percent' },
  { key: 'FIXED', label: 'Fixed' },
];

export default function VouchersPage() {
  const [vouchers, setVouchers] = useState([]);
  const [archivedVouchers, setArchivedVouchers] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [secondaryFilter, setSecondaryFilter] = useState('NONE');
  const editingVoucher = useMemo(
    () => vouchers.find((voucher) => voucher._id === editingId) || null,
    [editingId, vouchers],
  );

  const fetchVouchers = async () => {
    setLoading(true);
    setError('');
    try {
      const [activeRes, archivedRes] = await Promise.all([
        api.get('/vouchers'),
        api.get('/vouchers/archived'),
      ]);
      setVouchers(activeRes.data.data || []);
      setArchivedVouchers(archivedRes.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Không tải được danh sách voucher');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVouchers();
  }, []);

  const filteredVouchers = useMemo(() => {
    let source = [...vouchers, ...archivedVouchers];

    if (activeFilter === 'ACTIVE') {
      source = vouchers;
    }

    if (activeFilter === 'ARCHIVED') {
      source = archivedVouchers;
    }

    const keyword = search.trim().toLowerCase();
    if (!keyword) {
      return source;
    }

    return source.filter((voucher) => {
      const code = voucher.code?.toLowerCase() || '';
      const type = voucher.type?.toLowerCase() || '';
      return code.includes(keyword) || type.includes(keyword);
    });
  }, [activeFilter, archivedVouchers, search, vouchers]);
  const visibleVouchers = useMemo(() => {
    if (secondaryFilter === 'USED_MANY') {
      return filteredVouchers.filter((voucher) => Boolean(voucher.isHeavilyUsed));
    }

    if (secondaryFilter === 'INACTIVE') {
      return filteredVouchers.filter((voucher) => !voucher.isActive || Boolean(voucher.archivedAt));
    }

    if (secondaryFilter === 'PERCENT') {
      return filteredVouchers.filter((voucher) => voucher.type === 'PERCENT');
    }

    if (secondaryFilter === 'FIXED') {
      return filteredVouchers.filter((voucher) => voucher.type === 'FIXED');
    }

    return filteredVouchers;
  }, [filteredVouchers, secondaryFilter]);

  const summary = useMemo(() => ({
    total: vouchers.length + archivedVouchers.length,
    active: vouchers.filter((item) => item.isActive).length,
    archived: archivedVouchers.length,
    percent: vouchers.filter((item) => item.type === 'PERCENT').length,
    fixed: vouchers.filter((item) => item.type === 'FIXED').length,
  }), [archivedVouchers, vouchers]);

  const resetForm = () => {
    setEditingId(null);
    setForm(initialForm);
  };

  const saveVoucher = async () => {
    const payload = {
      code: form.code.trim().toUpperCase(),
      type: form.type,
      value: Number(form.value),
      minOrderValue: Number(form.minOrderValue || 0),
      maxDiscount: Number(form.maxDiscount || 0),
      isActive: Boolean(form.isActive),
    };

    if (payload.code.length < 3) {
      setError('Mã voucher tối thiểu 3 ký tự');
      return;
    }
    if (!['PERCENT', 'FIXED'].includes(payload.type)) {
      setError('Loại voucher không hợp lệ');
      return;
    }
    if (Number.isNaN(payload.value) || payload.value <= 0) {
      setError('Giá trị voucher phải lớn hơn 0');
      return;
    }
    if (Number.isNaN(payload.minOrderValue) || payload.minOrderValue < 0) {
      setError('Đơn tối thiểu phải >= 0');
      return;
    }
    if (Number.isNaN(payload.maxDiscount) || payload.maxDiscount < 0) {
      setError('Giảm tối đa phải >= 0');
      return;
    }
    if (payload.type === 'PERCENT' && payload.value > 100) {
      setError('Voucher phần trăm không thể lớn hơn 100');
      return;
    }

    if (
      editingVoucher?.usageCount >= HEAVY_USAGE_THRESHOLD &&
      editingVoucher.code !== payload.code &&
      !window.confirm(
        `Voucher ${editingVoucher.code} đã được dùng ${editingVoucher.usageCount} lần. Đổi mã có thể làm lệch báo cáo và lịch sử đơn. Bạn vẫn muốn tiếp tục?`,
      )
    ) {
      return;
    }

    setSaving(true);
    setError('');
    try {
      if (editingId) {
        await api.put(`/vouchers/${editingId}`, payload);
      } else {
        await api.post('/vouchers', payload);
      }
      resetForm();
      fetchVouchers();
    } catch (err) {
      setError(err.response?.data?.message || 'Không lưu được voucher');
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (voucher) => {
    setEditingId(voucher._id);
    setForm({
      code: voucher.code || '',
      type: voucher.type || 'PERCENT',
      value: String(voucher.value ?? ''),
      minOrderValue: String(voucher.minOrderValue ?? 0),
      maxDiscount: String(voucher.maxDiscount ?? 0),
      isActive: Boolean(voucher.isActive),
    });
    setError('');
  };

  const removeVoucher = async (id) => {
    const voucher = vouchers.find((item) => item._id === id);
    const confirmMessage = voucher?.usageCount >= HEAVY_USAGE_THRESHOLD
      ? `Voucher ${voucher.code} đã được dùng nhiều (${voucher.usageCount} lần). Hệ thống sẽ lưu trữ mềm và tắt mã thay vì xóa cứng. Tiếp tục?`
      : voucher?.usageCount
      ? `Voucher ${voucher.code} đã được dùng ${voucher.usageCount} lần. Xóa khỏi danh sách admin?`
      : 'Bạn có chắc muốn xóa voucher này?';

    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      const res = await api.delete(`/vouchers/${id}`);
      if (editingId === id) {
        resetForm();
      }
      if (res.data.data?.mode === 'soft-delete') {
        setError('');
        window.alert('Voucher đã được lưu trữ mềm và tự động tắt do có lịch sử sử dụng cao.');
      }
      fetchVouchers();
    } catch (err) {
      setError(err.response?.data?.message || 'Không xóa được voucher');
    }
  };

  const toggleStatus = async (voucher) => {
    try {
      await api.put(`/vouchers/${voucher._id}`, { isActive: !voucher.isActive });
      fetchVouchers();
    } catch (err) {
      setError(err.response?.data?.message || 'Không cập nhật được trạng thái voucher');
    }
  };

  const restoreVoucher = async (id, shouldActivate = false) => {
    const voucher = archivedVouchers.find((item) => item._id === id);
    if (!voucher) {
      return;
    }

    const confirmMessage = shouldActivate
      ? `Khôi phục và bật ngay voucher ${voucher.code}?`
      : `Khôi phục voucher ${voucher.code}? Mã sẽ trở lại danh sách chính ở trạng thái tắt.`;

    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      await api.put(`/vouchers/${id}/restore`, shouldActivate ? { activate: true } : {});
      fetchVouchers();
    } catch (err) {
      setError(err.response?.data?.message || (shouldActivate ? 'Không thể khôi phục và bật voucher' : 'Không khôi phục được voucher'));
    }
  };

  return (
    <Layout>
      <h1>Vouchers</h1>
      <p className="helper">Tạo mã giảm giá để admin demo được cả chiến dịch khuyến mãi lẫn checkout.</p>

      <div className="stats-grid stats-grid-4">
        <div className="stat-card accent-dark">
          <p className="stat-label">Tổng mã</p>
          <p className="stat-value">{summary.total}</p>
          <p className="stat-footnote">Kho voucher đang có</p>
        </div>
        <div className="stat-card accent-soft">
          <p className="stat-label">Đang bật</p>
          <p className="stat-value">{summary.active}</p>
          <p className="stat-footnote">Sẵn sàng cho checkout</p>
        </div>
        <div className="stat-card accent-warm">
          <p className="stat-label">Giảm %</p>
          <p className="stat-value">{summary.percent}</p>
          <p className="stat-footnote">Áp dụng theo phần trăm</p>
        </div>
        <div className="stat-card accent-alert">
          <p className="stat-label">Archived</p>
          <p className="stat-value">{summary.archived}</p>
          <p className="stat-footnote">Voucher đã archive mềm</p>
        </div>
      </div>

      <div className="voucher-tabs">
        {FILTER_OPTIONS.map((option) => (
          <button
            key={option.key}
            type="button"
            className={`voucher-tab ${activeFilter === option.key ? 'is-active' : ''}`}
            onClick={() => setActiveFilter(option.key)}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="voucher-subfilters">
        {SECONDARY_FILTER_OPTIONS.map((option) => (
          <button
            key={option.key}
            type="button"
            className={`voucher-subfilter ${secondaryFilter === option.key ? 'is-active' : ''}`}
            onClick={() => setSecondaryFilter(option.key)}
          >
            {option.label}
          </button>
        ))}
      </div>

      <section className="form-card voucher-form-card">
        <div className="form-card-head">
          <h3>{editingId ? 'Cập nhật voucher' : 'Tạo voucher mới'}</h3>
          <p className="helper">Hỗ trợ cả giảm phần trăm lẫn giảm cố định, có thể bật tắt nhanh.</p>
        </div>

        {editingVoucher?.usageCount ? (
          <div className={`voucher-warning ${editingVoucher.usageCount >= HEAVY_USAGE_THRESHOLD ? 'is-strong' : ''}`}>
            Voucher này đã được dùng {editingVoucher.usageCount} lần
            {editingVoucher.lastUsedAt ? `, gần nhất vào ${new Date(editingVoucher.lastUsedAt).toLocaleDateString('vi-VN')}` : ''}.
            {editingVoucher.usageCount >= HEAVY_USAGE_THRESHOLD ? ' Hạn chế đổi mã nếu không thật sự cần.' : ''}
          </div>
        ) : null}

        <div className="grid-form voucher-grid-form">
          <input
            placeholder="Mã voucher"
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
          />
          <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
            <option value="PERCENT">Phần trăm</option>
            <option value="FIXED">Giảm cố định</option>
          </select>
          <input
            placeholder={form.type === 'PERCENT' ? 'Giá trị giảm (%)' : 'Giá trị giảm (đ)'}
            value={form.value}
            onChange={(e) => setForm({ ...form, value: e.target.value })}
          />
          <input
            placeholder="Đơn tối thiểu (đ)"
            value={form.minOrderValue}
            onChange={(e) => setForm({ ...form, minOrderValue: e.target.value })}
          />
          <input
            placeholder="Giảm tối đa (đ, 0 nếu không giới hạn)"
            value={form.maxDiscount}
            onChange={(e) => setForm({ ...form, maxDiscount: e.target.value })}
          />
          <label className="toggle-field">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
            />
            <span>Voucher đang hoạt động</span>
          </label>
        </div>

        <div className="form-actions">
          <button className="btn-primary" onClick={saveVoucher} disabled={saving}>
            {saving ? 'Đang lưu...' : editingId ? 'Cập nhật voucher' : 'Tạo voucher'}
          </button>
          {editingId ? <button className="btn-ghost" onClick={resetForm}>Hủy sửa</button> : null}
        </div>
      </section>

      {loading ? <p className="page-card">Đang tải voucher...</p> : null}
      {error ? <p className="error">{error}</p> : null}

      <div className="table-toolbar voucher-toolbar">
        <input
          className="search-input"
          placeholder={activeFilter === 'ARCHIVED' ? 'Tìm trong archived vouchers' : 'Tìm theo mã hoặc loại voucher'}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {!loading && !visibleVouchers.length ? <p className="page-card">{activeFilter === 'ARCHIVED' ? 'Chưa có voucher archive nào' : 'Chưa có voucher nào phù hợp bộ lọc'}</p> : null}

      {!!visibleVouchers.length && (
        <section className="page-card table-wrap">
          <table className="products-table vouchers-table">
            <thead>
              <tr>
                <th>Mã</th>
                <th>Loại</th>
                <th>Giá trị</th>
                <th>Điều kiện</th>
                <th>Lượt dùng</th>
                <th>Archive reason</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {visibleVouchers.map((voucher) => (
                <tr key={voucher._id}>
                  <td>
                    <div className="voucher-code-stack">
                      <strong>{voucher.code}</strong>
                      <span className="helper">{voucher.type === 'PERCENT' ? 'Giảm theo %' : 'Giảm trực tiếp'}</span>
                    </div>
                  </td>
                  <td>{voucher.type === 'PERCENT' ? 'Phần trăm' : 'Cố định'}</td>
                  <td className="price-cell">
                    {voucher.type === 'PERCENT'
                      ? `${Number(voucher.value || 0)}%`
                      : formatCurrency(voucher.value)}
                  </td>
                  <td>
                    <div className="voucher-rule-stack">
                      <span>Đơn tối thiểu: {formatCurrency(voucher.minOrderValue)}</span>
                      <span>Trần giảm: {voucher.maxDiscount > 0 ? formatCurrency(voucher.maxDiscount) : 'Không giới hạn'}</span>
                    </div>
                  </td>
                  <td>
                    <div className="voucher-usage-stack">
                      <strong>{voucher.usageCount || 0}</strong>
                      <span className={`usage-badge ${voucher.isHeavilyUsed ? 'is-high' : ''}`}>
                        {voucher.usageCount >= HEAVY_USAGE_THRESHOLD ? 'Dùng nhiều' : 'Bình thường'}
                      </span>
                    </div>
                  </td>
                  <td>
                    <span className={`archive-reason-badge ${voucher.archiveReason ? 'has-value' : ''}`}>
                      {voucher.archiveReasonLabel || '-'}
                    </span>
                  </td>
                  <td>
                    {voucher.archivedAt ? (
                      <span className="archived-pill">Archived</span>
                    ) : (
                      <button
                        type="button"
                        className={`status-toggle ${voucher.isActive ? 'is-active' : 'is-inactive'}`}
                        onClick={() => toggleStatus(voucher)}
                      >
                        {voucher.isActive ? 'Đang bật' : 'Đang tắt'}
                      </button>
                    )}
                  </td>
                  <td>
                    <div className="row-actions">
                      {voucher.archivedAt ? (
                        <>
                          <button className="btn-edit" onClick={() => restoreVoucher(voucher._id)}>Khôi phục</button>
                          <button className="btn-primary" onClick={() => restoreVoucher(voucher._id, true)}>Restore and activate</button>
                        </>
                      ) : (
                        <>
                          <button className="btn-edit" onClick={() => startEdit(voucher)}>Sửa</button>
                          <button className="btn-delete" onClick={() => removeVoucher(voucher._id)}>Xóa</button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </Layout>
  );
}