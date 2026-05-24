import React, { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Edit3,
  ImageIcon,
  Link2,
  Package,
  Plus,
  Search,
  Trash2,
} from "lucide-react";

import {
  readProductCatalog,
  upsertProduct,
  deleteProduct as deleteCatalogProduct,
} from "../utils/productCatalogStore.js";

const initialProducts = [
  {
    id: "p-001",
    name: "عطر أرابيان أود",
    category: "عطور",
    price: "599",
    currency: "SAR",
    url: "https://store.example/products/oud",
    readiness: 86,
    status: "ready",
    assets: 4,
    source: "Store Setup",
    flags: ["مناسب للهدايا", "يصلح للفيديو", "الأكثر مبيعًا"],
    claims: ["لا تستخدم: الأفضل في السوق", "تجنب وعود الثبات الطويل دون دليل"],
    description: "عطر فاخر مناسب للهدايا والمناسبات ويصلح لحملات إطلاق وعروض موسمية.",
  },
  {
    id: "p-002",
    name: "باقة هدايا فاخرة",
    category: "هدايا",
    price: "349",
    currency: "SAR",
    url: "https://store.example/products/gift",
    readiness: 68,
    status: "review",
    assets: 2,
    source: "Store Crawler",
    flags: ["موسمي", "مناسب للهدايا"],
    claims: ["تحتاج تأكيد توفر المخزون قبل الحملة"],
    description: "باقة هدايا مهيأة للمناسبات وتحتاج مراجعة للأصول قبل استخدامها في الإعلانات.",
  },
  {
    id: "p-003",
    name: "كريم مرطب نيفيا",
    category: "عناية",
    price: "79",
    currency: "SAR",
    url: "https://store.example/products/cream",
    readiness: 42,
    status: "draft",
    assets: 1,
    source: "Manual",
    flags: ["يحتاج شرحًا"],
    claims: ["لا تستخدم ادعاءات علاجية أو طبية"],
    description: "منتج عناية يومي يحتاج شرح الفوائد بدون ادعاءات علاجية.",
  },
];

const statusMap = {
  ready: ["جاهز للحملات", "green"],
  review: ["يحتاج مراجعة", "amber"],
  draft: ["ناقص البيانات", "slate"],
  blocked: ["محظور مؤقتًا", "red"],
};

const flagOptions = [
  "موسمي",
  "مخزون كبير",
  "جديد",
  "الأكثر مبيعًا",
  "مناسب للهدايا",
  "يحتاج شرحًا",
  "يصلح للفيديو",
];

const categoryOptions = [
  "عطور",
  "عناية وجمال",
  "أزياء",
  "إكسسوارات",
  "غذاء ومشروبات",
  "إلكترونيات",
  "منزل",
  "هدايا",
  "خدمات",
  "أخرى",
];

function toggleValue(list, value) {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
}

