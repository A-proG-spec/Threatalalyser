// src/components/ui/Button.tsx
import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  isLoading?: boolean;
}

export function Button({ 
  children, 
  variant = 'primary', 
  isLoading, 
  className = '', 
  ...props 
}: ButtonProps) {
  const baseStyles = "inline-flex items-center justify-center font-medium transition-colors focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    // The main white pill button
    primary: "bg-white text-black rounded-full hover:bg-gray-200 px-6 py-2.5",
    // A dark subtle button for secondary actions
    secondary: "bg-[#1A1A1A] text-white rounded-full hover:bg-[#2A2A2A] px-6 py-2.5",
    // A text-only button with no background
    ghost: "text-gray-400 hover:text-white px-4 py-2",
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`} 
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <span className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
      ) : null}
      {children}
    </button>
  );
}