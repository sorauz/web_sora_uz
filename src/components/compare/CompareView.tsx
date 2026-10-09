"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import Image from "next/image";
import {
  Scale,
  Trash2,
  ShoppingCart,
  Check,
  ArrowRight,
  SlidersHorizontal,
  X,
  PackageX,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react";
import { Product, getProductLocalized } from "@/lib/schemas/product";
import { useCompareStore } from "@/lib/store/compare";
import { useCartStore } from "@/lib/store/cart";
import { calculateProductPrice } from "@/lib/utils/price";

interface CompareViewProps {
  products: Product[];
  locale: "uz" | "ru";
}

// Base parameters that are already shown in "Asosiy ma'lumotlar" section
// Avoid showing duplicate rows in dynamic "Texnik parametrlar" section
const BASE_PROPERTY_NAMES = new Set([
  "brend",
  "бренд",
  "brand",
  "ishlab chiqarilgan mamlakat",
  "страна производства",
  "страна",
  "mamlakat",
  "ishlab chiqaruvchi",
  "производитель",
  "artikul",
  "артикул",
  "sku",
  "shtrix-kod",
  "штрих-код",
  "штрихкод",
  "barcode",
  "qadoq",
  "упаковка",
  "o'lchov birligi",
  "oʻlchov birligi",
  "единица измерения",
]);

interface AttributeDef {
  key: string;
  uz: string;
  ru: string;
}

const normalizeProp = (str: string) => (str || "").trim().toLowerCase();

export function CompareView({ products, locale }: CompareViewProps) {
  const t = useTranslations("compare");
  const common = useTranslations("common");
  const { compareIds, removeFromCompare, clearCompare } = useCompareStore();
  const { addItem, hasItem } = useCartStore();

  const [onlyDifferences, setOnlyDifferences] = useState(false);
  const [addedIds, setAddedIds] = useState<Record<string, boolean>>({});
  const [mounted, setMounted] = useState(false);
  const [detailedProductsMap, setDetailedProductsMap] = useState<Record<string, Product>>({});
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch full 1C product details (including all technical 1C attributes) for compared items
  useEffect(() => {
    if (!mounted || compareIds.length === 0) return;

    const missingIds = compareIds.filter((id) => {
      const current = detailedProductsMap[id] || products.find((p) => p.id === id);
      return !current || !current.attributes || current.attributes.length === 0;
    });

    if (missingIds.length === 0) return;

    let isSubscribed = true;
    setIsLoadingDetails(true);

    fetch(`/api/products/compare?ids=${encodeURIComponent(missingIds.join(","))}`)
      .then((res) => res.json())
      .then((data) => {
        if (!isSubscribed) return;
        if (data.products && Array.isArray(data.products)) {
          setDetailedProductsMap((prev) => {
            const next = { ...prev };
            data.products.forEach((p: Product) => {
              if (p && p.id) {
                next[p.id] = p;
              }
            });
            return next;
          });
        }
      })
      .catch((err) => {
        console.error("Failed to load detailed compare products", err);
      })
      .finally(() => {
        if (isSubscribed) {
          setIsLoadingDetails(false);
        }
      });

    return () => {
      isSubscribed = false;
    };
  }, [mounted, compareIds, products, detailedProductsMap]);

  if (!mounted) {
    return (
      <div className="py-20 flex justify-center items-center">
        <div className="w-8 h-8 border-4 border-sora-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Selected products with 1C details merged in
  const selectedProducts = compareIds
    .map((id) => detailedProductsMap[id] || products.find((p) => p.id === id))
    .filter((p): p is Product => Boolean(p));

  const handleAddToCart = (product: Product) => {
    const loc = getProductLocalized(product, locale);
    const priceInfo = calculateProductPrice(product.price);
    const price = priceInfo.price;
    if (price <= 0 || product.price?.stock === "OutOfStock") return;

    addItem({
      id: product.id,
      sku: product.product_sku,
      name: loc.name,
      price: price,
      picture: product.main_picture,
      unit: loc.unit,
    });

    setAddedIds((prev) => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setAddedIds((prev) => ({ ...prev, [product.id]: false }));
    }, 1500);
  };

  // If compare list is empty
  if (selectedProducts.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 sm:p-16 text-center space-y-6 max-w-2xl mx-auto my-12 shadow-xs">
        <div className="w-20 h-20 rounded-3xl bg-sora-50 dark:bg-sora-950/60 text-sora-600 dark:text-sora-400 flex items-center justify-center mx-auto border border-sora-200 dark:border-sora-800">
          <Scale className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {t("emptyTitle")}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
            {t("emptyDesc")}
          </p>
        </div>
        <div>
          <Link
            href="/catalog"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-sora-600 hover:bg-sora-700 text-white font-bold text-sm shadow-md transition-all active:scale-[0.98]"
          >
            <span>{t("goToCatalog")}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  // Collect all unique technical attributes across selected products
  const attributeDefs: AttributeDef[] = [];

  selectedProducts.forEach((p) => {
    (p.attributes || []).forEach((attr) => {
      const uz = (attr.property_uz || "").trim();
      const ru = (attr.property_ru || "").trim();
      const normUz = normalizeProp(uz);
      const normRu = normalizeProp(ru);

      // Skip attributes that already exist in base rows
      if (BASE_PROPERTY_NAMES.has(normUz) || BASE_PROPERTY_NAMES.has(normRu)) {
        return;
      }

      // Check if already registered
      const existing = attributeDefs.find((def) => {
        const defNormUz = normalizeProp(def.uz);
        const defNormRu = normalizeProp(def.ru);
        return (
          (normRu && defNormRu && normRu === defNormRu) ||
          (normUz && defNormUz && normUz === defNormUz)
        );
      });

      if (!existing && (uz || ru)) {
        attributeDefs.push({
          key: normRu || normUz,
          uz: uz || ru,
          ru: ru || uz,
        });
      } else if (existing) {
        if (!existing.uz && uz) existing.uz = uz;
        if (!existing.ru && ru) existing.ru = ru;
      }
    });
  });

  // Helper to extract a product's value for a given attribute definition
  const getProductAttributeValue = (p: Product, def: AttributeDef) => {
    const normUz = normalizeProp(def.uz);
    const normRu = normalizeProp(def.ru);

    const found = (p.attributes || []).find((a) => {
      const aUz = normalizeProp(a.property_uz || "");
      const aRu = normalizeProp(a.property_ru || "");
      return (
        (normRu && aRu && aRu === normRu) ||
        (normUz && aUz && aUz === normUz)
      );
    });

    if (!found) return "—";
    const val = locale === "uz" ? found.value_uz || found.value_ru : found.value_ru || found.value_uz;
    return val?.trim() || "—";
  };

  // Helper: check if values differ across products
  const isValuesDifferent = (values: unknown[]) => {
    if (values.length <= 1) return false;
    const first = values[0];
    return values.some((v) => v !== first);
  };

  // Base parameters definitions
  const baseRows = [
    {
      id: "price",
      label: t("price"),
      getValue: (p: Product) => {
        const info = calculateProductPrice(p.price);
        return info.price > 0 ? `${info.price.toLocaleString("ru-RU")} ${common("currency")}` : "—";
      },
      rawValues: selectedProducts.map((p) => calculateProductPrice(p.price).price),
    },
    {
      id: "stock",
      label: t("stock"),
      getValue: (p: Product) => {
        const inStock = p.price?.stock !== "OutOfStock";
        return inStock ? (
          <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
            <CheckCircle2 className="w-4 h-4" />
            <span>{common("inStock")}</span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-rose-500 font-semibold">
            <XCircle className="w-4 h-4" />
            <span>{common("outOfStock")}</span>
          </span>
        );
      },
      rawValues: selectedProducts.map((p) => p.price?.stock === "OutOfStock"),
    },
    {
      id: "brand",
      label: t("brand"),
      getValue: (p: Product) => p.brand || "—",
      rawValues: selectedProducts.map((p) => p.brand),
    },
    {
      id: "country",
      label: t("country"),
      getValue: (p: Product) => p.country || "—",
      rawValues: selectedProducts.map((p) => p.country),
    },
    {
      id: "manufacturer",
      label: t("manufacturer"),
      getValue: (p: Product) => p.manufacturer || "—",
      rawValues: selectedProducts.map((p) => p.manufacturer),
    },
    {
      id: "package",
      label: t("package"),
      getValue: (p: Product) => p.package || "—",
      rawValues: selectedProducts.map((p) => p.package),
    },
    {
      id: "sku",
      label: t("sku"),
      getValue: (p: Product) => p.product_sku || "—",
      rawValues: selectedProducts.map((p) => p.product_sku),
    },
    {
      id: "barcode",
      label: t("barcode"),
      getValue: (p: Product) => p.barcode || "—",
      rawValues: selectedProducts.map((p) => p.barcode),
    },
    {
      id: "unit",
      label: t("unit"),
      getValue: (p: Product) => getProductLocalized(p, locale).unit || "—",
      rawValues: selectedProducts.map((p) => getProductLocalized(p, locale).unit),
    },
  ];

  // Filter rows based on "onlyDifferences" setting
  const visibleBaseRows = onlyDifferences
    ? baseRows.filter((row) => isValuesDifferent(row.rawValues))
    : baseRows;

  const visibleAttributeRows = attributeDefs
    .map((def) => {
      const label = locale === "uz" ? def.uz : def.ru;
      const rawValues = selectedProducts.map((p) => getProductAttributeValue(p, def));
      return {
        key: def.key,
        label,
        def,
        rawValues,
        isDifferent: isValuesDifferent(rawValues),
      };
    })
    .filter((row) => !onlyDifferences || row.isDifferent);

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sora-50 dark:bg-sora-950/60 text-sora-600 dark:text-sora-400 flex items-center justify-center font-bold">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {t("title")}
            </h1>
            <p className="text-xs text-slate-500">
              {t("subtitle")} ({selectedProducts.length}/4)
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Toggle Differences Filter */}
          <button
            type="button"
            onClick={() => setOnlyDifferences(!onlyDifferences)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-colors border cursor-pointer ${
              onlyDifferences
                ? "bg-sora-600 border-sora-600 text-white shadow-xs"
                : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>{onlyDifferences ? t("allSpecs") : t("onlyDiff")}</span>
          </button>

          {/* Clear All Button */}
          <button
            type="button"
            onClick={clearCompare}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-transparent hover:border-rose-200 dark:hover:border-rose-900 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{t("clearAll")}</span>
          </button>
        </div>
      </div>

      {/* Comparison Matrix Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-left border-collapse min-w-[700px]">
            {/* Top Product Cards Row */}
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                <th className="p-4 sm:p-6 w-48 sm:w-60 min-w-48 align-top text-xs font-bold uppercase tracking-wider text-slate-400">
                  {locale === "uz" ? "Mahsulotlar" : "Товары"}
                </th>
                {selectedProducts.map((product) => {
                  const loc = getProductLocalized(product, locale);
                  const priceInfo = calculateProductPrice(product.price);
                  const isOutOfStock = product.price?.stock === "OutOfStock";
                  const isAdded = !!addedIds[product.id];

                  return (
                    <th
                      key={product.id}
                      className="p-4 sm:p-6 align-top w-64 min-w-64 max-w-72 border-l border-slate-200 dark:border-slate-800 font-normal relative"
                    >
                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={() => removeFromCompare(product.id)}
                        aria-label="Remove"
                        className="absolute top-3 right-3 w-7 h-7 rounded-full bg-slate-100 hover:bg-rose-100 text-slate-400 hover:text-rose-600 dark:bg-slate-800 dark:hover:bg-rose-950/60 dark:hover:text-rose-400 flex items-center justify-center transition-colors cursor-pointer"
                        title="O'chirish"
                      >
                        <X className="w-4 h-4" />
                      </button>

                      {/* Product Preview Card */}
                      <div className="space-y-3">
                        <Link
                          href={`/products/${loc.slug}`}
                          className="block relative w-full aspect-square bg-white dark:bg-slate-800 rounded-2xl overflow-hidden p-3 border border-slate-100 dark:border-slate-700/60 group"
                        >
                          <Image
                            src={product.main_picture || "/placeholder-product.svg"}
                            alt={loc.name}
                            fill
                            sizes="200px"
                            className="object-contain p-2 group-hover:scale-105 transition-transform"
                          />
                        </Link>

                        <div>
                          <span className="text-[11px] font-bold text-sora-600 dark:text-sora-400 uppercase tracking-wider block">
                            {product.brand}
                          </span>
                          <Link
                            href={`/products/${loc.slug}`}
                            className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white line-clamp-2 hover:text-sora-600 dark:hover:text-sora-400 transition-colors"
                          >
                            {loc.name}
                          </Link>
                        </div>

                        {/* Price */}
                        <div>
                          {priceInfo.price > 0 ? (
                            <div className="flex items-baseline gap-1.5 flex-wrap">
                              <span className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white">
                                {priceInfo.price.toLocaleString("ru-RU")} {common("currency")}
                              </span>
                              {priceInfo.oldPrice && priceInfo.oldPrice > priceInfo.price && (
                                <span className="text-xs text-slate-400 line-through">
                                  {priceInfo.oldPrice.toLocaleString("ru-RU")}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs font-semibold text-slate-500">
                              {locale === "uz" ? "Narxi kelishiladi" : "Цена по запросу"}
                            </span>
                          )}
                        </div>

                        {/* Add to Cart Button */}
                        <button
                          type="button"
                          onClick={() => handleAddToCart(product)}
                          disabled={isOutOfStock || priceInfo.price <= 0}
                          className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer ${
                            isAdded
                              ? "bg-emerald-600 text-white"
                              : "bg-sora-600 hover:bg-sora-700 active:scale-[0.98] text-white"
                          }`}
                        >
                          {isAdded ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>{t("addToCart")}</span>
                            </>
                          ) : isOutOfStock ? (
                            <>
                              <PackageX className="w-3.5 h-3.5" />
                              <span>{common("outOfStock")}</span>
                            </>
                          ) : (
                            <>
                              <ShoppingCart className="w-3.5 h-3.5" />
                              <span>{t("addToCart")}</span>
                            </>
                          )}
                        </button>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>

            {/* Matrix Comparison Rows */}
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs sm:text-sm">
              {/* Section Header: Base Parameters */}
              {visibleBaseRows.length > 0 && (
                <tr className="bg-slate-100/70 dark:bg-slate-800/60 font-bold text-xs uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  <td
                    colSpan={selectedProducts.length + 1}
                    className="p-3.5 px-4 sm:px-6 text-sora-700 dark:text-sora-300"
                  >
                    {t("baseParams")}
                  </td>
                </tr>
              )}

              {visibleBaseRows.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <td className="p-4 px-4 sm:px-6 font-semibold text-slate-500 dark:text-slate-400 bg-slate-50/30 dark:bg-slate-900/30">
                    {row.label}
                  </td>
                  {selectedProducts.map((p) => (
                    <td
                      key={p.id}
                      className="p-4 border-l border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100"
                    >
                      {row.getValue(p)}
                    </td>
                  ))}
                </tr>
              ))}

              {/* Section Header: Technical Specifications */}
              {visibleAttributeRows.length > 0 && (
                <tr className="bg-slate-100/70 dark:bg-slate-800/60 font-bold text-xs uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  <td
                    colSpan={selectedProducts.length + 1}
                    className="p-3.5 px-4 sm:px-6 text-purple-700 dark:text-purple-300"
                  >
                    <div className="flex items-center gap-2">
                      <span>{t("specsParams")}</span>
                      {isLoadingDetails && (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-600" />
                      )}
                    </div>
                  </td>
                </tr>
              )}

              {visibleAttributeRows.map((attr) => (
                <tr
                  key={attr.key}
                  className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/30 ${
                    attr.isDifferent ? "bg-amber-50/30 dark:bg-amber-950/10" : ""
                  }`}
                >
                  <td className="p-4 px-4 sm:px-6 font-semibold text-slate-500 dark:text-slate-400 bg-slate-50/30 dark:bg-slate-900/30">
                    <div className="flex items-center gap-1.5">
                      <span>{attr.label}</span>
                      {attr.isDifferent && (
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" title="Farq qiladi" />
                      )}
                    </div>
                  </td>
                  {selectedProducts.map((p) => {
                    const val = getProductAttributeValue(p, attr.def);
                    return (
                      <td
                        key={p.id}
                        className="p-4 border-l border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-medium"
                      >
                        {val || "—"}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
