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
    if (!name.trim() || name.trim().length < 2) {
      setError('Tên danh mục tối thiểu 2 ký tự');
      return;
    }

    setError('');
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
    setError('');
  };

  return (
    <Layout>
      <h1>Categories</h1>
      <p className="helper">Danh mục nên ngắn gọn, dễ lọc sản phẩm.</p>

      <section className="form-card category-form-card">
        <div className="form-card-head">
          <h3>{editingId ? 'Cập nhật danh mục' : 'Thêm danh mục mới'}</h3>
        </div>

        <div className="category-form-row">
          <input
            className="category-name-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Tên danh mục"
          />
          <button className="btn-primary" onClick={saveCategory}>{editingId ? 'Cập nhật' : 'Thêm'}</button>
          {editingId ? <button className="btn-ghost" onClick={() => { setEditingId(null); setName(''); }}>Hủy</button> : null}
        </div>
      </section>

      {loading ? <p className="page-card">Đang tải danh mục...</p> : null}
      {error ? <p className="error">{error}</p> : null}

      {!loading && !categories.length ? <p className="page-card">Chưa có danh mục nào</p> : null}

      {!!categories.length && (
        <section className="page-card category-list-card">
          <h3 className="category-list-title">Danh sách danh mục</h3>

          <div className="category-list">
            {categories.map((c) => (
              <div key={c._id} className="category-row">
                <span className="category-name">{c.name}</span>
                <div className="row-actions">
                  <button className="btn-edit" onClick={() => startEdit(c)}>Sửa</button>
                  <button className="btn-delete" onClick={() => removeCategory(c._id)}>Xóa</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </Layout>
  );
}
