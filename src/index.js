import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import User from "./App";
import Professional from "./Professional";

if (window.location.hash.replace("#", "") === "professional") {
  ReactDOM.render(<Professional />, document.getElementById("root"));
} else {
  ReactDOM.render(<User />, document.getElementById("root"));
}
