import { useId } from "react"

function Ball({ marker = false }: { marker?: boolean }) {
  const rawId = useId().replace(/:/g, "")
  const clipId = `ball-${rawId}`
  const shadowId = `ball-shadow-${rawId}`

  if (marker) {
    return (
      <svg viewBox="0 0 24 24" className="size-[18px]" aria-hidden>
        <g filter={`url(#${shadowId})`}>
          <g clipPath={`url(#${clipId})`}>
            <circle cx="12" cy="11" r="9" fill="white" />
            <Panels />
            <Seams from="7.5125" />
            <circle cx="12" cy="11" r="8.5" fill="none" stroke="#09090B" />
          </g>
        </g>
        <defs>
          <filter id={shadowId} x="0" y="0" width="24" height="24" colorInterpolationFilters="sRGB">
            <feDropShadow dx="0" dy="1" stdDeviation="1" floodOpacity="0.1" />
          </filter>
          <clipPath id={clipId}>
            <rect x="3" y="2" width="18" height="18" rx="8" fill="white" />
          </clipPath>
        </defs>
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 16 16" className="size-4" aria-hidden>
      <g clipPath={`url(#${clipId})`}>
        <circle cx="8" cy="8" r="8" fill="white" />
        <path d="M8 4.9 10.948 7.042 9.822 10.508H6.178L5.052 7.042 8 4.9Z" fill="#09090B" />
        <path d="M8 3.4 5.432 1.534 6.413-1.484H9.587L10.568 1.534 8 3.4Z" fill="#09090B" />
        <path d="M12.375 6.579 13.356 3.56H16.53L17.511 6.579 14.943 8.444 12.375 6.579Z" fill="#09090B" />
        <path d="M10.704 11.721H13.878L14.859 14.74 12.291 16.606 9.723 14.74 10.704 11.721Z" fill="#09090B" />
        <path d="M5.296 11.721 6.277 14.74 3.709 16.606 1.141 14.74 2.122 11.721H5.296Z" fill="#09090B" />
        <path d="M3.625 6.579 1.057 8.444-1.511 6.579-0.53 3.56H2.644L3.625 6.579Z" fill="#09090B" />
        <path
          d="M8 4.9V3.4M10.948 7.042 12.375 6.579M9.822 10.508 10.704 11.721M6.178 10.508 5.296 11.721M5.052 7.042 3.625 6.579"
          stroke="#09090B"
          strokeLinecap="round"
        />
        <circle cx="8" cy="8" r="7.5" fill="none" stroke="#09090B" />
      </g>
      <defs>
        <clipPath id={clipId}>
          <rect width="16" height="16" rx="8" fill="white" />
        </clipPath>
      </defs>
    </svg>
  )
}

function Panels() {
  return (
    <>
      <path d="M12 7.5125 15.3165 9.92225 14.0498 13.8215H9.95025L8.6835 9.92225 12 7.5125Z" fill="#09090B" />
      <path d="M12 5.825 9.111 3.72575 10.2146.3305H13.7854L14.889 3.72575 12 5.825Z" fill="#09090B" />
      <path
        d="M16.9219 9.40138 18.0255 6.005H21.5963L22.6999 9.40138 19.8109 11.4995 16.9219 9.40138Z"
        fill="#09090B"
      />
      <path
        d="M15.042 15.1861H18.6128L19.7164 18.5825 16.8274 20.6817 13.9384 18.5825 15.042 15.1861Z"
        fill="#09090B"
      />
      <path d="M8.958 15.1861 10.0616 18.5825 7.17262 20.6817 4.28363 18.5825 5.38725 15.1861H8.958Z" fill="#09090B" />
      <path d="M7.07813 9.40138 4.18913 11.4995 1.30013 9.40138 2.40375 6.005H5.9745L7.07813 9.40138Z" fill="#09090B" />
    </>
  )
}

function Seams({ from }: { from: string }) {
  return (
    <path
      d={`M12 ${from}V5.825M15.3165 9.92225 16.9219 9.40138M14.0497 13.8215 15.042 15.1861M9.95025 13.8215 8.958 15.1861M8.6835 9.92225 7.07812 9.40138`}
      stroke="#09090B"
      strokeLinecap="round"
    />
  )
}

export { Ball }
