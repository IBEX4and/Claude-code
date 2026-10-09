import { content } from "@/content";
import { images } from "@/content/images";
import { ParallaxImage } from "./ParallaxImage";

export function About() {
  const t = content.about;
  return (
    <section id="sobre" className="about">
      <ParallaxImage
        className="about__image"
        src={images.about.src}
        alt={t.imageAlt}
        width={images.about.width}
        height={images.about.height}
        strength={8}
      />
      <div className="about__content">
        <h2 className="section-title">{t.title}</h2>
        {t.paragraphs.map((p) => (
          <p key={p} className="about__text">
            {p}
          </p>
        ))}
        <h3 className="about__subtitle">{t.credentialsTitle}</h3>
        <ul className="about__credentials">
          {t.credentials.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
