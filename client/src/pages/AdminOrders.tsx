import { useState, useEffect, useCallback } from "react";
import {
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  Coffee,
  User,
  ChefHat,
} from "lucide-react";
import api from "../api/axios";

interface OrderItem {
  id: number;
  product_id: number;
  quantity: number;
  sub_total: number;
  options_json: { name: string; price: number; group: string }[] | null;
  product_name: string;
  product_image: string | null;
}

interface Order {
  id: number;
  user_id: number | null;
  username: string | null;
  display_name: string;
  status: "pending" | "approved" | "completed" | "cancelled";
  total_price: number;
  created_at: string;
  items: OrderItem[];
}

type StatusFilter = "all" | "pending" | "approved" | "completed" | "cancelled";

const statusConfig: Record<Order["status"], { label: string; color: string; cardBorder: string; icon: typeof Clock }> = {
  pending: {
    label: "Pending",
    color: "bg-yellow-100 text-yellow-700 border-yellow-200",
    cardBorder: "border-l-yellow-400",
    icon: Clock,
  },
  approved: {
    label: "Approved",
    color: "bg-green-100 text-green-700 border-green-200",
    cardBorder: "border-l-green-400",
    icon: CheckCircle,
  },
  completed: {
    label: "Completed",
    color: "bg-emerald-100 text-emerald-700 border-emerald-200",
    cardBorder: "border-l-emerald-400",
    icon: CheckCircle,
  },
  cancelled: {
    label: "Cancelled",
    color: "bg-red-100 text-red-600 border-red-200",
    cardBorder: "border-l-red-400",
    icon: XCircle,
  },
};

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const fetchOrders = useCallback(async () => {
    try {
      const res = await api.get("/api/orders");
      setOrders(res.data.orders);
      setLastRefresh(new Date());
    } catch {
      console.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Auto-refresh every 10 seconds
  useEffect(() => {
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const updateStatus = async (orderId: number, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      await api.put(`/api/orders/${orderId}/status`, { status: newStatus });
      fetchOrders();
    } catch {
      alert("Failed to update order status.");
    } finally {
      setUpdatingId(null);
    }
  };

  const parseOptions = (optionsJson: any): { name: string; price: number; group: string }[] => {
    if (!optionsJson) return [];
    if (typeof optionsJson === "string") {
      try { return JSON.parse(optionsJson); } catch { return []; }
    }
    return Array.isArray(optionsJson) ? optionsJson : [];
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { day: "numeric", month: "short" });
  };

  const filtered = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  const counts = {
    all: orders.length,
    pending: orders.filter((o) => o.status === "pending").length,
    approved: orders.filter((o) => o.status === "approved").length,
    cancelled: orders.filter((o) => o.status === "cancelled").length,
  };

  const filterTabs: { key: StatusFilter; label: string; count: number }[] = [
    { key: "all", label: "All", count: counts.all },
    { key: "pending", label: "Pending", count: counts.pending },
    { key: "approved", label: "Approved", count: counts.approved },
    { key: "cancelled", label: "Cancelled", count: counts.cancelled },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-amber-900 flex items-center gap-2">
            <ChefHat className="w-6 h-6" />
            Kitchen Orders
          </h2>
          <p className="text-amber-600 text-sm mt-1">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </p>
        </div>
        <button
          onClick={fetchOrders}
          className="flex items-center gap-2 bg-amber-100 hover:bg-amber-200 text-amber-900 px-4 py-2.5 rounded-lg font-medium transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {filterTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-semibold transition-all ${filter === tab.key
              ? "bg-amber-900 text-white shadow-md"
              : "bg-white text-amber-800 border border-amber-200 hover:bg-amber-100"
              }`}
          >
            {tab.label}
            <span
              className={`ml-1.5 inline-flex items-center justify-center w-5 h-5 rounded-full text-xs ${filter === tab.key ? "bg-amber-700 text-amber-100" : "bg-amber-100 text-amber-700"
                }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="text-center py-16 text-amber-600">Loading orders...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <Coffee className="w-12 h-12 text-amber-200 mx-auto mb-3" />
          <p className="text-amber-500">No orders found.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((order) => {
            const cfg = statusConfig[order.status];
            const StatusIcon = cfg.icon;
            const isUpdating = updatingId === order.id;

            return (
              <div
                key={order.id}
                className={`bg-white rounded-2xl shadow-sm border-l-4 ${cfg.cardBorder} overflow-hidden`}
              >
                {/* Card Header */}
                <div className="px-4 py-3 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-amber-900">#{order.id}</span>
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${cfg.color}`}
                      >
                        <StatusIcon className="w-3 h-3" />
                        {cfg.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-1 text-xs text-amber-500">
                      <User className="w-3 h-3" />
                      {order.username}
                      <span className="mx-1">·</span>
                      {formatDate(order.created_at)} {formatTime(order.created_at)}
                    </div>
                  </div>
                  <span className="text-lg font-bold text-amber-900">
                    ฿{Number(order.total_price).toFixed(0)}
                  </span>
                </div>

                {/* Items */}
                <div className="px-4 py-2 border-t border-amber-50 space-y-2">
                  {order.items.map((item) => {
                    const options = parseOptions(item.options_json);
                    return (
                      <div key={item.id} className="flex justify-between items-start">
                        <div>
                          <span className="text-sm text-amber-900 font-medium">
                            {item.product_name} ×{item.quantity}
                          </span>
                          {options.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-0.5">
                              {options.map((opt, i) => (
                                <span
                                  key={i}
                                  className="text-[10px] bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded-full"
                                >
                                  {opt.group === "Sweetness" ? `Sweet ${opt.name}` : opt.name}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <span className="text-xs text-amber-600 font-medium">
                          ฿{Number(item.sub_total).toFixed(0)}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Action Buttons */}
                <div className="px-4 py-3 border-t border-amber-50 flex gap-2">
                  {order.status === "pending" && (
                    <>
                      <button
                        onClick={() => updateStatus(order.id, "approved")}
                        disabled={isUpdating}
                        className="flex-1 flex items-center justify-center gap-1.5 bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white text-sm font-semibold py-2 rounded-xl transition-colors"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Accept
                      </button>
                      <button
                        onClick={() => updateStatus(order.id, "cancelled")}
                        disabled={isUpdating}
                        className="flex-1 flex items-center justify-center gap-1.5 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white text-sm font-semibold py-2 rounded-xl transition-colors"
                      >
                        <XCircle className="w-4 h-4" />
                        Cancel
                      </button>
                    </>
                  )}
                  {order.status === "approved" && (
                    <div className="flex-1 flex items-center justify-center gap-1.5 text-green-600 text-sm font-semibold py-2">
                      <CheckCircle className="w-4 h-4" />
                      Order Approved
                    </div>
                  )}
                  {order.status === "cancelled" && (
                    <div className="flex-1 flex items-center justify-center gap-1.5 text-red-500 text-sm font-semibold py-2">
                      <XCircle className="w-4 h-4" />
                      Order Cancelled
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
