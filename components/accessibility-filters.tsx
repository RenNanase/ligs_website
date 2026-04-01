"use client"

/**
 * SVG filter definitions for color blindness simulation.
 * Rendered once at app root so url(#id) references resolve correctly when
 * --a11y-color-filter is applied to body.
 */
export function AccessibilityFilters() {
  return (
    <svg
      aria-hidden
      className="pointer-events-none absolute h-0 w-0 overflow-hidden"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <filter id="protanopia">
          <feColorMatrix
            type="matrix"
            values="0.567 0.433 0 0 0 0.558 0.442 0 0 0 0 0.242 0.758 0 0 0 0 0 1 0"
          />
        </filter>
        <filter id="deuteranopia">
          <feColorMatrix
            type="matrix"
            values="0.625 0.375 0 0 0 0.7 0.3 0 0 0 0 0.3 0.7 0 0 0 0 0 1 0"
          />
        </filter>
        <filter id="tritanopia">
          <feColorMatrix
            type="matrix"
            values="1.01277 0.13548 -0.14826 0 0 -0.01243 0.86812 0.14431 0 0 0.07589 0.80500 0.11911 0 0 0 0 0 1 0"
          />
        </filter>
      </defs>
    </svg>
  )
}
