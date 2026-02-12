import { memo, useId, useMemo } from "react";

type AkcentLogo = "auto" | "jasny";

type LogoPapaDataProps = {
  className?: string;
  ariaLabel?: string;
  dekoracyjne?: boolean;
  size?: number | string;
  akcent?: AkcentLogo;
  animowany?: boolean;
};

/**
 * Odpowiada za wektorowe logo PapaData z gradientem, glow oraz opcjonalną animacją.
 */
export const LogoPapaData = memo(function LogoPapaData({
  className = "",
  ariaLabel = "Logo PapaData Intelligence",
  dekoracyjne = false,
  size = 42,
  akcent = "auto",
  animowany = true,
}: LogoPapaDataProps) {
  const uid = useId();
  const safeUid = useMemo(() => uid.replace(/[^a-zA-Z0-9_-]/g, "_"), [uid]);

  const glowId = `logo_glow_${safeUid}`;
  const gradId = `logo_grad_${safeUid}`;
  const titleId = `logo_title_${safeUid}`;
  const isDecorative = dekoracyjne || !ariaLabel;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      preserveAspectRatio="xMidYMid meet"
      fill="none"
      className={className}
      focusable="false"
      aria-hidden={isDecorative ? "true" : undefined}
      role={!isDecorative ? "img" : undefined}
      aria-label={!isDecorative ? ariaLabel : undefined}
      aria-labelledby={!isDecorative ? titleId : undefined}
    >
      {!isDecorative && <title id={titleId}>{ariaLabel}</title>}

      <defs>
        <radialGradient id={glowId} cx="0.6" cy="0.2" r="0.8">
          <stop offset="0%" stopColor="#4E26E2" stopOpacity="0.32" />
          <stop offset="100%" stopColor="#4E26E2" stopOpacity="0" />
        </radialGradient>

        <linearGradient id={gradId} x1="0" y1="48" x2="48" y2="0" gradientUnits="userSpaceOnUse">
          <stop stopColor="#4E26E2" />
          <stop offset="1" stopColor="#4285F4" />
        </linearGradient>

        {animowany && (
          <style>
            {`
              @media (prefers-reduced-motion: no-preference) {
                .pd-glow-${safeUid} {
                  animation: pd-pulse-glow-${safeUid} 4s ease-in-out infinite;
                  transform-origin: 24px 24px;
                }
                .pd-arc-${safeUid} {
                  animation: pd-spin-${safeUid} 8s linear infinite;
                  transform-origin: 24px 24px;
                }
                .pd-bar-${safeUid} {
                  transform-origin: bottom;
                  transform-box: fill-box;
                }
                .pd-bar-1-${safeUid} { animation: pd-bar-wave-${safeUid} 1.5s ease-in-out infinite; }
                .pd-bar-2-${safeUid} { animation: pd-bar-wave-${safeUid} 1.5s ease-in-out 0.2s infinite; }
                .pd-bar-3-${safeUid} { animation: pd-bar-wave-${safeUid} 1.5s ease-in-out 0.4s infinite; }

                @keyframes pd-pulse-glow-${safeUid} {
                  0%, 100% { transform: scale(0.95); opacity: 0.8; }
                  50% { transform: scale(1.15); opacity: 1; }
                }
                @keyframes pd-spin-${safeUid} {
                  from { transform: rotate(0deg); }
                  to { transform: rotate(360deg); }
                }
                @keyframes pd-bar-wave-${safeUid} {
                  0%, 100% { transform: scaleY(0.7); }
                  50% { transform: scaleY(1.05); }
                }
              }
            `}
          </style>
        )}
      </defs>

      <g transform="translate(2, 2)">
        {/* Glow z animacją pulsowania */}
        <circle 
          cx="24" 
          cy="24" 
          r="18" 
          fill={`url(#${glowId})`} 
          className={`opacity-70 dark:opacity-60 ${animowany ? `pd-glow-${safeUid}` : ""}`} 
        />

        <path
          d="M16 32L8 40"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          className="opacity-35 dark:opacity-50"
        />

        <circle
          cx="24"
          cy="24"
          r="13"
          stroke="currentColor"
          strokeWidth="2.5"
          className="opacity-75 dark:opacity-95"
        />

        <circle
          cx="24"
          cy="24"
          r="10"
          stroke="currentColor"
          strokeWidth="1"
          className="opacity-20 dark:opacity-25"
        />

        {/* Słupki danych z animacją fali */}
        <g transform="translate(18, 18)">
          <rect 
            x="0" 
            y="8" 
            width="3" 
            height="5" 
            rx="1" 
            fill={`url(#${gradId})`} 
            className={`opacity-70 ${animowany ? `pd-bar-${safeUid} pd-bar-1-${safeUid}` : ""}`} 
          />
          <rect 
            x="5" 
            y="4" 
            width="3" 
            height="9" 
            rx="1" 
            fill={`url(#${gradId})`} 
            className={`opacity-85 ${animowany ? `pd-bar-${safeUid} pd-bar-2-${safeUid}` : ""}`} 
          />
          <rect 
            x="10" 
            y="0" 
            width="3" 
            height="13" 
            rx="1" 
            fill={`url(#${gradId})`} 
            className={animowany ? `pd-bar-${safeUid} pd-bar-3-${safeUid}` : ""} 
          />
        </g>

        {/* Orbitujący akcent (skaner) */}
        <path
          d="M28 16C31 17 33 20 33 24"
          stroke={akcent === "jasny" ? "white" : "currentColor"}
          strokeWidth="2"
          strokeLinecap="round"
          className={`opacity-25 dark:opacity-45 ${animowany ? `pd-arc-${safeUid}` : ""}`}
        />
      </g>
    </svg>
  );
});

export default LogoPapaData;