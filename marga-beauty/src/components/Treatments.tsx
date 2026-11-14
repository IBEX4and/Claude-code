"use client";

import { useRef, useState } from "react";
import { content } from "@/content";
import { areas, type TreatmentArea } from "@/content/treatments";
import { useExperience } from "./Experience";
import { TextReveal } from "./TextReveal";
import { Visual } from "./Visual";

type AreaId = TreatmentArea["id"];

/**
 * Trattamenti: due aree (Donna / Uomo) con le stesse quattro categorie.
 * Si può passare liberamente da un'area all'altra; la pagina scorre in modo
 * normale (niente blocchi o "agganci" della rolagem).
 */
export function Treatments() {
  const t = content.treatments;
  const { scrollTo } = useExperience();
  const [areaId, setAreaId] = useState<AreaId>("donna");
  const [categoryIndex, setCategoryIndex] = useState(0);
  const panel = useRef<HTMLDivElement>(null);
  const controls = useRef<HTMLDivElement>(null);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);

  const area = areas.find((a) => a.id === areaId) ?? areas[0];
  const category = area.categories[Math.min(categoryIndex, area.categories.length - 1)];

  // Lista lunga già scorsa: dopo il cambio torna ai pulsanti, sopra il nuovo elenco.
  const keepInView = () =>
    requestAnimationFrame(() => {
      if (panel.current && controls.current && panel.current.getBoundingClientRect().top < 0) scrollTo(controls.current);
    });

  const chooseArea = (id: AreaId) => {
    setAreaId(id);
    keepInView();
  };
  const chooseCategory = (i: number) => {
    setCategoryIndex(i);
    tabs.current[i]?.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
    keepInView();
  };

  // Frecce sinistra/destra tra le categorie, come una barra di schede.
  const onTabKey = (e: React.KeyboardEvent, i: number) => {
    const n = area.categories.length;
    const next = e.key === "ArrowRight" ? (i + 1) % n : e.key === "ArrowLeft" ? (i - 1 + n) % n : -1;
    if (next < 0) return;
    e.preventDefault();
    chooseCategory(next);
    tabs.current[next]?.focus();
  };

  return (
    <section id="tratamenti" className="treat" data-snap>
      <div className="treat__inner">
        <div className="treat__head">
          <TextReveal stagger={0.015}>
            <h2 className="treat__title">{t.title}</h2>
          </TextReveal>
          <p className="treat__lead">{t.intro}</p>
        </div>

        <div ref={controls} className="treat__controls">
          <div className="treat__areas" role="group" aria-label={t.areasLabel}>
            {areas.map((a) => (
              <button
                key={a.id}
                type="button"
                className="treat__area"
                aria-pressed={a.id === area.id}
                onClick={() => chooseArea(a.id)}
              >
                {a.name}
              </button>
            ))}
          </div>

          <div className="treat__tabs" role="tablist" aria-label={t.categoriesLabel}>
            {area.categories.map((c, i) => (
              <button
                key={c.id}
                ref={(el) => void (tabs.current[i] = el)}
                type="button"
                role="tab"
                id={`tab-${c.id}`}
                aria-selected={c.id === category.id}
                aria-controls="treat-panel"
                tabIndex={c.id === category.id ? 0 : -1}
                className="treat__tab"
                onClick={() => chooseCategory(i)}
                onKeyDown={(e) => onTabKey(e, i)}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        <div
          ref={panel}
          key={category.id}
          id="treat-panel"
          role="tabpanel"
          aria-labelledby={`tab-${category.id}`}
          className="treat__panel"
        >
          <div className="treat__content">
            <div className="treat__panel-head">
              <p className="treat__eyebrow">{area.name}</p>
              <h3>{category.name}</h3>
              {category.intro && <p className="treat__intro">{category.intro}</p>}
            </div>

            {category.groups.map((group, g) => (
              <div key={g} className="treat__group">
                {group.title && <h4 className="treat__group-title">{group.title}</h4>}
                <ul>
                  {group.items.map((item) => (
                    <li key={item.id} className={`treat__item${item.description ? "" : " treat__item--short"}`}>
                      <div>
                        <h5>{item.name}</h5>
                        {item.description && <p>{item.description}</p>}
                      </div>
                      <a href="#agendar" data-book-service={item.id} className="treat__book" aria-label={t.bookAria(item.name)}>
                        {t.book}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {category.notes.length > 0 && (
              <div className="treat__notes">
                {category.notes.map((note) => (
                  <p key={note}>{note}</p>
                ))}
              </div>
            )}

          </div>
          <div className="treat__visual">
            <Visual id={category.image} />
          </div>
        </div>
      </div>
      <div className="treat__glow" aria-hidden="true">
        <div />
      </div>
    </section>
  );
}
