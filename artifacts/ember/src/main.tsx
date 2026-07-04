import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { markRitualFlowStart } from "./lib/ritualMetrics";

markRitualFlowStart();

createRoot(document.getElementById("root")!).render(<App />);
