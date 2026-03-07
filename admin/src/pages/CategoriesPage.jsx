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
      setError(err.response?.data?.message || 'Khong tai duoc danh muc');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const saveCategory = async () => {
    if (!name.trim() || name.trim().length < 2) {
      setError('Ten danh muc toi thieu 2 ky tu');
      return;
    }

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
      setError(err.response?.data?.message || 'Khong luu duoc danh muc');
    }
  };

  const removeCategory = async (id) => {
    try {
      await api.delete(`/categories/${id}`);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Khong xoa duoc danh muc');
    }
  };

  const startEdit = (category) => {
    setEditingId(category._id);
    setName(category.name);
  };

  return (
    <Layout>
      <h1>Categories</h1>
      <p className="helper">Danh muc nen ngan gon, de loc san pham.</p>
      <div className="row page-card">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ten danh muc" />
        <button onClick={saveCategory}>{editingId ? 'Cap nhat' : 'Them'}</button>
        {editingId ? <button onClick={() => { setEditingId(null); setName(''); }}>Huy</button> : null}
      </div>

      {loading ? <p>Loading...</p> : null}
      {error ? <p className="error">{error}</p> : null}
      {!loading && !categories.length ? <p className="page-card">Chua co danh muc nao</p> : null}

      <ul className="page-card">
        {categories.map((c) => (
          <li key={c._id}>
            {c.name} <button onClick={() => startEdit(c)}>Sua</button> <button onClick={() => removeCategory(c._id)}>Xoa</button>
          </li>
        ))}
      </ul>
    </Layout>
  );
}
