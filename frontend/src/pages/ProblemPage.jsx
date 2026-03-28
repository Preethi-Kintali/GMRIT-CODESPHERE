import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { PROBLEMS } from "../data/problems";
import Navbar from "../components/Navbar";

import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import ProblemDescription from "../components/ProblemDescription";
import OutputPanel from "../components/OutputPanel";
import CodeEditorPanel from "../components/CodeEditorPanel";
import { executeCode } from "../lib/piston";

import toast from "react-hot-toast";
import confetti from "canvas-confetti";
import { GripVerticalIcon, GripHorizontalIcon } from "lucide-react";

function ProblemPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [currentProblemId, setCurrentProblemId] = useState("two-sum");
  const [selectedLanguage, setSelectedLanguage] = useState("javascript");
  const [code, setCode] = useState(PROBLEMS[currentProblemId].starterCode.javascript);
  const [output, setOutput] = useState(null);
  const [isRunning, setIsRunning] = useState(false);

  const currentProblem = PROBLEMS[currentProblemId];

  // update problem when URL param changes
  useEffect(() => {
    if (id && PROBLEMS[id]) {
      setCurrentProblemId(id);
      setCode(PROBLEMS[id].starterCode[selectedLanguage]);
      setOutput(null);
    }
  }, [id, selectedLanguage]);

  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    setSelectedLanguage(newLang);
    setCode(currentProblem.starterCode[newLang]);
    setOutput(null);
  };

  const handleCodeReset = () => {
    setCode(currentProblem.starterCode[selectedLanguage]);
    setOutput(null);
  };

  const handleProblemChange = (newProblemId) => navigate(`/problem/${newProblemId}`);

  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 250,
      origin: { x: 0.2, y: 0.6 },
    });

    confetti({
      particleCount: 80,
      spread: 250,
      origin: { x: 0.8, y: 0.6 },
    });
  };

  const normalizeOutput = (output) => {
    // normalize output for comparison (trim whitespace, handle different spacing)
    return output
      .trim()
      .split("\n")
      .map((line) =>
        line
          .trim()
          // remove spaces after [ and before ]
          .replace(/\[\s+/g, "[")
          .replace(/\s+\]/g, "]")
          // normalize spaces around commas to single space after comma
          .replace(/\s*,\s*/g, ",")
      )
      .filter((line) => line.length > 0)
      .join("\n");
  };

  const checkIfTestsPassed = (actualOutput, expectedOutput) => {
    const normalizedActual = normalizeOutput(actualOutput);
    const normalizedExpected = normalizeOutput(expectedOutput);

    return normalizedActual == normalizedExpected;
  };

  const handleRunCode = async () => {
    setIsRunning(true);
    setOutput(null);

    const result = await executeCode(selectedLanguage, code);
    setOutput(result);
    setIsRunning(false);

    // check if code executed successfully and matches expected output

    if (result.success) {
      const expectedOutput = currentProblem.expectedOutput[selectedLanguage];
      const testsPassed = checkIfTestsPassed(result.output, expectedOutput);

      if (testsPassed) {
        triggerConfetti();
        toast.success("All tests passed! Great job!", {
          style: {
            background: "#1e1e1e",
            color: "#fff",
            border: "1px solid rgba(255,255,255,0.1)",
          },
          iconTheme: { primary: "#10b981", secondary: "#fff" }
        });
      } else {
        toast.error("Tests failed. Check your output!", {
          style: {
            background: "#1e1e1e",
            color: "#fff",
            border: "1px solid rgba(255,255,255,0.1)",
          },
        });
      }
    } else {
      toast.error("Code execution failed!", {
        style: {
          background: "#1e1e1e",
          color: "#fff",
          border: "1px solid rgba(255,255,255,0.1)",
        },
      });
    }
  };

  return (
    <div className="h-screen bg-[#000000] flex flex-col font-sans">
      <Navbar />

      <div className="flex-1 p-4 pb-6 overflow-hidden min-h-0">
        <PanelGroup direction="horizontal">
          {/* left panel- problem desc */}
          <Panel defaultSize={45} minSize={30}>
            <ProblemDescription
              problem={currentProblem}
              currentProblemId={currentProblemId}
              onProblemChange={handleProblemChange}
              allProblems={Object.values(PROBLEMS)}
            />
          </Panel>

          <PanelResizeHandle className="w-4 flex items-center justify-center group cursor-col-resize">
            <div className="w-1.5 h-12 bg-white/10 group-hover:bg-emerald-500/50 rounded-full transition-colors flex items-center justify-center">
              <GripVerticalIcon className="size-3 text-white/20 group-hover:text-emerald-400" />
            </div>
          </PanelResizeHandle>

          {/* right panel- code editor & output */}
          <Panel defaultSize={55} minSize={30}>
            <PanelGroup direction="vertical">
              {/* Top panel - Code editor */}
              <Panel defaultSize={65} minSize={30}>
                <CodeEditorPanel
                  selectedLanguage={selectedLanguage}
                  code={code}
                  isRunning={isRunning}
                  onLanguageChange={handleLanguageChange}
                  onCodeChange={setCode}
                  onRunCode={handleRunCode}
                  onReset={handleCodeReset}
                />
              </Panel>

              <PanelResizeHandle className="h-4 flex items-center justify-center group cursor-row-resize">
                <div className="h-1.5 w-12 bg-white/10 group-hover:bg-emerald-500/50 rounded-full transition-colors flex items-center justify-center">
                  <GripHorizontalIcon className="size-3 text-white/20 group-hover:text-emerald-400" />
                </div>
              </PanelResizeHandle>

              {/* Bottom panel - Output Panel*/}

              <Panel defaultSize={35} minSize={30}>
                <OutputPanel output={output} />
              </Panel>
            </PanelGroup>
          </Panel>
        </PanelGroup>
      </div>
    </div>
  );
}

export default ProblemPage;
