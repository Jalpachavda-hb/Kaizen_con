import React from "react";

interface StarRatingProps {
  rating: number;
  max?: number;
  size?: "sm" | "md";
  showValue?: boolean;
}

const StarIcon: React.FC<{ filled: boolean; className: string }> = ({ filled, className }) => (
  <svg
    className={`${className} ${filled ? "text-amber-400" : "text-gray-300 dark:text-gray-600"}`}
    viewBox="0 0 24 24"
    fill={filled ? "currentColor" : "none"}
    stroke="currentColor"
    strokeWidth="1.5"
    aria-hidden="true"
  >
    <path
      strokeLinejoin="round"
      d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
    />
  </svg>
);

/** Read-only star rating display, e.g. ★★★☆☆ 3/5 */
export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  max = 5,
  size = "sm",
  showValue = true,
}) => {
  const safe = Number.isFinite(rating) ? Math.max(0, Math.min(max, Math.round(rating))) : 0;
  const iconClass = size === "md" ? "w-5 h-5" : "w-3.5 h-3.5";

  return (
    <div className="inline-flex items-center gap-1.5" aria-label={`${safe} out of ${max} stars`}>
      <div className="inline-flex items-center gap-0.5">
        {Array.from({ length: max }, (_, i) => (
          <StarIcon key={i} filled={i < safe} className={iconClass} />
        ))}
      </div>
      {showValue && (
        <span
          className={`font-semibold text-gray-700 dark:text-gray-300 ${
            size === "md" ? "text-sm" : "text-[11px]"
          }`}
        >
          {safe}/{max}
        </span>
      )}
    </div>
  );
};

export default StarRating;
