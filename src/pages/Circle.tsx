import { Link } from "react-router-dom";
import CircleDial from "../components/CircleDial";

export default function Circle() {
  return (
    <>
      <div style={{ position: "absolute", top: 16, right: 16 }}>
        <Link to="/voice" style={{ color: "#646cff" }}>
          Voice Avatar
        </Link>
      </div>
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
    </>
  );
}
