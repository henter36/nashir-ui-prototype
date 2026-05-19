import React, { useMemo, useState } from "react";
import {
  CheckCircle2,
  CircleAlert,
  ClipboardList,
  Clock3,
  Eye,
  FileText,
  ImageIcon,
  Mail,
  MessageCircle,
  PenLine,
  PlayCircle,
  RefreshCw,
  Sparkles,
} from "lucide-react";

const initialReviewItems = [
  {
    id: "ad-copy",
    title: "نص إعلان قصير",
    type: "نص إعلاني",
    channel: "Instagram / Snapchat",
    icon: FileText,
    status: "ready",
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
      "المشهد 1: لقطة قريبة للمنتج مع سؤال سريع.\n\nالمشهد 2: عرض أهم التفاصيل والميزة الأساسية.\n\nالمشهد 3: دعوة مباشرة للطلب قبل انتهاء العرض.",
  },
  {
    id: "whatsapp",
    title: "رسالة WhatsApp",
    type: "رسالة مباشرة",
    channel: "WhatsApp",
    icon: MessageCircle,
    status: "approved",
    content:
      "مرحبًا، جهزنا لك عرضًا خاصًا لفترة محدودة. يمكنك مشاهدة التفاصيل والطلب مباشرة من الرابط. يسعدنا خدمتك.",
  },
  {
    id: "email",
    title: "بريد إلكتروني",
    type: "Email",
    channel: "Email",
    icon: Mail,
    status: "changes_requested",
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
    label: "تحتاج مراجعة",
    className: "needs-review",
    icon: Eye,
  },
  ready: {
    label: "جاهزة للاعتماد",
    className: "ready",
    icon: ClipboardList,
  },
  approved: {
    label: "معتمدة",
    className: "approved",
    icon: CheckCircle2,
  },
  changes_requested: {
    label: "طلب تعديل",
    className: "changes-requested",
    icon: PenLine,
  },
  rejected: {
    label: "مرفوضة",
    className: "rejected",
    icon: CircleAlert,
  },
};

const initialAuditLog = [
  {
    id: 1,
    itemId: "whatsapp",
    action: "تم اعتماد رسالة WhatsApp",
    note: "المحتوى مناسب للاستخدام بعد المراجعة.",
    actor: "مراجع المحتوى",
    time: "قبل 12 دقيقة",
  },
  {
    id: 2,
    itemId: "email",
    action: "تم طلب تعديل على البريد الإلكتروني",
    note: "يحتاج العنوان إلى صياغة أقوى وربط أوضح بالعرض.",
    actor: "مراجع المحتوى",
    time: "قبل 20 دقيقة",
  },
  {
    id: 3,
    itemId: "ad-copy",
    action: "تم تحويل النص الإعلاني إلى جاهز للاعتماد",
    note: "النص مختصر ومناسب كبداية.",
    actor: "مراجع المحتوى",
    time: "قبل 35 دقيقة",
  },
];

