import React from "react";
import { useFormContext } from "react-hook-form";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  name: string;
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  name,
  id,
  disabled,
  ...rest
}) => {
  const {
    register,
    formState: { errors },
  } = useFormContext();
  const fieldError = errors[name];
  const hasError = Boolean(fieldError?.message);
  const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");
  const errorId = `${inputId}-error`;

  return (
    <div className={`w-full`}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-foreground mb-1"
        >
          {label}
        </label>
      )}

      <input
        id={inputId}
        disabled={disabled}
        className={`
          w-full px-3 py-2 border rounded-lg shadow-sm min-h-[44px]
          placeholder:text-muted-foreground 
          bg-background text-foreground
          focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring
          transition-colors duration-200
          ${
            error
              ? "border-destructive focus:ring-destructive focus:border-destructive"
              : "border-input"
          }
          ${
            disabled
              ? "bg-muted cursor-not-allowed opacity-50"
              : "hover:border-accent-foreground"
          }
        `
          .trim()
          .replace(/\s+/g, " ")}
        aria-invalid={!!error}
        aria-describedby={fieldError ? errorId : undefined}
        {...rest}
        {...register(name)}
      />

      {hasError && (
        <p
          id={errorId}
          className="mt-1 text-sm text-destructive"
          role="alert"
          aria-live="polite"
        >
          {fieldError?.message as string}
        </p>
      )}
    </div>
  );
};

export default Input;
