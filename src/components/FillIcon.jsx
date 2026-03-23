export default function FillIcon({ size = 18 }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}
    >
      {/* Paint pool on ground */}
      <ellipse cx="5.5" cy="20.5" rx="4.5" ry="1.8" fill="#4F9EF8" opacity="0.9" />
      {/* Paint drip stream */}
      <path
        d="M11 14 C9 16 7 18 5.5 19.5"
        stroke="#4F9EF8"
        strokeWidth="2.2"
        strokeLinecap="round"
        fill="none"
      />
      {/* Can body — tilted ~-50deg, opening facing lower-left */}
      <g transform="rotate(-50, 15, 10)">
        {/* Can body */}
        <rect x="10" y="5" width="10" height="13" rx="1.5" fill="#94A3B8" />
        {/* Can rim / lid */}
        <rect x="9" y="4" width="12" height="2.5" rx="1" fill="#64748B" />
        {/* Label (paint color) */}
        <rect x="11" y="8.5" width="7" height="5.5" rx="1" fill="#4F9EF8" />
        {/* Handle arc */}
        <path
          d="M12 4 Q15.5 0.5 19 4"
          stroke="#64748B"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
        />
      </g>
    </svg>
  )
}
