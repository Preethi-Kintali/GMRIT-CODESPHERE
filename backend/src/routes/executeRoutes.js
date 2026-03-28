import express from "express";

const router = express.Router();

const JUDGE0_API = "https://ce.judge0.com";

const LANGUAGE_IDS = {
  javascript: 63,
  python: 71,
  java: 62,
};

router.post("/", async (req, res) => {
  const { language, code } = req.body;
  const languageId = LANGUAGE_IDS[language];

  if (!languageId) {
    return res.status(400).json({ success: false, error: `Unsupported language: ${language}` });
  }

  try {
    const response = await fetch(`${JUDGE0_API}/submissions?base64_encoded=false&wait=true`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        source_code: code,
        language_id: languageId,
      }),
    });

    if (!response.ok) {
        return res.status(response.status).json({ success: false, error: `HTTP error: ${response.status}` });
    }

    const data = await response.json();

    if (data.compile_output) {
      return res.status(200).json({ success: false, error: `Compilation Error:\n${data.compile_output}` });
    }

    if (data.stderr) {
      return res.status(200).json({ success: false, error: `Runtime Error:\n${data.stderr}` });
    }

    const rawOutput = data.stdout ?? "";
    return res.status(200).json({ success: true, output: rawOutput.trimEnd() || "No output" });

  } catch (error) {
    console.error("Execute route error:", error);
    return res.status(500).json({ success: false, error: `Execution failed: ${error.message}` });
  }
});

export default router;
