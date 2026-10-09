import { content } from "@/content";

export function Process() {
  const t = content.process;
  return (
    <section className="process" aria-labelledby="process-title">
      <h2 id="process-title" className="section-title">
        {t.title}
      </h2>
      <ol className="process__steps">
        {t.steps.map((step, i) => (
          <li key={step.title} className="process__step">
            <span className="process__number" aria-hidden="true">
              {i + 1}
            </span>
            <h3 className="process__title">{step.title}</h3>
            <p className="process__text">{step.text}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
