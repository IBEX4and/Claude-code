/** Logotipo em texto, no mesmo desenho do "ELENAVOSS" da referência (duas espessuras). */
export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`logo ${className}`}>
      <span className="logo__a">Marga</span>
      <span className="logo__b">Beauty</span>
    </span>
  );
}
