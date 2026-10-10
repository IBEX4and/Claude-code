import type { Metadata } from "next";
import { content } from "@/content";

const t = content.privacy;

export const metadata: Metadata = { title: `${t.title} — Marga Beauty`, robots: { index: false } };

export default function PrivacyPage() {
  return (
    <main className="legal">
      <a href="/" className="text-link">
        {t.back}
      </a>
      <h1 className="section-title">{t.title}</h1>
      <p className="legal__updated">{t.updated}</p>
      {t.sections.map((section) => (
        <section key={section.title}>
          <h2>{section.title}</h2>
          {section.body.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </section>
      ))}
    </main>
  );
}
