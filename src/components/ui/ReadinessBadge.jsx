import Badge from "./Badge.jsx";

const STATUS_CONFIG = {
  ready:          { tone: "green",   label: "جاهز" },
  warning:        { tone: "amber",   label: "تحذير" },
  blocked:        { tone: "red",     label: "محجوب" },
  unknown:        { tone: "neutral", label: "غير معروف" },
  not_configured: { tone: "neutral", label: "غير مهيأ" },
};

export default function ReadinessBadge({ status }) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.unknown;
  return <Badge tone={config.tone}>{config.label}</Badge>;
}
