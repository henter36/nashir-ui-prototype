import Badge from "./Badge.jsx";

export default function PageHeader({ title, description, badge }) {
  return (
    <section className="page-header">
      <div>
        <div className="page-title-row">
          <h1>{title}</h1>
          {badge && <Badge tone="blue">{badge}</Badge>}
        </div>
        <p>{description}</p>
      </div>
    </section>
  );
}