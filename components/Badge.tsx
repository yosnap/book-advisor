import React from 'react'

interface BadgeProps {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'score'
  children: React.ReactNode
  className?: string
}

export default function Badge({ variant = 'primary', children, className = '' }: BadgeProps) {
  if (variant === 'score') {
    return (
      <span
        className={`inline-flex items-center justify-center w-12 h-12 rounded-full bg-(--primary) text-white font-primary font-bold text-sm ${className}`}
      >
        {children}
      </span>
    )
  }

  const variantStyles = {
    primary: 'bg-(--primary) text-white',
    secondary: 'bg-(--secondary) text-(--secondary-foreground)',
    success: 'bg-(--success) text-white',
    warning: 'bg-(--warning) text-white',
    danger: 'bg-(--danger) text-white',
  }

  return (
    <span className={`inline-block px-3 py-1.5 text-xs font-semibold rounded-full ${variantStyles[variant]} ${className}`}>
      {children}
    </span>
  )
}
