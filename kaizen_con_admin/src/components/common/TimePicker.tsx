import React, { useEffect, useRef } from "react";
import flatpickr from "flatpickr";
import type { Instance as FlatpickrInstance } from "flatpickr/dist/types/instance";

interface TimePickerProps {
  value: string;
  onChange: (timeStr: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  enableSeconds?: boolean;
}

export const TimePicker: React.FC<TimePickerProps> = ({
  value,
  onChange,
  placeholder = "Select time",
  required = false,
  disabled = false,
  className = "",
  enableSeconds = true,
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const fpRef = useRef<FlatpickrInstance | null>(null);

  useEffect(() => {
    if (!inputRef.current) return;

    fpRef.current = flatpickr(inputRef.current, {
      enableTime: true,
      noCalendar: true,
      time_24hr: false,
      enableSeconds: enableSeconds,
      dateFormat: enableSeconds ? "H:i:S" : "H:i",
      altInput: true,
      altFormat: enableSeconds ? "h:i:S K" : "h:i K",
      altInputClass:
        "w-full pl-4 pr-10 py-2.5 text-xs sm:text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-[#AA2D7B] focus:ring-2 focus:ring-[#AA2D7B]/20 transition-all shadow-2xs cursor-pointer",
      defaultDate: value || undefined,
      onChange: (_selectedDates, dateStr) => {
        onChange(dateStr);
      },
    });

    return () => {
      fpRef.current?.destroy();
      fpRef.current = null;
    };
  }, [enableSeconds]);

  // Sync external value changes into flatpickr
  useEffect(() => {
    if (fpRef.current) {
      if (value) {
        fpRef.current.setDate(value, false);
      } else {
        fpRef.current.clear();
      }
    }
  }, [value]);

  return (
    <div className={`relative flex items-center w-full ${className}`}>
      <input
        ref={inputRef}
        type="text"
        required={required}
        disabled={disabled}
        placeholder={placeholder}
        defaultValue={value}
        className="hidden"
      />
      <button
        type="button"
        onClick={() => fpRef.current?.open()}
        className="absolute right-3 text-gray-400 dark:text-gray-500 hover:text-[#AA2D7B] dark:hover:text-[#AA2D7B] flex items-center transition-colors cursor-pointer"
        aria-label="Open time picker"
        tabIndex={-1}
      >
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </button>
    </div>
  );
};
