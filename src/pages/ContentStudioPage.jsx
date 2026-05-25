import React, { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  CircleAlert,
  Clock3,
  Copy,
  Eye,
  FileText,
  ImageIcon,
  Mail,
  MessageCircle,
  PenLine,
  PlayCircle,
  RefreshCw,
  Save,
  Send,
  Sparkles,
} from "lucide-react";
import {
  readCampaignContent,
  upsertCampaignContentItem,
} from "../utils/campaignContentStore.js";
import {
  getActivePrompts,
  getApprovedTemplates,
} from "../utils/promptTemplateStore.js";

const initialItems = [
  {
    id: "ad-copy",
    title: "نص إعلان قصير",
    type: "نص إعلاني",
    channel: "Instagram / Snapchat",
    icon: FileText,
    status: "draft",
    content:
      "اكتشف مجموعة مختارة بعناية تمنحك تجربة مختلفة وجودة تستحق التجربة. اطلب الآن واستفد من العرض المحدود قبل انتهاء الكمية.",
  },
  {
    id: "instagram-post",
    title: "منشور Instagram",
    type: "منشور اجتماعي",
    channel: "Instagram",
    icon: ImageIcon,
    status: "needs_review",
    content:
      "منتجك اليومي بتفاصيل أجمل.\n\nصُمم هذا العرض لمن يبحث عن جودة واضحة، مظهر أنيق، وتجربة شراء سهلة.\n\nاكتشف المجموعة الآن وشاركنا رأيك.",
  },
  {
    id: "short-video",
    title: "سكريبت فيديو قصير",
    type: "فيديو قصير",
    channel: "TikTok / Reels",
    icon: PlayCircle,
    status: "draft",
    content:
      "المشهد 1: لقطة قريبة للمنتج مع سؤال سريع: هل تبحث عن خيار يجمع الجودة والشكل؟\n\nالمشهد 2: عرض أهم التفاصيل والميزة الأساسية.\n\nالمشهد 3: دعوة مباشرة: اطلبه الآن قبل انتهاء العرض.",
  },
  {
    id: "whatsapp",
    title: "رسالة WhatsApp",
    type: "رسالة مباشرة",
    channel: "WhatsApp",
    icon: MessageCircle,
    status: "ready",
    content:
      "مرحبًا، جهزنا لك عرضًا خاصًا لفترة محدودة. يمكنك مشاهدة التفاصيل والطلب مباشرة من الرابط. يسعدنا خدمتك.",
  },
  {
    id: "email",
    title: "بريد إلكتروني",
    type: "Email",
    channel: "Email",
    icon: Mail,
    status: "needs_review",
    content:
      "العنوان: عرض جديد يستحق التجربة\n\nمرحبًا،\n\nنشاركك اليوم مجموعة مختارة بعناية لتمنحك تجربة أفضل وجودة أوضح. العرض متاح لفترة محدودة ويمكنك الطلب بسهولة من المتجر.\n\nتحياتنا.",
  },
];

const statusMap = {
  draft: {
    label: "مسودة",
    className: "draft",
    icon: Clock3,
  },
  needs_review: {
    label: "يحتاج مراجعة",
    className: "needs-review",
    icon: Eye,
  },
  ready: {
    label: "جاهز للمراجعة",
    className: "ready",
    icon: CheckCircle2,
  },
};


function getSafeContentIcon(item) {
  if (typeof item?.icon === "function") return item.icon;

  const text = `${item?.type || ""} ${item?.channel || ""} ${item?.title || ""}`.toLowerCase();

  if (text.includes("video") || text.includes("reel") || text.includes("فيديو")) return PlayCircle;
  if (text.includes("email") || text.includes("بريد")) return Mail;
  if (text.includes("whatsapp") || text.includes("واتساب")) return MessageCircle;
  if (text.includes("image") || text.includes("post") || text.includes("منشور") || text.includes("صورة")) return ImageIcon;

  return FileText;
}

function getSafeStatusConfig(status) {
  return statusMap[status] || statusMap.draft || {
    label: "مسودة",
    className: "draft",
    icon: Clock3,
  };
}

