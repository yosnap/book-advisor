import React from 'react';

interface ModalProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
};

export default function Modal({
  isOpen,
  title,
  onClose,
  children,
  footer,
  size = 'md',
}: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className={`bg-(--card) border border-(--border) rounded-lg shadow-xl ${sizeClasses[size]} w-full`}>
        <div className="flex items-center justify-between p-6 border-b border-(--border)">
          <h2 className="font-primary font-bold text-xl text-(--card-foreground)">{title}</h2>
          <button
            onClick={onClose}
            className="text-(--muted-foreground) hover:text-(--foreground) transition-colors"
            aria-label="Cerrar"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="p-6">{children}</div>

        {footer && (
          <div className="flex items-center justify-end gap-3 p-6 border-t border-(--border)">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
