"use client";

import { useState, useRef, useEffect, useCallback } from "react";

interface Option {
  id: number;
  name: string;
  otherNames?: string[];
}

interface SearchableSelectProps {
  options: Option[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  emptyLabel?: string;
}

export function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = "検索...",
  label,
  emptyLabel = "すべて",
}: SearchableSelectProps) {
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

  // 外側クリックで閉じる
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

  const handleClear = () => {
    onChange("");
    setIsOpen(false);
    setSearchTerm("");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleOpen = () => {
    setIsOpen(true);
    setSearchTerm("");
    setTimeout(() => inputRef.current?.focus(), 10);
  };

  return (
    <div className="form-control w-full sm:w-auto sm:min-w-48 relative" ref={containerRef}>
      {label && (
        <label className="label">
          <span className="label-text">{label}</span>
        </label>
      )}

      {/* トリガーボタン / 入力欄 */}
      <div
        className="input input-bordered flex items-center gap-2 cursor-pointer w-full"
        onClick={!isOpen ? handleOpen : undefined}
      >
        {isOpen ? (
          <input
            ref={inputRef}
            type="text"
            className="grow bg-transparent outline-none min-w-0"
            placeholder={placeholder}
            value={searchTerm}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onCompositionStart={() => setIsComposing(true)}
            onCompositionEnd={() => setIsComposing(false)}
          />
        ) : (
          <span className={`grow truncate ${!selectedOption ? "text-base-content/50" : ""}`}>
            {selectedOption?.name || emptyLabel}
          </span>
        )}
        <svg
          className="w-4 h-4 shrink-0 text-base-content/50"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d={isOpen ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"}
          />
        </svg>
      </div>

      {/* ドロップダウンリスト */}
      {isOpen && (
        <ul className="absolute top-full left-0 right-0 mt-1 menu bg-base-100 rounded-box z-[100] max-h-60 flex-nowrap overflow-y-auto shadow-lg border border-base-300">
          {/* すべて選択オプション */}
          <li>
            <button
              type="button"
              className={!value ? "active" : ""}
              onClick={handleClear}
            >
              {emptyLabel}
            </button>
          </li>

          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => (
              <li key={option.id}>
                <button
                  type="button"
                  className={String(option.id) === value ? "active" : ""}
                  onClick={() => handleSelect(String(option.id))}
                >
                  {option.name}
                </button>
              </li>
            ))
          ) : (
            <li className="disabled">
              <span className="text-base-content/50">該当なし</span>
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
