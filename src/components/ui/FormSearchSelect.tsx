"use client";

import { useState, useRef, useEffect, useCallback } from "react";

interface Option {
  id: number;
  name: string;
  otherNames?: string[];
}

interface FormSearchSelectProps {
  id?: string;
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  clearable?: boolean;
  helperText?: React.ReactNode;
  maxResults?: number;
}

export function FormSearchSelect({
  id,
  options,
  value,
  onChange,
  placeholder = "検索...",
  label,
  required = false,
  clearable = false,
  helperText,
  maxResults = 10,
}: FormSearchSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isComposing, setIsComposing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 現在選択されているオプションを取得
  const selectedOption = options.find((opt) => String(opt.id) === value);

  // フィルターされたオプション（別名も検索対象）
  const filteredOptions = searchTerm
    ? options.filter((opt) => {
        const search = searchTerm.toLowerCase();
        const nameMatch = opt.name.toLowerCase().includes(search);
        const otherNameMatch = opt.otherNames?.some((name) =>
          name.toLowerCase().includes(search)
        );
        return nameMatch || otherNameMatch;
      })
    : options;

  // 外側クリックで閉じる & 検索テキストをリセット
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // キーボード操作
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      // IME変換中は何もしない
      if (isComposing) return;

      if (e.key === "Escape") {
        setIsOpen(false);
        setSearchTerm("");
      } else if (e.key === "Enter" && filteredOptions.length > 0) {
        e.preventDefault();
        onChange(String(filteredOptions[0].id));
        setIsOpen(false);
        setSearchTerm("");
      }
    },
    [filteredOptions, onChange, isComposing]
  );

  const handleSelect = (optionId: string) => {
    onChange(optionId);
    setIsOpen(false);
    setSearchTerm("");
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
    setSearchTerm("");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleFocus = () => {
    setIsOpen(true);
  };

  // 表示する値を決定
  const displayValue = selectedOption ? selectedOption.name : searchTerm;

  return (
    <div className="form-control w-full" ref={containerRef}>
      {label && (
        <label htmlFor={id} className="label">
          <span className="text-base label-text">
            {label}
            {required && " *"}
          </span>
        </label>
      )}

      <div className="relative">
        <input
          id={id}
          ref={inputRef}
          type="text"
          className="input input-bordered w-full pr-10"
          placeholder={placeholder}
          value={displayValue}
          onChange={(e) => {
            // 選択済みの場合は選択を解除して検索モードへ
            if (selectedOption) {
              onChange("");
            }
            handleInputChange(e);
            setIsOpen(true);
          }}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          onCompositionStart={() => setIsComposing(true)}
          onCompositionEnd={() => setIsComposing(false)}
        />

        {/* クリアボタン */}
        {clearable && selectedOption && (
          <button
            type="button"
            className="absolute right-2 top-1/2 -translate-y-1/2 btn btn-ghost btn-xs"
            onClick={handleClear}
          >
            ✕
          </button>
        )}

        {/* ドロップダウンリスト */}
        {isOpen && (
          <ul className="absolute top-full left-0 right-0 mt-1 bg-base-100 rounded-box z-[100] max-h-48 overflow-y-auto shadow-lg border border-base-300">
            {filteredOptions.length > 0 ? (
              filteredOptions.slice(0, maxResults).map((option) => (
                <li key={option.id}>
                  <button
                    type="button"
                    className="w-full text-left px-4 py-2 hover:bg-base-200"
                    onClick={() => handleSelect(String(option.id))}
                  >
                    {option.name}
                  </button>
                </li>
              ))
            ) : (
              <li className="px-4 py-2 text-base-content/60">該当なし</li>
            )}
          </ul>
        )}
      </div>

      {helperText && (
        <label className="label">
          <span className="label-text-alt">{helperText}</span>
        </label>
      )}
    </div>
  );
}
