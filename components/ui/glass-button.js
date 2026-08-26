"use client";

import React from "react";
import Link from "next/link";

function cx(...inputs) {
  return inputs.filter(Boolean).join(" ");
}

const sizeClasses = {
  sm: "text-sm font-medium",
  default: "text-base font-medium",
  lg: "text-lg font-medium",
  icon: "h-10 w-10",
};

const contentSizeClasses = {
  sm: "px-4 py-2",
  default: "px-6 py-3.5",
  lg: "px-8 py-4",
  icon: "flex h-10 w-10 items-center justify-center",
};

const GlassButton = React.forwardRef(function GlassButton(
  {
    className,
    children,
    size = "default",
    contentClassName,
    href,
    ...props
  },
  ref,
) {
  const sharedClassName = cx(
    "glass-button relative isolate block w-full cursor-pointer rounded-full",
    sizeClasses[size],
  );

  const content = (
    <span
      className={cx(
        "glass-button-text relative z-[2] block select-none tracking-[-0.02em]",
        contentSizeClasses[size],
        contentClassName,
      )}
    >
      {children}
    </span>
  );

  return (
    <div className={cx("glass-button-wrap rounded-full", className)}>
      {href ? (
        <Link ref={ref} href={href} className={sharedClassName} {...props}>
          {content}
        </Link>
      ) : (
        <button ref={ref} className={sharedClassName} {...props}>
          {content}
        </button>
      )}
      <span aria-hidden="true" className="glass-button-shadow rounded-full" />
    </div>
  );
});

GlassButton.displayName = "GlassButton";

export { GlassButton };
