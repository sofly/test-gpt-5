import React from "react";
import "./App.css";
import CircleDial from "./components/CircleDial";

function App() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        padding: 16,
      }}
    >
      <CircleDial autoPlay />
    </div>
  );
}

export default App;
