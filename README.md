# Nashir UI Prototype

واجهة React/Vite تجريبية لمنصة **ناشر** ضمن تصور Marketing OS.

هذا المستودع مخصص حاليًا لتثبيت واجهات المنتج ومساراته فقط قبل أي تنفيذ حقيقي. لا يمثل Backend أو API أو Database أو نظام صلاحيات فعلي.

## الحالة الحالية

**Status:** UI Prototype / Mock Only  
**Framework:** React + Vite  
**Routing:** Local screen state داخل `App.jsx`، وليس React Router  
**Latest stabilization:** إزالة الصفحات المستقلة القديمة وتثبيت خريطة الشاشات الحالية.

## القيود الصريحة

- لا يوجد Backend.
- لا يوجد API.
- لا يوجد Database.
- لا يوجد Auth أو RBAC حقيقي.
- لا يوجد توليد AI حقيقي.
- لا يوجد نشر فعلي لأي قناة.
- لا يوجد إرسال WhatsApp أو Email أو تكامل Social حقيقي.
- البيانات الحالية Mock/Seed داخل ملفات الواجهة.
- أي أزرار فحص، توليد، نشر، اعتماد، أو تشغيل هي محاكاة محلية فقط.

## الشاشات الحالية المعتمدة

| Screen ID | الصفحة | الملف | الدور |
|---|---|---|---|
| `dashboard` | لوحة التحكم | `src/pages/DashboardPage.jsx` | نقطة دخول ومتابعة عامة |
| `storeSetup` | إعداد المتجر | `src/pages/StoreSetupPage.jsx` | تأسيس بيانات المتجر والهوية التشغيلية |
| `productCatalog` | كتالوج المنتجات | `src/pages/ProductCatalogPage.jsx` | إدارة منتجات/خدمات Mock لاستخدامها في الحملات |
| `dataSourcesHub` | مركز المصادر البياناتية | `src/pages/DataSourcesHubPage.jsx` | عرض وفحص مصادر البيانات والتكاملات كمحاكاة |
| `assetLibrary` | مكتبة الأصول | `src/pages/AssetLibraryPage.jsx` | إدارة أصول المحتوى التجريبية |
| `campaigns` | معالج الحملات | `src/pages/CampaignWizardPage.jsx` | إنشاء حملة عبر معالج موحد |
| `campaignsList` | الحملات | `src/pages/CampaignsUnifiedPage.jsx` | قائمة الحملات وتفاصيلها بشكل موحد |
| `content` | المحتوى والمراجعة | `src/pages/ContentStudioPage.jsx` | إنشاء/مراجعة المحتوى داخل شاشة موحدة |
| `publishingQueue` | جدولة النشر | `src/pages/PublishingQueuePage.jsx` | إدارة جدول نشر تجريبي |
| `analytics` | التحليلات | `src/pages/AnalyticsUnifiedPage.jsx` | التحليلات والتحليلات الذكية في شاشة موحدة |
| `templateEngine` | محرك القوالب | `src/pages/TemplateEnginePage.jsx` | إدارة قوالب المحتوى محليًا |
| `multiPlatform` | متعدد القنوات | `src/pages/MultiPlatformPage.jsx` | جاهزية النشر متعدد القنوات كمحاكاة |
| `teamCollaboration` | تعاون الفريق | `src/pages/TeamCollaborationPage.jsx` | أدوار وتعليقات وسجل تغييرات Mock |
| `workflowRuns` | تشغيلات النظام | `src/pages/WorkflowRunsPage.jsx` | عرض تشغيلات Workflows كمحاكاة |
| `systemAdmin` | إدارة النظام | `src/pages/SystemAdminPage.jsx` | إعدادات إدارية Mock |
| `secrets` | الأسرار والمفاتيح | `src/pages/SecretsAndKeysPage.jsx` | واجهة شكلية لإدارة الأسرار دون تخزين فعلي |
| `modelRouting` | توجيه النماذج | `src/pages/ModelRoutingPage.jsx` | محاكاة سياسات اختيار مزودي AI |
| `promptGovernance` | حوكمة المطالبات | `src/pages/PromptGovernancePage.jsx` | محاكاة إدارة المطالبات ومخاطرها |
| `costMonitor` | مراقبة التكلفة | `src/pages/CostMonitorPage.jsx` | محاكاة تكلفة تشغيل AI وحدود الميزانية |
| `settings` | الإعدادات | `src/pages/SettingsPage.jsx` | إعدادات عامة محلية |

## الصفحات التي أزيلت من المسار

هذه الصفحات لم تعد جزءًا من خريطة التنقل الحالية ولا يجب إعادتها كصفحات مستقلة دون قرار جديد:

- `OnboardingFlowPage`
- `CampaignIntakePage`
- `DualGuidedIntakePage`
- `ReviewPage`
- `LivePreviewPage`
- `SmartAnalyticsPage`
- `CampaignDetailPage`

سبب الإزالة: دمج أو نقل وظائفها داخل صفحات موحدة لتقليل التكرار وتثبيت رحلة المستخدم.

## الرحلة الأساسية المقترحة للواجهة

```text
Dashboard
→ StoreSetup
→ ProductCatalog / DataSourcesHub
→ CampaignWizard
→ CampaignsUnified
→ ContentStudio
→ PublishingQueue / MultiPlatform
→ Analytics
```

صفحات الإدارة والحوكمة تدعم الرحلة، لكنها ليست المسار الرئيسي للمستخدم التجاري.

## خريطة الشاشات

راجع:

```text
docs/screen_map.md
```

يحتوي الملف على تعريف كل شاشة، دورها، نوعها، حالتها، وملاحظات الحوكمة المرتبطة بها.

## التشغيل المحلي

```bash
npm install
npm run dev
```

للتأكد من سلامة البناء:

```bash
npm run build
```

ولفحص الكود:

```bash
npm run lint
```

## قرار المرحلة الحالية

لا يتم الانتقال إلى Backend/API/Database قبل إغلاق مرحلة:

```text
UI Stabilization Gate
```

وتشمل:

1. تثبيت خريطة الشاشات.
2. ضبط الرحلة الأساسية.
3. توحيد أنماط UI المتكررة.
4. توثيق ما هو Mock وما هو مطلوب لاحقًا للتنفيذ الحقيقي.
