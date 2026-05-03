import React, { useCallback, useState } from 'react';

interface ResizableBorderProps {
  onResize: (delta: number) => void;
  isVertical?: boolean;
}

export const ResizableBorder: React.FC<ResizableBorderProps> = ({ onResize, isVertical = false }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);

    const startPos = isVertical ? e.clientY : e.clientX;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const currentPos = isVertical ? moveEvent.clientY : moveEvent.clientX;
      const delta = currentPos - startPos;
      onResize(delta);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'default';
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = isVertical ? 'row-resize' : 'col-resize';
  }, [isVertical, onResize]);

  return (
    <div
      onMouseDown={handleMouseDown}
      className={`
        flex-shrink-0 bg-transparent transition-colors duration-75
        ${isVertical ? 'h-1 w-full cursor-row-resize' : 'w-1 h-full cursor-col-resize'}
        ${isDragging ? 'bg-accent-violet' : 'hover:bg-accent-violet-transparent'}
      `}
    />
  );
};
