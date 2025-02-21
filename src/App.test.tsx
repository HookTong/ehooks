import React from "react";
import { render, screen } from "@testing-library/react";
// import "@testing-library/jest-dom"; // 导入自定义匹配器
import App from "./App";

test("renders learn react link", () => {
  render(<App />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
