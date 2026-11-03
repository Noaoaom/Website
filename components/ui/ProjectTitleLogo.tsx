type ProjectTitleLogoProps = {
  src: string;
  alt: string;
  className?: string;
  color?: string;
};

/** Project wordmark rendered in brand red via CSS mask. */
export default function ProjectTitleLogo({
  src,
  alt,
  className = "",
  color = "#d60001",
}: ProjectTitleLogoProps) {
  return (
    <div
      role="img"
      aria-label={alt}
      className={`block ${className}`}
      style={{
        backgroundColor: color,
        WebkitMaskImage: `url(${src})`,
        maskImage: `url(${src})`,
        WebkitMaskSize: "contain",
        maskSize: "contain",
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskPosition: "center",
        maskPosition: "center",
      }}
    />
  );
}
