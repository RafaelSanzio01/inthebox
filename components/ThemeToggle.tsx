"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
    const [isDark, setIsDark] = useState(true);

    useEffect(() => {
        // Check initial state
        const isLight = document.documentElement.classList.contains("light");
        setIsDark(!isLight);
    }, []);

    const toggle = () => {
        if (isDark) {
            document.documentElement.classList.add("light");
            setIsDark(false);
            localStorage.setItem("theme", "light");
        } else {
            document.documentElement.classList.remove("light");
            setIsDark(true);
            localStorage.setItem("theme", "dark");
        }
    };

    // Optional: Check local storage on mount (if we wanted persistence, but user said default dark)
    // But good UX persists. user said "varsayılan olarak koyu temada açılsın" (default open in dark).
    // This implies if I visit fresh, it's dark.
    // I will skip localStorage check for 'default' enforcement, or treat 'null' as dark.

    return (
        <button
            onClick={toggle}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors text-xl"
            aria-label="Toggle Theme"
        >
            {isDark ? (
                // Sun Icon (for switching to light)
                <span className="opacity-70 hover:opacity-100">☀️</span>
            ) : (
                // Moon Icon (for switching to dark)
                <span className="opacity-70 hover:opacity-100">🌙</span>
            )}
        </button>
    );
}
