// Tooltip Component
// Provides contextual help and hover information

import React, { useState, useRef, useEffect } from 'react';

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
}

const Tooltip: React.FC<TooltipProps> = ({ 
  content, 
  children, 
  position = 'top',
  delay = 300 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showTooltip = () => {
    timeoutRef.current = setTimeout(() => {
      if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        const tooltipRect = tooltipRef.current?.getBoundingClientRect();
        
        let x = 0;
        let y = 0;
        
        switch (position) {
          case 'top':
            x = rect.left + rect.width / 2;
            y = rect.top - 8;
            break;
          case 'bottom':
            x = rect.left + rect.width / 2;
            y = rect.bottom + 8;
            break;
          case 'left':
            x = rect.left - 8;
            y = rect.top + rect.height / 2;
            break;
          case 'right':
            x = rect.right + 8;
            y = rect.top + rect.height / 2;
            break;
        }
        
        setCoords({ x, y });
        setIsVisible(true);
      }
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const getPositionStyles = () => {
    const baseStyle: React.CSSProperties = {
      position: 'fixed',
      zIndex: 50,
      transform: 'translate(-50%, -100%)'
    };

    switch (position) {
      case 'top':
        return { ...baseStyle, left: coords.x, top: coords.y - 8 };
      case 'bottom':
        return { ...baseStyle, left: coords.x, top: coords.y + 8, transform: 'translate(-50%, 0)' };
      case 'left':
        return { ...baseStyle, left: coords.x - 8, top: coords.y, transform: 'translate(-100%, -50%)' };
      case 'right':
        return { ...baseStyle, left: coords.x + 8, top: coords.y, transform: 'translate(0, -50%)' };
    }
  };

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
        className="inline-flex"
      >
        {children}
      </div>
      
      {isVisible && (
        <div
          ref={tooltipRef}
          style={getPositionStyles()}
          className="px-3 py-2 text-sm bg-gray-900 text-white rounded-lg shadow-lg max-w-xs"
          role="tooltip"
        >
          {content}
          {/* Arrow */}
          <div 
            className={`absolute w-2 h-2 bg-gray-900 transform rotate-45 ${
              position === 'top' ? 'bottom-0 left-1/2 -mb-1 -ml-1' :
              position === 'bottom' ? 'top-0 left-1/2 -mt-1 -ml-1' :
              position === 'left' ? 'right-0 top-1/2 -mr-1 -mt-1' :
              'left-0 top-1/2 -ml-1 -mt-1'
            }`}
          />
        </div>
      )}
    </>
  );
};

export default Tooltip;

// Help Icon with Tooltip
interface HelpTooltipProps {
  title: string;
  content: React.ReactNode;
}

export const HelpTooltip: React.FC<HelpTooltipProps> = ({ title, content }) => {
  return (
    <Tooltip 
      content={
        <div>
          <p className="font-medium mb-1">{title}</p>
          {content}
        </div>
      }
      position="right"
    >
      <button
        type="button"
        className="w-4 h-4 text-gray-400 hover:text-gray-600 transition-colors"
        aria-label={`Help: ${title}`}
      >
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>
    </Tooltip>
  );
};
