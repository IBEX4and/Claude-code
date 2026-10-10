import { content } from "@/content";
import { visuals, type VisualKey } from "@/content/images";

/** Foto (ou cartaz provisório no degradê da marca, enquanto a foto real não chega). */
export function Visual({ id, className = "", alt = "" }: { id: VisualKey; className?: string; alt?: string }) {
  const v = visuals[id] as (typeof visuals)[VisualKey] & { src?: string; cutout?: boolean };
  if (v.src && !v.cutout) {
    return <img src={v.src} alt={alt} className={`visual visual--photo ${className}`} loading="lazy" decoding="async" />;
  }
  return (
    <div className={`visual visual--${v.tone} ${className}`} role={alt ? "img" : undefined} aria-label={alt || undefined}>
      {v.cutout && v.src ? (
        <img src={v.src} alt="" className="visual__cutout" loading="lazy" decoding="async" />
      ) : (
        <>
          <span className="visual__tag">{content.visuals.placeholder}</span>
          <span className="visual__label">{content.visuals.labels[id]}</span>
        </>
      )}
    </div>
  );
}
