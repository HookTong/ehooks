import { useLayoutEffect, useRef, useState } from "react";

export interface OnScreenOptions {
  root?: Element | Document | null;
  rootMargin?: string;
  target?: Element;
}

/**
 * 判断元素是否在可视范围内
 * @param options OnScreenOptions 配置
 */
export default function useOnScreen<RE extends Element, TE extends Element>(
  options?: OnScreenOptions
) {
  const [isVisible, setVisible] = useState(false);
  const rootRef = useRef<RE>(null);
  const targetRef = useRef<TE>(null);
  const { target, rootMargin = "0px", root } = options || {};

  useLayoutEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setVisible(entry.isIntersecting);
      },
      { rootMargin, root: root || rootRef.current }
    );

    const ele = target || targetRef.current;
    if (ele) {
      observer.observe(ele);
      return () => {
        observer.unobserve(ele);
      };
    }
  }, [root, rootMargin, target]);

  return {
    isVisible,
    targetRef,
    rootRef,
  };
}
