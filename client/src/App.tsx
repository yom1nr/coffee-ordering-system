import { BrowserRouter, Routes, Route, Navigate, Link } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AdminDashboard from "./pages/AdminDashboard";
import Menu from "./pages/Menu";
import Cart from "./pages/Cart";
import OrderHistory from "./pages/OrderHistory";
import AdminOrdersLayout from "./pages/AdminOrdersLayout";
import { LogOut, LayoutDashboard, Home, Coffee, ClipboardList, ChefHat } from "lucide-react";
  
function HomePage() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-amber-50">
      <header className="bg-amber-900 text-amber-50 px-6 py-4 flex items-center justify-between shadow-md">
        <h1 className="text-xl font-bold">☕ Coffee Shop</h1>
        <div className="flex items-center gap-4">
          <Link
            to="/orders"
            className="flex items-center gap-1.5 text-sm bg-amber-800 hover:bg-amber-700 px-3 py-1.5 rounded-lg transition-colors"
          >
            <ClipboardList className="w-4 h-4" />
            My Orders
          </Link>
          {user?.role === "admin" && (
            <Link
              to="/admin"
              className="flex items-center gap-1.5 text-sm bg-amber-800 hover:bg-amber-700 px-3 py-1.5 rounded-lg transition-colors"
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </Link>
          )}
          <span className="text-sm">
            Hello, <strong>{user?.username}</strong>{" "}
            <span className="bg-amber-700 text-xs px-2 py-0.5 rounded-full ml-1">
              {user?.role}
            </span>
          </span>
          <button
            onClick={logout}
            className="flex items-center gap-1.5 text-sm bg-amber-800 hover:bg-amber-700 px-3 py-1.5 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </header>
      <main className="flex items-center justify-center" style={{ minHeight: "calc(100vh - 64px)" }}>
        <div className="text-center">
          <h2 className="text-4xl font-bold text-amber-900 mb-4">
            Welcome, {user?.username}!
          </h2>
          <p className="text-amber-700 text-lg mb-8">
            Start ordering your favorite coffee.
          </p>
          <Link
            to="/menu"
            className="inline-flex items-center gap-2 bg-amber-900 hover:bg-amber-800 text-white px-8 py-3.5 rounded-xl font-bold text-lg transition-colors shadow-lg"
          >
            <Coffee className="w-6 h-6" />
            Browse Menu
          </Link>
        </div>
      </main>
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
      <header className="bg-amber-900 text-amber-50 px-6 py-4 flex items-center justify-between shadow-md">
        <h1 className="text-xl font-bold">☕ Coffee Shop Admin</h1>
        <div className="flex items-center gap-4">
          <Link
            to="/"
            className="flex items-center gap-1.5 text-sm bg-amber-800 hover:bg-amber-700 px-3 py-1.5 rounded-lg transition-colors"
          >
            <Home className="w-4 h-4" />
            Home
          </Link>
          <Link
            to="/admin/orders"
            className="flex items-center gap-1.5 text-sm bg-amber-800 hover:bg-amber-700 px-3 py-1.5 rounded-lg transition-colors"
          >
            <ChefHat className="w-4 h-4" />
            Orders
          </Link>
          <span className="text-sm">
            <strong>{user?.username}</strong>
          </span>
          <button
            onClick={logout}
            className="flex items-center gap-1.5 text-sm bg-amber-800 hover:bg-amber-700 px-3 py-1.5 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </header>
      <main className="p-6 max-w-7xl mx-auto">
        <AdminDashboard />
      </main>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Routes>
            <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
            <Route path="/menu" element={<ProtectedRoute><Menu /></ProtectedRoute>} />
            <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
            <Route path="/orders" element={<ProtectedRoute><OrderHistory /></ProtectedRoute>} />
            <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
            <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />
            <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>} />
            <Route path="/admin/orders" element={<ProtectedRoute><AdminOrdersLayout /></ProtectedRoute>} />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
