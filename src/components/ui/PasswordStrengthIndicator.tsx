"use client";

import { useMemo } from "react";
import {
  calculatePasswordStrength,
  MIN_PASSWORD_LENGTH,
} from "@/lib/validation/password";

interface PasswordStrengthIndicatorProps {
  password: string;
}

export function PasswordStrengthIndicator({
  password,
}: PasswordStrengthIndicatorProps) {
  const { strength, score } = useMemo(
    () => calculatePasswordStrength(password),
    [password]
  );

  if (!password) return null;

  const strengthLabels = {
    weak: "弱い",
    medium: "普通",
    strong: "強い",
  };

  const strengthColors = {
    weak: "bg-error",
    medium: "bg-warning",
    strong: "bg-success",
  };

  const strengthTextColors = {
    weak: "text-error",
    medium: "text-warning",
    strong: "text-success",
  };

  return (
    <div className="mt-2 space-y-1">
      {/* プログレスバー */}
      <div className="flex gap-1">
        {[1, 2, 3].map((level) => (
          <div
            key={level}
            className={`h-1 flex-1 rounded-full transition-colors ${
              (strength === "weak" && level === 1) ||
              (strength === "medium" && level <= 2) ||
              (strength === "strong" && level <= 3)
                ? strengthColors[strength]
                : "bg-base-300"
            }`}
          />
        ))}
      </div>

      {/* ラベル */}
      <div className="flex justify-between items-center text-xs">
        <span className={strengthTextColors[strength]}>
          強度: {strengthLabels[strength]}
        </span>
        <span className="text-base-content/60">
          {password.length}/{MIN_PASSWORD_LENGTH}文字以上
        </span>
      </div>
    </div>
  );
}
