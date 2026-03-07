import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';

const initial = { name: '', price: '', description: '', image: '', sizes: '', colors: '', stock: '', categoryId: '' };

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(initial);

  const fetchData = async () => {
    const [pRes, cRes] = await Promise.all([api.get('/products'), api.get('/categories')]);
    setProducts(pRes.data.data);
    setCategories(cRes.data.data);
  };

  useEffect(() => { fetchData(); }, []);

  const createProduct = async () => {
    if (!form.name || !form.price || !form.categoryId) return;
    await api.post('/products', {
      ...form,
      price: Number(form.price),
      stock: Number(form.stock || 0),
      sizes: form.sizes ? form.sizes.split(',').map((x) => x.trim()) : [],
      colors: form.colors ? form.colors.split(',').map((x) => x.trim()) : []
    });
    setForm(initial);
    fetchData();
  };

  const removeProduct = async (id) => {
    await api.delete(`/products/${id}`);
    fetchData();
  };

  return (
    <Layout>
      <h1>Products</h1>
      <div className="grid-form">
        <input placeholder="Tên" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input placeholder="Giá" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
        <input placeholder="Mô tả" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <input placeholder="Image URL" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} />
        <input placeholder="Sizes (S,M,L)" value={form.sizes} onChange={(e) => setForm({ ...form, sizes: e.target.value })} />
        <input placeholder="Colors (Đỏ,Xanh)" value={form.colors} onChange={(e) => setForm({ ...form, colors: e.target.value })} />
        <input placeholder="Tồn kho" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
        <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
          <option value="">-- Chọn danh mục --</option>
          {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>
        <button onClick={createProduct}>Thêm sản phẩm</button>
      </div>
      <table>
        <thead><tr><th>Tên</th><th>Giá</th><th>Tồn kho</th><th>Danh mục</th><th></th></tr></thead>
        <tbody>
          {products.map((p) => (
            <tr key={p._id}><td>{p.name}</td><td>{p.price}</td><td>{p.stock}</td><td>{p.categoryId?.name}</td><td><button onClick={() => removeProduct(p._id)}>Xóa</button></td></tr>
          ))}
        </tbody>
      </table>
    </Layout>
  );
}
