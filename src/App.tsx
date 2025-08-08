import { Routes, Route, Navigate } from "react-router-dom";
import Circle from "./pages/Circle";
import Voice from "./pages/Voice";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/circle" />} />
      <Route path="/circle" element={<Circle />} />
      <Route path="/voice" element={<Voice />} />
    </Routes>
  );
}
