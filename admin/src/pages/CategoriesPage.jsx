import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState('');

  const fetchData = () => api.get('/categories').then((res) => setCategories(res.data.data));
  useEffect(() => { fetchData(); }, []);

  const createCategory = async () => {
    if (!name) return;
    await api.post('/categories', { name });
    setName('');
    fetchData();
  };

  const removeCategory = async (id) => {
    await api.delete(`/categories/${id}`);
    fetchData();
  };

  return (
    <Layout>
      <h1>Categories</h1>
      <div className="row"><input value={name} onChange={(e) => setName(e.target.value)} placeholder="Tên danh mục" /><button onClick={createCategory}>Thêm</button></div>
      <ul>{categories.map((c) => <li key={c._id}>{c.name} <button onClick={() => removeCategory(c._id)}>Xóa</button></li>)}</ul>
    </Layout>
  );
}
