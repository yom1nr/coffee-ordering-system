import { BrowserRouter, Routes, Route, Navigate, Link } from "react-router-dom";
import ErrorBoundary from "./components/ErrorBoundary";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { CartProvider, useCart } from "./context/CartContext";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AdminDashboard from "./pages/AdminDashboard";
import Menu from "./pages/Menu";
import Cart from "./pages/Cart";
import OrderHistory from "./pages/OrderHistory";
import AdminOrdersLayout from "./pages/AdminOrdersLayout";
import NotFound from "./pages/NotFound";
import {
  LogOut,
  LayoutDashboard,
  Home,
  Coffee,
  ClipboardList,
  ChefHat,
  ShoppingCart,
  History
} from "lucide-react";

function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="bg-amber-900 text-amber-50 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between shadow-md sticky top-0 z-50">
      <Link to="/" className="text-lg sm:text-xl font-bold flex items-center gap-2 hover:text-amber-200 transition">
        <Coffee className="w-5 h-5 sm:w-6 sm:h-6" />
        <span className="hidden sm:inline">Coffee Shop</span>
        <span className="sm:hidden">Coffee</span>
      </Link>

      <div className="flex items-center gap-2 sm:gap-4">
        {user ? (
          <>
            <Link
              to="/cart"
              className="hidden sm:flex items-center gap-1.5 text-sm bg-amber-800 hover:bg-amber-700 px-3 py-1.5 rounded-lg transition-colors"
            >
              <ShoppingCart className="w-4 h-4" />
              <span className="hidden sm:inline">Cart</span>
            </Link>

            <Link
              to="/orders"
              className="hidden sm:flex items-center gap-1.5 text-sm bg-amber-800 hover:bg-amber-700 px-3 py-1.5 rounded-lg transition-colors"
            >
              <ClipboardList className="w-4 h-4" />
              <span className="hidden sm:inline">Orders</span>
            </Link>

            {user.role === "admin" && (
              <Link
                to="/admin"
                className="flex items-center gap-1.5 text-sm bg-orange-700 hover:bg-orange-600 px-3 py-1.5 rounded-lg transition-colors"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span className="hidden sm:inline">Admin</span>
              </Link>
            )}

            <div className="hidden md:flex items-center gap-2">
              <span className="text-sm">Hello, <strong>{user.username}</strong></span>
            </div>

            <button
              onClick={logout}
              className="hidden sm:flex items-center gap-1.5 text-sm bg-red-800 hover:bg-red-700 px-3 py-1.5 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </>
        ) : (
          <>
            <Link
              to="/login"
              className="text-sm font-medium hover:text-amber-200 transition-colors"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="text-sm bg-white text-amber-900 hover:bg-amber-50 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full font-bold transition-colors shadow-sm"
            >
              Register
            </Link>
          </>
        )}
      </div>
    </header>
  );
}

function BottomNav() {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();

  if (!user) return null;

  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-amber-200 z-50 shadow-[0_-2px_10px_rgba(0,0,0,0.08)]">
      <div className="grid grid-cols-4 h-16">
        <Link
          to="/"
          className="flex flex-col items-center justify-center gap-0.5 text-amber-700 hover:text-amber-900 transition-colors"
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-medium">Home</span>
        </Link>

        <Link
          to="/cart"
          className="flex flex-col items-center justify-center gap-0.5 text-amber-700 hover:text-amber-900 transition-colors relative"
        >
          <div className="relative">
            <ShoppingCart className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-2.5 bg-red-500 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                {cartCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-medium">Cart</span>
        </Link>

        <Link
          to="/orders"
          className="flex flex-col items-center justify-center gap-0.5 text-amber-700 hover:text-amber-900 transition-colors"
        >
          <History className="w-5 h-5" />
          <span className="text-[10px] font-medium">Orders</span>
        </Link>

        <button
          onClick={logout}
          className="flex flex-col items-center justify-center gap-0.5 text-amber-700 hover:text-red-600 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-[10px] font-medium">Logout</span>
        </button>
      </div>
    </nav>
  );
}

function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-amber-50 pb-20 sm:pb-6">
      <Navbar />
      <main className="max-w-7xl mx-auto p-4 md:p-6">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function GuestRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return !isAuthenticated ? <>{children}</> : <Navigate to="/" replace />;
}

function AdminLayout() {
  const { user, logout } = useAuth();

  if (user?.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-amber-50">
      <header className="bg-amber-900 text-amber-50 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between shadow-md">
        <h1 className="text-lg sm:text-xl font-bold flex items-center gap-2">
          <Coffee className="w-5 h-5 sm:w-6 sm:h-6" /> Admin Panel
        </h1>
        <div className="flex items-center gap-2 sm:gap-4">
          <Link to="/" className="flex items-center gap-1.5 text-sm bg-amber-800 hover:bg-amber-700 px-2.5 sm:px-3 py-1.5 rounded-lg transition-colors">
            <Home className="w-4 h-4" />
            <span className="hidden sm:inline">Home</span>
          </Link>
          <Link to="/admin/orders" className="flex items-center gap-1.5 text-sm bg-amber-800 hover:bg-amber-700 px-2.5 sm:px-3 py-1.5 rounded-lg transition-colors">
            <ChefHat className="w-4 h-4" />
            <span className="hidden sm:inline">Orders</span>
          </Link>
          <button onClick={logout} className="flex items-center gap-1.5 text-sm bg-red-800 hover:bg-red-700 px-2.5 sm:px-3 py-1.5 rounded-lg transition-colors">
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>
      <main className="p-4 sm:p-6 max-w-7xl mx-auto">
        <AdminDashboard />
      </main>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
            <Routes>
              <Route path="/" element={<MainLayout><Menu /></MainLayout>} />
              <Route path="/cart" element={<ProtectedRoute><MainLayout><Cart /></MainLayout></ProtectedRoute>} />
              <Route path="/orders" element={<ProtectedRoute><MainLayout><OrderHistory /></MainLayout></ProtectedRoute>} />
              <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>} />
              <Route path="/admin/orders" element={<ProtectedRoute><AdminOrdersLayout /></ProtectedRoute>} />
              <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
              <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />
              <Route path="*" element={<MainLayout><NotFound /></MainLayout>} />
            </Routes>
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
