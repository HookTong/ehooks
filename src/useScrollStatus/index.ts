import { RefObject, useLayoutEffect, useRef, useState } from "react";

export interface ScrollStatusOptions {
  /** 是否默认为水平滚动状态 */
  defaultScrollX?: boolean;
  /** 是否默认为垂直滚动状态 */
  defaultScrollY?: boolean;
}

/**
 * 监听元素是否滚动
 * @param o ScrollStatusOptions 配置
 */
export default function useScrollStatus<T = HTMLElement>(
  o?: ScrollStatusOptions
) {
  const { defaultScrollX, defaultScrollY } = o || {};
  const [isScrollX, setIsScrollX] = useState<boolean>(Boolean(defaultScrollX));
  const [isScrollY, setIsScrollY] = useState<boolean>(Boolean(defaultScrollY));
  const wapperRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    if (!wapperRef.current) return;

    const isScrollHandler = () => {
      const { scrollWidth, clientWidth, clientHeight, scrollHeight } =
        wapperRef!.current!;
      setIsScrollX(scrollWidth > clientWidth);
      setIsScrollY(scrollHeight > clientHeight);
    };

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (["childList", "attributes"].includes(mutation.type)) {
          isScrollHandler();
        }
      });
    });

    // 开始观察目标元素
    observer.observe(wapperRef.current, {
      childList: true,
      attributes: true,
      subtree: true,
    });

    // 初始化判断是否滚动
    isScrollHandler();

    // 组件卸载时停止观察
    return () => observer.disconnect();
  }, []);

  return { wapperRef: wapperRef as RefObject<T>, isScrollX, isScrollY };
}
