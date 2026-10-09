import { content } from "@/content";
import { images } from "@/content/images";
import { ParallaxImage } from "./ParallaxImage";

export function Drainage() {
  const t = content.drainage;
  return (
    <section id="drenagem" className="drainage">
      <ParallaxImage
        className="drainage__image"
        src={images.drainage.src}
        alt={t.imageAlt}
        width={images.drainage.width}
        height={images.drainage.height}
      />
      <div className="drainage__content">
        <h2 className="section-title">{t.title}</h2>
        <p className="drainage__method">{t.method}</p>
        <p className="drainage__text">{t.text}</p>
        <h3 className="drainage__subtitle">{t.benefitsTitle}</h3>
        <ul className="drainage__benefits">
          {t.benefits.map((benefit) => (
            <li key={benefit}>{benefit}</li>
          ))}
        </ul>
        <a href="#agendar" className="button button--light" data-book-service={t.ctaServiceId}>
          {t.cta}
        </a>
      </div>
    </section>
  );
}
