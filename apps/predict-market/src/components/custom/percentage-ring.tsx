export function ProbabilityRing({
  probability,
}: {
  probability: number;
}) {
  const size = 112;
  const stroke = 10;
  const radius = (size - stroke) / 2;
  const center = size / 2;
  const clamped = Math.max(0, Math.min(100, probability));
  const gapDegrees = 8;
  const halfArcDegrees = 180;
  const filledDegrees = (halfArcDegrees * clamped) / 100;
  const leftAngle = 270;
  const rightAngle = 90;
  const splitAngle = (leftAngle + filledDegrees) % 360;
  const normalizeAngle = (angle: number) => (angle + 360) % 360;
  const filledEndAngle = normalizeAngle(splitAngle - gapDegrees / 2);
  const emptyStartAngle = normalizeAngle(splitAngle + gapDegrees / 2);

  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
  const polarToCartesian = (angleDegrees: number) => {
    const angle = toRadians(angleDegrees - 90);
    return {
      x: center + radius * Math.cos(angle),
      y: center + radius * Math.sin(angle),
    };
  };

  const describeArc = (startDegrees: number, endDegrees: number) => {
    const start = polarToCartesian(startDegrees);
    const end = polarToCartesian(endDegrees);
    const arcSpan = (endDegrees - startDegrees + 360) % 360;
    if (arcSpan === 0) {
      return "";
    }
    const largeArcFlag = arcSpan > 180 ? 1 : 0;
    const sweepFlag = 1;

    return [
      "M",
      start.x,
      start.y,
      "A",
      radius,
      radius,
      0,
      largeArcFlag,
      sweepFlag,
      end.x,
      end.y,
    ].join(" ");
  };

  const fullArc = describeArc(leftAngle, rightAngle);
  const filledArc = describeArc(leftAngle, filledEndAngle);
  const emptyArc = describeArc(emptyStartAngle, rightAngle);

  return (
    <div className="relative flex h-28 w-28 items-center justify-center rounded-3xl bg-[#1a1f24]">
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="absolute inset-0 h-full w-full"
        aria-hidden="true"
      >
        {clamped <= 0 ? (
          <path
            d={fullArc}
            fill="none"
            stroke="#303844"
            strokeWidth={stroke}
            strokeLinecap="round"
          />
        ) : clamped >= 100 ? (
          <path
            d={fullArc}
            fill="none"
            stroke="#4f8f69"
            strokeWidth={stroke}
            strokeLinecap="round"
          />
        ) : (
          <>
            <path
              d={emptyArc}
              fill="none"
              stroke="#303844"
              strokeWidth={stroke}
              strokeLinecap="round"
            />
            <path
              d={filledArc}
              fill="none"
              stroke="#4f8f69"
              strokeWidth={stroke}
              strokeLinecap="round"
            />
          </>
        )}
      </svg>

      <div className="relative z-10 flex flex-col items-center justify-center text-center leading-none">
        <div className="text-3xl font-semibold tracking-[-0.08em] text-[#e8eaed]">
          {clamped}%
        </div>
        <div className="mt-1 text-xl font-medium tracking-[-0.08em] text-[#96a3af]">
          Up
        </div>
      </div>
    </div>
  );
}
