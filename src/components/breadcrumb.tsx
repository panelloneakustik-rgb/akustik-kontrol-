import Link from "next/link";

export function Breadcrumb({
  items,
}: {
  items: { href?: string; label: string }[];
}) {
  return (
    <nav className="mb-6 text-xs text-ink/50">
      <Link href="/" className="hover:text-burgundy">
        Ana Sayfa
      </Link>
      {items.map((item) => (
        <span key={item.label}>
          {" / "}
          {item.href ? (
            <Link href={item.href} className="hover:text-burgundy">
              {item.label}
            </Link>
          ) : (
            <span className="text-ink/70">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
