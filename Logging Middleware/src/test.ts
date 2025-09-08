import { sendLog } from "./index";

(async () => {
  try {
    const res = await sendLog({
      stack: "backend",
      level: "info",
      package: "service",
      message: "This is a test"
    });
    console.log("✅ Log sent:", res);
  } catch (err) {
    console.error("❌ Failed to send log:", err);
  }
})();
