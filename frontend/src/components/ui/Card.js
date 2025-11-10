import React from 'react';

const Card = ({
  children,
  className = '',
  hover = false,
  padding = 'md',
  ...props
}) => {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };
  
  const hoverClass = hover ? 'hover:shadow-lg transition-all duration-300' : '';
  
  return (
    <div
      className={`
        bg-white rounded-xl shadow-soft
        ${paddingClasses[padding]}
        ${hoverClass}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;

