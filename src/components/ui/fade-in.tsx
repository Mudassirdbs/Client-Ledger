import { ReactNode } from "react";

interface FadeInProps {
  children: ReactNode;
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
  duration?: number;
  viewMargin?: string;
  className?: string;
  [key: string]: any;
}

export function FadeIn({
  children,
  delay: _delay,
  direction: _direction,
  duration: _duration,
  viewMargin: _viewMargin,
  className,
  ...props
}: FadeInProps) {
  return (
    <div className={className} {...props}>
      {children}
    </div>
  );
}
