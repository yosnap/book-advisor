import React from 'react'

interface InputProps {
  type?: string
  placeholder?: string
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  error?: string
  disabled?: boolean
  required?: boolean
  className?: string
  label?: string
  name?: string
}

export default function Input({
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  disabled = false,
  required = false,
  className = '',
  label,
  name,
}: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-(--foreground) mb-2">
          {label}
          {required && <span className="text-(--danger) ml-1">*</span>}
        </label>
      )}
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
        aria-invalid={!!error}
        className={`w-full h-11 px-4 py-3 rounded-md border ${
          error
            ? 'border-(--danger) focus:ring-(--danger)'
            : 'border-(--border) focus:ring-(--primary)'
        } bg-(--background) text-(--foreground) placeholder:text-(--muted-foreground) focus:ring-1 focus:border-transparent transition-colors ${
          disabled ? 'bg-(--muted) cursor-not-allowed' : ''
        } ${className}`}
      />
      {error && <p className="mt-2 text-sm text-(--danger)">{error}</p>}
    </div>
  )
}
