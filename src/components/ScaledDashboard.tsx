import React, { useEffect, useRef, useState } from "react";

interface ScaledDashboardProps {
  children: React.ReactNode;
}

export const ScaledDashboard: React.FC<ScaledDashboardProps> = ({ children }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    const inner = innerRef.current;
    if (!container || !inner) return;

    const handleResize = () => {
      const containerWidth = container.offsetWidth;
      const targetWidth = 896; // Fixed design width
      const newScale = containerWidth / targetWidth;
      setScale(newScale);
      setHeight(inner.offsetHeight * newScale);
    };

    handleResize();

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);
    resizeObserver.observe(inner);

    // Initial delay for font loads/rendering
    const timer = setTimeout(handleResize, 100);

    return () => {
      resizeObserver.disconnect();
      clearTimeout(timer);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full relative overflow-hidden"
      style={{ height: height ? `${height}px` : "500px" }}
    >
      <div
        ref={innerRef}
        className="absolute left-0 top-0 origin-top-left"
        style={{
          width: "896px",
          transform: `scale(${scale})`,
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default ScaledDashboard;
