import React, { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  CircleAlert,
  Clock3,
  FileCheck2,
  Globe2,
  Layers,
  Link2,
  Lock,
  MessageSquare,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Smartphone,
  Users,
  Wand2,
  XCircle,
} from "lucide-react";
import {
  buildReadinessFromContent,
  readCampaignContent,
  readMultiPlatformReadiness,
  upsertMultiPlatformReadinessItem,
  writeMultiPlatformReadiness,
} from "../utils/campaignContentStore.js";

const initialAccounts = [
  {
    id: "instagram",
    platform: "Instagram",
    account: "@growth_store",
    status: "connected",
    owner: "Marketing",
    connectionType: "OAuth",
    selected: true,
    publishMode: "manual_approval",
    lastSync: "منذ 10 دقائق",
    risk: "medium",
  },
  {
    id: "tiktok",
    platform: "TikTok",
    account: "@growth_store",
    status: "connected",
    owner: "Marketing",
    connectionType: "OAuth",
    selected: true,
    publishMode: "manual_approval",
    lastSync: "منذ 18 دقيقة",
    risk: "high",
  },
  {
    id: "snapchat",
    platform: "Snapchat",
    account: "growth.snap",
    status: "pending",
    owner: "Marketing",
    connectionType: "Manual",
    selected: false,
    publishMode: "blocked_until_connected",
    lastSync: "لم يكتمل الربط",
    risk: "medium",
  },
  {
    id: "whatsapp",
    platform: "WhatsApp",
    account: "+966 5X XXX XXXX",
    status: "connected",
    owner: "Sales",
    connectionType: "Business API",
    selected: true,
    publishMode: "manual_approval",
    lastSync: "منذ 25 دقيقة",
    risk: "high",
  },
  {
    id: "email",
    platform: "Email",
    account: "marketing@example.com",
    status: "connected",
    owner: "CRM",
    connectionType: "SMTP / ESP",
    selected: false,
    publishMode: "manual_approval",
    lastSync: "منذ ساعة",
    risk: "low",
  },
];

const initialAssets = [
  {
    id: "instagram_story",
    name: "Instagram Story",
    platform: "Instagram",
    size: "1080 × 1920",
    type: "Image/Video",
    status: "ready",
    issue: "جاهز للنشر بعد المراجعة",
    approval: "approved",
  },
  {
    id: "instagram_post",
    name: "Instagram Post",
    platform: "Instagram",
    size: "1080 × 1080",
    type: "Image",
    status: "ready",
    issue: "جاهز",
    approval: "approved",
  },
  {
    id: "tiktok_video",
    name: "TikTok Video",
    platform: "TikTok",
    size: "1080 × 1920",
    type: "Video",
    status: "needs_asset",
    issue: "يحتاج فيديو عمودي مع Hook أول 3 ثواني",
    approval: "needs_review",
  },
  {
    id: "whatsapp_message",
    name: "WhatsApp Broadcast",
    platform: "WhatsApp",
    size: "Text + Image",
    type: "Message",
    status: "needs_review",
    issue: "يحتاج مراجعة الرابط وعبارة الموافقة",
    approval: "needs_review",
  },
  {
    id: "email_header",
    name: "Email Header",
    platform: "Email",
    size: "1200 × 600",
    type: "Image",
    status: "ready",
    issue: "جاهز",
    approval: "approved",
  },
];

const statusMap = {
  connected: ["مرتبط", "green"],
  pending: ["بانتظار", "amber"],
  disconnected: ["غير متصل", "red"],
  blocked: ["موقوف", "slate"],
};

const assetStatusMap = {
  ready: ["جاهز", "green"],
  needs_review: ["يحتاج مراجعة", "amber"],
  needs_asset: ["يحتاج أصل", "red"],
  blocked: ["محظور", "red"],
};

const approvalMap = {
  approved: ["معتمد", "green"],
  needs_review: ["بانتظار مراجعة", "amber"],
  rejected: ["مرفوض", "red"],
};

const riskMap = {
  low: "منخفض",
  medium: "متوسط",
  high: "مرتفع",
};

