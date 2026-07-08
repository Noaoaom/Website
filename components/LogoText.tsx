type LogoTextProps = {
  className?: string;
  color?: string;
  width?: number;
  height?: number;
};

export default function LogoText({
  className = "",
  color = "#D60001",
  width = 624,
  height = 145,
}: LogoTextProps) {
  return (
    <div
      className={`block h-full w-full ${className}`}
      style={{
        width,
        height,
        WebkitMaskImage: "url(/logo-text.svg)",
        maskImage: "url(/logo-text.svg)",
        WebkitMaskSize: "contain",
        maskSize: "contain",
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskPosition: "center",
        maskPosition: "center",
        backgroundColor: color,
      }}
    />
  );
}
