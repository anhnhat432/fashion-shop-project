import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';

const roleClassMap = {
  admin: 'status-confirmed',
  user: 'status-pending',
};

const roleLabelMap = {
  admin: 'Quản trị viên',
  user: 'Người dùng',
};

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/users');
      setUsers(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Không tải được danh sách người dùng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (id, role) => {
    setUpdatingId(id);
    setError('');
    try {
      await api.put(`/users/${id}/role`, { role });
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Không cập nhật được quyền');
    } finally {
      setUpdatingId('');
    }
  };

  return (
    <Layout>
      <h1>Người dùng</h1>
      <p className="helper">Xem danh sách người dùng và phân quyền quản trị.</p>

      {loading ? <p className="page-card">Đang tải người dùng...</p> : null}
      {error ? <p className="error">{error}</p> : null}
      {!loading && !users.length ? <p className="page-card">Chưa có người dùng nào.</p> : null}

      {!!users.length && (
        <div className="page-card table-wrap">
          <table className="orders-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Họ tên</th>
                <th>Email</th>
                <th>Số điện thoại</th>
                <th>Địa chỉ</th>
                <th>Quyền</th>
                <th>Ngày tạo</th>
                <th>Phân quyền</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, idx) => (
                <tr key={user._id}>
                  <td>{idx + 1}</td>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.phone || '—'}</td>
                  <td>{user.address || '—'}</td>
                  <td>
                    <span className={`status-badge ${roleClassMap[user.role] || ''}`}>
                      {roleLabelMap[user.role] || user.role}
                    </span>
                  </td>
                  <td>{new Date(user.createdAt).toLocaleDateString('vi-VN')}</td>
                  <td>
                    <select
                      className="order-status-select"
                      value={user.role}
                      onChange={(e) => handleRoleChange(user._id, e.target.value)}
                      disabled={updatingId === user._id}
                    >
                      <option value="user">Người dùng</option>
                      <option value="admin">Quản trị viên</option>
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
