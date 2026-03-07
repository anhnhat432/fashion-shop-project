import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';

const initial = { name: '', price: '', description: '', image: '', sizes: '', colors: '', stock: '', categoryId: '' };

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(initial);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [pRes, cRes] = await Promise.all([api.get('/products'), api.get('/categories')]);
      setProducts(pRes.data.data || []);
      setCategories(cRes.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Không tải được dữ liệu sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const toPayload = {
    ...form,
    name: form.name.trim(),
    description: form.description.trim(),
    price: Number(form.price),
    stock: Number(form.stock || 0),
    sizes: form.sizes ? form.sizes.split(',').map((x) => x.trim()).filter(Boolean) : [],
    colors: form.colors ? form.colors.split(',').map((x) => x.trim()).filter(Boolean) : []
  };

  const saveProduct = async () => {
    if (!toPayload.name || Number.isNaN(toPayload.price) || !toPayload.categoryId) {
      setError('Tên, giá và danh mục là bắt buộc');
      return;
    }

    try {
      if (editingId) {
        await api.put(`/products/${editingId}`, toPayload);
      } else {
        await api.post('/products', toPayload);
      }
      setForm(initial);
      setEditingId(null);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Không lưu được sản phẩm');
    }
  };

  const removeProduct = async (id) => {
    try {
      await api.delete(`/products/${id}`);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Không xóa được sản phẩm');
    }
  };

  const startEdit = (product) => {
    setEditingId(product._id);
    setForm({
      name: product.name || '',
      price: String(product.price ?? ''),
      description: product.description || '',
      image: product.image || '',
      sizes: Array.isArray(product.sizes) ? product.sizes.join(', ') : '',
      colors: Array.isArray(product.colors) ? product.colors.join(', ') : '',
      stock: String(product.stock ?? 0),
      categoryId: product.categoryId?._id || product.categoryId || ''
    });
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
          {categories.map((c) => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </select>
        <button onClick={saveProduct}>{editingId ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm'}</button>
        {editingId ? <button onClick={() => { setEditingId(null); setForm(initial); }}>Hủy sửa</button> : null}
      </div>

      {loading ? <p>Loading...</p> : null}
      {error ? <p className="error">{error}</p> : null}
      {!loading && !products.length ? <p>Chưa có sản phẩm nào</p> : null}

      {!!products.length && (
        <table>
          <thead><tr><th>Tên</th><th>Giá</th><th>Tồn kho</th><th>Danh mục</th><th>Hành động</th></tr></thead>
          <tbody>
            {products.map((p) => (
              <tr key={p._id}>
                <td>{p.name}</td>
                <td>{p.price}</td>
                <td>{p.stock}</td>
                <td>{p.categoryId?.name}</td>
                <td>
                  <button onClick={() => startEdit(p)}>Sửa</button>
                  <button onClick={() => removeProduct(p._id)}>Xóa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Layout>
  );
}
