import React, { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  CircleAlert,
  Clock3,
  Eye,
  FileCheck2,
  Filter,
  Layers,
  Megaphone,
  Plus,
  Search,
  Send,
  ShieldCheck,
  Trash2,
  XCircle,
} from "lucide-react";
import {
  createQueueItemFromContent,
  deletePublishingQueueItem,
  readCampaignContent,
  readPublishingQueue,
  upsertPublishingQueueItem,
} from "../utils/campaignContentStore.js";

const initialItems = [
  {
    id: 1,
    title: "Story عرض الصيف",
    channel: "Instagram",
    date: "2026-05-21",
    time: "10:00",
    status: "ready",
    approval: "approved",
    campaign: "إطلاق مجموعة الصيف",
    owner: "سارة",
    contentType: "Story",
    risk: "medium",
    preview: "عرض صيفي محدود مع صورة المنتج الرئيسية وCTA للمتجر.",
    checklist: {
      contentApproved: true,
      assetRights: true,
      linkChecked: true,
      channelReady: true,
    },
  },
  {
    id: 2,
    title: "Reel وعي",
    channel: "TikTok",
    date: "2026-05-21",
    time: "18:00",
    status: "review",
    approval: "needs_review",
    campaign: "إطلاق مجموعة الصيف",
    owner: "محمد",
    contentType: "Video",
    risk: "high",
    preview: "فيديو قصير يحتاج Hook أوضح ومراجعة حقوق الصوت.",
    checklist: {
      contentApproved: false,
      assetRights: false,
      linkChecked: true,
      channelReady: true,
    },
  },
  {
    id: 3,
    title: "رسالة WhatsApp",
    channel: "WhatsApp",
    date: "2026-05-22",
    time: "12:30",
    status: "ready",
    approval: "approved",
    campaign: "عرض نهاية الأسبوع",
    owner: "أحمد",
    contentType: "Message",
    risk: "high",
    preview: "رسالة مختصرة لإعادة التنشيط مع رابط العرض.",
    checklist: {
      contentApproved: true,
      assetRights: true,
      linkChecked: true,
      channelReady: true,
    },
  },
  {
    id: 4,
    title: "Email Offer",
    channel: "Email",
    date: "2026-05-23",
    time: "08:00",
    status: "draft",
    approval: "needs_review",
    campaign: "خصومات العيد",
    owner: "سارة",
    contentType: "Email",
    risk: "medium",
    preview: "عنوان بريدي يحتاج تحسين وFooter واضح لإلغاء الاشتراك.",
    checklist: {
      contentApproved: false,
      assetRights: true,
      linkChecked: false,
      channelReady: true,
    },
  },
  {
    id: 5,
    title: "Post تذكير العرض",
    channel: "Instagram",
    date: "2026-05-22",
    time: "12:30",
    status: "review",
    approval: "needs_review",
    campaign: "عرض نهاية الأسبوع",
    owner: "محمد",
    contentType: "Post",
    risk: "low",
    preview: "منشور تذكيري بنفس وقت WhatsApp لاختبار التعارض عبر القنوات.",
    checklist: {
      contentApproved: false,
      assetRights: true,
      linkChecked: true,
      channelReady: true,
    },
  },
];

const statusMap = {
  ready: ["جاهز", "green"],
  review: ["مراجعة", "amber"],
  draft: ["مسودة", "slate"],
  blocked: ["محظور", "red"],
  published_mock: ["نشر تجريبي", "blue"],
};

const approvalMap = {
  approved: ["معتمد", "green"],
  needs_review: ["بانتظار مراجعة", "amber"],
  rejected: ["مرفوض", "red"],
};

const riskMap = {
  low: ["منخفض", "green"],
  medium: ["متوسط", "amber"],
  high: ["مرتفع", "red"],
};

const channels = ["Instagram", "TikTok", "WhatsApp", "Email", "Snapchat"];
const campaigns = ["إطلاق مجموعة الصيف", "عرض نهاية الأسبوع", "خصومات العيد", "عودة إلى المدرسة"];
const contentTypes = ["Story", "Post", "Video", "Message", "Email"];

