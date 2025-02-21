import { useState } from "react";
import "./App.css";
import useFastArrayState from "./useFastArrayState";
import useFastObjectState from "./useFastObjectState";
import useOnScreen from "./useOnScreen";
import usePrevious from "./usePrevious";
import usePromise from "./usePromise";
import useScrollStatus from "./useScrollStatus";
import useUrlSearch from "./useUrlSearch";

function App() {
  const [list, setList] = useState<any[]>([]);
  const { wapperRef, isScrollX, isScrollY } = useScrollStatus<HTMLDivElement>();

  const [value, setValue] = useState(1);
  const preValue = usePrevious(value);

  const objState = useFastObjectState({
    a: 1,
    b: 2,
    c: 3,
  });

  const arrState = useFastArrayState([1, 2, 3]);

  const { isVisible, targetRef } = useOnScreen<HTMLDivElement, HTMLDivElement>({
    rootMargin: "0px",
  });

  const { data, loading, run, refresh, error, cancel, params } = usePromise<
    { name: string },
    { id: number }
  >(
    (p) => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          if (p?.id !== 1) {
            resolve({ name: "ok name hahahha1" });
          } else {
            reject(new Error("error hahah2"));
          }
        }, 5000);
      });
    },
    {
      defaultParams: { id: 1 },
      onBefore(params) {
        console.warn("onBefore", params);
        return true;
      },
      onSuccess(data, params) {
        console.warn("onSuccess", data, params);
      },
      onFinally(params, data, e) {
        console.warn("onFinally", params, data, e);
      },
      onError(e, params) {
        console.warn("onError", e, params);
      },
      manual: false,
    }
  );

  const { params: searchParams, setUrlParams } = useUrlSearch<{
    name: string;
    age: number;
  }>(
    {
      name: "张三",
      age: 18,
    },
    {
      mode: "pushState",
      initParamsToUrl: true,
    }
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUrlParams({ [name]: value } as Partial<{
      name: string;
      age: number;
    }>);
  };

  return (
    <div className="App">
      <div>isScrollX: {String(isScrollX)}</div>
      <div>isScrollY: {String(isScrollY)}</div>
      <button
        onClick={() => {
          setList([...list, list.length + 1]);
        }}
      >
        add item
      </button>
      <button
        onClick={() => {
          setList(list.slice(0, list.length - 1));
        }}
      >
        rm item
      </button>
      <div
        style={{
          width: "100%",
          height: 300,
          overflowX: "auto",
          display: "flex",
          gap: 20,
          alignItems: "center",
          justifyContent: "flex-start",
        }}
        ref={wapperRef}
      >
        {list.map((item, index) => (
          <div
            style={{
              width: 100,
              height: 100 * (index + 1),
              background: "red",
              flexShrink: 0,
            }}
          >
            {item}
          </div>
        ))}
      </div>

      <button
        onClick={() => {
          setValue(value + 1);
        }}
      >
        testPrevious
      </button>

      <div>
        curValue: {value}
        preValue: {preValue}
      </div>

      <button
        onClick={() => {
          objState.a = objState.a + 1;
          objState.b = objState.b + 1;
          objState.c = objState.c + 1;

          arrState[0] = arrState[0] + 1;
          arrState[1] = arrState[1] + 1;
          arrState[2] = arrState[2] + 1;
        }}
      >
        testObjState
      </button>

      <div>
        objState.a: {objState.a}
        objState.b: {objState.b}
        objState.c: {objState.c}
        <br />
        arrState[0]: {arrState[0]}
        arrState[1]: {arrState[1]}
        arrState[2]: {arrState[2]}
      </div>

      <button
        onClick={() => {
          arrState.reverse();
          arrState.push(arrState.length + 1);
        }}
      >
        testArrayState
      </button>

      <div>arrState: {arrState.join(",")}</div>

      <button
        disabled={loading}
        onClick={() => {
          run({ id: 1 });
        }}
      >
        promise run1
      </button>

      <button
        disabled={loading}
        onClick={() => {
          run({ id: 2 });
          run({ id: 3 });
          run({ id: 4 });
        }}
      >
        promise run2
      </button>

      <button
        disabled={loading}
        onClick={() => {
          refresh();
        }}
      >
        promise refresh
      </button>

      <button
        onClick={() => {
          cancel();
        }}
      >
        promise cancel
      </button>

      <div>
        promise loading: {String(loading)}
        <br />
        <br />
        data: {data ? JSON.stringify(data) : "undefined"}
        <br />
        <br />
        error: {error ? error.message : "undefined"}
        <br />
        <br />
        params: {params ? JSON.stringify(params) : "undefined"}
      </div>
      <br />
      <br />

      <div>
        <h1>URL Search Params</h1>
        <input
          type="text"
          name="name"
          value={searchParams.name}
          onChange={handleChange}
          placeholder="Name"
        />
        <input
          type="number"
          name="age"
          value={searchParams.age}
          onChange={handleChange}
          placeholder="Age"
        />
        <p>Name: {searchParams.name}</p>
        <p>Age: {searchParams.age}</p>
      </div>
      <br />

      {isVisible ? "I am visible!" : "I am not visible!"}

      <div
        style={{
          width: "100%",
          overflowX: "auto",
        }}
      >
        {/* 监听的元素 */}
        <div
          ref={targetRef}
          style={{
            marginLeft: "2000px", // 确保元素在滚动后才可见
            width: 200,
            height: 200,
            background: "blue",
            textAlign: "center",
            lineHeight: "200px",
            color: "white",
          }}
        >
          {isVisible ? "I am visible!" : "I am not visible!"}
        </div>
      </div>
    </div>
  );
}

export default App;
