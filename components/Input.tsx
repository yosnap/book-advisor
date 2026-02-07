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
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-600">*</span>}
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
        className={`w-full px-4 py-2 rounded-md border ${
          error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500'
        } focus:ring-1 focus:border-transparent transition-colors ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'} ${className}`}
      />
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  )
}
