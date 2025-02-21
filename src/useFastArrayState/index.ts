import { useMemo, useState } from "react";

/** 需要被代理的处理器方法名称 */
const ProxyHandlerNames = [
  "push",
  "pop",
  "shift",
  "unshift",
  "splice",
  "reverse",
  "sort",
  "fill",
  "copyWithin",
];

/**
 * 监听会改变原数组的方法使其能自动更新组件
 * push(...items): 向数组末尾添加一个或多个元素，并返回新的长度。
 * pop(): 移除数组的最后一个元素，并返回该元素。如果数组为空，则返回 undefined。
 * shift(): 移除数组的第一个元素，并返回该元素。如果数组为空，则返回 undefined。
 * unshift(...items): 向数组开头添加一个或多个元素，并返回新的长度。
 * splice(start, deleteCount, ...items): 从指定位置添加/移除元素，并返回被移除的元素组成的数组。
 * reverse(): 反转数组中的元素顺序，并返回修改后的数组。
 * sort(compareFunction): 对数组元素进行排序，并返回排序后的数组。
 * fill(value, start, end): 使用指定值填充数组中的一部分，并返回修改后的数组。
 * copyWithin(target, start, end): 浅复制数组的一部分到同一数组中的另一个位置，并返回修改后的数组。
 * @param defaultArray 初始数组
 * @returns Proxy 代理数组
 */
export default function useFastArrayState<T = any>(defaultArray: T[]) {
  const [array, setArray] = useState(defaultArray);

  const proxy = useMemo<T[]>(() => {
    const newArray = [...array];
    return new Proxy(array, {
      set(target, prop, value) {
        target[prop as any] = value;
        setArray([...target]);
        return true;
      },
      get(target, prop) {
        const targetVal = Reflect.get(target, prop);
        if (!ProxyHandlerNames.includes(String(prop))) {
          return targetVal;
        }
        // 代理如下处理器
        if (prop === "push") {
          return (...items: T[]): number => {
            const len = newArray.push(...items);
            setArray(newArray);
            return len;
          };
        } else if (prop === "pop") {
          return (): T | undefined => {
            const val = newArray.pop();
            setArray(newArray);
            return val;
          };
        } else if (prop === "shift") {
          return (): T | undefined => {
            const val = newArray.shift();
            setArray(newArray);
            return val;
          };
        } else if (prop === "unshift") {
          return (...items: T[]): number => {
            const len = newArray.unshift(...items);
            setArray(newArray);
            return len;
          };
        } else if (prop === "splice") {
          return (start: number, deleteCount: number, ...items: T[]): T[] => {
            const val = newArray.splice(start, deleteCount, ...items);
            setArray(newArray);
            return val;
          };
        } else if (prop === "reverse") {
          return (): T[] => {
            const val = newArray.reverse();
            setArray(newArray);
            return val;
          };
        } else if (prop === "sort") {
          return (compareFunction?: (a: T, b: T) => number): T[] => {
            const val = newArray.sort(compareFunction);
            setArray(newArray);
            return val;
          };
        } else if (prop === "fill") {
          return (value: T, start?: number, end?: number): T[] => {
            const val = newArray.fill(value, start, end);
            setArray(newArray);
            return val;
          };
        } else if (prop === "copyWithin") {
          return (target: number, start: number, end?: number): T[] => {
            const val = newArray.copyWithin(target, start, end);
            setArray(newArray);
            return val;
          };
        } else {
          return targetVal;
        }
      },
    });
  }, [array]);
  return proxy;
}