function getItemWarnings(item, allItems) {
  const warnings = [];
  const sameSlot = allItems.filter(
    (candidate) =>
      candidate.id !== item.id &&
      candidate.date === item.date &&
      candidate.time === item.time
  );

  if (sameSlot.length) warnings.push("يوجد عنصر آخر مجدول في نفس الوقت.");
  if (item.approval !== "approved") warnings.push("العنصر لم يحصل على اعتماد نهائي.");
  if (item.status === "draft") warnings.push("العنصر ما زال مسودة ولا يصلح للنشر.");
  if (item.status === "blocked") warnings.push("العنصر محظور ولا يجب إرساله للنشر.");
  if (item.risk === "high") warnings.push("القناة أو نوع المحتوى عالي الحساسية ويتطلب مراجعة بشرية.");
  if (!item.checklist.contentApproved) warnings.push("المحتوى غير معتمد.");
  if (!item.checklist.assetRights) warnings.push("حقوق الأصل غير مؤكدة.");
  if (!item.checklist.linkChecked) warnings.push("الرابط أو CTA غير مفحوص.");
  if (!item.checklist.channelReady) warnings.push("القناة غير جاهزة.");

  return warnings;
}

function isPublishable(item, allItems) {
  return getItemWarnings(item, allItems).length === 0 && item.status === "ready";
}

function getReadiness(item, allItems) {
  const checks = Object.values(item.checklist).filter(Boolean).length;
  let score = checks * 20;

  if (item.approval === "approved") score += 10;
  if (item.status === "ready") score += 10;
  if (item.risk === "high") score -= 10;
  if (allItems.some((candidate) => candidate.id !== item.id && candidate.date === item.date && candidate.time === item.time)) {
    score -= 15;
  }

  return Math.max(0, Math.min(100, score));
}

