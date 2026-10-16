import React from 'react';

/**
 * Official vector payment brand marks for e-commerce checkout and trust badges.
 * Built with crisp SVG paths matching official brand guidelines.
 */

export function VisaLogo({ className = "h-6 w-auto" }) {
  return (
    <svg className={className} viewBox="0 0 56 36" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Visa">
      <rect width="56" height="36" rx="4" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1" />
      <path
        d="M23.18 24.2H20.36L22.12 13.4H24.94L23.18 24.2ZM18.36 13.4L15.66 20.76L15.36 19.28C14.78 17.5 13.2 15.6 11.32 14.66L13.52 24.2H16.24L20.44 13.4H18.36ZM30.94 19.88C30.94 15.9 25.48 15.7 25.48 14.12C25.48 13.48 26.12 12.96 27.38 12.96C28.74 12.96 30.1 13.28 31.16 13.8L31.78 11.6C30.62 11.18 29.16 10.88 27.48 10.88C23.6 10.88 20.88 12.96 20.88 15.92C20.88 20.02 26.44 20.22 26.44 21.9C26.44 22.64 25.6 23.16 24.24 23.16C22.66 23.16 21.1 22.54 19.94 21.8L19.32 24.12C20.68 24.74 22.46 25.16 24.34 25.16C28.54 25.16 30.94 22.94 30.94 19.88ZM39.86 24.2H42.16L40.16 13.4H38.06C37.12 13.4 36.28 13.92 35.96 14.76L32.28 24.2H35.02L35.54 22.62H39.02L39.86 24.2ZM36.36 20.62L37.82 16.54L38.68 20.62H36.36Z"
        fill="#1434CB"
      />
      <path
        d="M11.32 14.66C13.2 15.6 14.78 17.5 15.36 19.28L13.52 24.2H10.8L8.18 13.4H11.02L11.32 14.66Z"
        fill="#F7B600"
      />
    </svg>
  );
}

export function MastercardLogo({ className = "h-6 w-auto" }) {
  return (
    <svg className={className} viewBox="0 0 56 36" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Mastercard">
      <rect width="56" height="36" rx="4" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1" />
      <g transform="translate(10, 8)">
        <circle cx="10" cy="10" r="9.5" fill="#EB001B" />
        <circle cx="26" cy="10" r="9.5" fill="#F79E1B" />
        <path
          d="M18 3.55A9.46 9.46 0 0 0 14.47 10 9.46 9.46 0 0 0 18 16.45 9.46 9.46 0 0 0 21.53 10 9.46 9.46 0 0 0 18 3.55Z"
          fill="#FF5F00"
        />
      </g>
    </svg>
  );
}

export function UpiLogo({ className = "h-6 w-auto" }) {
  return (
    <svg className={className} viewBox="0 0 56 36" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="UPI">
      <rect width="56" height="36" rx="4" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1" />
      <g transform="translate(8, 9)">
        {/* UPI Triangles / Chevrons */}
        <polygon points="27,1 32,9 29.5,9 24.5,1" fill="#097939" />
        <polygon points="30,9.5 35,17.5 32.5,17.5 27.5,9.5" fill="#ED7524" />
        {/* UPI Wordmark */}
        <text
          x="1"
          y="14"
          fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
          fontWeight="900"
          fontSize="13"
          fontStyle="italic"
          letterSpacing="-0.5px"
          fill="#097939"
        >
          UPI
        </text>
      </g>
    </svg>
  );
}

export function RupayLogo({ className = "h-6 w-auto" }) {
  return (
    <svg className={className} viewBox="0 0 56 36" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="RuPay">
      <rect width="56" height="36" rx="4" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1" />
      <g transform="translate(6, 8)">
        {/* RuPay Wordmark */}
        <text
          x="1"
          y="15"
          fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
          fontWeight="900"
          fontSize="13"
          fontStyle="italic"
          fill="#1C3F94"
        >
          RuPay
        </text>
        {/* RuPay Directional Chevrons */}
        <polygon points="34,4 31,10 33.5,10 36.5,4" fill="#09793A" />
        <polygon points="37.5,4 34.5,10 37,10 40,4" fill="#F37023" />
        <polygon points="32.5,10.5 29.5,16.5 32,16.5 35,10.5" fill="#09793A" />
        <polygon points="36,10.5 33,16.5 35.5,16.5 38.5,10.5" fill="#F37023" />
      </g>
    </svg>
  );
}

export function RazorpayLogo({ className = "h-6 w-auto" }) {
  return (
    <svg className={className} viewBox="0 0 68 36" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Razorpay">
      <rect width="68" height="36" rx="4" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1" />
      <g transform="translate(6, 9)">
        {/* Razorpay Bolt */}
        <path d="M11 0L3 18H7.5L10.2 11.5L14.5 11.5L16 7.7L11.5 7.7L13.5 2.5L15.8 2.5L16.8 0H11Z" fill="#0C2340" />
        <path d="M12.5 4.8L7.8 18H10.5L14.2 7.7L12.5 4.8Z" fill="#3395FF" />
        {/* Razorpay Wordmark */}
        <text
          x="18"
          y="13"
          fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
          fontWeight="800"
          fontSize="9"
          letterSpacing="-0.2px"
          fill="#0C2340"
        >
          Razorpay
        </text>
      </g>
    </svg>
  );
}

export function NetbankingLogo({ className = "h-6 w-auto" }) {
  return (
    <svg className={className} viewBox="0 0 68 36" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="NetBanking">
      <rect width="68" height="36" rx="4" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1" />
      <g transform="translate(6, 10)">
        {/* Bank Icon */}
        <path d="M7 1L1 4V6H13V4L7 1ZM2 7H4V13H2V7ZM5.5 7H7.5V13H5.5V7ZM9 7H11V13H9V7ZM0 14V16H14V14H0Z" fill="#1E293B" />
        {/* NetBanking Text */}
        <text
          x="16"
          y="12"
          fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
          fontWeight="800"
          fontSize="8.5"
          fill="#1E293B"
        >
          NetBanking
        </text>
      </g>
    </svg>
  );
}

export default function PaymentBadges({ className = "flex items-center gap-2 flex-wrap" }) {
  return (
    <div className={className}>
      <VisaLogo className="h-6 w-auto shadow-xs hover:scale-105 transition-transform" />
      <MastercardLogo className="h-6 w-auto shadow-xs hover:scale-105 transition-transform" />
      <UpiLogo className="h-6 w-auto shadow-xs hover:scale-105 transition-transform" />
      <RupayLogo className="h-6 w-auto shadow-xs hover:scale-105 transition-transform" />
      <RazorpayLogo className="h-6 w-auto shadow-xs hover:scale-105 transition-transform" />
      <NetbankingLogo className="h-6 w-auto shadow-xs hover:scale-105 transition-transform" />
    </div>
  );
}
