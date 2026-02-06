import { Link, useNavigate } from 'react-router-dom';
import { LogOut, ChefHat, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AdminOrders from './AdminOrders'; // เรียกใช้ตารางออเดอร์ที่เรามีอยู่แล้ว

const AdminOrdersLayout = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* --- Kitchen Header (หัวข้อสำหรับจอครัว) --- */}
      <header className="bg-white shadow-sm px-6 py-4 flex justify-between items-center z-10 border-b border-gray-200">
        <div className="flex items-center gap-3">
            <div className="bg-orange-100 p-2 rounded-lg">
                <ChefHat className="w-8 h-8 text-orange-600" />
            </div>
            <div>
                <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Kitchen Monitor</h1>
                <p className="text-xs text-gray-500 font-medium">Real-time Order Management</p>
            </div>
        </div>
        
        <div className="flex items-center gap-3">
            <Link 
                to="/admin" 
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition border border-gray-200"
            >
                <LayoutDashboard className="w-5 h-5" />
                <span className="font-medium">Back to Dashboard</span>
            </Link>
            
            <button 
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-white bg-red-500 hover:bg-red-600 rounded-lg transition shadow-sm"
            >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Logout</span>
            </button>
        </div>
      </header>

      {/* --- Main Content (พื้นที่แสดงออเดอร์) --- */}
      <main className="flex-1 overflow-hidden relative p-4">
        <div className="h-full w-full">
            {/* เรียกใช้ Component AdminOrders ที่นี่ */}
            <AdminOrders />
        </div>
      </main>
    </div>
  );
};

export default AdminOrdersLayout;