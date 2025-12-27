import React, { useEffect, useState } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

export function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setIsAnimating(true);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop with red tint */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm"
        style={{
          background: 'radial-gradient(circle at center, rgba(230,0,18,0.1) 0%, rgba(0,0,0,0.9) 100%)'
        }}
        onClick={onClose}
      />

      {/* Diagonal lines overlay */}
      <div
        className="fixed inset-0 pointer-events-none opacity-10"
        style={{
          background: `repeating-linear-gradient(
            -45deg,
            transparent,
            transparent 10px,
            rgba(230, 0, 18, 0.3) 10px,
            rgba(230, 0, 18, 0.3) 20px
          )`
        }}
      />

      {/* Scrollable container */}
      <div className="min-h-full flex items-start md:items-center justify-center p-2 md:p-4">
        {/* Modal content */}
        <div
          className={`
            relative z-10 w-full my-4 md:my-8
            ${sizeClasses[size]}
            ${isAnimating ? 'animate-zoom-in' : ''}
          `}
        >
        {/* Glowing border effect */}
        <div className="absolute -inset-[2px] bg-gradient-to-r from-[#e60012] via-[#ff4444] to-[#e60012] rounded-lg opacity-75 blur-sm" />

        {/* Main content container */}
        <div className="relative bg-gradient-to-b from-[#1a1a1a] to-[#0d0d0d] rounded-lg border-2 border-[#e60012] overflow-hidden">
          {/* Top accent bar */}
          <div className="h-1 bg-gradient-to-r from-transparent via-[#e60012] to-transparent" />

          {/* Header */}
          <div className="relative px-6 py-4 border-b-2 border-[#e60012]/30">
            {/* Title with Smash styling */}
            <h2 className="text-2xl font-bold uppercase tracking-wider text-white pr-8"
                style={{ fontFamily: "'Russo One', sans-serif" }}>
              {title}
            </h2>

            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center
                         text-gray-400 hover:text-white hover:bg-[#e60012]
                         rounded transition-all duration-200 hover:scale-110 hover:rotate-90"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Decorative slashes */}
            <div className="absolute bottom-0 right-16 w-8 h-[2px] bg-[#e60012] transform -skew-x-[45deg]" />
            <div className="absolute bottom-0 right-24 w-4 h-[2px] bg-[#e60012] transform -skew-x-[45deg]" />
          </div>

          {/* Body */}
          <div className="p-6">
            {children}
          </div>

          {/* Bottom accent */}
          <div className="h-1 bg-gradient-to-r from-transparent via-[#e60012] to-transparent" />
        </div>
      </div>
      </div>
    </div>
  );
}
