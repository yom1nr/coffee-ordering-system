import { useState, useEffect } from "react";
import { Coffee, Search } from "lucide-react";
import api from "../api/axios";
import { Product } from "../types";
import ProductModal from "../components/ProductModal";

export default function Menu() {
  const [products, setProducts] = useState<Product[]>([]);

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get("/api/products");
        setProducts(res.data.products.filter((p: Product) => p.is_active));
      } catch {
        console.error("Failed to fetch products");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const categories = ["All", ...new Set(products.map((p) => p.category))];

  const filtered = products.filter((p) => {
    const matchCategory = activeCategory === "All" || p.category === activeCategory;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-400" />
          <input
            type="text"
            placeholder="Search menu..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-amber-200 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 text-amber-900 placeholder-amber-300"
          />
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`whitespace-nowrap px-4 sm:px-5 py-2 rounded-full text-sm font-semibold transition-all ${activeCategory === cat
                ? "bg-amber-900 text-white shadow-md"
                : "bg-white text-amber-800 border border-amber-200 hover:bg-amber-100"
                }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="text-center py-20 text-amber-600">Loading menu...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <Coffee className="w-16 h-16 text-amber-200 mx-auto mb-4" />
            <p className="text-amber-500 text-lg">No items found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {filtered.map((product) => (
              <button
                key={product.id}
                onClick={() => setSelectedProduct(product)}
                className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden text-left group"
              >
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-32 sm:h-36 md:h-44 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-32 sm:h-36 md:h-44 bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center group-hover:from-amber-200 group-hover:to-amber-300 transition-colors">
                    <Coffee className="w-10 h-10 sm:w-12 sm:h-12 text-amber-400" />
                  </div>
                )}
                <div className="p-2.5 sm:p-3">
                  <h3 className="font-semibold text-amber-900 text-xs sm:text-sm leading-tight line-clamp-2">
                    {product.name}
                  </h3>
                  <div className="flex items-center justify-between mt-1.5 sm:mt-2">
                    <span className="text-[10px] sm:text-xs text-amber-500">{product.category}</span>
                    <span className="font-bold text-amber-900 text-sm sm:text-base">
                      ฿{Number(product.base_price).toFixed(0)}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Product Modal */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
}
