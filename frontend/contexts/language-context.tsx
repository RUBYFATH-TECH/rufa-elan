"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type Language = "en" | "fr" | "es" | "tr" | "ar";

const translations = {
  en: {
    language: "Language",
    orders: "Orders &",
    account: "Account",
    searchPlaceholder: "Search products",
    collection: "The RUFA ELAN collection",
    heroTitle: "Style made to be seen.",
    heroDescription: "The number one destination for premium, luxurious, modest, elegant, and affordable women's fashion accessories in Ghana.",
    shopCollection: "Shop the collection",
    exploreFavourites: "Explore favourites",
    loadingProducts: "Loading products...",
    loadProductsError: "Failed to load products. Please try again.",
    tryAgain: "Try again",
    recommended: "Recommended for you",
    showing: "Showing {from}–{to} of {count} items",
    next: "Next →",
    goToPage: "Go to page",
    go: "Go",
    noProducts: "No products available at the moment.",
    addToCart: "Add to Cart",
    fashionFavourites: "Fashion favourites",
    brandsTitle: "Women's Fashion Brands, All in One Place",
  },
  fr: {
    language: "Langue",
    orders: "Commandes &",
    account: "Compte",
    searchPlaceholder: "Rechercher des produits",
    collection: "La collection RUFA ELAN",
    heroTitle: "Un style qui se fait remarquer.",
    heroDescription: "La première destination d'accessoires de mode pour femmes, haut de gamme, luxueux, modestes, élégants et abordables au Ghana.",
    shopCollection: "Découvrir la collection",
    exploreFavourites: "Explorer les favoris",
    loadingProducts: "Chargement des produits...",
    loadProductsError: "Impossible de charger les produits. Veuillez réessayer.",
    tryAgain: "Réessayer",
    recommended: "Recommandé pour vous",
    showing: "Affichage de {from}–{to} sur {count} articles",
    next: "Suivant →",
    goToPage: "Aller à la page",
    go: "Aller",
    noProducts: "Aucun produit disponible pour le moment.",
    addToCart: "Ajouter au panier",
    fashionFavourites: "Favoris mode",
    brandsTitle: "Les marques de mode féminine, réunies en un seul endroit",
  },
  es: {
    language: "Idioma",
    orders: "Pedidos y",
    account: "Cuenta",
    searchPlaceholder: "Buscar productos",
    collection: "La colección RUFA ELAN",
    heroTitle: "Un estilo hecho para destacar.",
    heroDescription: "El principal destino de accesorios de moda para mujer prémium, lujosos, modestos, elegantes y asequibles en Ghana.",
    shopCollection: "Comprar la colección",
    exploreFavourites: "Explorar favoritos",
    loadingProducts: "Cargando productos...",
    loadProductsError: "No se pudieron cargar los productos. Inténtalo de nuevo.",
    tryAgain: "Intentar de nuevo",
    recommended: "Recomendado para ti",
    showing: "Mostrando {from}–{to} de {count} artículos",
    next: "Siguiente →",
    goToPage: "Ir a la página",
    go: "Ir",
    noProducts: "No hay productos disponibles en este momento.",
    addToCart: "Añadir al carrito",
    fashionFavourites: "Favoritos de moda",
    brandsTitle: "Marcas de moda femenina, todas en un solo lugar",
  },
  tr: {
    language: "Dil",
    orders: "Siparişler &",
    account: "Hesap",
    searchPlaceholder: "Ürün ara",
    collection: "RUFA ELAN koleksiyonu",
    heroTitle: "Fark edilmek için tasarlanmış stil.",
    heroDescription: "Gana'da kaliteli, lüks, sade, şık ve uygun fiyatlı kadın moda aksesuarları için önde gelen adres.",
    shopCollection: "Koleksiyonu keşfet",
    exploreFavourites: "Favorileri keşfet",
    loadingProducts: "Ürünler yükleniyor...",
    loadProductsError: "Ürünler yüklenemedi. Lütfen tekrar deneyin.",
    tryAgain: "Tekrar dene",
    recommended: "Sizin için önerilenler",
    showing: "{count} ürünün {from}–{to} arası gösteriliyor",
    next: "Sonraki →",
    goToPage: "Sayfaya git",
    go: "Git",
    noProducts: "Şu anda ürün bulunmuyor.",
    addToCart: "Sepete ekle",
    fashionFavourites: "Moda favorileri",
    brandsTitle: "Kadın Moda Markaları, Tek Bir Yerde",
  },
  ar: {
    language: "اللغة",
    orders: "الطلبات و",
    account: "الحساب",
    searchPlaceholder: "ابحث عن المنتجات",
    collection: "مجموعة روفا إيلان",
    heroTitle: "أناقة تستحق أن تُرى.",
    heroDescription: "وجهتك الأولى لإكسسوارات الأزياء النسائية الفاخرة والأنيقة وبأسعار مناسبة في غانا.",
    shopCollection: "تسوّق المجموعة",
    exploreFavourites: "استكشف المفضلات",
    loadingProducts: "جارٍ تحميل المنتجات...",
    loadProductsError: "تعذر تحميل المنتجات. يُرجى المحاولة مرة أخرى.",
    tryAgain: "حاول مرة أخرى",
    recommended: "موصى به لك",
    showing: "عرض {from}–{to} من أصل {count} منتجات",
    next: "التالي ←",
    goToPage: "الانتقال إلى الصفحة",
    go: "انتقال",
    noProducts: "لا توجد منتجات متاحة حالياً.",
    addToCart: "أضف إلى السلة",
    fashionFavourites: "المفضلات في الموضة",
    brandsTitle: "علامات الأزياء النسائية في مكان واحد",
  },
} as const;

type TranslationKey = keyof typeof translations.en;

type LanguageContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: TranslationKey, values?: Record<string, string | number>) => string;
};

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("en");

  useEffect(() => {
    const savedLanguage = window.localStorage.getItem("rufa-elan-language") as Language | null;
    if (savedLanguage && savedLanguage in translations) setLanguage(savedLanguage);
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    window.localStorage.setItem("rufa-elan-language", language);
  }, [language]);

  const t = (key: TranslationKey, values: Record<string, string | number> = {}) =>
    Object.entries(values).reduce(
      (text, [name, value]) => text.replace(`{${name}}`, String(value)),
      translations[language][key]
    );

  return <LanguageContext.Provider value={{ language, setLanguage, t }}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within a LanguageProvider");
  return context;
}
