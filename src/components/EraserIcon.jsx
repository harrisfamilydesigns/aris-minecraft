export default function EraserIcon({ size = 20 }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      style={{ display: 'block', flexShrink: 0 }}
    >
      {/* Eraser body */}
      <g transform="translate(12,13) rotate(-25) translate(-10,-6)">
        {/* Main pink body */}
        <rect x="0" y="0" width="20" height="12" rx="2" fill="#FF85A2" />
        {/* Darker stripe near bottom */}
        <rect x="0" y="7.5" width="20" height="4.5" rx="1" fill="#D44070" />
        {/* Top highlight */}
        <rect x="1.5" y="1.5" width="17" height="2.5" rx="1" fill="rgba(255,255,255,0.35)" />
      </g>
    </svg>
  )
}
