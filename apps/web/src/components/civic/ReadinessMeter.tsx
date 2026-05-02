'use client';

interface ReadinessMeterProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
}

const SIZES = {
  sm: { px: 80, r: 30, stroke: 5, fontSize: '1rem' },
  md: { px: 120, r: 46, stroke: 7, fontSize: '1.5rem' },
  lg: { px: 160, r: 62, stroke: 8, fontSize: '2rem' },
};

export function ReadinessMeter({ score, size = 'md' }: ReadinessMeterProps) {
  const { px, r, stroke, fontSize } = SIZES[size];
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (score / 100) * circumference;

  const color =
    score >= 80 ? '#10B981' : // Emerald
    score >= 40 ? '#F59E0B' : // Amber
    '#EF4444';                // Red

  const label =
    score >= 80 ? 'Ready to vote' :
    score >= 40 ? 'Keep going' :
    'Action needed';

  return (
    <div className="flex flex-col items-center gap-2">
      <svg
        width={px}
        height={px}
        role="meter"
        aria-label={`Voter readiness: ${score} out of 100`}
        aria-valuenow={score}
        aria-valuemin={0}
        aria-valuemax={100}
        viewBox={`0 0 ${px} ${px}`}
      >
        {/* Track */}
        <circle
          cx={px / 2} cy={px / 2} r={r}
          fill="none"
          stroke="#E2E8F0"
          strokeWidth={stroke}
        />
        {/* Fill */}
        <circle
          cx={px / 2} cy={px / 2} r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{
            transform: 'rotate(-90deg)',
            transformOrigin: 'center',
            transition: 'stroke-dashoffset 500ms ease, stroke 300ms ease',
          }}
        />
        {/* Score text */}
        <text
          x={px / 2} y={px / 2}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={fontSize}
          fontWeight="700"
          fill="#102A43"
          fontFamily="Inter, sans-serif"
        >
          {score}
        </text>
      </svg>
      <p className="text-sm font-medium" style={{ color }}>
        {label}
      </p>
    </div>
  );
}
