/** Logotipo oficial (MARGA Brazilian Beauty), versão bege para fundos escuros. */
export function Logo({ className = "" }: { className?: string }) {
  return (
    <img
      src="/brand/marga-logo-beige.svg"
      alt="MARGA Brazilian Beauty"
      width={4815}
      height={1762}
      className={`logo ${className}`}
      draggable={false}
    />
  );
}
