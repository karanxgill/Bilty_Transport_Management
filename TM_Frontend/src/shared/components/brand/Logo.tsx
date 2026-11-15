export function Logo({ size }: { size: any }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size * (410 / 1420)}
      viewBox="120 140 1420 410"
      fill="none"
      role="img"
      aria-label="BiltyFlow"
    >
      <defs>
        <linearGradient
          id="iconGradient"
          x1="190"
          y1="130"
          x2="570"
          y2="535"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#9A63FF" />
          <stop offset="0.48" stopColor="#7540E8" />
          <stop offset="1" stopColor="#5522C8" />
        </linearGradient>

        <linearGradient
          id="flowGradient"
          x1="1280"
          y1="230"
          x2="1950"
          y2="500"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#A16BFF" />
          <stop offset="1" stopColor="#6B32DD" />
        </linearGradient>

        <linearGradient
          id="speedGradient"
          x1="125"
          y1="285"
          x2="335"
          y2="420"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#BFA5FF" />
          <stop offset="1" stopColor="#9E7BEF" />
        </linearGradient>
      </defs>

      {/* Document icon */}
      <path
        d="M226 157 H444 L570 280 V486 Q570 527 528 527 H269 Q226 527 226 484 Z"
        fill="url(#iconGradient)"
      />

      {/* Folded corner */}
      <path d="M444 157 V246 Q444 280 482 280 H570 Z" fill="#D5C2FF" />

      {/* Digital motion lines */}
      <path
        d="M157 285 H317 Q358 285 358 324 Q358 363 317 363 H191"
        fill="none"
        stroke="url(#speedGradient)"
        strokeWidth="42"
        strokeLinecap="round"
      />

      <path d="M190 412 H300" fill="none" stroke="#A98AF5" strokeWidth="40" strokeLinecap="round" />

      <path d="M259 458 H302" fill="none" stroke="#A98AF5" strokeWidth="40" strokeLinecap="round" />

      {/* Checkmark */}
      <path
        d="M354 392 L398 436 L500 331"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="28"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Brand name */}
      <text
        x="638"
        y="472"
        fontFamily="Inter, Arial, sans-serif"
        fontSize="200"
        fontWeight="800"
        letterSpacing="-13"
        fill="#101A2B"
      >
        Bilty
      </text>

      <text
        x="1050"
        y="472"
        fontFamily="Inter, Arial, sans-serif"
        fontSize="200"
        fontWeight="800"
        letterSpacing="-13"
        fill="url(#flowGradient)"
      >
        Flow
      </text>
    </svg>
  );
}
