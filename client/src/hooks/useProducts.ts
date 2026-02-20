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
            
            // 🔍 แกะกล่องชั้นแรกก่อน (res.data คือก้อน JSON ทั้งก้อนที่ Server ส่งมา)
            const responseData = res.data;
            
            // 🎯 ท่าดึงข้อมูลแบบเจาะทะลวง 100% (หา Array ให้เจอ)
            let productList = [];
            
            if (responseData?.data?.products) {
                // เคสนี้แหละครับ! ตรงกับ JSON ของคุณเป๊ะๆ
                productList = responseData.data.products; 
            } else if (Array.isArray(responseData?.data)) {
                productList = responseData.data;
            } else if (Array.isArray(responseData)) {
                productList = responseData;
            }

            // ยัดกาแฟใส่หน้าเว็บ!
            setProducts(productList);
            
            // ดึงข้อมูลแบ่งหน้า (Pagination) ถ้ามี
            if (responseData?.data?.meta) {
                setMeta(responseData.data.meta);
            }

        } catch (err: any) {
            console.error("🔥 Error fetching products:", err);
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
