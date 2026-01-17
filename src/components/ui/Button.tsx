import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'gold' | 'purple';
  size?: 'sm' | 'md' | 'lg';
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles = `
    font-bold uppercase tracking-wider
    rounded-md
    transform skew-x-[-2deg]
    transition-all duration-200 ease-out
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black
    disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none
    hover:scale-105 hover:-translate-y-0.5
    active:scale-95
    relative overflow-hidden
    border-2
  `;

  const variantStyles = {
    primary: `
      bg-gradient-to-b from-[#e60012] to-[#b8000e]
      border-[#ff1a2b]
      text-white
      shadow-[0_4px_15px_rgba(230,0,18,0.4)]
      hover:shadow-[0_6px_25px_rgba(230,0,18,0.6)]
      focus:ring-[#e60012]
    `,
    secondary: `
      bg-gradient-to-b from-[#3d3d3d] to-[#2a2a2a]
      border-[#555]
      text-white
      shadow-[0_4px_15px_rgba(0,0,0,0.3)]
      hover:shadow-[0_6px_25px_rgba(255,255,255,0.1)]
      focus:ring-gray-500
    `,
    danger: `
      bg-gradient-to-b from-[#ff4444] to-[#cc0000]
      border-[#ff6666]
      text-white
      shadow-[0_4px_15px_rgba(255,0,0,0.4)]
      hover:shadow-[0_6px_25px_rgba(255,0,0,0.6)]
      focus:ring-red-500
    `,
    success: `
      bg-gradient-to-b from-[#22c55e] to-[#16a34a]
      border-[#4ade80]
      text-white
      shadow-[0_4px_15px_rgba(34,197,94,0.4)]
      hover:shadow-[0_6px_25px_rgba(34,197,94,0.6)]
      focus:ring-green-500
    `,
    gold: `
      bg-gradient-to-b from-[#ffd700] to-[#daa520]
      border-[#ffe44d]
      text-black
      shadow-[0_4px_15px_rgba(255,215,0,0.4)]
      hover:shadow-[0_6px_25px_rgba(255,215,0,0.6)]
      focus:ring-yellow-500
    `,
    purple: `
      bg-gradient-to-b from-[#8b5cf6] to-[#6d28d9]
      border-[#a78bfa]
      text-white
      shadow-[0_4px_15px_rgba(139,92,246,0.4)]
      hover:shadow-[0_6px_25px_rgba(139,92,246,0.6)]
      focus:ring-purple-500
    `,
  };

  const sizeStyles = {
    sm: 'px-4 py-1.5 text-xs',
    md: 'px-6 py-2.5 text-sm',
    lg: 'px-8 py-4 text-base',
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      disabled={disabled}
      {...props}
    >
      <span className="relative z-10 skew-x-[2deg]">{children}</span>
      {/* Shine effect */}
      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-700 skew-x-[2deg]" />
    </button>
  );
}
