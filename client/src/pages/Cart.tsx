import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Minus,
  Plus,
  Trash2,
  ShoppingCart,
  Coffee,
  CreditCard,
  User,
  Utensils
} from "lucide-react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

export default function Cart() {
  const navigate = useNavigate();
  const { cartItems, removeFromCart, updateQuantity, clearCart, checkout, cartTotal, cartCount } = useCart();
  const { user } = useAuth(); // เช็คว่าล็อกอินไหม

  const [checkingOut, setCheckingOut] = useState(false);
  const [error, setError] = useState("");
  const [guestName, setGuestName] = useState(""); // เก็บชื่อ Guest

  const handleCheckout = async () => {
    if (cartItems.length === 0) return;

    // ถ้าเป็น Guest แล้วไม่กรอกชื่อ ให้เตือน
    if (!user && !guestName.trim()) {
      setError("Please enter your name or table number.");
      return;
    }

    setCheckingOut(true);
    setError("");
    try {
      // ส่งชื่อ guestName ไปด้วย (ถ้าล็อกอินแล้วมันจะส่ง token ไปแทน)
      await checkout(guestName);
      
      if (user) {
        navigate("/orders");
      } else {
        alert("Order sent to kitchen! Please wait for your name to be called.");
        navigate("/menu");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Checkout failed. Please try again.");
    } finally {
      setCheckingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-orange-50 font-sans">
      {/* Header */}
      <header className="bg-stone-900 text-amber-50 px-4 sm:px-6 py-4 sticky top-0 z-30 shadow-xl">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/menu"
              className="p-2 hover:bg-stone-800 rounded-xl transition-colors text-amber-500"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-xl font-bold font-serif tracking-wide">Your Cart</h1>
          </div>
          {cartItems.length > 0 && (
            <button
              onClick={clearCart}
              className="text-sm text-stone-400 hover:text-red-400 transition-colors font-medium"
            >
              Clear All
            </button>
          )}
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        {cartItems.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-stone-100">
            <ShoppingCart className="w-20 h-20 text-stone-200 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-stone-800 mb-3 font-serif">
              Your cart is empty
            </h2>
            <p className="text-stone-500 mb-8 max-w-xs mx-auto">
              Looks like you haven't added any coffee yet.
            </p>
            <Link
              to="/menu"
              className="inline-flex items-center gap-2 bg-stone-900 hover:bg-stone-800 text-amber-50 px-8 py-4 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <Coffee className="w-5 h-5" />
              Start Ordering
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Cart Items */}
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item.cartId}
                  className="bg-white rounded-2xl shadow-sm border border-stone-100 p-4 flex gap-4 transition-transform hover:scale-[1.01]"
                >
                  {/* Image */}
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-24 h-24 rounded-xl object-cover flex-shrink-0 shadow-sm"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-xl bg-stone-100 flex items-center justify-center flex-shrink-0 border border-stone-200">
                      <Coffee className="w-8 h-8 text-stone-300" />
                    </div>
                  )}

                  {/* Details */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                        <div className="flex items-start justify-between gap-2">
                        <h3 className="font-bold text-stone-800 text-lg leading-tight font-serif">
                            {item.name}
                        </h3>
                        <button
                            onClick={() => removeFromCart(item.cartId)}
                            className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                        </div>

                        {/* Options */}
                        <div className="flex flex-wrap gap-1.5 mt-2">
                        {item.selectedOptions.map((opt, i) => (
                            <span
                            key={i}
                            className="text-[10px] uppercase font-bold tracking-wide bg-stone-100 text-stone-600 px-2 py-1 rounded-md"
                            >
                            {opt.group === "Sweetness"
                                ? `Sweet ${opt.name}`
                                : opt.name}
                            </span>
                        ))}
                        </div>
                    </div>

                    {/* Quantity & Price */}
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-3 bg-stone-50 rounded-lg p-1 border border-stone-100">
                        <button
                          onClick={() => updateQuantity(item.cartId, -1)}
                          className="w-7 h-7 flex items-center justify-center bg-white text-stone-600 rounded-md shadow-sm hover:bg-stone-100 transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-bold text-stone-800 w-4 text-center text-sm">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.cartId, 1)}
                          className="w-7 h-7 flex items-center justify-center bg-stone-900 text-white rounded-md shadow-sm hover:bg-stone-700 transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <span className="font-bold text-stone-900 text-lg font-serif">
                        ฿{item.totalPrice.toFixed(0)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary & Checkout Section */}
            <div className="bg-white rounded-3xl shadow-lg border border-stone-100 p-6 space-y-5">
              <h3 className="font-bold text-stone-800 font-serif text-xl flex items-center gap-2">
                  <Utensils className="w-5 h-5 text-amber-500" />
                  Order Summary
              </h3>
              
              <div className="space-y-3 text-sm border-b border-stone-100 pb-5">
                <div className="flex justify-between text-stone-600">
                  <span>Subtotal ({cartCount} items)</span>
                  <span className="font-medium">฿{cartTotal.toFixed(0)}</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>VAT (included)</span>
                  <span className="font-medium">฿0</span>
                </div>
                <div className="flex justify-between text-stone-900 font-bold text-xl pt-2">
                  <span>Total</span>
                  <span className="font-serif">฿{cartTotal.toFixed(0)}</span>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 font-medium animate-pulse">
                  ⚠️ {error}
                </div>
              )}

              {/* Guest Name Input (Show only if NOT logged in) */}
              {!user && (
                  <div className="space-y-2">
                      <label className="block text-sm font-bold text-stone-700 ml-1">
                          Who is this order for? <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                          <input 
                              type="text" 
                              value={guestName}
                              onChange={(e) => {
                                  setGuestName(e.target.value);
                                  if(error) setError("");
                              }}
                              placeholder="Your Name or Table No. (e.g. John / Table 5)"
                              className="w-full pl-11 pr-4 py-3.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all font-medium text-stone-800 placeholder-stone-400"
                          />
                      </div>
                  </div>
              )}

              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                disabled={checkingOut}
                className={`w-full flex items-center justify-center gap-2 font-bold py-4 rounded-xl text-lg transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${
                    checkingOut 
                        ? "bg-stone-300 cursor-not-allowed text-stone-500"
                        : "bg-gradient-to-r from-stone-900 to-stone-800 hover:from-black hover:to-stone-900 text-white"
                }`}
              >
                {checkingOut ? (
                  <span className="inline-block w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" />
                    {user ? `Checkout • ฿${cartTotal.toFixed(0)}` : `Place Order • ฿${cartTotal.toFixed(0)}`}
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}