import React, { useState, useRef, useEffect, useMemo } from "react";

export interface SpeakerOption {
  id: number;
  first_name: string;
  last_name: string;
  speciality?: string;
  designation?: string;
  institution?: string;
  profile_image_url?: string;
}

interface MultiSelectSpeakersProps {
  speakers: SpeakerOption[];
  selectedIds: number[];
  onChange: (ids: number[]) => void;
  placeholder?: string;
  label?: string;
}

export const MultiSelectSpeakers: React.FC<MultiSelectSpeakersProps> = ({
  speakers,
  selectedIds,
  onChange,
  placeholder = "Select Presenter / Speakers...",
  label = "Presenter / Speaker",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus search input when opened
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    } else {
      setSearchTerm("");
    }
  }, [isOpen]);

  // Filtered speakers
  const filteredSpeakers = useMemo(() => {
    if (!searchTerm.trim()) return speakers;
    const term = searchTerm.toLowerCase();
    return speakers.filter((sp) => {
      const fullName = `${sp.first_name} ${sp.last_name}`.toLowerCase();
      const spec = (sp.speciality || "").toLowerCase();
      const inst = (sp.institution || "").toLowerCase();
      return fullName.includes(term) || spec.includes(term) || inst.includes(term);
    });
  }, [speakers, searchTerm]);

  // Selected speaker objects
  const selectedSpeakers = useMemo(() => {
    return speakers.filter((s) => selectedIds.includes(s.id));
  }, [speakers, selectedIds]);

  const toggleSpeaker = (id: number) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((item) => item !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  const removeSpeaker = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(selectedIds.filter((item) => item !== id));
  };

  const handleSelectAll = (e: React.MouseEvent) => {
    e.preventDefault();
    onChange(speakers.map((s) => s.id));
  };

  const handleClearAll = (e: React.MouseEvent) => {
    e.preventDefault();
    onChange([]);
  };

  return (
    <div className="relative" ref={containerRef}>
      {label && (
        <div className="flex items-center justify-between mb-1">
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
            {label}
          </label>
          {selectedIds.length > 0 && (
            <span className="text-[11px] font-bold text-[#AA2D7B] dark:text-[#f0c3df]">
              {selectedIds.length} selected
            </span>
          )}
        </div>
      )}

      {/* Main Trigger Input Box */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`min-h-[42px] w-full px-3.5 py-2 text-xs sm:text-sm border rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 cursor-pointer flex items-center justify-between gap-2 transition-all ${
          isOpen
            ? "border-[#AA2D7B] ring-2 ring-[#AA2D7B]/20 shadow-xs"
            : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
        }`}
      >
        <div className="flex flex-wrap items-center gap-1.5 flex-1 min-w-0">
          {selectedSpeakers.length === 0 ? (
            <span className="text-gray-400 dark:text-gray-500 truncate">
              {placeholder}
            </span>
          ) : (
            selectedSpeakers.map((sp) => (
              <span
                key={sp.id}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-[#faedf5] text-[#AA2D7B] dark:bg-[#55355E]/40 dark:text-[#f0c3df] border border-[#AA2D7B]/20 animate-fadeIn"
              >
                <span>
                  Dr. {sp.first_name} {sp.last_name}
                </span>
                <button
                  type="button"
                  onClick={(e) => removeSpeaker(sp.id, e)}
                  className="w-3.5 h-3.5 rounded-full flex items-center justify-center hover:bg-[#AA2D7B] hover:text-white transition-colors"
                  title="Remove speaker"
                >
                  &times;
                </button>
              </span>
            ))
          )}
        </div>

        {/* Right Action Icons */}
        <div className="flex items-center gap-1 shrink-0 text-gray-400">
          {selectedIds.length > 0 && (
            <button
              type="button"
              onClick={handleClearAll}
              className="p-1 hover:text-red-500 text-gray-400 transition-colors"
              title="Clear all selected speakers"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}

          <svg
            className={`w-4 h-4 transition-transform duration-200 ${isOpen ? "rotate-180 text-[#AA2D7B]" : ""}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-850 shadow-xl overflow-hidden animate-fadeIn">
          {/* Search Box */}
          <div className="p-2 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
            <div className="relative">
              <svg
                className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, department, or hospital..."
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:border-[#AA2D7B]"
              />
            </div>

            {/* Quick Actions */}
            <div className="flex items-center justify-between pt-1.5 px-1 text-[11px]">
              <span className="text-gray-400">
                {selectedIds.length} of {speakers.length} selected
              </span>
              <div className="flex items-center gap-2 font-semibold">
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="text-[#AA2D7B] hover:underline"
                >
                  Select All
                </button>
                <span className="text-gray-300">|</span>
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="text-gray-500 hover:text-red-500"
                >
                  Clear All
                </button>
              </div>
            </div>
          </div>

          {/* Speakers List */}
          <div className="max-h-60 overflow-y-auto divide-y divide-gray-50 dark:divide-gray-800/60 p-1">
            {/* None / Break Session Option */}
            <div
              onClick={() => onChange([])}
              className={`p-2 rounded-lg cursor-pointer flex items-center justify-between text-xs transition-colors ${
                selectedIds.length === 0
                  ? "bg-[#faedf5]/80 text-[#55355E] font-bold"
                  : "hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 flex items-center justify-center text-[10px]">
                  ☕
                </span>
                <span>None / Break Session</span>
              </div>
              {selectedIds.length === 0 && (
                <span className="text-[10px] font-bold text-[#AA2D7B]">Active</span>
              )}
            </div>

            {filteredSpeakers.length === 0 ? (
              <div className="p-4 text-center text-xs text-gray-400">
                No speakers found matching "{searchTerm}"
              </div>
            ) : (
              filteredSpeakers.map((sp) => {
                const isSelected = selectedIds.includes(sp.id);
                return (
                  <div
                    key={sp.id}
                    onClick={() => toggleSpeaker(sp.id)}
                    className={`p-2 rounded-lg cursor-pointer flex items-center justify-between text-xs transition-colors ${
                      isSelected
                        ? "bg-[#faedf5]/60 dark:bg-[#55355E]/20 text-[#55355E] dark:text-white"
                        : "hover:bg-gray-50 dark:hover:bg-gray-800/60 text-gray-700 dark:text-gray-200"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      {/* Checkbox */}
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}} // Controlled by row click
                        className="w-4 h-4 rounded text-[#AA2D7B] border-gray-300 focus:ring-[#AA2D7B] cursor-pointer"
                      />

                      {/* Doctor Details */}
                      <div className="min-w-0 flex-1">
                        <div className="font-bold truncate">
                          Dr. {sp.first_name} {sp.last_name}
                        </div>
                        <div className="text-[10px] text-gray-500 dark:text-gray-400 truncate">
                          {sp.speciality && (
                            <span className="font-medium text-[#AA2D7B] dark:text-[#f0c3df] mr-1">
                              {sp.speciality}
                            </span>
                          )}
                          {sp.institution && `• ${sp.institution}`}
                        </div>
                      </div>
                    </div>

                    {isSelected && (
                      <span className="text-[#AA2D7B] font-bold text-xs ml-2 shrink-0">
                        ✓
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
