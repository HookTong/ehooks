import queryString from "query-string";
import { useEffect, useState } from "react";

export type ModeType = "pushState" | "replaceState";

export interface UrlSearchOptions {
  /** 是否在url中保留参数 */
  mode?: ModeType;
  /** 是否将初始化参数同步到url中，默认同步 */
  initParamsToUrl?: boolean;
}

/**
 * 更新url参数
 * @param state 参数对象
 * @param mode 模式，pushState | replaceState
 * */
export function updateUrlSearch<T = any>(state: Partial<T>, mode: ModeType) {
  const res = {
    ...queryString.parse(window.location.search),
    ...state,
  };
  const search = queryString.stringify(res, {
    skipNull: true,
    skipEmptyString: true,
  });
  window.history[mode]?.({}, "", `?${search}`);
  return res as Partial<T>;
}

/**
 * 监听/控制url地址栏参数
 * @param initialParams 初始参数
 * @param options 配置项
 */
export default function useUrlSearch<T = any>(
  initialParams?: T,
  options?: UrlSearchOptions
) {
  const { mode = "pushState", initParamsToUrl = true } = options || {};
  const [params, setParams] = useState<Partial<T>>({
    ...initialParams,
    ...queryString.parse(window.location.search),
  });

  const setUrlParams = (newParams: Partial<T>) => {
    setParams(updateUrlSearch(newParams, mode));
  };

  useEffect(() => {
    if (initParamsToUrl) updateUrlSearch(params, mode);
    const handlePopState = () => {
      const newParams = queryString.parse(window.location.search);
      setParams(newParams as Partial<T>);
    };
    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { params, setUrlParams };
}
