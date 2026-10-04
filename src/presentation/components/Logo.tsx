import React from 'react';

interface LogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ size = 32, className = '', showText = false }) => {
  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
      >
        <defs>
          <linearGradient id="orbit-grad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
            <stop stopColor="#6366f1" />
            <stop offset="1" stopColor="#4338ca" />
          </linearGradient>
          <linearGradient id="spark-core" x1="15" y1="15" x2="25" y2="25" gradientUnits="userSpaceOnUse">
            <stop stopColor="#34d399" />
            <stop offset="1" stopColor="#10b981" />
          </linearGradient>
        </defs>

        {/* Outer Rounded Container Badge */}
        <rect
          width="40"
          height="40"
          rx="12"
          fill="url(#orbit-grad)"
          className="shadow-sm"
        />

        {/* Outer Translucent Orbit Ring */}
        <circle
          cx="20"
          cy="20"
          r="13"
          stroke="white"
          strokeWidth="2"
          strokeOpacity="0.4"
          strokeDasharray="4 2"
        />

        {/* Inner Solid Concentric Orbit Ring */}
        <circle
          cx="20"
          cy="20"
          r="8"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* Central Radiant Spark Core */}
        <circle
          cx="20"
          cy="20"
          r="3.5"
          fill="url(#spark-core)"
        />
      </svg>

      {showText && (
        <span className="font-black text-xl tracking-tight text-slate-900 dark:text-white">
          Orbit<span className="text-indigo-600 dark:text-indigo-400">.</span>
        </span>
      )}
    </div>
  );
};