const platformRequirements = {
  Instagram: ["مقاس صحيح", "Caption قصير", "هاشتاقات محدودة", "موافقة على الصورة"],
  TikTok: ["فيديو عمودي", "Hook واضح", "مراجعة موسيقى/حقوق", "موافقة بشرية"],
  Snapchat: ["حساب متصل", "تصميم عمودي", "CTA واضح", "مراجعة محتوى"],
  WhatsApp: ["موافقة تسويقية", "رابط صحيح", "نص غير مزعج", "قائمة مستلمين آمنة"],
  Email: ["عنوان واضح", "Header جاهز", "رابط إلغاء الاشتراك", "مراجعة Spam Risk"],
};

function getAccountWarnings(account) {
  const warnings = [];

  if (account.status !== "connected") warnings.push("القناة غير جاهزة للنشر لأنها ليست مرتبطة بالكامل.");
  if (account.risk === "high") warnings.push("هذه القناة عالية الحساسية وتحتاج موافقة نهائية قبل النشر.");
  if (account.publishMode !== "manual_approval") warnings.push("يجب منع النشر دون مراجعة بشرية.");
  if (account.platform === "WhatsApp") warnings.push("WhatsApp يتطلب موافقة تسويقية وقائمة مستلمين آمنة.");
  if (account.platform === "TikTok") warnings.push("TikTok يتطلب مراجعة حقوق الصوت والفيديو.");

  return warnings;
}

function getChannelAssets(platform, assets) {
  return assets.filter((asset) => asset.platform === platform);
}

function getReadiness(account, assets) {
  const channelAssets = getChannelAssets(account.platform, assets);

  if (account.status !== "connected") return 0;
  if (!channelAssets.length) return 25;

  const approved = channelAssets.filter((asset) => asset.approval === "approved").length;
  const ready = channelAssets.filter((asset) => asset.status === "ready").length;
  const score = Math.round(((approved + ready) / (channelAssets.length * 2)) * 100);

  return Math.max(10, Math.min(100, score));
}

