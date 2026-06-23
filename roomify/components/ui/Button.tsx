import React from 'react';

const buttonStyles = `
  .btn {
    cursor: pointer;
    font-weight: 500;
    transition: all 0.2s ease;
    border: none;
    border-radius: 0.375rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .btn--primary {
    background-color: #2563eb;
    color: white;
  }

  .btn--primary:hover {
    background-color: #1d4ed8;
  }

  .btn--secondary {
    background-color: #6b7280;
    color: white;
  }

  .btn--secondary:hover {
    background-color: #4b5563;
  }

  .btn--danger {
    background-color: #dc2626;
    color: white;
  }

  .btn--danger:hover {
    background-color: #b91c1c;
  }

  .btn--ghost {
    background-color: transparent;
    color: currentColor;
    border: 1px solid transparent;
  }

  .btn--ghost:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }

  .btn--outline {
    background-color: white;
    border: 1px solid #d1d5db;
    color: #1f2937;
  }

  .btn--outline:hover {
    background-color: #f9fafb;
    border-color: #9ca3af;
  }

  .btn--sm {
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
  }

  .btn--md {
    padding: 0.75rem 1.5rem;
    font-size: 1rem;
  }

  .btn--lg {
    padding: 1rem 2rem;
    font-size: 1.125rem;
  }

  .btn--fullwidth {
    width: 100%;
  }
`;

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
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
      <>
        <style>{buttonStyles}</style>
        <button ref={ref} className={combinedClasses} {...props} />
      </>
    );
  }
);

Button.displayName = 'Button';

export default Button;
