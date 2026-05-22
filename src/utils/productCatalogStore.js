export const PRODUCT_CATALOG_KEY = "nashir_mock_product_catalog";

function normalizeProduct(product = {}) {
  const id = product.id || `p-${Date.now()}-${Math.random().toString(16).slice(2)}`;

  return {
    ...product,
    id,
    name: product.name || "",
    category: product.category || "غير مصنف",
    price: product.price || "غير محدد",
    currency: product.currency || "SAR",
    url: product.url || "",
    readiness: Number.isFinite(Number(product.readiness)) ? Number(product.readiness) : 35,
    status: product.status || "draft",
    assets: Number.isFinite(Number(product.assets)) ? Number(product.assets) : 0,
    source: product.source || "Manual",
    sourceSurface: product.sourceSurface || product.source || "Unknown",
    flags: Array.isArray(product.flags) ? product.flags : [],
    claims: Array.isArray(product.claims)
      ? product.claims
      : ["يحتاج مراجعة وصف المنتج قبل استخدامه في حملة"],
    description: product.description || "منتج يحتاج استكمال التفاصيل قبل استخدامه في الحملات.",
    updatedAt: product.updatedAt || new Date().toISOString(),
  };
}

export function readProductCatalog(seed = []) {
  if (typeof window === "undefined") return seed.map(normalizeProduct);

  try {
    const raw = window.localStorage.getItem(PRODUCT_CATALOG_KEY);

    if (!raw) {
      const normalizedSeed = seed.map(normalizeProduct);
      writeProductCatalog(normalizedSeed);
      return normalizedSeed;
    }

    const parsed = JSON.parse(raw);
    const products = Array.isArray(parsed) ? parsed : parsed?.products;

    if (!Array.isArray(products) || !products.length) {
      const normalizedSeed = seed.map(normalizeProduct);
      writeProductCatalog(normalizedSeed);
      return normalizedSeed;
    }

    return products.map(normalizeProduct);
  } catch {
    return seed.map(normalizeProduct);
  }
}

export function writeProductCatalog(products = []) {
  if (typeof window === "undefined") return products.map(normalizeProduct);

  const normalized = products.map(normalizeProduct);

  window.localStorage.setItem(
    PRODUCT_CATALOG_KEY,
    JSON.stringify({
      version: 1,
      source: "nashir_ui_prototype_product_catalog",
      updatedAt: new Date().toISOString(),
      products: normalized,
    })
  );

  window.dispatchEvent(new Event("nashir-product-catalog-updated"));

  return normalized;
}

export function upsertProduct(product, seed = []) {
  const current = readProductCatalog(seed);
  const normalized = normalizeProduct(product);
  const exists = current.some((item) => item.id === normalized.id);
  const next = exists
    ? current.map((item) => (item.id === normalized.id ? normalized : item))
    : [normalized, ...current];

  return writeProductCatalog(next);
}

export function deleteProduct(productId, seed = []) {
  const current = readProductCatalog(seed);
  const next = current.filter((item) => item.id !== productId);

  return writeProductCatalog(next.length ? next : seed.map(normalizeProduct));
}
