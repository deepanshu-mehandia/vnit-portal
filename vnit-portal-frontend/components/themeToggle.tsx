"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon, Monitor } from "lucide-react";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const options = [
    { value: "light",  Icon: Sun,     label: "Light"  },
    { value: "dark",   Icon: Moon,    label: "Dark"   },
    { value: "system", Icon: Monitor, label: "System" },
  ];

  return (
    <div className="flex items-center gap-1 bg-slate-800 rounded-xl p-1">
      {options.map(({ value, Icon, label }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          title={label}
          className={`w-7 h-7 flex items-center justify-center rounded-lg transition-all ${
            theme === value
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Icon size={13} />
        </button>
      ))}
    </div>
  );
}