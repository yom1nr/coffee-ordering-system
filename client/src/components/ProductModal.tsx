import { useState, useMemo } from "react";
import { X, Plus, Minus, Coffee, ShoppingCart } from "lucide-react";
import { Product, ProductOption } from "../types";
import { useCart } from "../context/CartContext";

const SWEETNESS_OPTIONS: ProductOption[] = [
  { name: "0%", price: 0, group: "Sweetness" },
  { name: "25%", price: 0, group: "Sweetness" },
  { name: "50%", price: 0, group: "Sweetness" },
  { name: "100%", price: 0, group: "Sweetness" },
];

const EXTRA_OPTIONS: ProductOption[] = [
  { name: "Extra Shot", price: 15, group: "Topping" },
  { name: "Bubble", price: 5, group: "Topping" },
  { name: "Whip Cream", price: 10, group: "Topping" },
  { name: "Oat Milk", price: 15, group: "Topping" },
];

interface Props {
  product: Product;
  onClose: () => void;
}

export default function ProductModal({ product, onClose }: Props) {
  const { addToCart } = useCart();
  const [sweetness, setSweetness] = useState<ProductOption>(SWEETNESS_OPTIONS[3]);
  const [extras, setExtras] = useState<ProductOption[]>([]);
  const [quantity, setQuantity] = useState(1);

  const toggleExtra = (option: ProductOption) => {
    setExtras((prev) =>
      prev.find((e) => e.name === option.name)
        ? prev.filter((e) => e.name !== option.name)
        : [...prev, option]
    );
  };

  const allOptions = useMemo(() => [sweetness, ...extras], [sweetness, extras]);

  const optionsPrice = useMemo(
    () => allOptions.reduce((sum, o) => sum + o.price, 0),
    [allOptions]
  );

  const unitPrice = Number(product.base_price) + optionsPrice;
  const totalPrice = unitPrice * quantity;

  const handleAdd = () => {
    addToCart(product, allOptions, quantity);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white w-full max-w-md mx-auto rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Image */}
        <div className="relative">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-56 object-cover rounded-t-3xl sm:rounded-t-2xl"
            />
          ) : (
            <div className="w-full h-56 bg-gradient-to-br from-amber-100 to-amber-200 rounded-t-3xl sm:rounded-t-2xl flex items-center justify-center">
              <Coffee className="w-20 h-20 text-amber-400" />
            </div>
          )}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg hover:bg-white transition-colors"
          >
            <X className="w-5 h-5 text-amber-900" />
          </button>
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/40 to-transparent h-20" />
        </div>

        <div className="p-5 space-y-5">
          {/* Name & Price */}
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-xl font-bold text-amber-900">{product.name}</h3>
              <span className="text-xs bg-amber-100 text-amber-700 px-2.5 py-0.5 rounded-full font-medium">
                {product.category}
              </span>
            </div>
            <span className="text-xl font-bold text-amber-900">
              ฿{Number(product.base_price).toFixed(0)}
            </span>
          </div>

          {/* Sweetness */}
          <div>
            <h4 className="text-sm font-semibold text-amber-900 mb-2">Sweetness Level</h4>
            <div className="grid grid-cols-4 gap-2">
              {SWEETNESS_OPTIONS.map((opt) => (
                <button
                  key={opt.name}
                  onClick={() => setSweetness(opt)}
                  className={`py-2 rounded-xl text-sm font-medium transition-all ${
                    sweetness.name === opt.name
                      ? "bg-amber-900 text-white shadow-md"
                      : "bg-amber-50 text-amber-800 hover:bg-amber-100"
                  }`}
                >
                  {opt.name}
                </button>
              ))}
            </div>
          </div>

          {/* Extra Options */}
          <div>
            <h4 className="text-sm font-semibold text-amber-900 mb-2">Extra Options</h4>
            <div className="space-y-2">
              {EXTRA_OPTIONS.map((opt) => {
                const selected = extras.some((e) => e.name === opt.name);
                return (
                  <button
                    key={opt.name}
                    onClick={() => toggleExtra(opt)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
                      selected
                        ? "bg-amber-900 text-white shadow-md"
                        : "bg-amber-50 text-amber-800 hover:bg-amber-100"
                    }`}
                  >
                    <span className="font-medium text-sm">{opt.name}</span>
                    <span className={`text-sm ${selected ? "text-amber-200" : "text-amber-500"}`}>
                      +฿{opt.price}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quantity */}
          <div>
            <h4 className="text-sm font-semibold text-amber-900 mb-2">Quantity</h4>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-10 h-10 flex items-center justify-center bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-xl transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="text-xl font-bold text-amber-900 w-8 text-center">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="w-10 h-10 flex items-center justify-center bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-xl transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Add to Cart */}
          <button
            onClick={handleAdd}
            className="w-full flex items-center justify-center gap-2 bg-amber-900 hover:bg-amber-800 text-white font-bold py-3.5 rounded-xl text-lg transition-colors shadow-lg"
          >
            <ShoppingCart className="w-5 h-5" />
            Add to Cart — ฿{totalPrice.toFixed(0)}
          </button>
        </div>
      </div>
    </div>
  );
}
