import React from 'react';
import { useFormContext } from 'react-hook-form';
import { usePasswordToggle } from '../../hooks/usePasswordToggle';
import { Eye, EyeOff } from 'lucide-react';

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
  const { togglePassword, showPassword } = usePasswordToggle();
  const fieldError = errors[name];
  const hasError = Boolean(fieldError?.message);
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
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

      <div className="relative">
        <input
          id={inputId}
          disabled={disabled}
          className={`
          w-full px-3 py-2 border rounded-lg shadow-sm
          placeholder:text-muted-foreground 
          bg-background text-foreground
          focus:outline-none  focus:ring-2 focus:ring-ring
          transition-colors duration-200
          ${
            error
              ? 'border-2 border-destructive focus:ring-destructive focus:border-destructive'
              : 'border-input'
          }
          ${disabled ? 'bg-muted cursor-not-allowed opacity-50' : ''}
        `
            .trim()
            .replace(/\s+/g, ' ')}
          aria-invalid={!!error}
          aria-describedby={fieldError ? errorId : undefined}
          {...rest}
          {...register(name)}
          type={rest.type === 'password' && showPassword ? 'text' : rest.type}
        />
        {rest.type === 'password' && (
          <>
            {showPassword ? (
              <EyeOff
                className="w-4 h-4 absolute right-3 bottom-3"
                onClick={togglePassword}
              />
            ) : (
              <Eye
                className="w-4 h-4 absolute right-3 bottom-3"
                onClick={togglePassword}
              />
            )}
          </>
        )}
      </div>

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

export const PlainInput: React.FC<InputProps> = ({
  label,
  id,
  disabled,
  ...rest
}) => {
  const { togglePassword, showPassword } = usePasswordToggle();
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
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

      <div className="relative">
        <input
          id={inputId}
          disabled={disabled}
          className={`
          w-full px-3 py-2 border rounded-lg shadow-sm
          placeholder:text-muted-foreground
          bg-background text-foreground
          focus:outline-none  focus:ring-2 focus:ring-ring
          transition-colors duration-200
          ${disabled ? 'bg-muted cursor-not-allowed opacity-50' : ''}
        `
            .trim()
            .replace(/\s+/g, ' ')}
          {...rest}
          type={rest.type === 'password' && showPassword ? 'text' : rest.type}
        />
        {rest.type === 'password' && (
          <>
            {showPassword ? (
              <EyeOff
                className="w-4 h-4 absolute right-3 bottom-3"
                onClick={togglePassword}
              />
            ) : (
              <Eye
                className="w-4 h-4 absolute right-3 bottom-3"
                onClick={togglePassword}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};
