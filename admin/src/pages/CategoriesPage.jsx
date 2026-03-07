import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/categories');
      setCategories(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Không tải được danh mục');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const saveCategory = async () => {
    if (!name.trim()) return;

    try {
      if (editingId) {
        await api.put(`/categories/${editingId}`, { name: name.trim() });
      } else {
        await api.post('/categories', { name: name.trim() });
      }
      setName('');
      setEditingId(null);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Không lưu được danh mục');
    }
  };

  const removeCategory = async (id) => {
    try {
      await api.delete(`/categories/${id}`);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Không xóa được danh mục');
    }
  };

  const startEdit = (category) => {
    setEditingId(category._id);
    setName(category.name);
  };

  return (
    <Layout>
      <h1>Categories</h1>
      <div className="row">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Tên danh mục" />
        <button onClick={saveCategory}>{editingId ? 'Cập nhật' : 'Thêm'}</button>
        {editingId ? <button onClick={() => { setEditingId(null); setName(''); }}>Hủy</button> : null}
      </div>

      {loading ? <p>Loading...</p> : null}
      {error ? <p className="error">{error}</p> : null}
      {!loading && !categories.length ? <p>Chưa có danh mục nào</p> : null}

      <ul>
        {categories.map((c) => (
          <li key={c._id}>
            {c.name} <button onClick={() => startEdit(c)}>Sửa</button> <button onClick={() => removeCategory(c._id)}>Xóa</button>
          </li>
        ))}
      </ul>
    </Layout>
  );
}
