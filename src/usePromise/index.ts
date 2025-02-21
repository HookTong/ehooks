import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

export interface PromiseProxyOptions<T = any, P = any> {
  /** 请求成功的回调 */
  onSuccess?: (data: T, params?: P) => void;
  /** 请求失败的回调 */
  onError?: (e: Error, params?: P) => void;
  /** 请求结束后的回调 */
  onFinally?: (params?: P, data?: T, e?: Error) => void;
  /** 请求前的回调，返回false则不执行且不会保存run方法传递的参数 */
  onBefore?: (params?: P) => boolean;
  /** 默认参数，只有在manual为false时会传递给run方法 */
  defaultParams?: P;
  /** 是否手动出发异步函数 */
  manual?: boolean;
}

export interface PromiseProxyResult<T = any, P = any> {
  /** 请求成功后的数据 */
  data?: T;
  /** 请求状态 */
  loading: boolean;
  /** 请求失败的错误信息 */
  error?: Error;
  /** 手动执行，参数为手动执行时的参数，如果想第一次手动执行使用defaultParams请使用refresh方法 */
  run: (params?: P) => Promise<T | undefined>;
  /** 当前执行请求的参数 */
  params?: P;
  /** 使用上一次的参数执行请求 */
  refresh: () => Promise<T | undefined>;
  /** 取消当前请求 */
  cancel: () => void;
  /** 手动更新data数据 */
  mutate: Dispatch<SetStateAction<T | undefined>>;
}

/**
 * 异步数据管理，封装promise，支持手动执行，参数，loading，error，data，不依赖任何库，可自行封装
 * @param promise 异步函数，支持传入promise，或返回promise的函数
 * @param options 配置项
 */
export default function usePromise<T = any, P = any>(
  promise: Promise<T> | ((params?: P) => Promise<T>),
  options: PromiseProxyOptions<T, P>
): PromiseProxyResult<T, P> {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error>();
  const [data, setData] = useState<T>();

  const {
    onSuccess,
    onError,
    onFinally,
    onBefore,
    manual = false,
    defaultParams,
  } = options;

  const currentParamRef = useRef<P>(defaultParams);
  const currentPromiseRef = useRef<Promise<T>>(null);

  const request = useCallback(
    async (p: Promise<T>) => {
      currentPromiseRef.current = p;
      let finallyRes, finallyErr;
      try {
        setLoading(true);
        const res = await p;
        // 必须确保是最新请求
        if (currentPromiseRef.current !== p) return;
        setData(res);
        setError(undefined);
        onSuccess?.(res, currentParamRef.current);
        finallyRes = res;
        return res;
      } catch (e) {
        if (currentPromiseRef.current !== p) return;
        const err = e as Error;
        setData(undefined);
        setError(err);
        onError?.(err, currentParamRef.current);
        finallyErr = err;
      } finally {
        if (currentPromiseRef.current !== p) return;
        setLoading(false);
        onFinally?.(currentParamRef.current, finallyRes, finallyErr);
      }
    },
    [onError, onFinally, onSuccess]
  );

  const run = useCallback(
    async (p?: P) => {
      const handler = async () => {
        currentParamRef.current = p;
        const promiseInstance =
          typeof promise === "function" ? promise(p) : promise;
        return await request(promiseInstance);
      };
      if (onBefore) {
        // 执行前处理，返回true则请求
        return onBefore(p) ? await handler() : undefined;
      }
      return await handler();
    },
    [onBefore, promise, request]
  );

  const refresh = async () => {
    return await run(currentParamRef.current);
  };

  const cancel = () => {
    setLoading(false);
    currentPromiseRef.current = null;
  };

  useEffect(() => {
    // 非手动则执行一次
    if (!manual) run(defaultParams);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [manual]);

  return {
    data,
    loading,
    error,
    run,
    params: currentParamRef.current,
    refresh,
    cancel,
    mutate: setData,
  };
}
