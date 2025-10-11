import React from "react";

interface BadgeProps {
  variant?: "success" | "warning" | "error" | "info";
  children: React.ReactNode;
  className?: string;
}

const variantClasses = {
  success: "bg-green-100 text-green-800 border-green-200",
  warning: "bg-yellow-100 text-yellow-800 border-yellow-200",
  error: "bg-red-100 text-red-800 border-red-200",
  info: "bg-blue-100 text-blue-800 border-blue-200",
};

export const Badge: React.FC<BadgeProps> = ({
  variant = "info",
  children,
  className = "",
}) => {
  return (
    <span
      className={`
        inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
        border transition-colors
        ${variantClasses[variant]}
        ${className}
      `
        .trim()
        .replace(/\s+/g, " ")}
    >
      {children}
    </span>
  );
};

export default Badge;
