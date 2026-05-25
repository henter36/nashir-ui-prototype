import React, { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  Eye,
  FileImage,
  FileText,
  Filter,
  FolderOpen,
  ImagePlus,
  Link2,
  Search,
  Sparkles,
  UploadCloud,
  Video,
} from "lucide-react";

import {
  getAssetQualityLabel,
  getAssetRightsLabel,
  getAssetStatusLabel,
  getAssetTypeLabel,
  readAssetLibrary,
} from "../utils/assetLibraryStore.js";
import { readProductCatalog } from "../utils/productCatalogStore.js";

const assetsSeed = [
  {
    id: "ast-001",
    name: "صورة عطر أرابيان أود الرئيسية",
    type: "image",
    url: "https://store.example/assets/oud-main.jpg",
    thumbnailUrl: "https://store.example/assets/oud-main-thumb.jpg",
    linkedType: "product",
    linkedName: "عطر أرابيان أود",
    channel: "Instagram",
    rightsStatus: "allowed",
    quality: "high",
    usage: ["إطلاق مجموعة الصيف", "خصومات العيد"],
    status: "ready",
    size: "1.8MB",
    updatedAt: "منذ ساعتين",
    tags: ["منتج", "إعلان", "Instagram"],
    notes: "صورة رئيسية مناسبة للإعلانات الثابتة.",
  },
  {
    id: "ast-002",
    name: "فيديو قصير لعرض المنتج",
    type: "video",
    url: "https://store.example/assets/oud-short.mp4",
    thumbnailUrl: "https://store.example/assets/oud-short-thumb.jpg",
    linkedType: "product",
    linkedName: "عطر أرابيان أود",
    channel: "TikTok",
    rightsStatus: "needs_check",
    quality: "medium",
    usage: ["إطلاق مجموعة الصيف"],
    status: "review",
    size: "18MB",
    updatedAt: "منذ 6 ساعات",
    tags: ["Reel", "TikTok", "Launch"],
    notes: "يحتاج تأكيد حقوق الاستخدام قبل النشر.",
  },
  {
    id: "ast-003",
    name: "شعار المتجر PNG",
    type: "logo",
    url: "https://store.example/assets/logo.png",
    thumbnailUrl: "https://store.example/assets/logo-thumb.png",
    linkedType: "general",
    linkedName: "Brand",
    channel: "كل القنوات",
    rightsStatus: "allowed",
    quality: "high",
    usage: ["كل الحملات"],
    status: "ready",
    size: "240KB",
    updatedAt: "منذ يوم",
    tags: ["Logo", "Brand"],
    notes: "شعار معتمد للاستخدام العام.",
  },
  {
    id: "ast-004",
    name: "وصف المنتج النصي",
    type: "text",
    url: "https://store.example/assets/cream-copy.txt",
    thumbnailUrl: "",
    linkedType: "product",
    linkedName: "كريم مرطب نيفيا",
    channel: "Meta",
    rightsStatus: "allowed",
    quality: "medium",
    usage: ["عرض نهاية الأسبوع"],
    status: "review",
    size: "12KB",
    updatedAt: "منذ يومين",
    tags: ["Copy", "Product"],
    notes: "نص قابل للمراجعة قبل استخدامه في الحملة.",
  },
];

const typeMap = {
  image: { label: "صورة", icon: FileImage },
  video: { label: "فيديو", icon: Video },
  logo: { label: "شعار", icon: FileImage },
  document: { label: "مستند", icon: FileText },
  text: { label: "نص", icon: FileText },
  design: { label: "تصميم", icon: FileImage },
};

const statusMap = {
  ready: { label: "جاهز", className: "green" },
  review: { label: "يحتاج مراجعة", className: "amber" },
  rejected: { label: "مرفوض", className: "red" },
  archived: { label: "مؤرشف", className: "slate" },
};

const filters = [
  ["all", "الكل"],
  ["image", "صور"],
  ["video", "فيديو"],
  ["logo", "شعارات"],
  ["document", "نصوص/ملفات"],
  ["text", "نصوص"],
  ["design", "تصاميم"],
];