export default function ReviewPage() {
  const [items, setItems] = useState(initialReviewItems);
  const [activeItemId, setActiveItemId] = useState(initialReviewItems[0].id);
  const [reviewNote, setReviewNote] = useState("");
  const [auditLog, setAuditLog] = useState(initialAuditLog);

  const activeItem = useMemo(() => {
    return items.find((item) => item.id === activeItemId) || items[0];
  }, [items, activeItemId]);

  const stats = useMemo(() => {
    return {
      total: items.length,
      ready: items.filter((item) => item.status === "ready").length,
      approved: items.filter((item) => item.status === "approved").length,
      changes: items.filter((item) => item.status === "changes_requested").length,
      rejected: items.filter((item) => item.status === "rejected").length,
    };
  }, [items]);

  const itemAuditLog = useMemo(() => {
    return auditLog.filter((log) => log.itemId === activeItem.id);
  }, [auditLog, activeItem.id]);

  const updateStatus = (status, actionText, fallbackNote) => {
    const note = reviewNote.trim() || fallbackNote;

    setItems((prev) =>
      prev.map((item) =>
        item.id === activeItem.id
          ? {
              ...item,
              status,
            }
          : item
      )
    );

    setAuditLog((prev) => [
      {
        id: Date.now(),
        itemId: activeItem.id,
        action: actionText,
        note,
        actor: "مراجع المحتوى",
        time: "الآن",
      },
      ...prev,
    ]);

    setReviewNote("");
  };

  const resetAll = () => {
    setItems(initialReviewItems);
    setAuditLog(initialAuditLog);
    setReviewNote("");
    setActiveItemId(initialReviewItems[0].id);
  };

  const ActiveIcon = activeItem.icon;
  const StatusIcon = statusMap[activeItem.status].icon;

  return (
    <main className="review-page" dir="rtl">
      <style>{styles}</style>

      <section className="review-hero">
        <div className="hero-content">
          <div className="eyebrow">
            <Sparkles size={16} />
            مركز المراجعة
          </div>

          <h1>اعتماد المحتوى قبل أي استخدام أو نشر</h1>

          <p>
            هذه الصفحة تمثل مرحلة الحوكمة قبل النشر. يراجع المستخدم المواد،
            يعتمدها، يطلب تعديلها، أو يرفضها، مع سجل مراجعة تجريبي داخل الواجهة.
          </p>

          <div className="hero-alert">
            <CircleAlert size={18} />
            <span>
              الاعتماد هنا لا يعني نشرًا فعليًا. لا يوجد إرسال، ولا API، ولا سجل
              تدقيق حقيقي. هذه واجهة مراجعة محلية فقط.
            </span>
          </div>
        </div>

        <div className="review-stats-card">
          <div className="stats-icon">
            <ClipboardList size={26} />
          </div>

          <span>مواد قيد المراجعة</span>
          <strong>{stats.total}</strong>

          <div className="stats-grid">
            <div>
              <b>{stats.ready}</b>
              <small>جاهزة</small>
            </div>
            <div>
              <b>{stats.approved}</b>
              <small>معتمدة</small>
            </div>
            <div>
              <b>{stats.changes}</b>
              <small>تعديل</small>
            </div>
            <div>
              <b>{stats.rejected}</b>
              <small>مرفوضة</small>
            </div>
          </div>
        </div>
      </section>

      <section className="review-layout">
        <aside className="review-list-panel">
          <div className="panel-header">
            <h2>مواد المحتوى</h2>
            <p>اختر مادة لمراجعتها واتخاذ قرار عليها.</p>
          </div>

          <div className="review-list">
            {items.map((item) => {
              const Icon = item.icon;
              const itemStatus = statusMap[item.status];
              const ItemStatusIcon = itemStatus.icon;
              const active = item.id === activeItemId;

              return (
                <button
                  key={item.id}
                  type="button"
                  className={`review-item ${active ? "active" : ""}`}
                  onClick={() => {
                    setActiveItemId(item.id);
                    setReviewNote("");
                  }}
                >
                  <div className="review-item-icon">
                    <Icon size={20} />
                  </div>

                  <div className="review-item-body">
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

          <button type="button" className="reset-button" onClick={resetAll}>
            <RefreshCw size={17} />
            إعادة ضبط تجريبية
          </button>
        </aside>

        <section className="review-detail-panel">
          <div className="detail-header">
            <div className="detail-title">
              <div className="detail-icon">
                <ActiveIcon size={24} />
              </div>

              <div>
                <h2>{activeItem.title}</h2>
                <p>
                  {activeItem.type} · {activeItem.channel}
                </p>
              </div>
            </div>

            <div className={`status-badge ${statusMap[activeItem.status].className}`}>
              <StatusIcon size={15} />
              {statusMap[activeItem.status].label}
            </div>
          </div>

          <div className="detail-grid">
            <section className="content-preview-card">
              <div className="section-title">
                <h3>محتوى المادة</h3>
                <p>اقرأ المادة كما ستظهر للمستخدم أو لفريق النشر لاحقًا.</p>
              </div>

              <div className="content-preview">
                {activeItem.content}
              </div>

              <div className="risk-note">
                <CircleAlert size={18} />
                <p>
                  يجب مراجعة صحة الوعود التسويقية، وضمان عدم وجود مبالغة أو
                  ادعاءات غير قابلة للإثبات قبل الاعتماد.
                </p>
              </div>
            </section>

            <aside className="decision-panel">
              <div className="section-title">
                <h3>قرار المراجعة</h3>
                <p>أضف ملاحظة ثم اختر الإجراء المناسب.</p>
              </div>

              <label className="note-field">
                <span>ملاحظة المراجع</span>
                <textarea
                  value={reviewNote}
                  onChange={(event) => setReviewNote(event.target.value)}
                  placeholder="اكتب سبب الاعتماد أو التعديل أو الرفض..."
                  rows={6}
                />
              </label>

              <div className="decision-actions">
                <button
                  type="button"
                  className="decision-button approve"
                  onClick={() =>
                    updateStatus(
                      "approved",
                      "تم اعتماد المادة",
                      "تم اعتماد المادة بدون ملاحظات إضافية."
                    )
                  }
                >
                  <CheckCircle2 size={18} />
                  اعتماد
                </button>

                <button
                  type="button"
                  className="decision-button changes"
                  onClick={() =>
                    updateStatus(
                      "changes_requested",
                      "تم طلب تعديل على المادة",
                      "المادة تحتاج تعديلًا قبل الاعتماد."
                    )
                  }
                >
                  <PenLine size={18} />
                  طلب تعديل
                </button>

                <button
                  type="button"
                  className="decision-button reject"
                  onClick={() =>
                    updateStatus(
                      "rejected",
                      "تم رفض المادة",
                      "تم رفض المادة لأنها غير مناسبة للاعتماد الحالي."
                    )
                  }
                >
                  <CircleAlert size={18} />
                  رفض
                </button>
              </div>

              <div className="governance-note">
                <strong>قاعدة حوكمة</strong>
                <p>
                  لا يُفترض لاحقًا أن يؤدي الاعتماد إلى نشر تلقائي. الاعتماد
                  خطوة داخلية، والنشر يجب أن يكون بإجراء مستقل ومصرّح.
                </p>
              </div>
            </aside>
          </div>

          <section className="audit-panel">
            <div className="section-title">
              <h3>سجل المراجعة التجريبي</h3>
              <p>سجل محلي لإظهار رحلة القرار فقط.</p>
            </div>

            <div className="audit-list">
              {itemAuditLog.length ? (
                itemAuditLog.map((log) => (
                  <div key={log.id} className="audit-item">
                    <div className="audit-dot" />
                    <div>
                      <strong>{log.action}</strong>
                      <p>{log.note}</p>
                      <span>
                        {log.actor} · {log.time}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-audit">
                  لا يوجد سجل مراجعة لهذه المادة حتى الآن.
                </div>
              )}
            </div>
          </section>
        </section>
      </section>
    </main>
  );
}

const styles = `
.review-page {
  min-height: 100vh;
  background:
    radial-gradient(circle at top right, rgba(34, 197, 94, 0.10), transparent 30%),
    radial-gradient(circle at bottom left, rgba(37, 99, 235, 0.12), transparent 32%),
    #f7f8fb;
  padding: 28px;
  color: #111827;
  font-family: "Inter", "Tajawal", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

.review-hero {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 360px;
  gap: 20px;
  margin-bottom: 22px;
}

.hero-content,
.review-stats-card,
.review-list-panel,
.review-detail-panel {
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
  color: #166534;
  background: #f0fdf4;
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

.review-stats-card {
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
  background: linear-gradient(135deg, #16a34a, #2563eb);
  margin-bottom: 18px;
}

.review-stats-card > span {
  color: #64748b;
  font-size: 14px;
}

.review-stats-card > strong {
  display: block;
  font-size: 42px;
  margin-top: 4px;
  color: #0f172a;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  margin-top: 18px;
}

.stats-grid div {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 10px;
  text-align: center;
}

.stats-grid b {
  display: block;
  font-size: 18px;
  color: #0f172a;
}

.stats-grid small {
  display: block;
  margin-top: 3px;
  color: #64748b;
  font-size: 11px;
}

.review-layout {
  display: grid;
  grid-template-columns: 350px minmax(0, 1fr);
  gap: 20px;
  align-items: start;
}

.review-list-panel {
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

.review-list {
  display: grid;
  gap: 10px;
  margin-top: 18px;
}

.review-item {
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

.review-item:hover {
  background: #f8fafc;
}

.review-item.active {
  border-color: #bbf7d0;
  background: #f0fdf4;
  box-shadow: 0 14px 28px rgba(22, 163, 74, 0.10);
}

.review-item-icon {
  width: 42px;
  height: 42px;
  flex: 0 0 auto;
  display: grid;
  place-items: center;
  border-radius: 16px;
  color: #475569;
  background: #f1f5f9;
}

.review-item.active .review-item-icon {
  color: #fff;
  background: linear-gradient(135deg, #16a34a, #2563eb);
}

.review-item-body strong {
  display: block;
  color: #0f172a;
  font-size: 14px;
}

.review-item-body span {
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
  color: #1d4ed8;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
}

.approved {
  color: #166534;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
}

.changes-requested {
  color: #7c2d12;
  background: #fff7ed;
  border: 1px solid #fed7aa;
}

.rejected {
  color: #991b1b;
  background: #fef2f2;
  border: 1px solid #fecaca;
}

.reset-button {
  width: 100%;
  margin-top: 16px;
  border-radius: 16px;
  padding: 12px;
  min-height: 44px;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  color: #334155;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-weight: 900;
  font-family: inherit;
  cursor: pointer;
}

.review-detail-panel {
  padding: 24px;
}

.detail-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 24px;
  padding-bottom: 18px;
  border-bottom: 1px solid #e5e7eb;
}

.detail-title {
  display: flex;
  align-items: center;
  gap: 14px;
}

.detail-icon {
  width: 52px;
  height: 52px;
  display: grid;
  place-items: center;
  border-radius: 18px;
  color: #fff;
  background: linear-gradient(135deg, #111827, #334155);
}

.detail-title h2 {
  margin: 0;
  color: #0f172a;
  font-size: 24px;
  letter-spacing: -0.03em;
}

.detail-title p {
  margin: 4px 0 0;
  color: #64748b;
  font-size: 14px;
}

.detail-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 340px;
  gap: 18px;
  align-items: start;
}

.content-preview-card,
.decision-panel,
.audit-panel {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 24px;
  padding: 20px;
}

.content-preview {
  margin-top: 16px;
  min-height: 280px;
  white-space: pre-line;
  color: #0f172a;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 18px;
  padding: 18px;
  line-height: 1.95;
  font-size: 15px;
}

.risk-note {
  margin-top: 16px;
  display: flex;
  gap: 10px;
  align-items: flex-start;
  color: #92400e;
  background: #fffbeb;
  border: 1px solid #fde68a;
  border-radius: 18px;
  padding: 13px;
}

.risk-note p {
  margin: 0;
  line-height: 1.8;
  font-size: 13px;
}

.note-field {
  display: grid;
  gap: 8px;
  margin-top: 16px;
}

.note-field span {
  color: #334155;
  font-size: 13px;
  font-weight: 900;
}

.note-field textarea {
  width: 100%;
  box-sizing: border-box;
  border: 1px solid #dbe3ef;
  background: #fff;
  border-radius: 16px;
  padding: 14px;
  color: #0f172a;
  outline: none;
  resize: vertical;
  font-size: 14px;
  line-height: 1.8;
  font-family: inherit;
}

.note-field textarea:focus {
  border-color: #22c55e;
  box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.12);
}

.decision-actions {
  display: grid;
  gap: 10px;
  margin-top: 14px;
}

.decision-button {
  width: 100%;
  min-height: 48px;
  border-radius: 16px;
  padding: 12px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 10px;
  font-family: inherit;
  font-weight: 900;
  cursor: pointer;
  transition: 0.2s ease;
}

.decision-button.approve {
  color: #166534;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
}

.decision-button.changes {
  color: #7c2d12;
  background: #fff7ed;
  border: 1px solid #fed7aa;
}

.decision-button.reject {
  color: #991b1b;
  background: #fef2f2;
  border: 1px solid #fecaca;
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

.audit-panel {
  margin-top: 18px;
}

.audit-list {
  display: grid;
  gap: 12px;
  margin-top: 16px;
}

.audit-item {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 18px;
  padding: 14px;
}

.audit-dot {
  width: 10px;
  height: 10px;
  margin-top: 8px;
  border-radius: 999px;
  background: #22c55e;
  box-shadow: 0 0 0 5px rgba(34, 197, 94, 0.12);
  flex: 0 0 auto;
}

.audit-item strong {
  color: #0f172a;
  font-size: 14px;
}

.audit-item p {
  margin: 6px 0;
  color: #334155;
  line-height: 1.8;
  font-size: 13px;
}

.audit-item span {
  color: #64748b;
  font-size: 12px;
}

.empty-audit {
  color: #64748b;
  background: #f8fafc;
  border: 1px dashed #cbd5e1;
  border-radius: 18px;
  padding: 16px;
  font-size: 14px;
}

@media (max-width: 1100px) {
  .review-hero,
  .review-layout,
  .detail-grid {
    grid-template-columns: 1fr;
  }

  .review-list-panel {
    position: static;
  }
}

@media (max-width: 640px) {
  .review-page {
    padding: 18px;
  }

  .hero-content h1 {
    font-size: 28px;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .detail-header {
    align-items: stretch;
    flex-direction: column;
  }
}
`;