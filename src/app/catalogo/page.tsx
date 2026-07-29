"use client";

import { useEffect, useState } from "react";
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

export default function CatalogPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchData = async () => {
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          fetch("/api/products"),
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
  }, []);

  const filteredProducts = selectedCategory === "all" 
    ? products 
    : products.filter(p => p.categoryId === selectedCategory);

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <h1 className={styles.title}>
          Nosso <span className="gold-text">Catálogo</span>
        </h1>

        <div className={styles.filters}>
          <button 
            className={`${styles.filterBtn} ${selectedCategory === "all" ? styles.active : ""}`}
            onClick={() => setSelectedCategory("all")}
          >
            Todos
          </button>
          {categories.map(category => (
            <button 
              key={category.id}
              className={`${styles.filterBtn} ${selectedCategory === category.id ? styles.active : ""}`}
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
