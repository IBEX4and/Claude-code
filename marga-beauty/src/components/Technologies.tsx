import { content } from "@/content";

export function Technologies() {
  const t = content.technologies;
  return (
    <section id="tecnologias" className="tech">
      <div className="tech__aside">
        <h2 className="section-title">{t.title}</h2>
        <p className="section-intro">{t.intro}</p>
      </div>
      <ul className="tech__list">
        {t.items.map((item) => (
          <li key={item.name} className="tech__item">
            <h3 className="tech__name">{item.name}</h3>
            <p className="tech__description">{item.description}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
