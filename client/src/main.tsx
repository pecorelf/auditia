import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// IMPORTANT: No StrictMode — avoids double-fetch of SSE chat endpoint in dev.
createRoot(document.getElementById("root")!).render(<App />);
