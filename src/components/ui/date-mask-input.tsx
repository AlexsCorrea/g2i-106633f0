import React, { useState } from "react";
import { cn } from "@/lib/utils";

interface DateMaskInputProps {
  value: string; // YYYY-MM-DD format for internal use
  onChange: (isoDate: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

/**
 * Masked date input that accepts DD/MM/AAAA typed input
 * and converts to ISO (YYYY-MM-DD) internally.
 * Shows numeric keyboard on mobile.
 */
export function DateMaskInput({ value, onChange, placeholder = "DD/MM/AAAA", className, disabled }: DateMaskInputProps) {
  // Convert ISO to display format
  const isoToDisplay = (iso: string) => {
    if (!iso) return "";
    const parts = iso.split("-");
    if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
    return "";
  };

  const [display, setDisplay] = useState(() => isoToDisplay(value));

  const applyMask = (raw: string) => {
    const digits = raw.replace(/\D/g, "").slice(0, 8);
    let masked = "";
    for (let i = 0; i < digits.length; i++) {
      if (i === 2 || i === 4) masked += "/";
      masked += digits[i];
    }
    return masked;
  };

  const isValidDate = (dd: string, mm: string, yyyy: string) => {
    const d = parseInt(dd, 10);
    const m = parseInt(mm, 10);
    const y = parseInt(yyyy, 10);
    if (m < 1 || m > 12 || d < 1 || d > 31 || y < 1900 || y > 2100) return false;
    const date = new Date(y, m - 1, d);
    return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const masked = applyMask(e.target.value);
    setDisplay(masked);

    const digits = masked.replace(/\D/g, "");
    if (digits.length === 8) {
      const dd = digits.slice(0, 2);
      const mm = digits.slice(2, 4);
      const yyyy = digits.slice(4, 8);
      if (isValidDate(dd, mm, yyyy)) {
        onChange(`${yyyy}-${mm}-${dd}`);
      } else {
        onChange("");
      }
    } else {
      onChange("");
    }
  };

  return (
    <input
      type="text"
      inputMode="numeric"
      value={display}
      onChange={handleChange}
      placeholder={placeholder}
      disabled={disabled}
      className={cn(
        "w-full h-14 text-xl text-center border-2 border-border rounded-xl px-4 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
        className
      )}
    />
  );
}