function buildAssetGaps(products = [], assets = []) {
  const gaps = [];

  products.slice(0, 6).forEach((product) => {
    const flags = product.flags || [];
    const linkedAssets = assets.filter(
      (asset) => asset.linkedType === "product" && asset.linkedName === product.name
    );
    const hasImageAsset = linkedAssets.some((asset) => asset.type === "image") || Boolean(product.imageUrl);
    const hasVideoAsset = linkedAssets.some((asset) => asset.type === "video") || Boolean(product.videoUrl);
    const videoReady = flags.includes("يصلح للفيديو") || flags.includes("يحتاج شرحًا") || Boolean(product.videoUrl);

    if (!hasImageAsset) {
      gaps.push({
        productName: product.name || "منتج غير محدد",
        missingType: "صورة منتج",
        reason: "الصورة تساعد في تجهيز حملة أو معاينة منتج واضحة.",
        priority: Number(product.readiness || 0) >= 70 ? "مرتفعة" : "متوسطة",
      });
    }

    if (videoReady && !hasVideoAsset) {
      gaps.push({
        productName: product.name || "منتج غير محدد",
        missingType: "فيديو قصير",
        reason: "المنتج مناسب للشرح أو العرض المرئي ويحتاج أصل فيديو قبل التوسع.",
        priority: "مرتفعة",
      });
    }
  });

  if (!gaps.length) {
    assets
      .filter((asset) => asset.linkedType !== "product")
      .slice(0, 2)
      .forEach((asset) => {
        gaps.push({
          productName: "أصل عام يمكن ربطه لاحقًا",
          missingType: getAssetTypeLabel(asset.type),
          reason: "الأصل متاح كخيار عام ويمكن ربطه بمنتج أو حملة لاحقًا.",
          priority: asset.rightsStatus === "allowed" ? "منخفضة" : "متوسطة",
        });
      });
  }

  return gaps;
}

