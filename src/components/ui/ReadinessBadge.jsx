const STATUS_CONFIG = {
  ready:          { tone: "badge-green",   label: "جاهز" },
  warning:        { tone: "badge-amber",   label: "تحذير" },
  blocked:        { tone: "badge-red",     label: "محجوب" },
  unknown:        { tone: "badge-neutral", label: "غير معروف" },
  not_configured: { tone: "badge-neutral", label: "غير مهيأ" },
  not_applicable: { tone: "badge-neutral", label: "لا ينطبق" },
};

export default function ReadinessBadge({ status }) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.unknown;
  return <span className={`badge ${config.tone}`}>{config.label}</span>;
}
