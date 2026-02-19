import { useState, useEffect, useCallback } from "react";
import api from "../api/axios";

interface OrderItem {
    id: number;
    order_id: number;
    product_id: number;
    quantity: number;
    price_per_unit: number;
    sub_total: number;
    options_json: any;
    product_name?: string;
    product_image?: string;
}

interface Order {
    id: number;
    user_id: number | null;
    customer_name: string | null;
    status: string;
    total_price: number;
    created_at: string;
    updated_at: string;
    items: OrderItem[];
    display_name?: string;
}

interface UseOrdersReturn {
    orders: Order[];
    loading: boolean;
    error: string | null;
    refetch: () => void;
}

export function useMyOrders(): UseOrdersReturn {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchOrders = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await api.get("/api/orders/my-orders");
            const data = res.data.data;
            setOrders(data.data?.orders || data.orders || []);
        } catch (err: any) {
            const msg = err.response?.data?.message || err.message || "Failed to load orders.";
            setError(msg);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    return { orders, loading, error, refetch: fetchOrders };
}

export function useAllOrders(): UseOrdersReturn {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchOrders = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await api.get("/api/orders");
            const data = res.data;
            setOrders(data.data?.orders || data.orders || []);
        } catch (err: any) {
            const msg = err.response?.data?.message || err.message || "Failed to load orders.";
            setError(msg);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    return { orders, loading, error, refetch: fetchOrders };
}
