/**
 * Material Symbols Outlined ikonu — mobil tarafın kullandığı aynı ikon
 * ailesi (Flutter'ın `Icons.*`), emoji yerine web'de de aynı tutarlı
 * görseli vermek için. İsimler: fonts.google.com/icons.
 */
export function Icon({ name, className = "" }: { name: string; className?: string }) {
  return <span className={`material-symbols-outlined ${className}`}>{name}</span>;
}
