import React from 'react'

interface CardProps {
  children: React.ReactNode
  className?: string
  title?: string
  description?: string
}

export default function Card({ children, className = '', title, description }: CardProps) {
  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow ${className}`}>
      {title && (
        <div className="border-b border-gray-200 px-6 py-4">
          <h3 className="font-primary font-bold text-lg text-gray-900">{title}</h3>
          {description && <p className="text-gray-600 text-sm mt-1">{description}</p>}
        </div>
      )}
      <div className={title ? 'px-6 py-4' : 'p-6'}>{children}</div>
    </div>
  )
}
