import React from "react";
import ReactDOM from "react-dom/client";
import Flashcards from "./components/Flashcards"; // Updated import
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Flashcards />
  </React.StrictMode>
);

// ✅ Register service worker for GitHub Pages
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("./service-worker.js")
      .then(() => console.log("Service Worker registered"))
      .catch((err) =>
        console.error("Service Worker registration failed:", err)
      );
  });
}