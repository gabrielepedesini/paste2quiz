"use client";

import { useTheme } from "next-themes";
import { LuMoon, LuSun } from "react-icons/lu";

type ToggleThemeProps = {
    className?: string;
    ariaLabel?: string;
};

export function ToggleTheme({ className, ariaLabel }: ToggleThemeProps) {
    const { resolvedTheme, setTheme } = useTheme();
    const isDark = resolvedTheme === "dark";
    
    const toggleColorMode = () => {
        setTheme(isDark ? "light" : "dark");
    };

    return (
        <button
            type="button"
            className={["toggle-theme-button", className].filter(Boolean).join(" ")}
            onClick={toggleColorMode}
            aria-label={ariaLabel ?? "Toggle theme"}
            title={ariaLabel ?? "Toggle theme"}
        >
            {isDark ? <LuSun /> : <LuMoon />}
        </button>
    );
}