export default function PublishingQueuePage() {
  const [contentItems, setContentItems] = useState(() => readCampaignContent([]));
  const [items, setItems] = useState(() => readPublishingQueue(initialItems));
  const [selectedId, setSelectedId] = useState(String(initialItems[0].id));
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [channelFilter, setChannelFilter] = useState("all");
  const [newItem, setNewItem] = useState({
    title: "",
    campaign: campaigns[0],
    channel: channels[0],
    date: "2026-05-24",
    time: "09:00",
    contentType: "Post",
  });
  const [auditLog, setAuditLog] = useState([
    ["تم اعتماد Story عرض الصيف للنشر اليدوي", "Reviewer", "منذ 20 دقيقة"],
    ["تم منع Reel وعي من النشر بسبب حقوق الصوت", "Governance", "قبل ساعة"],
    ["تم تحديث موعد رسالة WhatsApp", "أحمد", "قبل ساعتين"],
  ]);

  useEffect(() => {
    const reloadItems = () => {
      setContentItems(readCampaignContent([]));
      setItems(readPublishingQueue(initialItems));
    };

    window.addEventListener("focus", reloadItems);
    window.addEventListener("storage", reloadItems);
    window.addEventListener("nashir-campaign-content-updated", reloadItems);
    window.addEventListener("nashir-publishing-queue-updated", reloadItems);

    return () => {
      window.removeEventListener("focus", reloadItems);
      window.removeEventListener("storage", reloadItems);
      window.removeEventListener("nashir-campaign-content-updated", reloadItems);
      window.removeEventListener("nashir-publishing-queue-updated", reloadItems);
    };
  }, []);

  const selected = items.find((item) => item.id === selectedId) || items[0];

  const days = useMemo(() => {
    return Array.from(new Set(items.map((item) => item.date))).sort();
  }, [items]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesQuery =
        item.title.includes(query) ||
        item.campaign.includes(query) ||
        item.channel.toLowerCase().includes(query.toLowerCase());

      const matchesStatus = statusFilter === "all" || item.status === statusFilter;
      const matchesChannel = channelFilter === "all" || item.channel === channelFilter;

      return matchesQuery && matchesStatus && matchesChannel;
    });
  }, [items, query, statusFilter, channelFilter]);

  const stats = useMemo(() => {
    const ready = items.filter((item) => item.status === "ready").length;
    const review = items.filter((item) => item.status === "review").length;
    const draft = items.filter((item) => item.status === "draft").length;
    const blocked = items.filter((item) => item.status === "blocked").length;
    const publishable = items.filter((item) => isPublishable(item, items)).length;

    return {
      total: items.length,
      ready,
      review,
      draft,
      blocked,
      publishable,
    };
  }, [items]);

  const queueWarnings = useMemo(() => {
    const warnings = [];
    const duplicateSlots = new Set();

    items.forEach((item) => {
      const key = `${item.date}-${item.time}`;
      if (items.filter((candidate) => `${candidate.date}-${candidate.time}` === key).length > 1) {
        duplicateSlots.add(key);
      }
    });

    if (duplicateSlots.size) warnings.push("توجد تعارضات زمنية في جدول النشر.");
    if (items.some((item) => item.risk === "high" && item.approval !== "approved")) {
      warnings.push("توجد عناصر عالية الحساسية غير معتمدة.");
    }
    if (items.some((item) => item.status === "draft")) warnings.push("توجد مسودات داخل قائمة الانتظار.");
    if (!items.some((item) => isPublishable(item, items))) warnings.push("لا يوجد عنصر آمن للنشر اليدوي الآن.");

    return warnings.length ? warnings : ["قائمة النشر مستقرة مبدئيًا، مع بقاء المراجعة النهائية مطلوبة."];
  }, [items]);

  const selectedWarnings = getItemWarnings(selected, items);
  const selectedReadiness = getReadiness(selected, items);

  const addAudit = (action, actor = "Publishing Queue") => {
    setAuditLog((prev) => [[action, actor, "الآن"], ...prev]);
  };

  const updateSelected = (key, value) => {
    const updatedItem = {
      ...selected,
      [key]: value,
    };
    const next = upsertPublishingQueueItem(updatedItem, initialItems);

    setItems(next);
  };

  const updateChecklist = (key) => {
    const updatedItem = {
      ...selected,
      checklist: {
        ...selected.checklist,
        [key]: !selected.checklist[key],
      },
    };
    const next = upsertPublishingQueueItem(updatedItem, initialItems);

    setItems(next);
  };

  const addItem = () => {
    const sourceContent =
      contentItems.find((content) => content.status === "ready") ||
      contentItems.find((content) => content.approval === "approved") ||
      contentItems[0];

    if (!sourceContent) {
      addAudit("لا يوجد محتوى جاهز للجدولة.", "Editor");
      return;
    }

    const item = createQueueItemFromContent(sourceContent, {
      title: newItem.title.trim() || sourceContent.title,
      campaign: newItem.campaign,
      channel: newItem.channel,
      date: newItem.date,
      time: newItem.time,
      contentType: newItem.contentType,
    });
    const next = upsertPublishingQueueItem(item, initialItems);

    setItems(next);
    setSelectedId(item.scheduleId || item.id);
    setNewItem((prev) => ({ ...prev, title: "" }));
    addAudit(`تمت إضافة ${item.title} إلى قائمة النشر`, "Editor");
  };

  const deleteSelected = () => {
    if (!selected) return;

    const next = deletePublishingQueueItem(selected.scheduleId || selected.id, initialItems);
    setItems(next);
    setSelectedId(next[0]?.scheduleId || next[0]?.id || null);
    addAudit(`تم حذف ${selected.title} من قائمة النشر`, "Editor");
  };

  const approveSelected = () => {
    const updatedItem = {
      ...selected,
      approval: "approved",
      status: "ready",
    };
    const next = upsertPublishingQueueItem(updatedItem, initialItems);

    setItems(next);
    addAudit(`تم اعتماد ${selected.title} للنشر اليدوي`, "Reviewer");
  };

  const blockSelected = () => {
    const updatedItem = {
      ...selected,
      status: "blocked",
      approval: "rejected",
    };
    const next = upsertPublishingQueueItem(updatedItem, initialItems);

    setItems(next);
    addAudit(`تم حظر ${selected.title} من النشر`, "Governance");
  };

  const simulatePublish = () => {
    if (!isPublishable(selected, items)) {
      addAudit(`تم منع نشر ${selected.title} بسبب ضوابط الحوكمة`, "Governance");
      return;
    }

    const next = upsertPublishingQueueItem(
      {
        ...selected,
        status: "published_mock",
      },
      initialItems
    );

    setItems(next);
    addAudit(`تمت محاكاة نشر ${selected.title} دون إرسال فعلي`, "Publishing Queue");
  };

  return (
    <main className="publishing-page" dir="rtl">
      <style>{styles}</style>

      <section className="page-title">
        <div>
          <div className="eyebrow">
            <CalendarDays size={15} />
            Publishing Queue
          </div>
          <h1>جدولة النشر</h1>
          <p>
            مركز محلي لإدارة ما سيُنشر، متى، وعلى أي قناة. النشر الحقيقي غير
            مفعّل، وكل الإجراءات هنا محاكاة داخل البروتوتايب.
          </p>
        </div>

        <div className="title-actions">
          <button type="button" className="secondary" onClick={approveSelected}>
            <ShieldCheck size={16} />
            اعتماد المحدد
          </button>
          <button type="button" className="primary" onClick={simulatePublish}>
            <Send size={16} />
            محاكاة نشر
          </button>
        </div>
      </section>

      <section className="guardrail">
        <ShieldCheck size={19} />
        <div>
          <strong>Publishing Guardrail</strong>
          <span>
            المسار الآمن: تجهيز المحتوى ← مراجعة بشرية ← اعتماد ← جدولة ← نشر
            يدوي. لا يوجد إرسال فعلي إلى Instagram أو TikTok أو WhatsApp أو Email.
          </span>
        </div>
      </section>

      <section className="stats-grid">
        <Stat title="المجدول" value={stats.total} icon={CalendarDays} />
        <Stat title="جاهز" value={stats.ready} icon={CheckCircle2} />
        <Stat title="مراجعة" value={stats.review} icon={Clock3} />
        <Stat title="مسودة" value={stats.draft} icon={Megaphone} />
        <Stat title="آمن للنشر اليدوي" value={stats.publishable} icon={ShieldCheck} />
      </section>

      <section className="controls-card">
        <div className="search-box">
          <Search size={17} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="ابحث بالعنوان أو الحملة أو القناة..."
          />
        </div>

        <div className="filter-row">
          <label>
            <Filter size={15} />
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
              <option value="all">كل الحالات</option>
              <option value="ready">جاهز</option>
              <option value="review">مراجعة</option>
              <option value="draft">مسودة</option>
              <option value="blocked">محظور</option>
              <option value="published_mock">نشر تجريبي</option>
            </select>
          </label>

          <label>
            <Layers size={15} />
            <select value={channelFilter} onChange={(event) => setChannelFilter(event.target.value)}>
              <option value="all">كل القنوات</option>
              {channels.map((channel) => (
                <option key={channel} value={channel}>
                  {channel}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <section className="queue-layout">
        <article className="card calendar-card">
          <CardHeader
            title="تقويم النشر"
            description="اضغط على أي عنصر لعرض تفاصيله وضوابطه."
            icon={CalendarDays}
          />

          <div className="calendar-grid">
            {days.map((day) => (
              <div key={day} className="day-card">
                <strong>{day}</strong>
                <div className="day-items">
                  {filteredItems
                    .filter((item) => item.date === day)
                    .map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        className={selectedId === item.id ? "selected" : ""}
                        onClick={() => setSelectedId(item.id)}
                      >
                        <span>{item.time}</span>
                        <b>{item.title}</b>
                        <small>{item.channel}</small>
                        <Status value={item.status} />
                      </button>
                    ))}

                  {!filteredItems.some((item) => item.date === day) && (
                    <div className="empty-day">لا توجد عناصر مطابقة للفلاتر.</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </article>

        <aside className="card detail-card">
          <div className="detail-icon">
            <Send size={24} />
          </div>

          {selected ? (
            <>
              <h2>{selected.title}</h2>
              <p>{selected.campaign}</p>

              <div className="readiness-block">
                <div>
                  <span>جاهزية النشر</span>
                  <strong>{selectedReadiness}%</strong>
                </div>
                <div className="meter">
                  <span style={{ width: `${selectedReadiness}%` }} />
                </div>
              </div>

              <Info label="القناة" value={selected.channel} />
              <Info label="التاريخ" value={selected.date} />
              <Info label="الوقت" value={selected.time} />
              <Info label="الحالة" value={statusMap[selected.status]?.[0] || selected.status} />
              <Info label="الاعتماد" value={approvalMap[selected.approval]?.[0] || selected.approval} />
              <Info label="المخاطر" value={riskMap[selected.risk]?.[0] || selected.risk} />

              <div className="actions">
                <button type="button">
                  <Eye size={16} />
                  معاينة
                </button>
                <button type="button" onClick={approveSelected}>
                  <ShieldCheck size={16} />
                  اعتماد
                </button>
                <button type="button" onClick={blockSelected}>
                  <XCircle size={16} />
                  حظر
                </button>
                <button type="button" onClick={deleteSelected}>
                  <Trash2 size={16} />
                  حذف
                </button>
              </div>

              <div className="warnings">
                {selectedWarnings.length ? (
                  selectedWarnings.map((warning) => (
                    <div key={warning} className="warning">
                      <AlertTriangle size={17} />
                      <span>{warning}</span>
                    </div>
                  ))
                ) : (
                  <div className="warning ok">
                    <CheckCircle2 size={17} />
                    <span>العنصر جاهز للنشر اليدوي الآمن داخل المحاكاة.</span>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="empty-state">لا يوجد عنصر محدد.</div>
          )}
        </aside>
      </section>

      <section className="lower-grid">
        <article className="card">
          <CardHeader
            title="إضافة عنصر للنشر"
            description="إضافة محلية فقط؛ يبدأ العنصر كمسودة ويحتاج مراجعة."
            icon={Plus}
          />

          <div className="form-grid">
            <label>
              <span>العنوان</span>
              <input
                value={newItem.title}
                onChange={(event) => setNewItem((prev) => ({ ...prev, title: event.target.value }))}
                placeholder="مثال: Story حملة نهاية الأسبوع"
              />
            </label>

            <label>
              <span>الحملة</span>
              <select
                value={newItem.campaign}
                onChange={(event) => setNewItem((prev) => ({ ...prev, campaign: event.target.value }))}
              >
                {campaigns.map((campaign) => (
                  <option key={campaign}>{campaign}</option>
                ))}
              </select>
            </label>

            <label>
              <span>القناة</span>
              <select
                value={newItem.channel}
                onChange={(event) => setNewItem((prev) => ({ ...prev, channel: event.target.value }))}
              >
                {channels.map((channel) => (
                  <option key={channel}>{channel}</option>
                ))}
              </select>
            </label>

            <label>
              <span>نوع المحتوى</span>
              <select
                value={newItem.contentType}
                onChange={(event) => setNewItem((prev) => ({ ...prev, contentType: event.target.value }))}
              >
                {contentTypes.map((type) => (
                  <option key={type}>{type}</option>
                ))}
              </select>
            </label>

            <label>
              <span>التاريخ</span>
              <input
                type="date"
                value={newItem.date}
                onChange={(event) => setNewItem((prev) => ({ ...prev, date: event.target.value }))}
              />
            </label>

            <label>
              <span>الوقت</span>
              <input
                type="time"
                value={newItem.time}
                onChange={(event) => setNewItem((prev) => ({ ...prev, time: event.target.value }))}
              />
            </label>
          </div>

          <button type="button" className="primary wide" onClick={addItem}>
            <Plus size={16} />
            إضافة كمسودة
          </button>
        </article>

        <article className="card">
          <CardHeader
            title="قائمة التحقق"
            description="تتحكم في جاهزية العنصر المحدد للنشر اليدوي."
            icon={FileCheck2}
          />

          {selected ? (
            <div className="checklist">
              {[
                ["contentApproved", "المحتوى معتمد"],
                ["assetRights", "حقوق الأصول مؤكدة"],
                ["linkChecked", "الرابط / CTA مفحوص"],
                ["channelReady", "القناة جاهزة"],
              ].map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  className={selected.checklist[key] ? "checked" : ""}
                  onClick={() => updateChecklist(key)}
                >
                  {selected.checklist[key] ? <CheckCircle2 size={17} /> : <CircleAlert size={17} />}
                  <span>{label}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="empty-state">اختر عنصرًا لإدارة قائمة التحقق.</div>
          )}
        </article>

        <article className="card">
          <CardHeader
            title="تنبيهات القائمة"
            description="مخاطر على مستوى جدول النشر بالكامل."
            icon={AlertTriangle}
          />

          <div className="warnings">
            {queueWarnings.map((warning) => (
              <div key={warning} className={warning.includes("مستقرة") ? "warning ok" : "warning"}>
                {warning.includes("مستقرة") ? <CheckCircle2 size={17} /> : <AlertTriangle size={17} />}
                <span>{warning}</span>
              </div>
            ))}
          </div>

          <div className="simulation-box">
            <strong>
              {selected && isPublishable(selected, items)
                ? "المحدد قابل لمحاكاة النشر"
                : "المحدد غير جاهز للنشر الآمن"}
            </strong>
            <span>
              {selected && isPublishable(selected, items)
                ? "سيتم تحويله إلى حالة نشر تجريبي دون إرسال فعلي."
                : "أغلق التحذيرات أولًا ثم أعد المحاكاة."}
            </span>
          </div>
        </article>
      </section>

      <section className="card">
        <CardHeader
          title="قائمة الانتظار"
          description="عرض جدولي لكل العناصر والفلاتر الحالية."
          icon={Clock3}
        />

        <div className="table">
          {filteredItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setSelectedId(item.id)}
              className={selectedId === item.id ? "active" : ""}
            >
              <span>{item.title}</span>
              <span>{item.channel}</span>
              <span>{item.campaign}</span>
              <span>{item.date} · {item.time}</span>
              <Status value={item.status} />
              <Approval value={item.approval} />
            </button>
          ))}
        </div>
      </section>

      <section className="card">
        <CardHeader
          title="سجل الحوكمة"
          description="سجل محلي للقرارات داخل البروتوتايب."
          icon={ShieldCheck}
        />

        <div className="audit-list">
          {auditLog.map(([action, actor, time]) => (
            <div key={`${action}-${time}`} className="audit-row">
              <ShieldCheck size={16} />
              <p>
                <strong>{action}</strong>
                <span>{actor} · {time}</span>
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

function CardHeader({ title, description, icon: Icon }) {
  return (
    <div className="card-header">
      <div>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      <div className="header-icon">
        <Icon size={20} />
      </div>
    </div>
  );
}

function Stat({ title, value, icon: Icon }) {
  return (
    <article className="stat">
      <div>
        <span>{title}</span>
        <strong>{value}</strong>
      </div>
      <div>
        <Icon size={21} />
      </div>
    </article>
  );
}

function Info({ label, value }) {
  return (
    <div className="info">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function Status({ value }) {
  const [label, cls] = statusMap[value] || statusMap.draft;
  return <span className={`status ${cls}`}>{label}</span>;
}

function Approval({ value }) {
  const [label, cls] = approvalMap[value] || approvalMap.needs_review;
  return <span className={`status ${cls}`}>{label}</span>;
}

const styles = `
.publishing-page{
  min-height:calc(100vh - 80px);
  padding:24px;
  background:#f7f8f4;
  color:#1f241d;
  font-family:Inter,"Segoe UI",Tahoma,Arial,sans-serif;
}

.page-title,
.stat,
.card,
.controls-card,
.guardrail{
  border:1px solid #e4e7df;
  background:#fff;
  border-radius:24px;
  box-shadow:0 8px 26px rgba(24,38,18,.035);
}

.page-title{
  padding:20px;
  display:flex;
  justify-content:space-between;
  gap:16px;
  margin-bottom:16px;
}

.eyebrow{
  width:fit-content;
  min-height:30px;
  padding:0 11px;
  border-radius:999px;
  display:inline-flex;
  align-items:center;
  gap:7px;
  color:#176b2c;
  background:#eef7e9;
  font-size:12px;
  font-weight:900;
  margin-bottom:10px;
}

.page-title h1{
  margin:0;
  font-size:34px;
  letter-spacing:-.04em;
}

.page-title p{
  margin:7px 0 0;
  color:#6f746b;
  line-height:1.8;
  max-width:860px;
}

.title-actions{
  display:flex;
  gap:10px;
  flex-wrap:wrap;
  align-items:flex-start;
  justify-content:flex-end;
}

.primary,
.secondary{
  min-height:42px;
  border-radius:16px;
  padding:0 16px;
  display:inline-flex;
  align-items:center;
  justify-content:center;
  gap:8px;
  font-family:inherit;
  font-weight:900;
  cursor:pointer;
}

.primary{
  border:0;
  background:#176b2c;
  color:#fff;
}

.secondary{
  border:1px solid #e4e7df;
  background:#fff;
  color:#1f241d;
}

.wide{
  width:100%;
  margin-top:14px;
}

.guardrail{
  padding:14px 16px;
  margin-bottom:16px;
  display:flex;
  gap:12px;
  color:#176b2c;
}

.guardrail strong{
  display:block;
  margin-bottom:4px;
}

.guardrail span{
  display:block;
  color:#52604c;
  line-height:1.8;
  font-size:13px;
}

.stats-grid{
  display:grid;
  grid-template-columns:repeat(5,minmax(0,1fr));
  gap:14px;
  margin-bottom:16px;
}

.stat{
  min-height:104px;
  padding:16px;
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:12px;
}

.stat span{
  color:#6f746b;
  font-size:13px;
  font-weight:900;
}

.stat strong{
  display:block;
  margin-top:8px;
  font-size:30px;
}

.stat>div:last-child{
  width:46px;
  height:46px;
  border-radius:16px;
  background:#eef7e9;
  color:#176b2c;
  display:grid;
  place-items:center;
}

.controls-card{
  padding:14px;
  margin-bottom:16px;
  display:flex;
  gap:12px;
  align-items:center;
  justify-content:space-between;
  flex-wrap:wrap;
}

.search-box{
  flex:1;
  min-width:260px;
  min-height:42px;
  border:1px solid #e4e7df;
  background:#f7f8f4;
  border-radius:16px;
  padding:0 12px;
  display:flex;
  align-items:center;
  gap:8px;
}

.search-box input{
  flex:1;
  border:0;
  outline:0;
  background:transparent;
  font-family:inherit;
  font-weight:800;
}

.filter-row{
  display:flex;
  gap:10px;
  flex-wrap:wrap;
}

.filter-row label{
  min-height:42px;
  border:1px solid #e4e7df;
  background:#fff;
  border-radius:16px;
  padding:0 10px;
  display:inline-flex;
  align-items:center;
  gap:7px;
}

.filter-row select{
  border:0;
  outline:0;
  background:transparent;
  font-family:inherit;
  font-weight:900;
}

.queue-layout{
  display:grid;
  grid-template-columns:minmax(0,1fr)360px;
  gap:16px;
  margin-bottom:16px;
}

.lower-grid{
  display:grid;
  grid-template-columns:1.15fr .85fr .85fr;
  gap:16px;
  margin-bottom:16px;
}

.card{
  padding:18px;
  margin-bottom:16px;
}

.card-header{
  display:flex;
  justify-content:space-between;
  gap:14px;
  align-items:flex-start;
  margin-bottom:14px;
}

.card-header h2{
  margin:0;
  font-size:18px;
}

.card-header p{
  margin:5px 0 0;
  color:#6f746b;
  line-height:1.7;
  font-size:13px;
}

.header-icon{
  width:40px;
  height:40px;
  border-radius:14px;
  display:grid;
  place-items:center;
  color:#176b2c;
  background:#eef7e9;
}

.calendar-grid{
  display:grid;
  grid-template-columns:repeat(5,minmax(180px,1fr));
  gap:12px;
  overflow:auto;
  padding-bottom:4px;
}

.day-card{
  border:1px solid #e4e7df;
  background:#f7f8f4;
  border-radius:18px;
  padding:12px;
  min-height:260px;
}

.day-card>strong{
  display:block;
  margin-bottom:10px;
}

.day-items{
  display:grid;
  gap:8px;
}

.day-items button{
  border:1px solid #e4e7df;
  background:#fff;
  border-radius:16px;
  padding:10px;
  display:grid;
  gap:5px;
  text-align:right;
  font-family:inherit;
  cursor:pointer;
}

.day-items button.selected{
  border-color:#176b2c;
  background:#eef7e9;
}

.day-items span,
.day-items small{
  color:#6f746b;
  font-size:11px;
  font-weight:900;
}

.day-items b{
  font-size:13px;
}

.empty-day,
.empty-state{
  border:1px dashed #cbd5c0;
  color:#6f746b;
  background:#fff;
  border-radius:16px;
  padding:14px;
  line-height:1.7;
  font-size:12px;
  font-weight:800;
}

.detail-card h2{
  margin:0;
}

.detail-card p{
  color:#6f746b;
  margin:6px 0 12px;
}

.detail-icon{
  width:54px;
  height:54px;
  background:#176b2c;
  color:#fff;
  display:grid;
  place-items:center;
  border-radius:18px;
  margin-bottom:12px;
}

.readiness-block{
  border:1px solid #e4e7df;
  background:#f7f8f4;
  border-radius:18px;
  padding:13px;
  margin-bottom:12px;
}

.readiness-block>div:first-child{
  display:flex;
  justify-content:space-between;
  gap:10px;
  font-weight:900;
}

.readiness-block span{
  color:#6f746b;
}

.meter{
  height:10px;
  background:#e8ecdf;
  border-radius:999px;
  overflow:hidden;
  margin-top:10px;
}

.meter span{
  display:block;
  height:100%;
  background:#176b2c;
  border-radius:999px;
}

.info{
  min-height:42px;
  border-bottom:1px solid #e4e7df;
  display:flex;
  justify-content:space-between;
  gap:12px;
  align-items:center;
}

.info span{
  color:#6f746b;
  font-size:12px;
  font-weight:900;
}

.info strong{
  text-align:left;
}

.actions{
  display:grid;
  grid-template-columns:repeat(2,1fr);
  gap:8px;
  margin-top:14px;
}

.actions button{
  min-height:38px;
  border:1px solid #e4e7df;
  background:#fff;
  border-radius:14px;
  display:inline-flex;
  align-items:center;
  justify-content:center;
  gap:7px;
  font-family:inherit;
  font-weight:900;
  cursor:pointer;
}

.warnings{
  display:grid;
  gap:10px;
  margin-top:14px;
}

.warning{
  border:1px solid #fde68a;
  background:#fff7e6;
  color:#92400e;
  border-radius:18px;
  padding:13px;
  display:flex;
  gap:8px;
  line-height:1.8;
  font-size:12px;
  font-weight:800;
}

.warning.ok{
  border-color:#bbf7d0;
  background:#f0fdf4;
  color:#166534;
}

.form-grid{
  display:grid;
  grid-template-columns:repeat(3,minmax(0,1fr));
  gap:10px;
}

.form-grid label{
  display:grid;
  gap:7px;
}

.form-grid label span{
  color:#6f746b;
  font-size:12px;
  font-weight:900;
}

.form-grid input,
.form-grid select{
  min-height:42px;
  border:1px solid #e4e7df;
  background:#fff;
  border-radius:14px;
  padding:0 12px;
  font-family:inherit;
  font-weight:900;
}

.checklist{
  display:grid;
  gap:10px;
}

.checklist button{
  min-height:46px;
  border:1px solid #e4e7df;
  background:#f7f8f4;
  border-radius:16px;
  padding:0 12px;
  display:flex;
  align-items:center;
  gap:9px;
  font-family:inherit;
  font-weight:900;
  cursor:pointer;
  color:#92400e;
}

.checklist button.checked{
  background:#f0fdf4;
  border-color:#bbf7d0;
  color:#166534;
}

.simulation-box{
  margin-top:14px;
  border:1px solid #e4e7df;
  background:#f7f8f4;
  border-radius:18px;
  padding:14px;
}

.simulation-box strong,
.simulation-box span{
  display:block;
}

.simulation-box span{
  color:#6f746b;
  line-height:1.7;
  margin-top:5px;
  font-size:12px;
}

.table{
  border:1px solid #e4e7df;
  border-radius:18px;
  overflow:hidden;
}

.table button{
  width:100%;
  min-height:54px;
  border:0;
  border-top:1px solid #e4e7df;
  background:#fff;
  padding:10px 13px;
  display:grid;
  grid-template-columns:1.1fr .7fr 1fr 1fr .7fr .9fr;
  gap:10px;
  align-items:center;
  text-align:right;
  font-family:inherit;
  cursor:pointer;
}

.table button:first-child{
  border-top:0;
}

.table button.active{
  background:#eef7e9;
}

.status{
  width:fit-content;
  border-radius:999px;
  padding:6px 10px;
  font-size:11px;
  font-weight:900;
  white-space:nowrap;
}

.green{
  background:#f0fdf4;
  color:#166534;
}

.amber{
  background:#fffbeb;
  color:#92400e;
}

.slate{
  background:#f8fafc;
  color:#475569;
}

.red{
  background:#fef2f2;
  color:#991b1b;
}

.blue{
  background:#eff6ff;
  color:#1d4ed8;
}

.audit-list{
  display:grid;
  gap:10px;
}

.audit-row{
  border:1px solid #e4e7df;
  background:#f7f8f4;
  border-radius:18px;
  padding:12px;
  display:flex;
  gap:9px;
  align-items:flex-start;
}

.audit-row p{
  margin:0;
}

.audit-row strong{
  display:block;
  color:#1f241d;
}

.audit-row span{
  display:block;
  margin-top:4px;
  color:#6f746b;
  font-size:12px;
  font-weight:800;
}

@media(max-width:1180px){
  .stats-grid,
  .queue-layout,
  .lower-grid{
    grid-template-columns:1fr;
  }

  .page-title{
    flex-direction:column;
  }

  .title-actions{
    justify-content:flex-start;
  }

  .calendar-grid{
    grid-template-columns:repeat(2,minmax(220px,1fr));
  }
}

@media(max-width:760px){
  .publishing-page{
    padding:16px;
  }

  .stats-grid,
  .calendar-grid,
  .form-grid,
  .actions,
  .table button{
    grid-template-columns:1fr;
  }

  .controls-card,
  .filter-row{
    align-items:stretch;
  }

  .primary,
  .secondary{
    width:100%;
  }
}
`;
