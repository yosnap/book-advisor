import React from 'react'

interface CardProps {
  children: React.ReactNode
  className?: string
  title?: string
  description?: string
}

export default function Card({ children, className = '', title, description }: CardProps) {
  return (
    <div className={`bg-(--card) border border-(--border) rounded-lg shadow-card ${className}`}>
      {title && (
        <div className="border-b border-(--border) px-6 py-4">
          <h3 className="font-primary font-semibold text-lg text-(--card-foreground)">{title}</h3>
          {description && <p className="text-(--muted-foreground) text-sm mt-1">{description}</p>}
        </div>
      )}
      <div className={title ? 'px-6 py-4' : ''}>{children}</div>
    </div>
  )
}
