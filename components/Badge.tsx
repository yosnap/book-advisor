import React from 'react'

interface BadgeProps {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger'
  children: React.ReactNode
  className?: string
}

export default function Badge({ variant = 'primary', children, className = '' }: BadgeProps) {
  const variantStyles = {
    primary: 'bg-indigo-100 text-indigo-800',
    secondary: 'bg-purple-100 text-purple-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
  }

  return (
    <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${variantStyles[variant]} ${className}`}>
      {children}
    </span>
  )
}
