# Prompt + Template Source Gate — UI-Safe Minimal Patch

## Goal

Prevent prompts and templates from becoming separate entities inside each screen.

Do not redesign screens.
Do not remove existing UI sections.
Do not expose internal IDs or ownership concepts in the UI.

## Internal Stores

Use:

```txt
nashir_mock_prompt_governance
nashir_mock_template_engine
```

These are internal mock stores only.

## UI-Safe Rule

The user may see:

- مطالبة معتمدة
- مطالبة تجريبية
- قالب جاهز
- قالب يحتاج مراجعة
- إصدار نشط
- محظور
- مراجعة مطلوبة

The user must not see:

- مصدر الحقيقة
- مصدر مشترك
- الشاشة المالكة
- promptId
- templateId
- sourceSurface
- PromptGovernancePage
- TemplateEnginePage
- ContentStudioPage as ownership text

These terms may exist only as imports, function names, code metadata, or docs.

## Scope

Allowed files:

```txt
src/utils/promptTemplateStore.js
src/pages/PromptGovernancePage.jsx
src/pages/TemplateEnginePage.jsx
```

Do not edit `ContentStudioPage.jsx` in this first patch unless the build requires a safe import adjustment. ContentStudio will consume approved templates/prompts in a later small patch.

## PromptGovernancePage.jsx

### Required import

```js
import {
  readPromptRegistry,
  upsertPrompt,
  deletePrompt,
  duplicatePrompt,
} from "../utils/promptTemplateStore.js";
```

If `useEffect` is not imported, import it.

### State

Replace:

```js
const [promptList, setPromptList] = useState(INITIAL_PROMPTS);
```

with:

```js
const [promptList, setPromptList] = useState(() => readPromptRegistry(INITIAL_PROMPTS));
```

### Listener

Add:

```js
useEffect(() => {
  const refresh = () => setPromptList(readPromptRegistry(INITIAL_PROMPTS));

  window.addEventListener("focus", refresh);
  window.addEventListener("storage", refresh);
  window.addEventListener("nashir-prompt-governance-updated", refresh);

  return () => {
    window.removeEventListener("focus", refresh);
    window.removeEventListener("storage", refresh);
    window.removeEventListener("nashir-prompt-governance-updated", refresh);
  };
}, []);
```

### updatePrompt

Replace local-only mutation with:

```js
const updatePrompt = (patch) => {
  if (!selected) return;
  const next = upsertPrompt({ ...selected, ...patch, updatedAt: "الآن" }, INITIAL_PROMPTS);
  setPromptList(next);
};
```

### createPrompt

After building `newPrompt`:

```js
const next = upsertPrompt(newPrompt, INITIAL_PROMPTS);
setPromptList(next);
setSelectedId(newPrompt.id || newPrompt.promptId);
```

### duplicatePrompt

Use:

```js
const result = duplicatePrompt(selected, {
  name: `${selected.name} - نسخة مراجعة`,
  version: `${selected.version}-copy`,
}, INITIAL_PROMPTS);

setPromptList(result.items);
setSelectedId(result.item.id || result.item.promptId);
```

### deletePrompt

Use the imported delete function with an alias to avoid name conflict:

```js
import { deletePrompt as deletePromptFromStore } from "../utils/promptTemplateStore.js";
```

Then:

```js
const nextList = deletePromptFromStore(selected.id || selected.promptId, INITIAL_PROMPTS);
setPromptList(nextList);
setSelectedId(nextList[0]?.id || nextList[0]?.promptId);
```

## TemplateEnginePage.jsx

### Required import

```js
import {
  readTemplateRegistry,
  upsertTemplate,
  createTemplateFromText,
  deleteTemplate,
} from "../utils/promptTemplateStore.js";
```

If `useEffect` is not imported, import it.

### State

Replace:

```js
const [selectedId, setSelectedId] = useState(templates[0].id);
```

with:

```js
const [templateList, setTemplateList] = useState(() => readTemplateRegistry(templates));
const [selectedId, setSelectedId] = useState(() => readTemplateRegistry(templates)[0]?.id || templates[0].id);
```

Replace all filtering references from `templates` to `templateList`.

### Listener

Add:

```js
useEffect(() => {
  const refresh = () => {
    const latest = readTemplateRegistry(templates);
    setTemplateList(latest);
    setSelectedId((current) => current || latest[0]?.id || "");
  };

  window.addEventListener("focus", refresh);
  window.addEventListener("storage", refresh);
  window.addEventListener("nashir-template-engine-updated", refresh);

  return () => {
    window.removeEventListener("focus", refresh);
    window.removeEventListener("storage", refresh);
    window.removeEventListener("nashir-template-engine-updated", refresh);
  };
}, []);
```

### Save custom template

The current page has `customText`. The "حفظ" button should not remain local-only.

Use:

```js
const saveCustomTemplate = () => {
  const result = createTemplateFromText(customText, {
    title: selected?.title ? `${selected.title} - مخصص` : "قالب مخصص",
    occasion: selected?.occasion || "Custom",
    type: "مخصص",
    channel: selected?.channel || "عام",
    status: "draft",
    approval: "needs_review",
  }, templates);

  setTemplateList(result.items);
  setSelectedId(result.item.id || result.item.templateId);
};
```

Wire the existing save button to `saveCustomTemplate`.

### Create template button

If there is an "إنشاء قالب" button, wire it to create a draft template through `createTemplateFromText`, not local-only state.

### UI rule

Do not show `templateId`, `promptId`, `sourceSurface`, or owner-screen wording.

## Verification

Run:

```bash
npm run build

grep -RIn \
  "مصدر الحقيقة\|مصدر مشترك\|الشاشة المالكة\|promptId\|templateId\|sourceSurface\|PromptGovernancePage\|TemplateEnginePage\|ContentStudioPage" \
  src/pages src/components
```

Expected:
- Build passes.
- Grep may find internal code identifiers or component function names.
- Grep must not find those terms in visible JSX text.

## Commit

```bash
git add src/utils/promptTemplateStore.js src/pages/PromptGovernancePage.jsx src/pages/TemplateEnginePage.jsx
git commit -m "ui: share prompt and template registries safely"
git push origin main
```
