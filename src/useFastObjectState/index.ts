import { useMemo, useState } from "react";

/**
 * 创建对象状态，使用 Proxy 代理对象，无需 setState ，直接 obj.a = 1 即可实现更新组件
 * @param defaultObj 初始对象
 * @returns Proxy 代理对象
 */
export default function useFastObjectState<T = any>(defaultObj?: T) {
  const [source, setSource] = useState<any>(defaultObj || {});
  const proxy = useMemo<T>(() => {
    // 创建代理对象
    return new Proxy(source, {
      set(target, p, newValue) {
        target[p] = newValue;
        setSource({ ...target });
        return true;
      },
      get(target, p) {
        return Reflect.get(target, p);
      },
    });
  }, [source]);
  return proxy;
}
