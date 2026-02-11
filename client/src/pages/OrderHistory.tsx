import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Clock,
  CheckCircle,
  XCircle,
  Coffee,
  Package,
  Printer,
  Receipt
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
  user_id: number;
  status: "pending" | "approved" | "completed" | "cancelled";
  total_price: number;
  created_at: string;
  items: OrderItem[];
}

const statusConfig = {
  pending: {
    label: "Pending",
    color: "bg-yellow-100 text-yellow-700 border-yellow-200",
    icon: Clock,
  },
  approved: {
    label: "Approved",
    color: "bg-orange-100 text-orange-700 border-orange-200",
    icon: Coffee,
  },
  completed: {
    label: "Completed",
    color: "bg-emerald-100 text-emerald-700 border-emerald-200",
    icon: CheckCircle,
  },
  cancelled: {
    label: "Cancelled",
    color: "bg-stone-100 text-stone-500 border-stone-200",
    icon: XCircle,
  },
};

export default function OrderHistory() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async (isBackground = false) => {
    try {
      if (!isBackground) setLoading(true);
      const res = await api.get("/api/orders/my-orders");
      setOrders(res.data.orders);
    } catch {
      console.error("Failed to fetch orders");
    } finally {
      if (!isBackground) setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(() => {
      fetchOrders(true);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const parseOptions = (optionsJson: any): { name: string; price: number; group: string }[] => {
    if (!optionsJson) return [];
    if (typeof optionsJson === "string") {
      try { return JSON.parse(optionsJson); } catch { return []; }
    }
    return Array.isArray(optionsJson) ? optionsJson : [];
  };

  // 🖨️ ฟังก์ชันพิมพ์ใบเสร็จ (Thermal Printer Style)
  const handlePrint = (order: Order) => {
    const printWindow = window.open('', '', 'width=400,height=600');
    if (!printWindow) return;

    const itemsHtml = order.items.map(item => {
      const opts = parseOptions(item.options_json).map(o => o.name).join(', ');
      return `
            <div style="margin-bottom: 8px; border-bottom: 1px dashed #ddd; padding-bottom: 8px;">
                <div style="display: flex; justify-content: space-between; font-weight: bold;">
                    <span>${item.product_name} x${item.quantity}</span>
                    <span>${Number(item.sub_total).toFixed(0)}</span>
                </div>
                ${opts ? `<div style="font-size: 12px; color: #666;">+ ${opts}</div>` : ''}
            </div>
        `;
    }).join('');

    const htmlContent = `
        <html>
        <head>
            <title>Receipt #${order.id}</title>
            <style>
                body { font-family: 'Courier New', monospace; padding: 20px; color: #000; }
                .header { text-align: center; margin-bottom: 20px; }
                .divider { border-top: 1px dashed #000; margin: 10px 0; }
                .total { display: flex; justify-content: space-between; font-weight: bold; font-size: 18px; margin-top: 10px; }
                .footer { text-align: center; margin-top: 20px; font-size: 12px; }
                @media print { .no-print { display: none; } }
            </style>
        </head>
        <body>
            <div class="header">
                <h2 style="margin: 0;">COFFEE SHOP</h2>
                <p style="margin: 5px 0;">Premium Quality</p>
                <div class="divider"></div>
                <p style="margin: 5px 0;">Order #${order.id}</p>
                <p style="margin: 0; font-size: 12px;">${new Date(order.created_at).toLocaleString()}</p>
            </div>
            
            <div class="items">
                ${itemsHtml}
            </div>

            <div class="divider"></div>
            
            <div class="total">
                <span>TOTAL</span>
                <span>฿${Number(order.total_price).toFixed(0)}</span>
            </div>

            <div class="footer">
                <p>Thank you for your order!</p>
                <p>Please come again.</p>
            </div>

            <script>
                window.onload = function() { window.print(); window.close(); }
            </script>
        </body>
        </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  return (
    <div className="font-sans">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4 sm:mb-6">
        <Link to="/" className="p-2 hover:bg-stone-200 rounded-xl transition-colors text-amber-700">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-xl sm:text-2xl font-bold font-serif tracking-wide text-stone-900">My Orders</h1>
      </div>

      <div className="max-w-3xl mx-auto">
        {loading && orders.length === 0 ? (
          <div className="text-center py-20 text-stone-500 animate-pulse">Loading your coffee history...</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-stone-100">
            <Package className="w-16 h-16 text-stone-200 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-stone-800 mb-2 font-serif">No orders yet</h2>
            <p className="text-stone-500 mb-6">Experience our premium selection today.</p>
            <Link
              to="/menu"
              className="inline-flex items-center gap-2 bg-stone-900 hover:bg-stone-800 text-amber-50 px-8 py-3 rounded-xl font-semibold transition-all shadow-md"
            >
              <Coffee className="w-5 h-5" />
              Browse Menu
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const cfg = statusConfig[order.status] || statusConfig.pending;
              const StatusIcon = cfg.icon;
              return (
                <div key={order.id} className="bg-white rounded-2xl shadow-md border border-stone-100 overflow-hidden hover:shadow-lg transition-shadow duration-300">
                  {/* Order Header */}
                  <div className="px-6 py-4 flex items-center justify-between border-b border-stone-100 bg-stone-50/50">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-bold text-stone-800">
                          Order #{order.id}
                        </span>
                        {/* Print Button */}
                        <button
                          onClick={() => handlePrint(order)}
                          className="p-1.5 bg-white border border-stone-200 rounded-lg text-stone-500 hover:text-stone-900 hover:border-stone-400 transition-colors"
                          title="Print Receipt"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-xs text-stone-500 mt-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(order.created_at)}
                      </p>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border ${cfg.color} shadow-sm`}
                    >
                      <StatusIcon className="w-3.5 h-3.5" />
                      {cfg.label.toUpperCase()}
                    </span>
                  </div>

                  {/* Items */}
                  <div className="px-6 py-4 space-y-4">
                    {order.items.map((item) => {
                      const options = parseOptions(item.options_json);
                      return (
                        <div key={item.id} className="flex items-start gap-4">
                          {item.product_image ? (
                            <img
                              src={item.product_image}
                              alt={item.product_name}
                              className="w-14 h-14 rounded-lg object-cover flex-shrink-0 shadow-sm border border-stone-100"
                            />
                          ) : (
                            <div className="w-14 h-14 rounded-lg bg-stone-100 flex items-center justify-center flex-shrink-0 border border-stone-200">
                              <Coffee className="w-6 h-6 text-stone-300" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                              <span className="text-sm font-bold text-stone-800">
                                {item.product_name} <span className="text-stone-400 font-normal">x{item.quantity}</span>
                              </span>
                              <span className="text-sm font-bold text-stone-800 font-mono">
                                ฿{Number(item.sub_total).toFixed(0)}
                              </span>
                            </div>
                            {options.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mt-1.5">
                                {options.map((opt, i) => (
                                  <span
                                    key={i}
                                    className="text-[10px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded-md border border-amber-100 font-medium"
                                  >
                                    {opt.group === "Sweetness" ? `Sweet ${opt.name}` : opt.name}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Footer */}
                  <div className="px-6 py-4 bg-stone-50 border-t border-stone-100 flex justify-between items-center">
                    <div className="flex items-center gap-2 text-stone-500 text-xs">
                      <Receipt className="w-4 h-4" />
                      <span>Included VAT</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-stone-500 font-medium">Total Amount</span>
                      <span className="text-xl font-bold text-stone-900 font-serif">
                        ฿{Number(order.total_price).toFixed(0)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}