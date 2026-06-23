import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', fullWidth = false, className = '', ...props }, ref) => {
    const baseClass = 'btn';
    const variantClass = `${baseClass}--${variant}`;
    const sizeClass = `${baseClass}--${size}`;
    const fullWidthClass = fullWidth ? `${baseClass}--fullwidth` : '';

    const combinedClasses = [baseClass, variantClass, sizeClass, fullWidthClass, className]
      .filter(Boolean)
      .join(' ');

    return (
      <button ref={ref} className={combinedClasses} {...props} />
    );
  }
);

Button.displayName = 'Button';

export default Button;
