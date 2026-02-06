import { useState, useEffect, FormEvent } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Coffee,
  Search,
  Package,
  DollarSign,
  TrendingUp,
  Award,
  Layers
} from "lucide-react";
import api from "../api/axios";
import { Product } from "../types";

// เพิ่ม Interface สำหรับ Stats
interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  popularMenu: string;
}

const CATEGORIES = ["Hot Coffee", "Iced Coffee", "Blended", "Tea", "Bakery", "Other"];

const emptyForm = {
  name: "",
  base_price: "",
  stock: "100", // เพิ่มค่า Default Stock
  image_url: "",
  category: CATEGORIES[0],
};

export default function AdminDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState<DashboardStats>({ totalRevenue: 0, totalOrders: 0, popularMenu: "-" });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // ฟังก์ชันดึงข้อมูลสินค้า
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/products", {
        params: { includeInactive: "true" },
      });
      setProducts(res.data.products);
    } catch {
      console.error("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  // ฟังก์ชันดึงข้อมูล Stats (ยอดขาย)
  const fetchStats = async () => {
    try {
      const res = await api.get("/api/stats");
      setStats(res.data);
    } catch {
      console.warn("Stats API not ready yet (Skipping)");
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchStats(); // เรียกดึง stats
  }, []);

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setModalOpen(true);
  };

  const openEdit = (product: Product) => {
    setEditingId(product.id);
    setForm({
      name: product.name,
      base_price: String(product.base_price),
      stock: product.hasOwnProperty('stock') ? String((product as any).stock ?? 100) : "100", // กรณีไม่มี stock ใน type Product
      image_url: product.image_url || "",
      category: product.category,
    });
    setError("");
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
    setForm(emptyForm);
    setError("");
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.name.trim() || !form.base_price || !form.category) {
      setError("Name, price, and category are required.");
      return;
    }

    const price = parseFloat(form.base_price);
    const stock = parseInt(form.stock);

    if (isNaN(price) || price < 0) {
      setError("Price must be a valid positive number.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        base_price: price,
        stock: isNaN(stock) ? 0 : stock, // ส่งค่า Stock ไปด้วย
        image_url: form.image_url.trim() || null,
        category: form.category,
      };

      if (editingId) {
        await api.put(`/api/products/${editingId}`, payload);
      } else {
        await api.post("/api/products", payload);
      }

      closeModal();
      fetchProducts();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to save product.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`Deactivate "${name}"?`)) return;
    try {
      await api.delete(`/api/products/${id}`);
      fetchProducts();
    } catch {
      alert("Failed to delete product.");
    }
  };

  const handleReactivate = async (id: number) => {
    try {
      await api.put(`/api/products/${id}`, { is_active: true });
      fetchProducts();
    } catch {
      alert("Failed to reactivate product.");
    }
  };

  const filtered = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchCategory = !filterCategory || p.category === filterCategory;
    return matchSearch && matchCategory;
  });

  const uniqueCategories = [...new Set(products.map((p) => p.category))];

  return (
    <div className="space-y-8 font-sans">
      {/* --- Stat Cards (Premium Section) --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-stone-800 to-stone-900 rounded-2xl p-6 text-white shadow-xl flex items-center justify-between">
            <div>
                <p className="text-stone-400 text-sm font-medium mb-1">Total Revenue</p>
                <h3 className="text-3xl font-bold font-serif">฿{stats.totalRevenue.toLocaleString()}</h3>
            </div>
            <div className="bg-stone-700/50 p-3 rounded-xl">
                <DollarSign className="w-8 h-8 text-amber-400" />
            </div>
        </div>
        
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-stone-100 flex items-center justify-between">
            <div>
                <p className="text-stone-500 text-sm font-medium mb-1">Total Orders</p>
                <h3 className="text-3xl font-bold text-stone-800 font-serif">{stats.totalOrders}</h3>
            </div>
            <div className="bg-orange-50 p-3 rounded-xl">
                <TrendingUp className="w-8 h-8 text-orange-600" />
            </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg border border-stone-100 flex items-center justify-between">
            <div>
                <p className="text-stone-500 text-sm font-medium mb-1">Best Seller</p>
                <h3 className="text-xl font-bold text-stone-800 font-serif truncate max-w-[150px]" title={stats.popularMenu}>
                    {stats.popularMenu}
                </h3>
            </div>
            <div className="bg-yellow-50 p-3 rounded-xl">
                <Award className="w-8 h-8 text-yellow-600" />
            </div>
        </div>
      </div>

      {/* --- Header --- */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-stone-900 flex items-center gap-3 font-serif">
            <Package className="w-8 h-8 text-stone-700" />
            Menu Management
          </h2>
          <p className="text-stone-500 text-sm mt-1">
            Manage your coffee inventory and pricing.
          </p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-stone-900 hover:bg-stone-800 text-amber-50 px-6 py-3 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg"
        >
          <Plus className="w-5 h-5" />
          Add New Menu
        </button>
      </div>

      {/* --- Filters --- */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-xl shadow-sm border border-stone-100">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-500 bg-stone-50/30"
          />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-4 py-2.5 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-500 bg-white min-w-[180px]"
        >
          <option value="">All Categories</option>
          {uniqueCategories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* --- Table --- */}
      {loading ? (
        <div className="text-center py-16 text-stone-500 animate-pulse">Loading premium products...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-stone-100">
          <Coffee className="w-16 h-16 text-stone-200 mx-auto mb-4" />
          <p className="text-stone-500 text-lg">No products found in the catalog.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-lg border border-stone-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-200">
                  <th className="px-6 py-4 text-xs font-bold text-stone-600 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-4 text-xs font-bold text-stone-600 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-4 text-xs font-bold text-stone-600 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-4 text-xs font-bold text-stone-600 uppercase tracking-wider">Stock</th>
                  <th className="px-6 py-4 text-xs font-bold text-stone-600 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-stone-600 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filtered.map((product) => (
                  <tr
                    key={product.id}
                    className={`hover:bg-stone-50/50 transition-colors ${
                      !product.is_active ? "opacity-60 bg-stone-50" : ""
                    }`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        {product.image_url ? (
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-12 h-12 rounded-lg object-cover shadow-sm border border-stone-100"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-stone-100 flex items-center justify-center border border-stone-200">
                            <Coffee className="w-6 h-6 text-stone-400" />
                          </div>
                        )}
                        <div>
                            <span className="font-bold text-stone-800 block text-base">{product.name}</span>
                            <span className="text-xs text-stone-400 font-mono">#{product.id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs bg-orange-100 text-orange-800 px-3 py-1 rounded-full font-semibold border border-orange-200">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-stone-800 font-mono">
                      ฿{Number(product.base_price).toFixed(0)}
                    </td>
                    <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                            <Layers className="w-4 h-4 text-stone-400" />
                            <span className={`text-sm font-medium ${
                                ((product as any).stock ?? 0) < 10 ? 'text-red-600' : 'text-stone-600'
                            }`}>
                                {(product as any).stock ?? 0}
                            </span>
                        </div>
                    </td>
                    <td className="px-6 py-4">
                      {product.is_active ? (
                        <span className="flex items-center gap-1.5 text-xs text-emerald-700 font-bold bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 w-fit">
                          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                          Active
                        </span>
                      ) : (
                        <button
                          onClick={() => handleReactivate(product.id)}
                          className="text-xs bg-stone-200 text-stone-600 px-3 py-1 rounded-full font-bold hover:bg-stone-300 transition-colors"
                        >
                          Inactive
                        </button>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(product)}
                          className="p-2 text-stone-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id, product.name)}
                          className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- Modal --- */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-stone-900/30">
          <div
            className="absolute inset-0"
            onClick={closeModal}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 p-8 border border-stone-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-stone-900 font-serif">
                {editingId ? "Edit Product" : "Add New Menu"}
              </h3>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-stone-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-stone-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 font-medium">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-bold text-stone-700 mb-2">
                      Product Name
                    </label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 bg-stone-50"
                      placeholder="e.g. Signature Espresso"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-stone-700 mb-2">
                      Category
                    </label>
                    <select
                      value={form.category}
                      onChange={(e) =>
                        setForm({ ...form, category: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-stone-700 mb-2">
                      Stock
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={form.stock}
                      onChange={(e) => setForm({ ...form, stock: e.target.value })}
                      className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 bg-stone-50"
                      placeholder="100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-stone-700 mb-2">
                      Price (฿)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={form.base_price}
                      onChange={(e) =>
                        setForm({ ...form, base_price: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 bg-stone-50"
                      placeholder="0.00"
                    />
                  </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-stone-700 mb-2">
                  Image URL
                </label>
                <input
                  type="text"
                  value={form.image_url}
                  onChange={(e) =>
                    setForm({ ...form, image_url: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 bg-stone-50"
                  placeholder="https://..."
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 py-3 border border-stone-300 text-stone-700 rounded-xl font-bold hover:bg-stone-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-3 bg-stone-900 hover:bg-stone-800 disabled:bg-stone-400 text-amber-50 rounded-xl font-bold transition-all shadow-md"
                >
                  {saving ? "Saving..." : "Save Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}