export default function AssetLibraryPage() {
  const [assets, setAssets] = useState(() => readAssetLibrary(assetsSeed));
  const [products, setProducts] = useState(() => readProductCatalog([]));
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [selectedId, setSelectedId] = useState(() => readAssetLibrary(assetsSeed)[0]?.id || assetsSeed[0].id);
  const [uploadOpen, setUploadOpen] = useState(false);

  useEffect(() => {
    const refreshAssets = () => {
      const next = readAssetLibrary(assetsSeed);
      setAssets(next);
      setSelectedId((current) => current || next[0]?.id || assetsSeed[0].id);
    };

    window.addEventListener("focus", refreshAssets);
    window.addEventListener("storage", refreshAssets);
    window.addEventListener("nashir-asset-library-updated", refreshAssets);

    return () => {
      window.removeEventListener("focus", refreshAssets);
      window.removeEventListener("storage", refreshAssets);
      window.removeEventListener("nashir-asset-library-updated", refreshAssets);
    };
  }, []);

  useEffect(() => {
    const refreshProducts = () => {
      setProducts(readProductCatalog([]));
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

  const filteredAssets = useMemo(() => {
    return assets.filter((asset) => {
      const matchesQuery = `${asset.name} ${asset.linkedName} ${asset.channel} ${(asset.tags || []).join(" ")}`
        .toLowerCase()
        .includes(query.toLowerCase());
      const matchesFilter = filter === "all" || asset.type === filter;
      return matchesQuery && matchesFilter;
    });
  }, [assets, query, filter]);

  const selectedAsset = assets.find((asset) => asset.id === selectedId) || assets[0] || assetsSeed[0];

  const stats = useMemo(() => {
    return {
      total: assets.length,
      images: assets.filter((item) => item.type === "image").length,
      videos: assets.filter((item) => item.type === "video").length,
      reusable: assets.filter((item) => item.status === "ready").length,
    };
  }, [assets]);

  const SelectedIcon = typeMap[selectedAsset.type]?.icon || FileText;
  const assetGaps = useMemo(() => buildAssetGaps(products, assets), [products, assets]);
  const selectedAssetGap = selectedAsset?.linkedType === "product"
    ? assetGaps.find((gap) => gap.productName === selectedAsset.linkedName) || {
      productName: selectedAsset.linkedName || "منتج غير محدد",
      missingType: "لا يوجد نقص واضح",
      reason: "الأصل الحالي مرتبط بمنتج ويمكن استخدامه بعد مراجعة الحالة والحقوق.",
      priority: selectedAsset.rightsStatus === "allowed" ? "متوسطة" : "مرتفعة",
    }
    : {
      productName: "أصل عام يمكن ربطه لاحقًا",
      missingType: "ربط بمنتج",
      reason: "الأصل غير مرتبط بمنتج محدد ويمكن اختياره لاحقًا حسب الحملة.",
      priority: "منخفضة",
    };

  return (
    <main className="asset-library-page" dir="rtl">
      <style>{styles}</style>

      <section className="page-title">
        <div>
          <div className="eyebrow">
            <FolderOpen size={15} />
            Asset Library
          </div>
          <h1>مكتبة الأصول</h1>
          <p>
            مركز واحد للصور، الفيديو، الشعار، والنصوص المرجعية حتى لا تتكرر
            عمليات الرفع داخل كل حملة. مكتبة الأصول تحفظ الصور والفيديوهات القابلة للاستخدام.
          </p>
        </div>

        <button type="button" className="primary-action" onClick={() => setUploadOpen((value) => !value)}>
          <UploadCloud size={17} />
          رفع أصل جديد
        </button>
      </section>

      {uploadOpen ? (
        <section className="upload-panel">
          <div className="upload-box">
            <ImagePlus size={28} />
            <strong>اسحب الملفات هنا أو اضغط للرفع</strong>
            <span>صور، فيديو، PDF، ملفات نصية — واجهة فقط حاليًا بدون رفع فعلي.</span>
          </div>

          <div className="upload-guidance">
            <AlertTriangle size={18} />
            <p>
              الرفع الفعلي غير مفعّل حاليًا. هذه الواجهة مخصصة لترتيب معلومات الأصل
              قبل أي معالجة لاحقة.
            </p>
          </div>
        </section>
      ) : null}

      <section className="stats-grid">
        <Stat title="إجمالي الأصول" value={stats.total} icon={FolderOpen} />
        <Stat title="الصور" value={stats.images} icon={FileImage} />
        <Stat title="الفيديو" value={stats.videos} icon={Video} />
        <Stat title="قابلة لإعادة الاستخدام" value={stats.reusable} icon={CheckCircle2} />
      </section>

      <section className="toolbar-card">
        <div className="search-box">
            <Search size={17} />
          <input
            value={query}
            placeholder="ابحث باسم الأصل، الارتباط، أو الوسوم..."
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>

        <div className="filter-row">
          {filters.map(([id, label]) => (
            <button
              key={id}
              type="button"
              className={filter === id ? "active" : ""}
              onClick={() => setFilter(id)}
            >
              {label}
            </button>
          ))}
        </div>

        <button type="button" className="secondary-action">
          <Filter size={16} />
          فلترة
        </button>
      </section>

      <section className="assets-layout">
        <article className="assets-grid-card">
          <div className="card-header">
            <div>
              <h2>الأصول</h2>
              <p>اختر أصلًا لرؤية تفاصيل استخدامه وربطه بالحملات.</p>
            </div>
            <span>{filteredAssets.length} أصل</span>
          </div>

          <div className="asset-grid">
            {filteredAssets.map((asset) => {
              const Icon = typeMap[asset.type]?.icon || FileText;
              const status = statusMap[asset.status] || statusMap.review;

              return (
                <button
                  key={asset.id}
                  type="button"
                  className={`asset-card ${selectedId === asset.id ? "selected" : ""}`}
                  onClick={() => setSelectedId(asset.id)}
                >
                  <div className={`asset-preview ${asset.type}`}>
                    <Icon size={28} />
                  </div>

                  <div className="asset-body">
                    <strong>{asset.name}</strong>
                    <span>{getAssetProductLinkLabel(asset)}</span>
                  </div>

                  <div className="asset-meta">
                    <span className={`status-pill ${status.className}`}>
                      {getAssetStatusLabel(asset.status)}
                    </span>
                    <small>{asset.size}</small>
                  </div>
                </button>
              );
            })}
          </div>
        </article>

        <aside className="asset-detail-card">
          <div className="detail-preview">
            <SelectedIcon size={42} />
          </div>

          <h2>{selectedAsset.name}</h2>
          <p>{getAssetTypeLabel(selectedAsset.type)} · {getAssetProductLinkLabel(selectedAsset)}</p>

          <Info label="نوع الأصل" value={getAssetTypeLabel(selectedAsset.type)} />
          <Info label="رابط الأصل" value={selectedAsset.url || "غير محدد"} />
          <Info label="صورة مصغرة" value={selectedAsset.thumbnailUrl ? "متاحة" : "غير محددة"} />
          <Info label="مرتبط بالمنتج" value={getAssetProductLinkLabel(selectedAsset)} />
          <Info label="الحالة" value={getAssetStatusLabel(selectedAsset.status)} />
          <Info label="حالة الحقوق" value={getAssetRightsLabel(selectedAsset.rightsStatus)} />
          <Info label="الجودة" value={getAssetQualityLabel(selectedAsset.quality)} />
          <Info label="قناة الاستخدام" value={selectedAsset.channel || "غير محدد"} />
          <Info label="الحجم" value={selectedAsset.size} />
          <Info label="آخر تحديث" value={selectedAsset.updatedAt} />

          <div className="detail-section">
            <h3>الاستخدام في الحملات</h3>
            <div className="usage-list">
              {(selectedAsset.usage || []).map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
          </div>

          <div className="detail-section">
            <h3>الوسوم</h3>
            <div className="tag-list">
              {(selectedAsset.tags || []).map((tag) => (
                <span key={tag}>#{tag}</span>
              ))}
            </div>
          </div>

          <div className="detail-section asset-gap-section">
            <h3>فجوات الأصول المطلوبة</h3>
            <p>هذه توصيات واجهية مشتقة من بيانات الإعداد الحالية، وليست تحليلًا إنتاجيًا.</p>
            <Info label="المنتج المرتبط أو العام" value={selectedAssetGap.productName} />
            <Info label="نوع الأصل الناقص" value={selectedAssetGap.missingType} />
            <Info label="سبب الحاجة" value={selectedAssetGap.reason} />
            <Info label="أولوية الاستكمال" value={selectedAssetGap.priority} />
          </div>

          <div className="detail-actions">
            <button type="button" className="secondary-action full">
              <Eye size={16} />
              معاينة
            </button>
            <button type="button" className="secondary-action full">
              <Link2 size={16} />
              ربط بحملة
            </button>
            <button type="button" className="secondary-action full">
              <Download size={16} />
              تنزيل
            </button>
          </div>

          <div className="warning-box">
            <Sparkles size={18} />
            <p>
              تُستخدم هذه المكتبة لتنظيم الأصول القابلة للمراجعة وإعادة الاستخدام.
            </p>
          </div>
        </aside>
      </section>
    </main>
  );
}

function Stat({ title, value, icon: Icon }) {
  return (
    <article className="stat-card">
      <div>
        <span>{title}</span>
        <strong>{value}</strong>
      </div>
      <div className="stat-icon">
        <Icon size={21} />
      </div>
    </article>
  );
}

function Info({ label, value }) {
  return (
    <div className="info-row">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function getAssetProductLinkLabel(asset = {}) {
  if (asset.linkedType === "product" && asset.linkedName) {
    return `مرتبط بالمنتج: ${asset.linkedName}`;
  }

  return "عام / غير مرتبط بمنتج";
}

const styles = `
.asset-library-page {
  min-height: calc(100vh - 80px);
  padding: 24px;
  background:
    radial-gradient(circle at top right, rgba(37, 99, 235, 0.05), transparent 32%),
    #f7f8f4;
  color: #1f241d;
  font-family: Inter, "Segoe UI", Tahoma, Arial, sans-serif;
}

.page-title,
.upload-panel,
.stat-card,
.toolbar-card,
.assets-grid-card,
.asset-detail-card {
  border: 1px solid #e4e7df;
  background: #ffffff;
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
  line-height: 1.2;
  letter-spacing: -0.04em;
}

.page-title p {
  margin: 7px 0 0;
  max-width: 760px;
  color: #6f746b;
  line-height: 1.8;
  font-size: 14px;
}

.primary-action,
.secondary-action {
  min-height: 42px;
  border-radius: 16px;
  padding: 0 16px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-family: inherit;
  font-weight: 900;
  cursor: pointer;
}

.primary-action {
  color: #fff;
  background: #176b2c;
  border: 0;
  box-shadow: 0 12px 24px rgba(23, 107, 44, 0.16);
}

.secondary-action {
  background: #fff;
  color: #1f241d;
  border: 1px solid #e4e7df;
}

.full {
  width: 100%;
}

.upload-panel {
  padding: 16px;
  margin-bottom: 16px;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 360px;
  gap: 14px;
}

.upload-box {
  min-height: 150px;
  border: 1px dashed #9fd0a6;
  background: #eef7e9;
  color: #176b2c;
  border-radius: 20px;
  display: grid;
  place-items: center;
  text-align: center;
  align-content: center;
  gap: 8px;
}

.upload-box strong {
  display: block;
  font-size: 16px;
}

.upload-box span {
  color: #4b6b52;
  font-size: 12px;
}

.upload-guidance {
  border: 1px solid #fde68a;
  background: #fff7e6;
  color: #92400e;
  border-radius: 20px;
  padding: 14px;
  display: flex;
  gap: 10px;
  align-items: flex-start;
}

.upload-guidance p {
  margin: 0;
  line-height: 1.8;
  font-size: 13px;
  font-weight: 800;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 16px;
}

.stat-card {
  min-height: 106px;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  gap: 14px;
  align-items: center;
}

.stat-card span {
  color: #6f746b;
  font-size: 13px;
  font-weight: 900;
}

.stat-card strong {
  display: block;
  margin-top: 8px;
  font-size: 32px;
  line-height: 1;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 16px;
  display: grid;
  place-items: center;
  color: #176b2c;
  background: #eef7e9;
}

.toolbar-card {
  min-height: 70px;
  padding: 14px;
  display: grid;
  grid-template-columns: minmax(260px, 1fr) auto auto;
  gap: 12px;
  align-items: center;
  margin-bottom: 16px;
}

.search-box {
  height: 44px;
  border: 1px solid #e4e7df;
  background: #fff;
  border-radius: 999px;
  padding: 0 13px;
  display: flex;
  align-items: center;
  gap: 9px;
  color: #94a3b8;
}

.search-box input {
  width: 100%;
  border: 0;
  outline: 0;
  background: transparent;
  font-family: inherit;
}

.filter-row {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
}

.filter-row button {
  min-height: 36px;
  border: 1px solid #e4e7df;
  background: #fff;
  border-radius: 999px;
  padding: 0 12px;
  font-family: inherit;
  font-size: 12px;
  font-weight: 900;
  cursor: pointer;
}

.filter-row button.active {
  color: #176b2c;
  background: #eef7e9;
  border-color: #176b2c;
}

.assets-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 330px;
  gap: 16px;
  align-items: start;
}

.assets-grid-card,
.asset-detail-card {
  padding: 18px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  gap: 14px;
  margin-bottom: 16px;
}

.card-header h2,
.asset-detail-card h2 {
  margin: 0;
  font-size: 18px;
}

.card-header p,
.asset-detail-card p {
  margin: 5px 0 0;
  color: #6f746b;
  font-size: 12px;
}

.card-header > span {
  color: #176b2c;
  background: #eef7e9;
  border-radius: 999px;
  padding: 6px 10px;
  font-size: 12px;
  font-weight: 900;
}

.asset-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.asset-card {
  min-height: 210px;
  border: 1px solid #e4e7df;
  background: #fff;
  border-radius: 20px;
  padding: 12px;
  text-align: right;
  font-family: inherit;
  cursor: pointer;
}

.asset-card.selected {
  border-color: #176b2c;
  background: #fbfdf9;
  box-shadow: 0 0 0 4px #eef7e9;
}

.asset-preview {
  height: 105px;
  border-radius: 16px;
  display: grid;
  place-items: center;
  margin-bottom: 12px;
}

.asset-preview.image {
  color: #176b2c;
  background: linear-gradient(135deg, #eef7e9, #ffffff);
}

.asset-preview.video {
  color: #2563eb;
  background: #eff6ff;
}

.asset-preview.document {
  color: #92400e;
  background: #fff7e6;
}

.asset-body strong {
  display: block;
  font-size: 13px;
  line-height: 1.5;
}

.asset-body span {
  display: block;
  color: #6f746b;
  font-size: 11px;
  margin-top: 4px;
}

.asset-meta {
  margin-top: 10px;
  display: flex;
  justify-content: space-between;
  gap: 8px;
  align-items: center;
}

.asset-meta small {
  color: #6f746b;
  font-size: 11px;
}

.status-pill {
  width: fit-content;
  min-height: 26px;
  padding: 0 9px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  font-size: 11px;
  font-weight: 900;
}

.status-pill.green {
  color: #166534;
  background: #f0fdf4;
}

.status-pill.amber {
  color: #92400e;
  background: #fffbeb;
}

.status-pill.red {
  color: #991b1b;
  background: #fef2f2;
}

.status-pill.slate {
  color: #475569;
  background: #f8fafc;
}

.detail-preview {
  min-height: 150px;
  border: 1px solid #e4e7df;
  background: #f7f8f4;
  border-radius: 20px;
  display: grid;
  place-items: center;
  color: #176b2c;
  margin-bottom: 16px;
}

.info-row {
  min-height: 44px;
  border-bottom: 1px solid #e4e7df;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.info-row span {
  color: #6f746b;
  font-size: 12px;
  font-weight: 900;
}

.info-row strong {
  font-size: 13px;
}

.detail-section {
  margin-top: 16px;
}

.detail-section h3 {
  margin: 0 0 10px;
  font-size: 15px;
}

.asset-gap-section {
  border: 1px solid #d9ead7;
  background: #eef7e9;
  border-radius: 18px;
  padding: 12px;
}

.asset-gap-section p {
  margin: 0 0 8px;
  color: #52604c;
  line-height: 1.7;
  font-size: 12px;
  font-weight: 800;
}

.asset-gap-section .info-row {
  border-bottom-color: #d9ead7;
}

.usage-list,
.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
}

.usage-list span,
.tag-list span {
  border: 1px solid #e4e7df;
  background: #fff;
  border-radius: 999px;
  padding: 5px 9px;
  font-size: 11px;
  font-weight: 900;
}

.tag-list span {
  color: #176b2c;
  background: #eef7e9;
  border-color: #d9ead7;
}

.detail-actions {
  display: grid;
  gap: 9px;
  margin-top: 16px;
}

.warning-box {
  margin-top: 16px;
  border: 1px solid #fde68a;
  background: #fff7e6;
  color: #92400e;
  border-radius: 18px;
  padding: 13px;
  display: flex;
  gap: 9px;
  align-items: flex-start;
}

.warning-box p {
  margin: 0;
  font-size: 12px;
  line-height: 1.8;
  font-weight: 800;
}

@media (max-width: 1180px) {
  .stats-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .toolbar-card,
  .assets-layout,
  .upload-panel {
    grid-template-columns: 1fr;
  }

  .asset-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 760px) {
  .asset-library-page {
    padding: 16px;
  }

  .page-title {
    align-items: stretch;
    flex-direction: column;
  }

  .page-title h1 {
    font-size: 27px;
  }

  .stats-grid,
  .asset-grid {
    grid-template-columns: 1fr;
  }
}
`;