export default function ContentStudioPage() {
  const [items, setItems] = useState(() => readCampaignContent(initialItems));
  const [approvedTemplates, setApprovedTemplates] = useState(() => getApprovedTemplates([]));
  const [activePrompts, setActivePrompts] = useState(() => getActivePrompts([]));
  const [activeItemId, setActiveItemId] = useState(initialItems[0].id);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const reloadItems = () => {
      setItems(readCampaignContent(initialItems));
    };

    window.addEventListener("focus", reloadItems);
    window.addEventListener("storage", reloadItems);
    window.addEventListener("nashir-campaign-content-updated", reloadItems);

    return () => {
      window.removeEventListener("focus", reloadItems);
      window.removeEventListener("storage", reloadItems);
      window.removeEventListener("nashir-campaign-content-updated", reloadItems);
    };
  }, []);

  useEffect(() => {
    const reloadPromptTemplateReadiness = () => {
      setApprovedTemplates(getApprovedTemplates([]));
      setActivePrompts(getActivePrompts([]));
    };

    window.addEventListener("focus", reloadPromptTemplateReadiness);
    window.addEventListener("storage", reloadPromptTemplateReadiness);
    window.addEventListener("nashir-template-engine-updated", reloadPromptTemplateReadiness);
    window.addEventListener("nashir-prompt-governance-updated", reloadPromptTemplateReadiness);

    return () => {
      window.removeEventListener("focus", reloadPromptTemplateReadiness);
      window.removeEventListener("storage", reloadPromptTemplateReadiness);
      window.removeEventListener("nashir-template-engine-updated", reloadPromptTemplateReadiness);
      window.removeEventListener("nashir-prompt-governance-updated", reloadPromptTemplateReadiness);
    };
  }, []);

  const emptyContentItem = {
    id: "empty-content",
    title: "محتوى غير محدد",
    type: "محتوى",
    channel: "عام",
    status: "draft",
    content: "",
  };

  const visibleItems = useMemo(() => {
    return items.length ? items : initialItems;
  }, [items]);

  const activeItem = useMemo(() => {
    return (
      visibleItems.find((item) => item.id === activeItemId) ||
      visibleItems[0] ||
      initialItems[0] ||
      emptyContentItem
    );
  }, [visibleItems, activeItemId]);

  const stats = useMemo(() => {
    return {
      total: items.length,
      draft: items.filter((item) => item.status === "draft").length,
      needsReview: items.filter((item) => item.status === "needs_review").length,
      ready: items.filter((item) => item.status === "ready").length,
    };
  }, [items]);

  const updateActiveContent = (value) => {
    const updatedItem = {
      ...activeItem,
      content: value,
      status: activeItem.status === "ready" ? "needs_review" : activeItem.status,
    };
    const next = upsertCampaignContentItem(updatedItem, initialItems);

    setItems(next);

    setSaved(false);
    setCopied(false);
  };

  const updateStatus = (status) => {
    const updatedItem = {
      ...activeItem,
      status,
    };
    const next = upsertCampaignContentItem(updatedItem, initialItems);

    setItems(next);

    setSaved(false);
  };

  const copyContent = async () => {
    try {
      await navigator.clipboard.writeText(activeItem.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  const saveLocalDraft = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
  };

  const resetContent = () => {
    const original = initialItems.find((item) => item.id === activeItem.id);

    if (!original) return;

    const next = upsertCampaignContentItem(original, initialItems);

    setItems(next);

    setSaved(false);
    setCopied(false);
  };

  const ActiveIcon = getSafeContentIcon(activeItem);
  const activeStatus = getSafeStatusConfig(activeItem?.status);
  const StatusIcon = activeStatus.icon;
  const activeCampaignName = activeItem?.campaign || "حملة غير محددة";
  const activeReviewReadiness =
    activeItem?.status === "ready" || activeItem?.status === "needs_review"
      ? "جاهزة للمراجعة"
      : "تحتاج تحريرًا قبل المراجعة";

  return (
    <main className="content-studio-page" dir="rtl">
      <style>{styles}</style>

      <section className="studio-hero">
        <div className="hero-content">
          <div className="eyebrow">
            <Sparkles size={16} />
            استوديو المحتوى
          </div>

          <h1>مراجعة وتحرير مخرجات الحملة قبل الاعتماد</h1>

          <p>
            هذه الشاشة تمثل مساحة العمل التي يرى فيها المستخدم مخرجات الحملة،
            يعدل النصوص، يغير حالة المراجعة، ويجهز المواد قبل أي نشر أو إرسال.
          </p>

          <div className="hero-alert">
            <CircleAlert size={18} />
            <span>
              لا يوجد نشر فعلي، ولا إرسال WhatsApp أو Email، ولا حفظ في قاعدة
              بيانات. كل ما يحدث هنا محلي وتجريبي للمراجعة البصرية.
            </span>
          </div>

          <section className="screen-guidance-card">
            <div><span>هدف الشاشة</span><strong>تحرير مخرجات الحملة وتجهيزها للمراجعة.</strong></div>
            <div><span>المدخلات</span><strong>مخرجات الحملة، القناة، نوع المحتوى، الملاحظات.</strong></div>
            <div><span>المخرجات</span><strong>نسخة محتوى قابلة للمراجعة.</strong></div>
            <div><span>الإجراء التالي</span><strong>حفظ التعديل أو إرسال المحتوى للمراجعة.</strong></div>
            <div><span>ما لا يحدث هنا</span><strong>لا توجد جدولة أو اعتماد نهائي هنا.</strong></div>
          </section>

          <div className="campaign-output-note">
            <strong>مخرجات الحملة</strong>
            <span>هذه مخرجات واجهية تجريبية، وهي مخرجات أولية قابلة للمراجعة وليست نتيجة توليد أو تنفيذ حقيقي.</span>
          </div>

          <div className="campaign-output-note social-format-note">
            <strong>صيغ محتوى اجتماعي مقترحة</strong>
            <span>الصيغ هنا مسودات واجهية قابلة للتحرير، وليست توليدًا أو نشرًا حقيقيًا.</span>
            <div className="social-format-grid">
              <span>Instagram Reel</span>
              <span>TikTok short video</span>
              <span>Story caption</span>
              <span>UGC-style hook</span>
              <span>comment reply draft concept</span>
            </div>
          </div>
        </div>

        <div className="stats-card">
          <div className="stats-icon">
            <PenLine size={26} />
          </div>

          <span>إجمالي المخرجات</span>
          <strong>{stats.total}</strong>

          <div className="stats-grid">
            <div>
              <b>{stats.draft}</b>
              <small>مسودة</small>
            </div>
            <div>
              <b>{stats.needsReview}</b>
              <small>تحتاج مراجعة</small>
            </div>
            <div>
              <b>{stats.ready}</b>
              <small>جاهزة</small>
            </div>
          </div>

          <div className="readiness-summary">
            <div>
              <b>{approvedTemplates.length}</b>
              <span>
                {approvedTemplates.length
                  ? "قوالب معتمدة متاحة"
                  : "لا توجد قوالب معتمدة"}
              </span>
            </div>
            <div>
              <b>{activePrompts.length}</b>
              <span>
                {activePrompts.length
                  ? "مطالبات نشطة متاحة"
                  : "لا توجد مطالبات نشطة"}
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="studio-layout">
        <aside className="content-list-panel">
          <div className="panel-header">
            <h2>مخرجات الحملة</h2>
            <p>اختر مادة لمراجعتها وتحريرها.</p>
          </div>

          <div className="content-list">
            {visibleItems.map((item) => {
              const Icon = getSafeContentIcon(item);
              const itemStatus = getSafeStatusConfig(item.status);
              const ItemStatusIcon = itemStatus.icon;
              const active = item.id === activeItemId;

              return (
                <button
                  key={item.id}
                  type="button"
                  className={`content-item ${active ? "active" : ""}`}
                  onClick={() => {
                    setActiveItemId(item.id);
                    setCopied(false);
                    setSaved(false);
                  }}
                >
                  <div className="content-item-icon">
                    <Icon size={20} />
                  </div>

                  <div className="content-item-body">
                    <strong>{item.title}</strong>
                    <span>{item.channel}</span>

                    <div className={`status-pill ${itemStatus.className}`}>
                      <ItemStatusIcon size={14} />
                      {itemStatus.label}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        <section className="editor-panel">
          <div className="editor-header">
            <div className="editor-title">
              <div className="editor-icon">
                <ActiveIcon size={24} />
              </div>

              <div>
                <h2>{activeItem.title}</h2>
              <p>
                {activeItem.type} · {activeItem.channel}
              </p>
            </div>
          </div>

            <div className={`status-badge ${getSafeStatusConfig(activeItem.status).className}`}>
              <StatusIcon size={15} />
              {getSafeStatusConfig(activeItem.status).label}
            </div>
          </div>

          <div className="campaign-output-summary">
            <div><span>الحملة</span><strong>{activeCampaignName}</strong></div>
            <div><span>حالة المحتوى</span><strong>{getSafeStatusConfig(activeItem.status).label}</strong></div>
            <div><span>جاهزية المراجعة</span><strong>{activeReviewReadiness}</strong></div>
          </div>

          <div className="editor-grid">
            <section className="text-editor-card">
              <div className="section-title">
                <h3>النص القابل للتحرير</h3>
                <p>عدّل المخرج كما تريد قبل تحويله للمراجعة.</p>
              </div>

              <textarea
                value={activeItem.content}
                onChange={(event) => updateActiveContent(event.target.value)}
                rows={14}
              />

              <div className="editor-actions">
                <button type="button" className="secondary-button" onClick={resetContent}>
                  <RefreshCw size={17} />
                  استعادة النص
                </button>

                <button type="button" className="secondary-button" onClick={copyContent}>
                  <Copy size={17} />
                  {copied ? "تم النسخ" : "نسخ النص"}
                </button>

                <button type="button" className="primary-button" onClick={saveLocalDraft}>
                  <Save size={17} />
                  حفظ محلي
                </button>
              </div>

              {saved && (
                <div className="success-box">
                  <CheckCircle2 size={18} />
                  تم حفظ التعديل محليًا داخل الواجهة فقط.
                </div>
              )}
            </section>

            <aside className="review-panel">
              <div className="section-title">
                <h3>حالة المراجعة</h3>
                <p>غيّر حالة المادة حسب جاهزيتها.</p>
              </div>

              <div className="status-actions">
                <button
                  type="button"
                  className={`status-action draft ${
                    activeItem.status === "draft" ? "selected" : ""
                  }`}
                  onClick={() => updateStatus("draft")}
                >
                  <Clock3 size={18} />
                  مسودة
                </button>

                <button
                  type="button"
                  className={`status-action needs-review ${
                    activeItem.status === "needs_review" ? "selected" : ""
                  }`}
                  onClick={() => updateStatus("needs_review")}
                >
                  <Eye size={18} />
                  يحتاج مراجعة
                </button>

                <button
                  type="button"
                  className={`status-action ready ${
                    activeItem.status === "ready" ? "selected" : ""
                  }`}
                  onClick={() => updateStatus("ready")}
                >
                  <CheckCircle2 size={18} />
                  جاهز للمراجعة
                </button>
              </div>

              <div className="preview-card">
                <div className="preview-header">
                  <Send size={18} />
                  <strong>معاينة مختصرة</strong>
                </div>

                <p>{activeItem.content}</p>
              </div>

              <div className="governance-note">
                <strong>تنبيه تشغيلي</strong>
                <p>
                  اعتماد المحتوى لا يعني النشر. أي إرسال أو نشر فعلي يجب أن
                  يبقى لاحقًا تحت موافقة بشرية واضحة وسجل تدقيق.
                </p>
              </div>
            </aside>
          </div>
        </section>
      </section>
    </main>
  );
}

const styles = `
.content-studio-page {
  min-height: 100vh;
  background:
    radial-gradient(circle at top right, rgba(16, 185, 129, 0.11), transparent 30%),
    radial-gradient(circle at bottom left, rgba(79, 70, 229, 0.13), transparent 32%),
    #f7f8fb;
  padding: 28px;
  color: #111827;
  font-family: "Inter", "Tajawal", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

.studio-hero {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 340px;
  gap: 20px;
  margin-bottom: 22px;
}

.hero-content,
.stats-card,
.content-list-panel,
.editor-panel {
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(226, 232, 240, 0.95);
  box-shadow: 0 20px 60px rgba(15, 23, 42, 0.07);
  backdrop-filter: blur(18px);
  border-radius: 28px;
}

.hero-content {
  padding: 30px;
}

.eyebrow {
  width: fit-content;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #047857;
  background: #ecfdf5;
  border: 1px solid #bbf7d0;
  border-radius: 999px;
  padding: 8px 12px;
  font-weight: 900;
  font-size: 13px;
  margin-bottom: 18px;
}

.hero-content h1 {
  margin: 0;
  font-size: 34px;
  line-height: 1.25;
  letter-spacing: -0.04em;
  color: #0f172a;
}

.hero-content p {
  max-width: 820px;
  margin: 14px 0 0;
  color: #64748b;
  font-size: 15px;
  line-height: 1.9;
}

.hero-alert {
  margin-top: 20px;
  display: flex;
  gap: 10px;
  align-items: flex-start;
  color: #92400e;
  background: #fffbeb;
  border: 1px solid #fde68a;
  border-radius: 18px;
  padding: 13px 14px;
  font-size: 14px;
  line-height: 1.8;
}

.campaign-output-note {
  margin-top: 12px;
  border: 1px solid #bfdbfe;
  background: #eff6ff;
  color: #1d4ed8;
  border-radius: 18px;
  padding: 12px 14px;
}

.campaign-output-note strong,
.campaign-output-note span {
  display: block;
}

.campaign-output-note span {
  margin-top: 4px;
  line-height: 1.7;
  font-size: 13px;
  font-weight: 800;
}

.social-format-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}

.social-format-grid span {
  margin: 0;
  border: 1px solid #bfdbfe;
  background: #fff;
  color: #1d4ed8;
  border-radius: 999px;
  padding: 6px 9px;
  font-size: 12px;
  font-weight: 900;
}

.stats-card {
  padding: 24px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.stats-icon {
  width: 56px;
  height: 56px;
  display: grid;
  place-items: center;
  border-radius: 20px;
  color: #fff;
  background: linear-gradient(135deg, #059669, #4f46e5);
  margin-bottom: 18px;
}

.stats-card > span {
  color: #64748b;
  font-size: 14px;
}

.stats-card > strong {
  display: block;
  font-size: 42px;
  margin-top: 4px;
  color: #0f172a;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-top: 18px;
}

.stats-grid div {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 12px;
  text-align: center;
}

.stats-grid b {
  display: block;
  font-size: 20px;
  color: #0f172a;
}

.stats-grid small {
  display: block;
  margin-top: 3px;
  color: #64748b;
  font-size: 11px;
}

.readiness-summary {
  display: grid;
  gap: 8px;
  margin-top: 14px;
}

.readiness-summary div {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  border: 1px solid #e2e8f0;
  background: #fff;
  border-radius: 14px;
  padding: 10px 12px;
}

.readiness-summary b {
  color: #047857;
  font-size: 18px;
}

.readiness-summary span {
  color: #475569;
  font-size: 12px;
  font-weight: 800;
  text-align: left;
}

.studio-layout {
  display: grid;
  grid-template-columns: 340px minmax(0, 1fr);
  gap: 20px;
  align-items: start;
}

.content-list-panel {
  padding: 20px;
  position: sticky;
  top: 24px;
}

.panel-header h2,
.section-title h3 {
  margin: 0;
  color: #0f172a;
}

.panel-header p,
.section-title p {
  margin: 6px 0 0;
  color: #64748b;
  line-height: 1.7;
  font-size: 13px;
}

.content-list {
  display: grid;
  gap: 10px;
  margin-top: 18px;
}

.content-item {
  width: 100%;
  display: flex;
  gap: 12px;
  align-items: flex-start;
  text-align: right;
  border: 1px solid #e2e8f0;
  background: #fff;
  border-radius: 20px;
  padding: 14px;
  cursor: pointer;
  transition: 0.2s ease;
}

.content-item:hover {
  background: #f8fafc;
}

.content-item.active {
  border-color: #a7f3d0;
  background: #ecfdf5;
  box-shadow: 0 14px 28px rgba(16, 185, 129, 0.1);
}

.content-item-icon {
  width: 42px;
  height: 42px;
  flex: 0 0 auto;
  display: grid;
  place-items: center;
  border-radius: 16px;
  color: #475569;
  background: #f1f5f9;
}

.content-item.active .content-item-icon {
  color: #fff;
  background: linear-gradient(135deg, #059669, #4f46e5);
}

.content-item-body {
  min-width: 0;
}

.content-item-body strong {
  display: block;
  color: #0f172a;
  font-size: 14px;
}

.content-item-body span {
  display: block;
  color: #64748b;
  font-size: 12px;
  margin-top: 4px;
}

.status-pill,
.status-badge {
  width: fit-content;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border-radius: 999px;
  font-weight: 900;
}

.status-pill {
  margin-top: 10px;
  padding: 6px 9px;
  font-size: 11px;
}

.status-badge {
  padding: 9px 12px;
  font-size: 12px;
}

.draft {
  color: #475569;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
}

.needs-review {
  color: #92400e;
  background: #fffbeb;
  border: 1px solid #fde68a;
}

.ready {
  color: #166534;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
}

.editor-panel {
  padding: 24px;
}

.editor-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 24px;
  padding-bottom: 18px;
  border-bottom: 1px solid #e5e7eb;
}

.campaign-output-summary {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  margin-bottom: 18px;
}

.campaign-output-summary div {
  border: 1px solid #e5e7eb;
  background: #f8fafc;
  border-radius: 16px;
  padding: 11px;
}

.campaign-output-summary span {
  display: block;
  color: #64748b;
  font-size: 12px;
  font-weight: 900;
}

.campaign-output-summary strong {
  display: block;
  margin-top: 5px;
  color: #111827;
  font-size: 13px;
  line-height: 1.5;
}

.editor-title {
  display: flex;
  align-items: center;
  gap: 14px;
}

.editor-icon {
  width: 52px;
  height: 52px;
  display: grid;
  place-items: center;
  border-radius: 18px;
  color: #fff;
  background: linear-gradient(135deg, #111827, #334155);
}

.editor-title h2 {
  margin: 0;
  color: #0f172a;
  font-size: 24px;
  letter-spacing: -0.03em;
}

.editor-title p {
  margin: 4px 0 0;
  color: #64748b;
  font-size: 14px;
}

.editor-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 340px;
  gap: 18px;
  align-items: start;
}

.text-editor-card,
.review-panel {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 24px;
  padding: 20px;
}

textarea {
  width: 100%;
  box-sizing: border-box;
  min-height: 360px;
  margin-top: 16px;
  border: 1px solid #dbe3ef;
  background: #fff;
  border-radius: 18px;
  padding: 16px;
  color: #0f172a;
  outline: none;
  resize: vertical;
  font-size: 15px;
  line-height: 1.9;
  font-family: inherit;
  transition: 0.2s ease;
}

textarea:focus {
  border-color: #10b981;
  box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.12);
}

.editor-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 14px;
}

.primary-button,
.secondary-button {
  border-radius: 16px;
  padding: 12px 16px;
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-weight: 900;
  font-family: inherit;
  cursor: pointer;
  transition: 0.2s ease;
}

.primary-button {
  border: 0;
  color: #fff;
  background: linear-gradient(135deg, #059669, #4f46e5);
  box-shadow: 0 14px 28px rgba(16, 185, 129, 0.18);
}

.secondary-button {
  color: #334155;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
}

.success-box {
  margin-top: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #166534;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 16px;
  padding: 12px;
  font-size: 13px;
  font-weight: 800;
}

.status-actions {
  display: grid;
  gap: 10px;
  margin-top: 16px;
}

.status-action {
  width: 100%;
  min-height: 48px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 10px;
  border-radius: 16px;
  padding: 12px;
  font-family: inherit;
  font-weight: 900;
  cursor: pointer;
  transition: 0.2s ease;
}

.status-action.selected {
  box-shadow: 0 12px 24px rgba(15, 23, 42, 0.08);
}

.preview-card {
  margin-top: 18px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  padding: 16px;
}

.preview-header {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #0f172a;
}

.preview-card p {
  max-height: 220px;
  overflow: auto;
  margin: 12px 0 0;
  color: #334155;
  line-height: 1.9;
  font-size: 14px;
  white-space: pre-line;
}

.governance-note {
  margin-top: 18px;
  color: #92400e;
  background: #fffbeb;
  border: 1px solid #fde68a;
  border-radius: 18px;
  padding: 14px;
}

.governance-note strong {
  display: block;
  margin-bottom: 5px;
}

.governance-note p {
  margin: 0;
  line-height: 1.8;
  font-size: 13px;
}

@media (max-width: 1100px) {
  .studio-hero,
  .studio-layout,
  .editor-grid {
    grid-template-columns: 1fr;
  }

  .content-list-panel {
    position: static;
  }
}

@media (max-width: 640px) {
  .content-studio-page {
    padding: 18px;
  }

  .hero-content h1 {
    font-size: 28px;
  }

  .editor-header,
  .editor-actions {
    align-items: stretch;
    flex-direction: column;
  }

  .primary-button,
  .secondary-button {
    width: 100%;
  }
}

.screen-guidance-card {
  background: #fff;
  border: 1px solid #e4e7df;
  border-radius: 18px;
  padding: 12px;
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 8px;
}

.screen-guidance-card div {
  border: 1px solid #e4e7df;
  background: #f7f8f4;
  border-radius: 14px;
  padding: 9px;
}

.screen-guidance-card span {
  display: block;
  color: #6f746b;
  font-size: 12px;
  font-weight: 900;
}

.screen-guidance-card strong {
  display: block;
  margin-top: 5px;
  color: #1f241d;
  font-size: 12px;
  line-height: 1.6;
}

@media (max-width: 1180px) {
  .screen-guidance-card { grid-template-columns: 1fr; }
}
`;
