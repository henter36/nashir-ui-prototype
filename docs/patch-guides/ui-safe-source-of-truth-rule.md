# UI-Safe Source-of-Truth Rule Patch

Add this note to the project documentation if needed.

## Rule

Single Source of Truth is an internal system rule.

It is used to prevent duplicated entities during implementation.

It must not be exposed to the customer or merchant as visible UI wording.

## UI Must Show

- values
- operational status
- readiness
- approval state
- available actions

## UI Must Not Show

- source entity
- owner surface
- backend table
- sourceSurface
- contentId/productId as labels
- "this field belongs to screen X"

## Example

Correct customer-facing UI:

```txt
المحتوى جاهز للنشر
القناة تحتاج ربط
المنتج يحتاج وصفًا
المراجعة مطلوبة
```

Incorrect customer-facing UI:

```txt
هذا الحقل مصدره ProductCatalogPage
هذا المحتوى من ContentStudioPage
مصدر الحقيقة: CampaignContent
contentId: abc123
```
