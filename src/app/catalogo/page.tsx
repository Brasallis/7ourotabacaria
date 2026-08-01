"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import styles from "./page.module.css";

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string | null;
  categoryId: string;
};

type Category = {
  id: string;
  name: string;
};

function CatalogContent() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") || "";
  const catParam = searchParams.get("cat");
  
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>(catParam || "all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchData = async () => {
      setLoading(true);
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          fetch(`/api/products${q ? `?q=${encodeURIComponent(q)}` : ''}`),
          fetch("/api/categories")
        ]);
        
        if (productsRes.ok && categoriesRes.ok) {
          const productsData = await productsRes.json();
          const categoriesData = await categoriesRes.json();
          setProducts(productsData);
          setCategories(categoriesData);
        }
      } catch (error) {
        console.error("Error fetching data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [q]);

  const filteredProducts = selectedCategory === "all" 
    ? products 
    : products.filter(p => p.categoryId === selectedCategory);

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <h1 className={styles.title}>
          {q ? (
            <>Resultados para <span className="gold-text">"{q}"</span></>
          ) : (
            <>Nosso <span className="gold-text">Catálogo</span></>
          )}
        </h1>

        <div className={styles.filters}>
          <button 
            className={selectedCategory === "all" ? "btn-primary" : "btn-secondary"}
            onClick={() => setSelectedCategory("all")}
          >
            Todas
          </button>
          {categories.map(category => (
            <button 
              key={category.id}
              className={selectedCategory === category.id ? "btn-primary" : "btn-secondary"}
              onClick={() => setSelectedCategory(category.id)}
            >
              {category.name}
            </button>
          ))}
        </div>

        {loading ? (
          <div className={styles.loading}>Carregando produtos...</div>
        ) : filteredProducts.length === 0 ? (
          <div className={styles.empty}>Nenhum produto encontrado nesta categoria.</div>
        ) : (
          <div className={styles.grid}>
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

export default function CatalogPage() {
  return (
    <Suspense fallback={<div style={{ textAlign: 'center', padding: '50px', color: 'var(--gold-primary)' }}>Carregando catálogo...</div>}>
      <CatalogContent />
    </Suspense>
  );
}
