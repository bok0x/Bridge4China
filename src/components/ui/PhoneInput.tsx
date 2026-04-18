"use client";
import { useState, useRef, useEffect } from "react";

interface CountryCode {
  name: string;
  code: string;
  flag: string;
}

export const COUNTRY_CODES: CountryCode[] = [
  { name: "Morocco", code: "+212", flag: "🇲🇦" },
  { name: "Algeria", code: "+213", flag: "🇩🇿" },
  { name: "Tunisia", code: "+216", flag: "🇹🇳" },
  { name: "Libya", code: "+218", flag: "🇱🇾" },
  { name: "Egypt", code: "+20", flag: "🇪🇬" },
  { name: "Mauritania", code: "+222", flag: "🇲🇷" },
  { name: "Senegal", code: "+221", flag: "🇸🇳" },
  { name: "Mali", code: "+223", flag: "🇲🇱" },
  { name: "Ivory Coast", code: "+225", flag: "🇨🇮" },
  { name: "Burkina Faso", code: "+226", flag: "🇧🇫" },
  { name: "Ghana", code: "+233", flag: "🇬🇭" },
  { name: "Nigeria", code: "+234", flag: "🇳🇬" },
  { name: "Cameroon", code: "+237", flag: "🇨🇲" },
  { name: "Congo DR", code: "+243", flag: "🇨🇩" },
  { name: "Ethiopia", code: "+251", flag: "🇪🇹" },
  { name: "Kenya", code: "+254", flag: "🇰🇪" },
  { name: "Tanzania", code: "+255", flag: "🇹🇿" },
  { name: "South Africa", code: "+27", flag: "🇿🇦" },
  { name: "Sudan", code: "+249", flag: "🇸🇩" },
  { name: "Saudi Arabia", code: "+966", flag: "🇸🇦" },
  { name: "UAE", code: "+971", flag: "🇦🇪" },
  { name: "Qatar", code: "+974", flag: "🇶🇦" },
  { name: "Kuwait", code: "+965", flag: "🇰🇼" },
  { name: "Bahrain", code: "+973", flag: "🇧🇭" },
  { name: "Oman", code: "+968", flag: "🇴🇲" },
  { name: "Jordan", code: "+962", flag: "🇯🇴" },
  { name: "Lebanon", code: "+961", flag: "🇱🇧" },
  { name: "Iraq", code: "+964", flag: "🇮🇶" },
  { name: "Syria", code: "+963", flag: "🇸🇾" },
  { name: "Yemen", code: "+967", flag: "🇾🇪" },
  { name: "Palestine", code: "+970", flag: "🇵🇸" },
  { name: "Pakistan", code: "+92", flag: "🇵🇰" },
  { name: "India", code: "+91", flag: "🇮🇳" },
  { name: "Indonesia", code: "+62", flag: "🇮🇩" },
  { name: "Malaysia", code: "+60", flag: "🇲🇾" },
  { name: "Thailand", code: "+66", flag: "🇹🇭" },
  { name: "Vietnam", code: "+84", flag: "🇻🇳" },
  { name: "China", code: "+86", flag: "🇨🇳" },
  { name: "South Korea", code: "+82", flag: "🇰🇷" },
  { name: "Japan", code: "+81", flag: "🇯🇵" },
  { name: "Turkey", code: "+90", flag: "🇹🇷" },
  { name: "Russia", code: "+7", flag: "🇷🇺" },
  { name: "Ukraine", code: "+380", flag: "🇺🇦" },
  { name: "France", code: "+33", flag: "🇫🇷" },
  { name: "Belgium", code: "+32", flag: "🇧🇪" },
  { name: "Netherlands", code: "+31", flag: "🇳🇱" },
  { name: "Germany", code: "+49", flag: "🇩🇪" },
  { name: "Spain", code: "+34", flag: "🇪🇸" },
  { name: "Italy", code: "+39", flag: "🇮🇹" },
  { name: "UK", code: "+44", flag: "🇬🇧" },
  { name: "USA / Canada", code: "+1", flag: "🇺🇸" },
  { name: "Brazil", code: "+55", flag: "🇧🇷" },
  { name: "Argentina", code: "+54", flag: "🇦🇷" },
  { name: "Mexico", code: "+52", flag: "🇲🇽" },
];

interface Props {
  code: string;
  number: string;
  onCodeChange: (code: string) => void;
  onNumberChange: (number: string) => void;
  required?: boolean;
}

export function PhoneInput({ code, number, onCodeChange, onNumberChange, required }: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = COUNTRY_CODES.filter(cc =>
    cc.name.toLowerCase().includes(search.toLowerCase()) || cc.code.includes(search)
  );

  const selected = COUNTRY_CODES.find(cc => cc.code === code) ?? COUNTRY_CODES[0];

  return (
    <div style={{ display: "flex", gap: 8, position: "relative" }} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => { setOpen(!open); setSearch(""); }}
        className="input-glass"
        style={{
          minWidth: 106,
          display: "flex",
          alignItems: "center",
          gap: 6,
          fontSize: 14,
          fontWeight: 500,
          cursor: "pointer",
          flexShrink: 0,
          whiteSpace: "nowrap",
        }}
      >
        <span style={{ fontSize: 18 }}>{selected.flag}</span>
        <span>{selected.code}</span>
        <span style={{ marginLeft: "auto", opacity: 0.4, fontSize: 9 }}>▼</span>
      </button>

      {open && (
        <div style={{
          position: "absolute",
          top: "calc(100% + 6px)",
          left: 0,
          zIndex: 200,
          width: 250,
          maxHeight: 280,
          overflowY: "auto",
          background: "var(--color-bg-elevated, #0f2720)",
          border: "1px solid var(--glass-border)",
          borderRadius: 14,
          boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
          padding: "8px 0",
        }}>
          <div style={{ padding: "0 10px 8px" }}>
            <input
              autoFocus
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search country…"
              className="input-glass w-full"
              style={{ fontSize: 13, padding: "6px 10px" }}
            />
          </div>
          {filtered.map(cc => (
            <button
              key={`${cc.code}-${cc.name}`}
              type="button"
              onClick={() => { onCodeChange(cc.code); setOpen(false); setSearch(""); }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                width: "100%",
                padding: "8px 14px",
                fontSize: 13,
                background: cc.code === code && cc.name === selected.name ? "rgba(72,197,156,0.12)" : "transparent",
                color: "var(--color-text-primary)",
                border: "none",
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              <span style={{ fontSize: 18 }}>{cc.flag}</span>
              <span style={{ flex: 1 }}>{cc.name}</span>
              <span style={{ opacity: 0.5, fontSize: 12 }}>{cc.code}</span>
            </button>
          ))}
        </div>
      )}

      <input
        type="tel"
        value={number}
        onChange={e => onNumberChange(e.target.value)}
        required={required}
        placeholder="6XX XXX XXX"
        className="input-glass w-full"
        style={{ flex: 1, fontSize: 14 }}
      />
    </div>
  );
}
