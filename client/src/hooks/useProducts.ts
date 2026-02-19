import { useState, useEffect, useCallback } from "react";
import api from "../api/axios";
import { Product } from "../types";

interface UseProductsOptions {
    category?: string;
    page?: number;
    limit?: number;
}

interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

interface UseProductsReturn {
    products: Product[];
    loading: boolean;
    error: string | null;
    meta?: PaginationMeta;
    refetch: () => void;
}

export function useProducts(options: UseProductsOptions = {}): UseProductsReturn {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [meta, setMeta] = useState<PaginationMeta | undefined>();

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        setError(null);
                try {
            const params: Record<string, any> = {};
            if (options.category) params.category = options.category;
            if (options.page) params.page = options.page;
            if (options.limit) params.limit = options.limit;

            const res = await api.get("/api/products", { params });
            const payload = res.data.data; // แกะกล่องชั้นแรก

            // ✅ เช็คเลยว่าข้อมูลที่ได้มา เป็น Array หรือเปล่า?
            if (Array.isArray(payload)) {
                // ถ้าเป็นลิสต์กาแฟตรงๆ ก็จับยัดใส่ State เลย
                setProducts(payload);
            } else {
                // ถ้า Backend ห่อมาในกล่อง Object ที่มีคำว่า products หรือ meta ซ้อนอีกชั้น
                setProducts(payload?.products || payload?.data?.products || []);
                if (payload?.meta) setMeta(payload.meta);
            }
            
        } catch (err: any) {
            const msg = err.response?.data?.message || err.message || "Failed to load products.";
            setError(msg);
        } finally {
            setLoading(false);
        }

    }, [options.category, options.page, options.limit]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    return { products, loading, error, meta, refetch: fetchProducts };
}
