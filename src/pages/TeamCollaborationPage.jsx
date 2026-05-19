import React, { useState } from "react";
import { Clock3, MessageSquare, ShieldCheck, Users } from "lucide-react";

const members = [
  ["أحمد السعيد", "Owner", "كل الصلاحيات"],
  ["سارة محمد", "Reviewer", "مراجعة واعتماد"],
  ["محمد خالد", "Editor", "تحرير المحتوى"],
];

const comments = [
  ["سارة", "يحتاج CTA أوضح في Reel.", "قبل 10 دقائق"],
  ["أحمد", "اعتمد نسخة WhatsApp بعد تعديل الرابط.", "قبل 25 دقيقة"],
];

const changes = [
  ["تم تغيير دور سارة إلى Reviewer", "System Admin", "قبل ساعة"],
  ["تمت إضافة تعليق على Caption", "سارة", "قبل ساعتين"],
  ["تم تحديث حالة المحتوى إلى مراجعة", "محمد", "قبل 3 ساعات"],
];

export default function TeamCollaborationPage() {
  const [comment, setComment] = useState("");

  return (
    <main className="page" dir="rtl">
      <style>{styles}</style>
      <section className="hero"><div><div className="eyebrow"><Users size={15}/> Team Collaboration</div><h1>تعاون الفريق</h1><p>صلاحيات الأدوار، تعليقات على المحتوى، وسجل تغييرات واضح.</p></div></section>
      <section className="layout">
        <article className="card"><h2>الأدوار والصلاحيات</h2><div className="members">{members.map(([name,role,scope])=><div key={name}><div><strong>{name}</strong><span>{scope}</span></div><b>{role}</b></div>)}</div></article>
        <article className="card"><h2>تعليقات المحتوى</h2><div className="comment-box"><textarea value={comment} onChange={(e)=>setComment(e.target.value)} placeholder="أضف تعليقًا على المحتوى..." /><button>إضافة تعليق</button></div><div className="comments">{comments.map(([name,text,time])=><div key={text}><MessageSquare size={18}/><p><strong>{name}</strong> {text}<span>{time}</span></p></div>)}</div></article>
        <aside className="card"><h2>سجل التغييرات</h2><div className="changes">{changes.map(([action,actor,time])=><div key={action}><Clock3 size={17}/><p><strong>{action}</strong><span>{actor} · {time}</span></p></div>)}</div><div className="warning"><ShieldCheck size={18}/> لاحقًا يجب أن يكون السجل غير قابل للتلاعب ومربوطًا بالصلاحيات.</div></aside>
      </section>
    </main>
  )
}
const styles=`.page{min-height:calc(100vh - 80px);padding:24px;background:#f7f8f4;color:#1f241d;font-family:Inter,"Segoe UI",Tahoma,Arial,sans-serif}.hero,.card{border:1px solid #e4e7df;background:#fff;border-radius:24px;box-shadow:0 8px 26px rgba(24,38,18,.035)}.hero{padding:20px;margin-bottom:16px}.eyebrow{width:fit-content;min-height:30px;padding:0 11px;border-radius:999px;display:inline-flex;align-items:center;gap:7px;color:#176b2c;background:#eef7e9;font-size:12px;font-weight:900;margin-bottom:10px}.hero h1{margin:0;font-size:34px}.hero p{color:#6f746b}.layout{display:grid;grid-template-columns:330px minmax(0,1fr)330px;gap:16px}.card{padding:18px}.card h2{margin:0 0 14px}.members,.comments,.changes{display:grid;gap:10px}.members>div,.comments>div,.changes>div{border:1px solid #e4e7df;background:#f7f8f4;border-radius:18px;padding:13px;display:flex;justify-content:space-between;gap:10px}.members strong{display:block}.members span,.comments span,.changes span{display:block;color:#6f746b;font-size:12px;margin-top:4px}.members b{color:#176b2c}.comment-box{display:grid;gap:10px;margin-bottom:14px}.comment-box textarea{min-height:130px;border:1px solid #e4e7df;border-radius:16px;padding:14px;font-family:inherit;line-height:1.8}.comment-box button{min-height:42px;border:0;border-radius:16px;background:#176b2c;color:#fff;font-weight:900}.comments>div,.changes>div{justify-content:flex-start}.comments p,.changes p{margin:0;line-height:1.7}.warning{margin-top:14px;border:1px solid #fde68a;background:#fff7e6;color:#92400e;border-radius:18px;padding:13px;display:flex;gap:8px;line-height:1.8;font-size:12px;font-weight:800}@media(max-width:1100px){.layout{grid-template-columns:1fr}}`;