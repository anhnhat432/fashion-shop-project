import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';

const roleClassMap = {
  admin: 'status-confirmed',
  user: 'status-pending'
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
      setError(err.response?.data?.message || 'Không cập nhật được role');
    } finally {
      setUpdatingId('');
    }
  };

  return (
    <Layout>
      <h1>Users</h1>
      <p className="helper">Xem danh sách người dùng và phân quyền admin.</p>

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
                <th>Role</th>
                <th>Ngày tạo</th>
                <th>Phân quyền</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u, idx) => (
                <tr key={u._id}>
                  <td>{idx + 1}</td>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.phone || '—'}</td>
                  <td>{u.address || '—'}</td>
                  <td>
                    <span className={`status-badge ${roleClassMap[u.role] || ''}`}>
                      {u.role}
                    </span>
                  </td>
                  <td>{new Date(u.createdAt).toLocaleDateString('vi-VN')}</td>
                  <td>
                    <select
                      className="order-status-select"
                      value={u.role}
                      onChange={(e) => handleRoleChange(u._id, e.target.value)}
                      disabled={updatingId === u._id}
                    >
                      <option value="user">user</option>
                      <option value="admin">admin</option>
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
