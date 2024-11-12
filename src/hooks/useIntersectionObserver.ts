import { useEffect } from 'react';

export function useIntersectionObserver(
  elementRef: React.RefObject<Element>,
  callback: (entries: IntersectionObserverEntry[]) => void,
  options: IntersectionObserverInit = { threshold: 1.0 }
) {
  useEffect(() => {
    const observer = new IntersectionObserver(callback, options);
    
    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      if (elementRef.current) {
        observer.unobserve(elementRef.current);
      }
    };
  }, [elementRef, callback, options]);
}