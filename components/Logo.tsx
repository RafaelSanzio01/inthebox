"use client";

import React from 'react';

export const BoxIcon = ({ className = "w-8 h-8", color = "#FBBF24" }: { className?: string, color?: string }) => (
    <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        style={{ filter: `drop-shadow(0 0 8px ${color}44)` }}
    >
        {/* Outer Shell */}
        <path
            d="M12 2L3 7V17L12 22L21 17V7L12 2Z"
            stroke={color}
            strokeWidth="1.5"
            strokeLinejoin="round"
            fill={`${color}11`}
        />
        {/* Middle Lines emphasizing depth */}
        <path
            d="M3 7L12 12L21 7"
            stroke={color}
            strokeWidth="1.5"
            strokeLinejoin="round"
            strokeOpacity="0.8"
        />
        <path
            d="M12 12V22"
            stroke={color}
            strokeWidth="1.5"
            strokeLinejoin="round"
            strokeOpacity="0.8"
        />
        {/* Inner details for "premium" look - opening flaps */}
        <path
            d="M12 12L16.5 9.5"
            stroke={color}
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeOpacity="0.5"
        />
        <path
            d="M12 12L7.5 9.5"
            stroke={color}
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeOpacity="0.5"
        />
    </svg>
);

const Logo = ({ showText = true }: { showText?: boolean }) => {
    return (
        <div className="flex items-center gap-3 group cursor-pointer">
            <div className="relative">
                {/* Glow effect */}
                <div className="absolute inset-0 bg-yellow-400/20 blur-xl rounded-full scale-150 group-hover:bg-yellow-400/30 transition-all duration-500" />
                <BoxIcon className="w-10 h-10 relative z-10 transition-transform duration-500 group-hover:scale-105 group-hover:-rotate-3" />
            </div>

            {showText && (
                <div className="flex flex-col -space-y-1.5">
                    <div className="text-2xl font-black tracking-tighter flex items-center">
                        <span className="text-white">inthe</span>
                        <span className="text-yellow-400 ml-0.5">Box</span>
                    </div>
                    <span className="text-[11px] font-bold text-gray-500 tracking-[0.2em] uppercase pl-0.5 group-hover:text-yellow-400/70 transition-colors">
                        Unbox Great Stories
                    </span>
                </div>
            )}
        </div>
    );
};

export default Logo;
