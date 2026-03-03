// Ícones simples com emoji/SVG inline (evita libs externas)
const CustomIcon = ({ label, path, size = 18 }: { label?: string; path?: string; size?: number }) => {
  if (!path) return <span aria-hidden>•</span>;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      role={label ? "img" : undefined}
      aria-label={label}
      style={{ display: "inline", verticalAlign: "middle" }}
    >
      <path d={path} />
    </svg>
  );
}

export default CustomIcon;