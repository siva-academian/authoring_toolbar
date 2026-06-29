import React from "react";
import ReactDOM from "react-dom/client";
import App from "./components/App";

Office.onReady(() => {
  const root = ReactDOM.createRoot(document.getElementById("root"));
  root.render(<App />);
});
