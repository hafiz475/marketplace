import React, { KeyboardEvent, ChangeEvent } from "react";

interface PhoneInputProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  icon?: React.ReactNode;
  className?: string;
}

export default function PhoneInput({
  value,
  onChange,
  placeholder = "Phone Number",
  icon = "📞",
  className = "",
}: PhoneInputProps) {
  
  // Format the input value dynamically as +CC Number
  const formatPhoneString = (val: string) => {
    // Keep only digits and '+'
    let cleaned = val.replace(/[^\d+]/g, "");
    if (cleaned.length === 0) return "";
    
    if (!cleaned.startsWith("+")) {
      cleaned = "+" + cleaned.replace(/\+/g, "");
    } else {
      // Ensure only one '+' at the very beginning
      cleaned = "+" + cleaned.slice(1).replace(/\+/g, "");
    }

    const digits = cleaned.slice(1);
    if (digits.length === 0) return "+";

    // Detect country code
    // 1-digit country codes: 1 (US/CA), 7 (RU/KZ)
    if (digits.startsWith("1") || digits.startsWith("7")) {
      const cc = digits.slice(0, 1);
      const rest = digits.slice(1);
      return rest ? `+${cc} ${rest}` : `+${cc}`;
    }

    // Common 3-digit country codes
    const threeDigitPrefixes = [
      "353", "971", "372", "380", "506", "962", "965", "966", "968", "972", "973", "974", "593", "595", "598"
    ];
    for (const prefix of threeDigitPrefixes) {
      if (digits.startsWith(prefix)) {
        const rest = digits.slice(3);
        return rest ? `+${prefix} ${rest}` : `+${prefix}`;
      }
    }

    // Default to 2-digit country code
    if (digits.length >= 2) {
      const cc = digits.slice(0, 2);
      const rest = digits.slice(2);
      return rest ? `+${cc} ${rest}` : `+${cc}`;
    }

    return `+${digits}`;
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    // Block spacebar key
    if (e.key === " ") {
      e.preventDefault();
      return;
    }
    
    // Allow control keys
    const allowedKeys = [
      "Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab", "Enter", "Home", "End"
    ];
    if (allowedKeys.includes(e.key)) {
      return;
    }

    // Allow Ctrl/Cmd shortcuts (copy, paste, select all)
    if (e.ctrlKey || e.metaKey) {
      return;
    }

    // Block any key that is not a digit or '+'
    if (!/[\d+]/.test(e.key)) {
      e.preventDefault();
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    const formatted = formatPhoneString(rawVal);
    onChange(formatted);
  };

  return (
    <div className={`input-group-row ${className}`}>
      <span className="input-icon">{icon}</span>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
      />
    </div>
  );
}
