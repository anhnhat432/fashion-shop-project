import { useEffect, useMemo, useState } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';

const initial = { name: '', price: '', description: '', image: '', sizes: '', colors: '', stock: '', categoryId: '' };

const getStockBadgeClass = (stock) => {
  if (stock <= 5) return 'stock-badge low';
  if (stock <= 20) return 'stock-badge mid';
  return 'stock-badge high';
};

const getStockLabel = (stock) => {
  if (stock <= 5) return 'Sap het';
  if (stock <= 20) return 'Vua';
  return 'Con nhieu';
};

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(initial);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [pRes, cRes] = await Promise.all([api.get('/products'), api.get('/categories')]);
      setProducts(pRes.data.data || []);
      setCategories(cRes.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Khong tai duoc du lieu san pham');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredProducts = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return products;

    return products.filter((item) => {
      const name = item.name?.toLowerCase() || '';
      const category = item.categoryId?.name?.toLowerCase() || '';
      return name.includes(keyword) || category.includes(keyword);
    });
  }, [products, search]);

  const saveProduct = async () => {
    const payload = {
      ...form,
      name: form.name.trim(),
      description: form.description.trim(),
      image: form.image.trim(),
      price: Number(form.price),
      stock: Number(form.stock || 0),
      sizes: form.sizes ? form.sizes.split(',').map((x) => x.trim()).filter(Boolean) : [],
      colors: form.colors ? form.colors.split(',').map((x) => x.trim()).filter(Boolean) : []
    };

    if (!payload.name || payload.name.length < 2) {
      setError('Ten san pham toi thieu 2 ky tu');
      return;
    }
    if (Number.isNaN(payload.price) || payload.price <= 0) {
      setError('Gia san pham phai > 0');
      return;
    }
    if (Number.isNaN(payload.stock) || payload.stock < 0) {
      setError('Ton kho phai >= 0');
      return;
    }
    if (!payload.categoryId) {
      setError('Vui long chon danh muc');
      return;
    }
    if (payload.image && !payload.image.startsWith('http')) {
      setError('Anh san pham can la URL bat dau bang http');
      return;
    }

    setSaving(true);
    setError('');
    try {
      if (editingId) {
        await api.put(`/products/${editingId}`, payload);
      } else {
        await api.post('/products', payload);
      }
      setForm(initial);
      setEditingId(null);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Khong luu duoc san pham');
    } finally {
      setSaving(false);
    }
  };

  const removeProduct = async (id) => {
    try {
      await api.delete(`/products/${id}`);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Khong xoa duoc san pham');
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
      <p className="helper">Quan ly san pham nhanh cho demo mon hoc.</p>

      <section className="form-card">
        <div className="form-card-head">
          <h3>{editingId ? 'Cap nhat san pham' : 'Them san pham moi'}</h3>
          <p className="helper">Nhap thong tin co ban va luu nhanh.</p>
        </div>

        <div className="grid-form">
          <input placeholder="Ten" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input placeholder="Gia" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
          <input placeholder="Mo ta" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <input placeholder="Image URL" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} />
          <input placeholder="Sizes (S,M,L)" value={form.sizes} onChange={(e) => setForm({ ...form, sizes: e.target.value })} />
          <input placeholder="Colors (Do,Xanh)" value={form.colors} onChange={(e) => setForm({ ...form, colors: e.target.value })} />
          <input placeholder="Ton kho" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
          <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
            <option value="">-- Chon danh muc --</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="form-actions">
          <button className="btn-primary" onClick={saveProduct} disabled={saving}>
            {saving ? 'Dang luu...' : editingId ? 'Cap nhat san pham' : 'Them san pham'}
          </button>
          {editingId ? <button className="btn-ghost" onClick={() => { setEditingId(null); setForm(initial); }}>Huy sua</button> : null}
        </div>
      </section>

      {loading ? <p className="page-card">Dang tai du lieu...</p> : null}
      {error ? <p className="error">{error}</p> : null}

      <div className="table-toolbar">
        <input
          className="search-input"
          placeholder="Tim theo ten san pham hoac danh muc"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {!loading && !filteredProducts.length ? <p className="page-card">Chua co san pham nao</p> : null}

      {!!filteredProducts.length && (
        <div className="page-card table-wrap">
          <table className="products-table">
            <thead>
              <tr><th>Ten</th><th>Gia</th><th>Ton kho</th><th>Danh muc</th><th>Hanh dong</th></tr>
            </thead>
            <tbody>
              {filteredProducts.map((p) => (
                <tr key={p._id}>
                  <td className="product-name-cell">{p.name}</td>
                  <td className="price-cell">{Number(p.price).toLocaleString()} d</td>
                  <td>
                    <div className="stock-cell">
                      <strong>{p.stock}</strong>
                      <span className={getStockBadgeClass(Number(p.stock))}>{getStockLabel(Number(p.stock))}</span>
                    </div>
                  </td>
                  <td>{p.categoryId?.name}</td>
                  <td>
                    <div className="row-actions">
                      <button className="btn-edit" onClick={() => startEdit(p)}>Sua</button>
                      <button className="btn-delete" onClick={() => removeProduct(p._id)}>Xoa</button>
                    </div>
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
