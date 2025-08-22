type Props = {
  href: string;
  imageUrl: string;
  alt?: string;
  className?: string;
};
export default function AdBanner({ href, imageUrl, alt = "ad banner", className }: Props) {
  return (
    <a href={href} target="_blank" rel="noreferrer"
       className={`block overflow-hidden rounded-2xl border border-[var(--c-card-border)] bg-white ${className ?? ""}`}>
      <img src={imageUrl} alt={alt} className="h-28 w-full object-cover md:h-36" loading="lazy"/>
    </a>
  );
}