export default function MultiPlatformPage() {
  const [accounts, setAccounts] = useState(initialAccounts);
  const [contentItems, setContentItems] = useState(() => readCampaignContent([]));
  const [assets, setAssets] = useState(() => {
    const content = readCampaignContent([]);
    const stored = readMultiPlatformReadiness(initialAssets);
    const derived = buildReadinessFromContent(content, stored);
    const next = derived.length ? derived : stored;
    writeMultiPlatformReadiness(next);
    return next;
  });
  const [selectedAccountId, setSelectedAccountId] = useState(initialAccounts[0].id);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [scheduleMode, setScheduleMode] = useState("manual");
  const [newPlatform, setNewPlatform] = useState("");
  const [auditLog, setAuditLog] = useState([
    ["تم تحديث حالة Instagram", "System", "منذ 12 دقيقة"],
    ["تمت مراجعة WhatsApp Broadcast", "Reviewer", "قبل ساعة"],
    ["تم اكتشاف نقص فيديو TikTok", "Content Studio", "قبل ساعتين"],
  ]);

  useEffect(() => {
    const reloadReadiness = () => {
      const content = readCampaignContent([]);
      const stored = readMultiPlatformReadiness(initialAssets);
      const derived = buildReadinessFromContent(content, stored);
      const next = derived.length ? derived : stored;

      setContentItems(content);
      setAssets(next);
      writeMultiPlatformReadiness(next);
    };

    window.addEventListener("focus", reloadReadiness);
    window.addEventListener("storage", reloadReadiness);
    window.addEventListener("nashir-campaign-content-updated", reloadReadiness);
    window.addEventListener("nashir-multi-platform-readiness-updated", reloadReadiness);

    return () => {
      window.removeEventListener("focus", reloadReadiness);
      window.removeEventListener("storage", reloadReadiness);
      window.removeEventListener("nashir-campaign-content-updated", reloadReadiness);
      window.removeEventListener("nashir-multi-platform-readiness-updated", reloadReadiness);
    };
  }, []);

  const selectedAccount =
    accounts.find((account) => account.id === selectedAccountId) || accounts[0];

  const filteredAccounts = useMemo(() => {
    return accounts.filter((account) => {
      const matchesQuery =
        account.platform.toLowerCase().includes(query.toLowerCase()) ||
        account.account.toLowerCase().includes(query.toLowerCase()) ||
        account.owner.toLowerCase().includes(query.toLowerCase());

      const matchesStatus = statusFilter === "all" || account.status === statusFilter;

      return matchesQuery && matchesStatus;
    });
  }, [accounts, query, statusFilter]);

  const selectedAccounts = accounts.filter((account) => account.selected);
  const connectedSelected = selectedAccounts.filter((account) => account.status === "connected");
  const approvedAssets = assets.filter((asset) => asset.approval === "approved");
  const blockedAssets = assets.filter((asset) => asset.status === "blocked");
  const needsWork = assets.filter(
    (asset) => asset.status !== "ready" || asset.approval !== "approved"
  );

  const overallReadiness = useMemo(() => {
    if (!selectedAccounts.length) return 0;
    const sum = selectedAccounts.reduce((total, account) => total + getReadiness(account, assets), 0);
    return Math.round(sum / selectedAccounts.length);
  }, [selectedAccounts, assets]);

  const governanceWarnings = useMemo(() => {
    const warnings = [];

    if (!selectedAccounts.length) warnings.push("لم يتم اختيار أي قناة للنشر.");
    if (selectedAccounts.some((account) => account.status !== "connected")) {
      warnings.push("بعض القنوات المختارة غير مرتبطة بالكامل.");
    }
    if (needsWork.length) warnings.push("توجد مخرجات تحتاج مراجعة أو أصول ناقصة قبل النشر.");
    if (selectedAccounts.some((account) => account.risk === "high")) {
      warnings.push("توجد قنوات عالية الحساسية تتطلب موافقة بشرية.");
    }
    if (scheduleMode === "auto") {
      warnings.push("النشر التلقائي غير معتمد في هذا البروتوتايب ويجب إبقاؤه محاكاة فقط.");
    }

    return warnings.length ? warnings : ["كل القنوات المختارة جاهزة مبدئيًا، مع بقاء الاعتماد النهائي مطلوبًا."];
  }, [selectedAccounts, needsWork.length, scheduleMode]);

  const addAudit = (action, actor = "System") => {
    setAuditLog((prev) => [[action, actor, "الآن"], ...prev]);
  };

  const toggleAccount = (id) => {
    setAccounts((prev) =>
      prev.map((account) =>
        account.id === id ? { ...account, selected: !account.selected } : account
      )
    );
  };

  const updateSelectedAccount = (key, value) => {
    setAccounts((prev) =>
      prev.map((account) =>
        account.id === selectedAccount.id ? { ...account, [key]: value } : account
      )
    );
  };

  const updateAsset = (assetId, key, value) => {
    const asset = assets.find((item) => item.id === assetId);

    if (!asset) return;

    const updatedItem = {
      ...asset,
      [key]: value,
    };
    const next = upsertMultiPlatformReadinessItem(updatedItem, initialAssets);

    setAssets(next);
  };

  const syncAccounts = () => {
    setAccounts((prev) =>
      prev.map((account) =>
        account.status === "pending"
          ? { ...account, lastSync: "تمت محاولة الربط الآن" }
          : { ...account, lastSync: "الآن" }
      )
    );

    addAudit("تم تحديث الحسابات محليًا", "Multi-Platform");
  };

  const addMockAccount = () => {
    const name = newPlatform.trim();
    if (!name) return;

    const id = `${name.toLowerCase().replace(/\s+/g, "_")}_${Date.now()}`;

    setAccounts((prev) => [
      ...prev,
      {
        id,
        platform: name,
        account: "@new_account",
        status: "pending",
        owner: "Marketing",
        connectionType: "Manual",
        selected: false,
        publishMode: "manual_approval",
        lastSync: "أضيف الآن",
        risk: "medium",
      },
    ]);

    setSelectedAccountId(id);
    setNewPlatform("");
    addAudit(`تمت إضافة قناة ${name} محليًا`, "Admin");
  };

  const simulatePublish = () => {
    addAudit(
      overallReadiness >= 80
        ? "تمت محاكاة تجهيز خطة نشر متعددة القنوات"
        : "تم منع محاكاة النشر بسبب نقص الجاهزية",
      "Governance"
    );
  };

  const selectedWarnings = getAccountWarnings(selectedAccount);
  const selectedAssets = getChannelAssets(selectedAccount.platform, assets);

  return (
    <main className="multi-page" dir="rtl">
      <style>{styles}</style>

      <section className="hero">
        <div>
          <div className="eyebrow">
            <Layers size={15} />
            Multi-Platform
          </div>
          <h1>النشر متعدد القنوات</h1>
          <p>
            إدارة القنوات، جاهزية المقاسات، الموافقات، ومتطلبات كل منصة قبل أي نشر.
            كل الإجراءات هنا محاكاة محلية ولا تنشر فعليًا.
          </p>
        </div>

        <div className="hero-actions">
          <select value={scheduleMode} onChange={(event) => setScheduleMode(event.target.value)}>
            <option value="manual">نشر يدوي بعد الموافقة</option>
            <option value="scheduled">جدولة بعد الموافقة</option>
            <option value="auto">نشر تلقائي - غير معتمد</option>
          </select>

          <button className="secondary" type="button" onClick={simulatePublish}>
            <CalendarDays size={16} />
            محاكاة خطة النشر
          </button>

          <button className="primary" type="button" onClick={syncAccounts}>
            <RefreshCw size={16} />
            تحديث الحسابات
          </button>
        </div>
      </section>

      <section className="guardrail">
        <ShieldCheck size={19} />
        <div>
          <strong>Publication Guardrail</strong>
          <span>
            لا يوجد نشر حقيقي. أي قناة عالية الحساسية أو مخرج غير معتمد يجب أن
            يبقى في حالة مراجعة قبل الانتقال لاحقًا إلى تنفيذ فعلي.
          </span>
        </div>
      </section>

      <section className="stats">
        <Stat title="القنوات المختارة" value={selectedAccounts.length} hint={`${connectedSelected.length} مرتبطة`} />
        <Stat title="جاهزية النشر" value={`${overallReadiness}%`} hint="حسب الحسابات والمخرجات" />
        <Stat title="المخرجات المعتمدة" value={`${approvedAssets.length}/${assets.length}`} hint={`${needsWork.length} تحتاج عمل`} />
        <Stat title="قنوات عالية الحساسية" value={selectedAccounts.filter((x) => x.risk === "high").length} hint="تحتاج موافقة" />
      </section>

      <section className="controls-card">
        <div className="search-box">
          <Search size={17} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="ابحث عن قناة أو حساب أو مالك..."
          />
        </div>

        <div className="filter-group">
          {[
            ["all", "الكل"],
            ["connected", "مرتبط"],
            ["pending", "بانتظار"],
            ["disconnected", "غير متصل"],
            ["blocked", "موقوف"],
          ].map(([id, label]) => (
            <button
              key={id}
              type="button"
              className={statusFilter === id ? "active" : ""}
              onClick={() => setStatusFilter(id)}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      <section className="grid">
        <article className="card">
          <div className="card-header">
            <div>
              <h2>الحسابات والقنوات</h2>
              <p>اختيار القناة لا يعني السماح بالنشر؛ الجاهزية والموافقة مطلوبة.</p>
            </div>
            <Globe2 size={20} />
          </div>

          <div className="add-box">
            <input
              value={newPlatform}
              onChange={(event) => setNewPlatform(event.target.value)}
              placeholder="أضف قناة جديدة محليًا..."
            />
            <button type="button" onClick={addMockAccount}>
              <Plus size={16} />
              إضافة
            </button>
          </div>

          <div className="account-list">
            {filteredAccounts.map((account) => (
              <button
                key={account.id}
                type="button"
                className={`${selectedAccount.id === account.id ? "focused" : ""} ${account.selected ? "selected" : ""}`}
                onClick={() => setSelectedAccountId(account.id)}
              >
                <div className="account-main">
                  <span className="platform-icon"><Globe2 size={18} /></span>
                  <span>
                    <strong>{account.platform}</strong>
                    <small>{account.account}</small>
                  </span>
                </div>

                <div className="account-actions">
                  <Status value={account.status} />
                  <span
                    role="button"
                    tabIndex={0}
                    className={account.selected ? "check selected" : "check"}
                    onClick={(event) => {
                      event.stopPropagation();
                      toggleAccount(account.id);
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.stopPropagation();
                        toggleAccount(account.id);
                      }
                    }}
                  >
                    {account.selected ? <CheckCircle2 size={17} /> : <Plus size={17} />}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </article>

        <article className="card">
          <div className="card-header">
            <div>
              <h2>جاهزية المقاسات والمخرجات</h2>
              <p>كل منصة تحتاج أصلًا مناسبًا ومراجعة قبل الاعتماد.</p>
            </div>
            <Smartphone size={20} />
          </div>

          <div className="size-grid">
            {assets.map((asset) => (
              <div key={asset.id} className="asset-card">
                <div className="asset-head">
                  <div>
                    <strong>{asset.name}</strong>
                    <span>{asset.platform} · {asset.size}</span>
                  </div>
                  <AssetStatus value={asset.status} />
                </div>

                <p>{asset.issue}</p>

                <div className="asset-controls">
                  <select
                    value={asset.status}
                    onChange={(event) => updateAsset(asset.id, "status", event.target.value)}
                  >
                    <option value="ready">جاهز</option>
                    <option value="needs_review">يحتاج مراجعة</option>
                    <option value="needs_asset">يحتاج أصل</option>
                    <option value="blocked">محظور</option>
                  </select>

                  <select
                    value={asset.approval}
                    onChange={(event) => updateAsset(asset.id, "approval", event.target.value)}
                  >
                    <option value="approved">معتمد</option>
                    <option value="needs_review">بانتظار مراجعة</option>
                    <option value="rejected">مرفوض</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        </article>

        <aside className="card">
          <div className="card-header">
            <div>
              <h2>ملخص النشر</h2>
              <p>قرار الجاهزية النهائي.</p>
            </div>
            <FileCheck2 size={20} />
          </div>

          <Summary label="القنوات المختارة" value={selectedAccounts.length} />
          <Summary label="المقاسات الجاهزة" value={`${assets.filter((x) => x.status === "ready").length}/${assets.length}`} />
          <Summary label="مخرجات معتمدة" value={`${approvedAssets.length}/${assets.length}`} />
          <Summary label="وضع الجدولة" value={scheduleMode === "manual" ? "يدوي" : scheduleMode === "scheduled" ? "مجدول" : "تلقائي محظور"} />

          <div className="readiness">
            <div>
              <span>جاهزية عامة</span>
              <strong>{overallReadiness}%</strong>
            </div>
            <div className="meter">
              <span style={{ width: `${overallReadiness}%` }} />
            </div>
          </div>

          <div className="warnings">
            {governanceWarnings.map((warning) => (
              <div key={warning} className={warning.includes("جاهزة") ? "warning ok" : "warning"}>
                {warning.includes("جاهزة") ? <CheckCircle2 size={17} /> : <AlertTriangle size={17} />}
                <span>{warning}</span>
              </div>
            ))}
          </div>
        </aside>
      </section>

      <section className="detail-grid">
        <article className="card">
          <div className="card-header">
            <div>
              <h2>إعداد القناة المحددة</h2>
              <p>{selectedAccount.platform} · {selectedAccount.account}</p>
            </div>
            <Status value={selectedAccount.status} />
          </div>

          <div className="edit-grid">
            <label>
              <span>الحساب</span>
              <input
                value={selectedAccount.account}
                onChange={(event) => updateSelectedAccount("account", event.target.value)}
              />
            </label>

            <label>
              <span>المالك</span>
              <input
                value={selectedAccount.owner}
                onChange={(event) => updateSelectedAccount("owner", event.target.value)}
              />
            </label>

            <label>
              <span>الحالة</span>
              <select
                value={selectedAccount.status}
                onChange={(event) => updateSelectedAccount("status", event.target.value)}
              >
                <option value="connected">مرتبط</option>
                <option value="pending">بانتظار</option>
                <option value="disconnected">غير متصل</option>
                <option value="blocked">موقوف</option>
              </select>
            </label>

            <label>
              <span>مستوى الحساسية</span>
              <select
                value={selectedAccount.risk}
                onChange={(event) => updateSelectedAccount("risk", event.target.value)}
              >
                <option value="low">منخفض</option>
                <option value="medium">متوسط</option>
                <option value="high">مرتفع</option>
              </select>
            </label>
          </div>

          <div className="requirements">
            <h3>متطلبات المنصة</h3>
            <div>
              {(platformRequirements[selectedAccount.platform] || [
                "ربط الحساب",
                "اعتماد المخرج",
                "مراجعة بشرية",
              ]).map((requirement) => (
                <span key={requirement}>
                  <CheckCircle2 size={14} />
                  {requirement}
                </span>
              ))}
            </div>
          </div>
        </article>

        <article className="card">
          <div className="card-header">
            <div>
              <h2>حوكمة القناة</h2>
              <p>تحذيرات خاصة بالقناة المحددة.</p>
            </div>
            <ShieldCheck size={20} />
          </div>

          <div className="channel-score">
            <div>
              <span>جاهزية القناة</span>
              <strong>{getReadiness(selectedAccount, assets)}%</strong>
            </div>
            <div className="meter">
              <span style={{ width: `${getReadiness(selectedAccount, assets)}%` }} />
            </div>
          </div>

          <div className="warnings">
            {selectedWarnings.length ? (
              selectedWarnings.map((warning) => (
                <div key={warning} className="warning">
                  <CircleAlert size={17} />
                  <span>{warning}</span>
                </div>
              ))
            ) : (
              <div className="warning ok">
                <CheckCircle2 size={17} />
                <span>لا توجد تحذيرات حرجة لهذه القناة.</span>
              </div>
            )}
          </div>

          <div className="selected-assets">
            <h3>مخرجات هذه القناة</h3>
            {selectedAssets.length ? (
              selectedAssets.map((asset) => (
                <div key={asset.id} className="selected-asset-row">
                  <span>{asset.name}</span>
                  <Approval value={asset.approval} />
                </div>
              ))
            ) : (
              <p>لا توجد مخرجات مرتبطة بهذه القناة بعد.</p>
            )}
          </div>
        </article>
      </section>

      <section className="bottom-grid">
        <article className="card">
          <div className="card-header">
            <div>
              <h2>محاكاة النشر</h2>
              <p>نتيجة تشغيل محلية لا ترسل أي شيء للقنوات.</p>
            </div>
            <Wand2 size={20} />
          </div>

          <div className={overallReadiness >= 80 ? "simulation ok" : "simulation blocked"}>
            {overallReadiness >= 80 ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
            <div>
              <strong>
                {overallReadiness >= 80
                  ? "يمكن تجهيز خطة نشر بعد الموافقة النهائية"
                  : "لا يمكن تجهيز خطة نشر آمنة الآن"}
              </strong>
              <span>
                {overallReadiness >= 80
                  ? "القنوات والمخرجات جاهزة مبدئيًا، لكن النشر الحقيقي غير مفعل."
                  : "أكمل الربط والمراجعة وتوفير الأصول الناقصة قبل المتابعة."}
              </span>
            </div>
          </div>

          <button type="button" className="primary full" onClick={simulatePublish}>
            <MessageSquare size={16} />
            تشغيل محاكاة النشر
          </button>
        </article>

        <article className="card">
          <div className="card-header">
            <div>
              <h2>سجل الحوكمة</h2>
              <p>أحداث محلية مرتبطة بالقنوات والمراجعة.</p>
            </div>
            <Clock3 size={20} />
          </div>

          <div className="audit-list">
            {auditLog.map(([action, actor, time]) => (
              <div key={`${action}-${time}`} className="audit-row">
                <Lock size={16} />
                <p>
                  <strong>{action}</strong>
                  <span>{actor} · {time}</span>
                </p>
              </div>
            ))}
          </div>
        </article>
      </section>
    </main>
  );
}

function Status({ value }) {
  const [label, tone] = statusMap[value] || statusMap.pending;
  return <span className={`status ${tone}`}>{label}</span>;
}

function AssetStatus({ value }) {
  const [label, tone] = assetStatusMap[value] || assetStatusMap.needs_review;
  return <span className={`status ${tone}`}>{label}</span>;
}

function Approval({ value }) {
  const [label, tone] = approvalMap[value] || approvalMap.needs_review;
  return <span className={`status ${tone}`}>{label}</span>;
}

function Stat({ title, value, hint }) {
  return (
    <article className="stat">
      <span>{title}</span>
      <strong>{value}</strong>
      {hint ? <small>{hint}</small> : null}
    </article>
  );
}

function Summary({ label, value }) {
  return (
    <div className="summary">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

const styles = `
.multi-page{
  min-height:calc(100vh - 80px);
  padding:24px;
  background:#f7f8f4;
  color:#1f241d;
  font-family:Inter,"Segoe UI",Tahoma,Arial,sans-serif;
}

.hero,
.card,
.stat,
.controls-card,
.guardrail{
  border:1px solid #e4e7df;
  background:#fff;
  border-radius:24px;
  box-shadow:0 8px 26px rgba(24,38,18,.035);
}

.hero{
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

.hero h1{
  margin:0;
  font-size:34px;
  letter-spacing:-.04em;
}

.hero p{
  margin:7px 0 0;
  color:#6f746b;
  line-height:1.8;
  max-width:820px;
}

.hero-actions{
  display:flex;
  gap:10px;
  flex-wrap:wrap;
  align-items:flex-start;
  justify-content:flex-end;
}

.hero-actions select,
.edit-grid input,
.edit-grid select,
.asset-controls select{
  min-height:42px;
  border:1px solid #e4e7df;
  background:#fff;
  border-radius:16px;
  padding:0 12px;
  font-family:inherit;
  font-weight:900;
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

.full{
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

.stats{
  display:grid;
  grid-template-columns:repeat(4,1fr);
  gap:14px;
  margin-bottom:16px;
}

.stat{
  padding:16px;
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

.stat small{
  display:block;
  margin-top:5px;
  color:#8a9185;
  font-size:12px;
  font-weight:800;
}

.controls-card{
  padding:14px;
  margin-bottom:16px;
  display:flex;
  justify-content:space-between;
  gap:12px;
  align-items:center;
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

.filter-group{
  display:flex;
  gap:8px;
  flex-wrap:wrap;
}

.filter-group button{
  min-height:36px;
  border:1px solid #e4e7df;
  background:#fff;
  border-radius:999px;
  padding:0 12px;
  font-family:inherit;
  font-weight:900;
  cursor:pointer;
}

.filter-group button.active{
  border-color:#176b2c;
  background:#eef7e9;
  color:#176b2c;
}

.grid{
  display:grid;
  grid-template-columns:360px minmax(0,1fr)320px;
  gap:16px;
  margin-bottom:16px;
}

.detail-grid,
.bottom-grid{
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:16px;
  margin-bottom:16px;
}

.card{
  padding:18px;
}

.card-header{
  display:flex;
  justify-content:space-between;
  gap:12px;
  align-items:flex-start;
  margin-bottom:14px;
}

.card h2{
  margin:0;
}

.card p{
  margin:6px 0 0;
  color:#6f746b;
  line-height:1.7;
  font-size:13px;
}

.add-box{
  display:flex;
  gap:8px;
  margin-bottom:14px;
}

.add-box input{
  flex:1;
  min-height:42px;
  border:1px solid #e4e7df;
  background:#f7f8f4;
  border-radius:16px;
  padding:0 12px;
  font-family:inherit;
  font-weight:800;
}

.add-box button{
  border:0;
  background:#176b2c;
  color:#fff;
  border-radius:16px;
  padding:0 12px;
  display:inline-flex;
  align-items:center;
  gap:6px;
  font-family:inherit;
  font-weight:900;
}

.account-list{
  display:grid;
  gap:10px;
}

.account-list button{
  border:1px solid #e4e7df;
  background:#fff;
  border-radius:18px;
  padding:13px;
  display:flex;
  justify-content:space-between;
  gap:12px;
  align-items:center;
  text-align:right;
  font-family:inherit;
  cursor:pointer;
}

.account-list button.selected{
  background:#f7fbf3;
}

.account-list button.focused{
  border-color:#176b2c;
  background:#eef7e9;
}

.account-main{
  display:flex;
  gap:10px;
  align-items:center;
  min-width:0;
}

.platform-icon{
  width:34px;
  height:34px;
  border-radius:12px;
  display:grid;
  place-items:center;
  background:#eef7e9;
  color:#176b2c;
  flex:0 0 auto;
}

.account-list strong{
  display:block;
}

.account-list small{
  display:block;
  color:#6f746b;
  margin-top:4px;
}

.account-actions{
  display:flex;
  gap:8px;
  align-items:center;
  flex:0 0 auto;
}

.check{
  width:32px;
  height:32px;
  border:1px solid #e4e7df;
  border-radius:999px;
  display:grid;
  place-items:center;
  color:#6f746b;
}

.check.selected{
  color:#176b2c;
  background:#eef7e9;
  border-color:#176b2c;
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

.red{
  background:#fef2f2;
  color:#991b1b;
}

.slate{
  background:#f8fafc;
  color:#475569;
}

.size-grid{
  display:grid;
  grid-template-columns:repeat(2,minmax(0,1fr));
  gap:12px;
}

.asset-card{
  border:1px solid #e4e7df;
  background:#f7f8f4;
  border-radius:18px;
  padding:14px;
}

.asset-head{
  display:flex;
  justify-content:space-between;
  gap:10px;
  align-items:flex-start;
}

.asset-head strong,
.asset-head span{
  display:block;
}

.asset-head span{
  color:#6f746b;
  margin-top:5px;
  font-size:12px;
  font-weight:800;
}

.asset-card p{
  min-height:44px;
}

.asset-controls{
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:8px;
  margin-top:12px;
}

.summary{
  border-bottom:1px solid #e4e7df;
  min-height:44px;
  display:flex;
  justify-content:space-between;
  align-items:center;
  gap:10px;
}

.summary span{
  color:#6f746b;
  font-size:12px;
  font-weight:900;
}

.readiness,
.channel-score{
  border:1px solid #e4e7df;
  background:#f7f8f4;
  border-radius:18px;
  padding:13px;
  margin-top:14px;
}

.readiness>div:first-child,
.channel-score>div:first-child{
  display:flex;
  justify-content:space-between;
  gap:10px;
  font-weight:900;
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

.edit-grid{
  display:grid;
  grid-template-columns:repeat(4,1fr);
  gap:10px;
  margin-bottom:16px;
}

.edit-grid label{
  display:grid;
  gap:7px;
}

.edit-grid label span{
  color:#6f746b;
  font-size:12px;
  font-weight:900;
}

.requirements{
  border:1px solid #e4e7df;
  background:#f7f8f4;
  border-radius:18px;
  padding:14px;
}

.requirements h3,
.selected-assets h3{
  margin:0 0 10px;
}

.requirements>div{
  display:flex;
  gap:8px;
  flex-wrap:wrap;
}

.requirements span{
  border:1px solid #dce8d5;
  background:#fff;
  color:#176b2c;
  border-radius:999px;
  min-height:32px;
  padding:0 10px;
  display:inline-flex;
  align-items:center;
  gap:6px;
  font-size:12px;
  font-weight:900;
}

.selected-assets{
  margin-top:14px;
}

.selected-asset-row{
  min-height:42px;
  border-bottom:1px solid #e4e7df;
  display:flex;
  justify-content:space-between;
  gap:10px;
  align-items:center;
}

.simulation{
  border-radius:18px;
  padding:14px;
  display:flex;
  gap:10px;
  align-items:flex-start;
}

.simulation strong{
  display:block;
  margin-bottom:4px;
}

.simulation span{
  display:block;
  line-height:1.7;
  font-size:13px;
}

.simulation.ok{
  border:1px solid #bbf7d0;
  background:#f0fdf4;
  color:#166534;
}

.simulation.blocked{
  border:1px solid #fecaca;
  background:#fef2f2;
  color:#991b1b;
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
  color:#6f746b;
  margin-top:4px;
  font-size:12px;
  font-weight:800;
}

@media(max-width:1180px){
  .stats,
  .grid,
  .detail-grid,
  .bottom-grid{
    grid-template-columns:1fr;
  }

  .hero{
    flex-direction:column;
  }

  .hero-actions{
    justify-content:flex-start;
  }
}

@media(max-width:760px){
  .size-grid,
  .edit-grid,
  .asset-controls{
    grid-template-columns:1fr;
  }

  .controls-card{
    align-items:stretch;
  }
}
`;
