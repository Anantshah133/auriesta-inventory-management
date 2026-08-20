import { forwardRef, useState } from 'react';
import type { InputHTMLAttributes } from 'react';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import './Input.css';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, type = 'text', id, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';
    const inputId = id || label.toLowerCase().replace(/\s+/g, '-');
    const inputType = isPassword && showPassword ? 'text' : type;

    return (
      <div className="input-group">
        <label htmlFor={inputId} className="input-label">
          {label}
        </label>
        <div className="input-wrapper">
          <input
            id={inputId}
            ref={ref}
            type={inputType}
            className={`input-field ${error ? 'input-error' : ''} ${isPassword ? 'input-password' : ''}`}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          )}
        </div>
        {error && (
          <div className="error-message">
            <AlertCircle size={14} />
            <span>{error}</span>
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
