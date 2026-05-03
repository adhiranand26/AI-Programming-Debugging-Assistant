import React from 'react';

interface SkeletonProps {
  width?: string;
  height?: string;
  borderRadius?: string;
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = '32px',
  borderRadius = '6px',
  className = '',
}) => (
  <div
    style={{ width, height, borderRadius }}
    className={`bg-overlay animate-[shimmer_1.5s_ease-in-out_infinite] bg-[length:400%_100%] bg-[linear-gradient(90deg,var(--bg-overlay)_25%,var(--bg-active)_50%,var(--bg-overlay)_75%)] ${className}`}
  />
);