function hasUrl(value) {
  if (!value || typeof value !== "string") return false;

  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export default function ProductCatalogPage() {
  const [products, setProducts] = useState(() => readProductCatalog(initialProducts));
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(
    () => readProductCatalog(initialProducts)[0]?.id || initialProducts[0].id
  );
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState({
    name: "",
    category: categoryOptions[0],
    price: "",
    url: "",
    imageUrl: "",
    videoUrl: "",
    description: "",
    flags: [],
  });

  useEffect(() => {
    const refreshProducts = () => {
      const next = readProductCatalog(initialProducts);
      setProducts(next);
      setSelectedId((current) => current || next[0]?.id || initialProducts[0].id);
    };

    window.addEventListener("focus", refreshProducts);
    window.addEventListener("storage", refreshProducts);
    window.addEventListener("nashir-product-catalog-updated", refreshProducts);

    return () => {
      window.removeEventListener("focus", refreshProducts);
      window.removeEventListener("storage", refreshProducts);
      window.removeEventListener("nashir-product-catalog-updated", refreshProducts);
    };
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter((product) =>
      `${product.name} ${product.category} ${product.flags.join(" ")} ${product.source}`
        .toLowerCase()
        .includes(query.toLowerCase())
    );
  }, [products, query]);

  const selectedProduct =
    products.find((product) => product.id === selectedId) || products[0] || initialProducts[0];

  const stats = useMemo(() => {
    return {
      total: products.length,
      ready: products.filter((product) => product.status === "ready").length,
      review: products.filter((product) => product.status === "review").length,
      assets: products.reduce((sum, product) => sum + product.assets, 0),
    };
  }, [products]);

  const resetDraft = () => {
    setDraft({
      name: "",
      category: categoryOptions[0],
      price: "",
      url: "",
      imageUrl: "",
      videoUrl: "",
      description: "",
      flags: [],
    });
    setEditingId(null);
  };

  const addOrUpdateProduct = () => {
    if (!draft.name.trim()) return;

    if (editingId) {
      const currentProduct = products.find((product) => product.id === editingId);
      if (!currentProduct) return;

      const next = upsertProduct(
        {
          ...currentProduct,
          name: draft.name,
          category: draft.category || categoryOptions[0],
          price: draft.price || "غير محدد",
          url: draft.url,
          imageUrl: draft.imageUrl,
          videoUrl: draft.videoUrl,
          description: draft.description,
          flags: draft.flags,
          readiness: Math.max(currentProduct.readiness, 55),
          status: currentProduct.status === "blocked" ? currentProduct.status : "review",
        },
        initialProducts
      );

      setProducts(next);
      setSelectedId(editingId);
      resetDraft();
      return;
    }

    const product = {
      id: `p-${Date.now()}`,
      name: draft.name,
      category: draft.category || categoryOptions[0],
      price: draft.price || "غير محدد",
      currency: "SAR",
      url: draft.url,
      imageUrl: draft.imageUrl,
      videoUrl: draft.videoUrl,
      readiness: 35,
      status: "draft",
      assets: 0,
      source: "Manual",
      flags: draft.flags.length ? draft.flags : ["جديد"],
      claims: ["يحتاج مراجعة وصف المنتج قبل استخدامه في حملة"],
      description: draft.description || "منتج جديد يحتاج استكمال التفاصيل قبل استخدامه في الحملات.",
    };

    const next = upsertProduct(product, initialProducts);
    setProducts(next);
    setSelectedId(product.id);
    resetDraft();
  };

  const editProduct = (product) => {
    setEditingId(product.id);
    setSelectedId(product.id);
    setDraft({
      name: product.name,
      category: categoryOptions.includes(product.category) ? product.category : "أخرى",
      price: product.price,
      url: product.url,
      imageUrl: product.imageUrl,
      videoUrl: product.videoUrl,
      description: product.description,
      flags: product.flags,
    });
  };

  const deleteProduct = (id) => {
    if (products.length <= 1) return;
    const next = deleteCatalogProduct(id, initialProducts);
    setProducts(next);
    if (selectedId === id) setSelectedId(next[0].id);
    if (editingId === id) resetDraft();
  };

  const pullFromStore = () => {
    const crawled = [
      {
        id: `crawl-${Date.now()}-1`,
        name: "منتج مكتشف من رابط المتجر",
        category: "أخرى",
        price: "199",
        currency: "SAR",
        url: "https://store.example/products/discovered",
        readiness: 58,
        status: "review",
        assets: 2,
        source: "Store Crawler",
        flags: ["من رابط المتجر", "يحتاج مراجعة"],
        claims: ["تأكد من حقوق الصور قبل استخدامها"],
        description: "منتج تم سحبه كمحاكاة من رابط المتجر ويحتاج مراجعة قبل استخدامه.",
      },
      {
        id: `crawl-${Date.now()}-2`,
        name: "باقة موسمية مكتشفة",
        category: "هدايا",
        price: "299",
        currency: "SAR",
        url: "https://store.example/products/seasonal",
        readiness: 62,
        status: "review",
        assets: 3,
        source: "Store Crawler",
        flags: ["موسمي", "مناسب للهدايا"],
        claims: ["تأكد من توفر المخزون وسعر العرض"],
        description: "باقة موسمية تم سحبها كمحاكاة من المتجر.",
      },
    ];

    let next = products;
    crawled.forEach((product) => {
      next = upsertProduct(product, initialProducts);
    });

    setProducts(next);
    setSelectedId(crawled[0].id);
  };

  return (
    <main className="product-catalog-page" dir="rtl">
      <style>{styles}</style>

      <section className="page-title">
        <div>
          <div className="eyebrow">
            <Package size={15} />
            Product Catalog
          </div>
          <h1>كتالوج المنتجات</h1>
          <p>
            مركز المنتجات الذي تختار منه الحملات بدل إعادة إدخال المنتج في كل شاشة.
            كل منتج له جاهزية، أصول، خصائص، وقيود ادعاءات.
          </p>
        </div>

        <div className="title-actions">
          <button type="button" className="secondary-button" onClick={pullFromStore}>
            <Link2 size={16} />
            سحب من رابط المتجر
          </button>
          <button type="button" className="primary-button" onClick={addOrUpdateProduct}>
            <Plus size={16} />
            {editingId ? "حفظ التعديل" : "إضافة المنتج"}
          </button>
        </div>
      </section>

      <section className="stats-grid">
        <Stat title="إجمالي المنتجات" value={stats.total} />
        <Stat title="جاهزة للحملات" value={stats.ready} />
        <Stat title="تحتاج مراجعة" value={stats.review} />
        <Stat title="الأصول المرتبطة" value={stats.assets} />
      </section>

      <section className="add-card">
        <div className="field">
          <span>اسم المنتج</span>
          <input
            value={draft.name}
            onChange={(event) => setDraft((prev) => ({ ...prev, name: event.target.value }))}
            placeholder="مثال: عطر أرابيان أود"
          />
        </div>

        <div className="field">
          <span>التصنيف</span>
          <select
            value={draft.category}
            onChange={(event) => setDraft((prev) => ({ ...prev, category: event.target.value }))}
          >
            {categoryOptions.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <span>السعر</span>
          <input
            value={draft.price}
            onChange={(event) => setDraft((prev) => ({ ...prev, price: event.target.value }))}
            placeholder="599"
          />
        </div>

        <div className="field">
          <span>رابط المنتج</span>
          <input
            value={draft.url}
            onChange={(event) => setDraft((prev) => ({ ...prev, url: event.target.value }))}
            placeholder="https://store.example/products/..."
          />
        </div>

        <div className="field">
          <span>رابط صورة المنتج</span>
          <input
            value={draft.imageUrl}
            onChange={(event) => setDraft((prev) => ({ ...prev, imageUrl: event.target.value }))}
            placeholder="https://store.example/products/image.jpg"
          />
        </div>

        <div className="field">
          <span>رابط فيديو المنتج</span>
          <input
            value={draft.videoUrl}
            onChange={(event) => setDraft((prev) => ({ ...prev, videoUrl: event.target.value }))}
            placeholder="https://store.example/products/video.mp4"
          />
        </div>

        <div className="field wide">
          <span>وصف المنتج</span>
          <textarea
            value={draft.description}
            onChange={(event) => setDraft((prev) => ({ ...prev, description: event.target.value }))}
            placeholder="اكتب وصف المنتج، فوائده، وما يميزه..."
          />
        </div>

        <div className="field wide">
          <span>خصائص المنتج</span>
          <div className="flag-row">
            {flagOptions.map((flag) => (
              <button
                key={flag}
                type="button"
                className={draft.flags.includes(flag) ? "selected" : ""}
                onClick={() =>
                  setDraft((prev) => ({
                    ...prev,
                    flags: toggleValue(prev.flags, flag),
                  }))
                }
              >
                {flag}
              </button>
            ))}
          </div>
        </div>

        {editingId ? (
          <button type="button" className="secondary-button cancel-edit" onClick={resetDraft}>
            إلغاء التعديل
          </button>
        ) : null}
      </section>

      <section className="toolbar">
        <div className="search">
          <Search size={17} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="بحث في المنتجات..."
          />
        </div>
        <span>{filteredProducts.length} منتج</span>
      </section>

      <section className="layout">
        <article className="table-card">
          <div className="table">
            <div className="head">
              <span>المنتج</span>
              <span>الحالة</span>
              <span>الجاهزية</span>
              <span>التصنيف</span>
              <span>الأصول</span>
              <span>المصدر</span>
              <span>إجراء</span>
            </div>

            {filteredProducts.map((product) => (
              <button
                type="button"
                key={product.id}
                className={`row ${selectedId === product.id ? "selected" : ""}`}
                onClick={() => setSelectedId(product.id)}
              >
                <div className="product-main">
                  <div className="thumb">
                    <ImageIcon size={17} />
                  </div>
                  <div>
                    <strong>{product.name}</strong>
                    <small>{product.category} · {product.price} ر.س</small>
                  </div>
                </div>

                <Status value={product.status} />

                <div className="progress">
                  <i>
                    <b style={{ width: `${product.readiness}%` }} />
                  </i>
                  <small>{product.readiness}%</small>
                </div>

                <span>{product.category}</span>
                <span>{product.assets}</span>
                <span className="source-pill">{product.source}</span>

                <div className="actions">
                  <span
                    onClick={(event) => {
                      event.stopPropagation();
                      editProduct(product);
                    }}
                  >
                    <Edit3 size={14} />
                    تعديل
                  </span>

                  <span
                    className="danger"
                    onClick={(event) => {
                      event.stopPropagation();
                      deleteProduct(product.id);
                    }}
                  >
                    <Trash2 size={14} />
                    حذف
                  </span>
                </div>
              </button>
            ))}
          </div>
        </article>

        <aside className="detail-card">
          <div className="detail-icon">
            <Package size={24} />
          </div>

          <h2>{selectedProduct.name}</h2>
          <p>{selectedProduct.category} · {selectedProduct.price} ر.س</p>

          <Info label="الرابط" value={selectedProduct.url || "غير محدد"} />
          <Info label="التصنيف" value={selectedProduct.category} />
          <Info label="رابط صورة المنتج" value={hasUrl(selectedProduct.imageUrl) ? "صورة متاحة" : "لا توجد صورة"} />
          <Info label="رابط فيديو المنتج" value={hasUrl(selectedProduct.videoUrl) ? "فيديو متاح" : "لا يوجد فيديو"} />
          <Info label="المصدر" value={selectedProduct.source} />
          <Info label="الأصول المرتبطة" value={String(selectedProduct.assets)} />
          <Info label="جاهزية الحملات" value={`${selectedProduct.readiness}%`} />

          <h3>خصائص المنتج</h3>
          <div className="chips">
            {selectedProduct.flags.map((flag) => (
              <span key={flag}>{flag}</span>
            ))}
          </div>

          <h3>قيود الادعاءات</h3>
          <div className="claim-list">
            {selectedProduct.claims.map((claim) => (
              <div key={claim}>
                <AlertTriangle size={15} />
                {claim}
              </div>
            ))}
          </div>
        </aside>
      </section>
    </main>
  );
}

function Stat({ title, value }) {
  return (
    <article className="stat">
      <span>{title}</span>
      <strong>{value}</strong>
    </article>
  );
}

function Status({ value }) {
  const [label, tone] = statusMap[value] || statusMap.draft;
  return <span className={`status ${tone}`}>{label}</span>;
}

function Info({ label, value }) {
  return (
    <div className="info">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

const styles = `
.product-catalog-page {
  min-height: calc(100vh - 80px);
  padding: 24px;
  background: #f7f8f4;
  color: #1f241d;
  font-family: Inter, "Segoe UI", Tahoma, Arial, sans-serif;
}

.page-title,
.stat,
.add-card,
.toolbar,
.table-card,
.detail-card {
  background: #fff;
  border: 1px solid #e4e7df;
  border-radius: 24px;
  box-shadow: 0 8px 26px rgba(24, 38, 18, 0.035);
}

.page-title {
  padding: 20px;
  display: flex;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
}

.eyebrow {
  width: fit-content;
  min-height: 30px;
  padding: 0 11px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  color: #176b2c;
  background: #eef7e9;
  font-size: 12px;
  font-weight: 900;
  margin-bottom: 10px;
}

.page-title h1 {
  margin: 0;
  font-size: 34px;
  letter-spacing: -0.04em;
}

.page-title p {
  color: #6f746b;
  line-height: 1.8;
  margin: 7px 0 0;
}

.title-actions {
  display: flex;
  gap: 10px;
  align-items: flex-start;
}

.primary-button,
.secondary-button {
  min-height: 42px;
  border-radius: 16px;
  padding: 0 16px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-family: inherit;
  font-weight: 900;
  cursor: pointer;
}

.primary-button {
  border: 0;
  background: #176b2c;
  color: #fff;
}

.secondary-button {
  border: 1px solid #e4e7df;
  background: #fff;
  color: #1f241d;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 16px;
}

.stat {
  padding: 16px;
}

.stat span {
  display: block;
  color: #6f746b;
  font-size: 13px;
  font-weight: 900;
}

.stat strong {
  display: block;
  margin-top: 8px;
  font-size: 30px;
}

.add-card {
  padding: 16px;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}

.field {
  display: grid;
  gap: 7px;
}

.field.wide {
  grid-column: 1 / -1;
}

.field span {
  font-size: 12px;
  font-weight: 900;
}

.field input,
.field select,
.field textarea {
  width: 100%;
  box-sizing: border-box;
  border: 1px solid #e4e7df;
  border-radius: 14px;
  padding: 0 12px;
  font-family: inherit;
}

.field input,
.field select {
  height: 42px;
}

.field textarea {
  min-height: 90px;
  padding: 12px;
  line-height: 1.8;
  resize: vertical;
}

.flag-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.flag-row button {
  border: 1px solid #e4e7df;
  background: #fff;
  border-radius: 999px;
  padding: 8px 12px;
  font-family: inherit;
  font-size: 12px;
  font-weight: 900;
  cursor: pointer;
}

.flag-row button.selected {
  color: #176b2c;
  background: #eef7e9;
  border-color: #176b2c;
}

.cancel-edit {
  align-self: end;
}

.toolbar {
  padding: 14px;
  margin-bottom: 16px;
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
}

.search {
  height: 42px;
  border: 1px solid #e4e7df;
  border-radius: 999px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 12px;
  flex: 1;
  color: #94a3b8;
}

.search input {
  border: 0;
  outline: 0;
  background: transparent;
  width: 100%;
  font-family: inherit;
}

.layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 330px;
  gap: 16px;
}

.table-card,
.detail-card {
  padding: 18px;
}

.table {
  border: 1px solid #e4e7df;
  border-radius: 18px;
  overflow: hidden;
}

.head,
.row {
  display: grid;
  grid-template-columns: minmax(220px, 1.35fr) 0.8fr 0.8fr 0.65fr 0.45fr 0.7fr 1fr;
  gap: 10px;
  align-items: center;
  padding: 13px 14px;
}

.head {
  background: #f7f8f4;
  color: #6f746b;
  font-size: 12px;
  font-weight: 900;
}

.row {
  width: 100%;
  border: 0;
  border-top: 1px solid #e4e7df;
  background: #fff;
  text-align: right;
  font-family: inherit;
  cursor: pointer;
}

.row.selected {
  background: #fbfdf9;
}

.product-main {
  display: flex;
  align-items: center;
  gap: 11px;
}

.thumb {
  width: 42px;
  height: 40px;
  border-radius: 14px;
  background: #eef7e9;
  color: #176b2c;
  display: grid;
  place-items: center;
  flex: 0 0 auto;
}

.product-main strong {
  display: block;
}

.product-main small {
  display: block;
  color: #6f746b;
}

.status {
  border-radius: 999px;
  padding: 6px 10px;
  font-size: 11px;
  font-weight: 900;
  width: fit-content;
}

.status.green {
  background: #f0fdf4;
  color: #166534;
}

.status.amber {
  background: #fffbeb;
  color: #92400e;
}

.status.slate {
  background: #f8fafc;
  color: #475569;
}

.status.red {
  background: #fef2f2;
  color: #991b1b;
}

.progress {
  display: flex;
  gap: 7px;
  align-items: center;
}

.progress i {
  width: 70px;
  height: 7px;
  background: #e4e7df;
  border-radius: 999px;
  overflow: hidden;
}

.progress b {
  height: 100%;
  display: block;
  background: #176b2c;
}

.progress small {
  font-weight: 900;
}

.source-pill {
  width: fit-content;
  border: 1px solid #e4e7df;
  border-radius: 999px;
  padding: 5px 8px;
  font-size: 10px;
  font-weight: 900;
}

.actions {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.actions span {
  border: 1px solid #e4e7df;
  border-radius: 999px;
  padding: 5px 8px;
  font-size: 10px;
  font-weight: 900;
  display: flex;
  gap: 4px;
  align-items: center;
}

.actions .danger {
  color: #991b1b;
  background: #fef2f2;
  border-color: #fecaca;
}

.detail-card h2 {
  margin: 12px 0 0;
}

.detail-card p {
  color: #6f746b;
}

.detail-icon {
  width: 54px;
  height: 54px;
  background: #176b2c;
  color: #fff;
  border-radius: 18px;
  display: grid;
  place-items: center;
}

.info {
  min-height: 42px;
  border-bottom: 1px solid #e4e7df;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.info span {
  color: #6f746b;
  font-size: 12px;
  font-weight: 900;
}

.detail-card h3 {
  margin: 18px 0 10px;
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
}

.chips span {
  border: 1px solid #e4e7df;
  border-radius: 999px;
  padding: 6px 10px;
  font-size: 11px;
  font-weight: 900;
}

.claim-list {
  display: grid;
  gap: 8px;
}

.claim-list div {
  border: 1px solid #fde68a;
  background: #fff7e6;
  color: #92400e;
  border-radius: 14px;
  padding: 10px;
  display: flex;
  gap: 7px;
  font-size: 12px;
  font-weight: 800;
}

@media (max-width: 1100px) {
  .stats-grid,
  .add-card,
  .layout {
    grid-template-columns: 1fr;
  }

  .table {
    overflow: auto;
  }

  .head,
  .row {
    min-width: 980px;
  }
}
`;
