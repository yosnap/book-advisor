import React from 'react'

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  isLoading?: boolean
  onClick?: () => void
  children: React.ReactNode
  className?: string
  type?: 'button' | 'submit' | 'reset'
}

export default function Button({
  variant = 'primary',
  size = 'md',
  disabled = false,
  isLoading = false,
  onClick,
  children,
  className = '',
  type = 'button',
}: ButtonProps) {
  const baseStyles = 'font-secondary font-semibold rounded-md transition-all duration-200'

  const variantStyles = {
    primary: 'bg-(--primary) text-white hover:opacity-90 active:opacity-80',
    secondary: 'bg-(--secondary) text-(--secondary-foreground) hover:opacity-90 active:opacity-80',
    ghost: 'border border-(--primary) text-(--primary) bg-transparent hover:bg-(--primary) hover:text-white',
    outline: 'border border-(--border) text-(--foreground) bg-transparent hover:bg-(--surface)',
    danger: 'bg-(--danger) text-white hover:opacity-90 active:opacity-80',
  }

  const sizeStyles = {
    sm: 'px-4 py-1.5 text-sm',
    md: 'px-6 py-3 text-sm',
    lg: 'px-8 py-3 text-base',
  }

  const disabledStyles = disabled || isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${disabledStyles} ${className}`}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          {children}
        </span>
      ) : (
        children
      )}
    </button>
  )
}
