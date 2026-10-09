"use client";

/**
 * Botão em pílula da referência: o ponto cresce até preencher o botão e as
 * letras rolam para cima, uma de cada vez.
 */
export function RollButton({
  label,
  href = "#agendar",
  onClick,
  className = "",
  bookService,
  type,
  disabled,
}: {
  label: string;
  href?: string;
  onClick?: (e: React.MouseEvent) => void;
  className?: string;
  bookService?: string;
  /** Quando definido, vira <button> (ex.: envio de formulário). */
  type?: "button" | "submit";
  disabled?: boolean;
}) {
  const inner = (
    <>
      <span className="roll-btn__dot" aria-hidden="true">
        <span />
      </span>
      <span className="roll-btn__sizer" aria-hidden="true">
        {label}
      </span>
      <span className="roll-btn__label">
        <span className="roll-btn__chars" aria-label={label}>
          {Array.from(label).map((char, i) => (
            <span key={i} aria-hidden="true" style={{ transitionDelay: `${i * 0.01}s` }}>
              {char === " " ? " " : char}
            </span>
          ))}
        </span>
      </span>
      <span className="roll-btn__spacer" aria-hidden="true" />
    </>
  );

  if (type) {
    return (
      <button type={type} className={`roll-btn ${className}`} onClick={onClick} disabled={disabled}>
        {inner}
      </button>
    );
  }
  return (
    <a href={href} className={`roll-btn ${className}`} onClick={onClick} data-book-service={bookService}>
      {inner}
    </a>
  );
}
