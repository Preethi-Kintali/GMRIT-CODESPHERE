const JUDGE0_API = "https://ce.judge0.com";

const LANGUAGE_IDS = {
  javascript: 63,
  python: 71,
  java: 62,
};

export async function executeCode(language, code) {
  try {
    const languageId = LANGUAGE_IDS[language];

    if (!languageId) {
      return {
        success: false,
        error: `Unsupported language: ${language}`,
      };
    }

    const response = await fetch(
      `${JUDGE0_API}/submissions?base64_encoded=false&wait=true`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          source_code: code,
          language_id: languageId,
        }),
      }
    );

    if (!response.ok) {
      return {
        success: false,
        error: `HTTP error: ${response.status}`,
      };
    }

    const data = await response.json();

    // Check for compilation errors first (Java, C++, etc.)
    if (data.compile_output) {
      return {
        success: false,
        error: `Compilation Error:\n${data.compile_output}`,
      };
    }

    // Then check for runtime errors
    if (data.stderr) {
      return {
        success: false,
        error: `Runtime Error:\n${data.stderr}`,
      };
    }

    // Trim trailing newline so output comparison is reliable
    const rawOutput = data.stdout ?? "";
    return {
      success: true,
      output: rawOutput.trimEnd() || "No output",
    };
  } catch (error) {
    return {
      success: false,
      error: `Execution failed: ${error.message}`,
    };
  }
}