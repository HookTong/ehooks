import { useEffect, useRef } from "react";

/**
 * 获取上一次的值
 * @param val
 * @returns 上一次的值
 */
export default function usePrevious<T = any>(val: T) {
  const preVal = useRef<T>(null);
  useEffect(() => {
    preVal.current = val;
  }, [val]);
  return preVal.current;
}
