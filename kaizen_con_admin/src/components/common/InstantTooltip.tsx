import React, { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";

interface TooltipState {
  visible: boolean;
  text: string;
  rect: DOMRect | null;
  placement: "top" | "bottom";
}

export function InstantTooltipProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<TooltipState>({
    visible: false,
    text: "",
    rect: null,
    placement: "top",
  });

  const activeElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const handleMouseOver = (e: MouseEvent) => {
      // ONLY trigger on elements with data-tooltip (specifically for action buttons)
      const target = (e.target as HTMLElement | null)?.closest?.(
        "[data-tooltip]"
      ) as HTMLElement | null;

      if (!target) {
        if (state.visible) {
          activeElementRef.current = null;
          setState((prev) => ({ ...prev, visible: false }));
        }
        return;
      }

      // If already showing tooltip for this same target element, don't re-trigger
      if (activeElementRef.current === target && state.visible) {
        return;
      }

      const tooltipText = target.getAttribute("data-tooltip") || "";
      if (!tooltipText.trim()) return;

      activeElementRef.current = target;
      const rect = target.getBoundingClientRect();
      const placement = rect.top < 38 ? "bottom" : "top";

      setState({
        visible: true,
        text: tooltipText,
        rect,
        placement,
      });
    };

    const handleMouseOut = (e: MouseEvent) => {
      const related = e.relatedTarget as HTMLElement | null;
      if (activeElementRef.current && (!related || !activeElementRef.current.contains(related))) {
        activeElementRef.current = null;
        setState((prev) => ({ ...prev, visible: false }));
      }
    };

    const handlePointerDown = () => {
      // Hide instantly on click so it doesn't linger after action
      activeElementRef.current = null;
      setState((prev) => ({ ...prev, visible: false }));
    };

    const handleScrollOrResize = () => {
      if (activeElementRef.current) {
        const rect = activeElementRef.current.getBoundingClientRect();
        if (
          rect.bottom < 0 ||
          rect.top > window.innerHeight ||
          rect.right < 0 ||
          rect.left > window.innerWidth
        ) {
          activeElementRef.current = null;
          setState((prev) => ({ ...prev, visible: false }));
        } else {
          setState((prev) => ({
            ...prev,
            rect,
            placement: rect.top < 38 ? "bottom" : "top",
          }));
        }
      }
    };

    document.addEventListener("mouseover", handleMouseOver, true);
    document.addEventListener("mouseout", handleMouseOut, true);
    document.addEventListener("pointerdown", handlePointerDown, true);
    window.addEventListener("scroll", handleScrollOrResize, true);
    window.addEventListener("resize", handleScrollOrResize);

    return () => {
      document.removeEventListener("mouseover", handleMouseOver, true);
      document.removeEventListener("mouseout", handleMouseOut, true);
      document.removeEventListener("pointerdown", handlePointerDown, true);
      window.removeEventListener("scroll", handleScrollOrResize, true);
      window.removeEventListener("resize", handleScrollOrResize);
    };
  }, [state.visible]);

  return (
    <>
      {children}
      {state.visible &&
        state.rect &&
        state.text &&
        createPortal(
          <div
            className="fixed pointer-events-none select-none z-[999999] px-2.5 py-1 text-[11px] font-medium tracking-wide text-white bg-gray-900/95 dark:bg-gray-800/95 dark:text-gray-100 rounded-md shadow-lg border border-gray-700/60 whitespace-nowrap animate-fadeIn backdrop-blur-xs max-w-xs"
            style={{
              left: `${Math.max(12, Math.min(window.innerWidth - 12, state.rect.left + state.rect.width / 2))}px`,
              top: `${state.placement === "top" ? state.rect.top - 6 : state.rect.bottom + 6}px`,
              transform:
                state.placement === "top"
                  ? "translate(-50%, -100%)"
                  : "translate(-50%, 0)",
            }}
          >
            {state.text}
            {/* Arrow */}
            {state.placement === "top" ? (
              <div
                className="absolute top-full left-1/2 -translate-x-1/2 border-x-[5px] border-x-transparent border-t-[5px] border-t-gray-900/95 dark:border-t-gray-800/95"
              />
            ) : (
              <div
                className="absolute bottom-full left-1/2 -translate-x-1/2 border-x-[5px] border-x-transparent border-b-[5px] border-b-gray-900/95 dark:border-b-gray-800/95"
              />
            )}
          </div>,
          document.body
        )}
    </>
  );
}

export default InstantTooltipProvider;
