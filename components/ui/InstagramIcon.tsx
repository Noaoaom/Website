type InstagramIconProps = {
  className?: string;
};

export default function InstagramIcon({ className = "size-[1em]" }: InstagramIconProps) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden
      className={`block ${className}`}
      preserveAspectRatio="xMidYMid meet"
    >
      <rect
        x="1.5"
        y="1.5"
        width="17"
        height="17"
        rx="4.25"
        stroke="currentColor"
        strokeWidth="1.35"
      />
      <circle
        cx="10"
        cy="10"
        r="3.75"
        stroke="currentColor"
        strokeWidth="1.35"
      />
      <circle cx="14.65" cy="5.35" r="0.95" fill="currentColor" />
    </svg>
  );
}
