import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { problemsApi } from "../api/problems";
import Navbar from "../components/Navbar";

import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import ProblemDescription from "../components/ProblemDescription";
import OutputPanel from "../components/OutputPanel";
import CodeEditorPanel from "../components/CodeEditorPanel";
import { executeCode } from "../lib/piston";

import toast from "react-hot-toast";
import confetti from "canvas-confetti";
import { GripVerticalIcon, GripHorizontalIcon, Loader2Icon } from "lucide-react";
import { useMobile } from "../hooks/useMobile";

function ProblemPage() {
  const { id: slug } = useParams();
  const navigate = useNavigate();

  const [selectedLanguage, setSelectedLanguage] = useState("javascript");
  const [code, setCode] = useState("");
  const [output, setOutput] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const isMobile = useMobile();

  const { data: problem, isLoading, isError } = useQuery({
    queryKey: ["problem", slug],
    queryFn: () => problemsApi.getProblemBySlug(slug),
    enabled: !!slug,
  });

  const { data: allProblems = [] } = useQuery({
    queryKey: ["published-problems"],
    queryFn: problemsApi.getPublishedProblems,
  });

  // sync code once problem is fetched
  useEffect(() => {
    if (problem) {
      if (problem.starterCode?.[selectedLanguage]) {
        setCode(problem.starterCode[selectedLanguage]);
      } else {
        // fallback to first available or empty
        const firstLang = Object.keys(problem.starterCode || {})[0];
        if (firstLang) {
          setSelectedLanguage(firstLang);
          setCode(problem.starterCode[firstLang]);
        }
      }
    }
  }, [problem, selectedLanguage]);

  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    setSelectedLanguage(newLang);
    if (problem?.starterCode?.[newLang]) {
      setCode(problem.starterCode[newLang]);
    }
    setOutput(null);
  };

  const handleCodeReset = () => {
    if (problem?.starterCode?.[selectedLanguage]) {
       setCode(problem.starterCode[selectedLanguage]);
    }
    setOutput(null);
  };

  const handleProblemChange = (newSlug) => navigate(`/problem/${newSlug}`);

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
    if (!output) return "";
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
      const expectedOutput = problem?.expectedOutput?.[selectedLanguage];
      if (expectedOutput) {
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

  if (isLoading) {
    return (
      <div className="h-screen bg-black">
        <Navbar />
        <div className="flex items-center justify-center p-20">
          <Loader2Icon className="size-10 text-emerald-500 animate-spin" />
        </div>
      </div>
    );
  }

  if (isError || !problem) {
    return (
      <div className="h-screen bg-black">
        <Navbar />
        <div className="flex flex-col items-center justify-center p-20 space-y-4">
          <div className="text-red-500 font-bold">Problem Not Found</div>
          <button onClick={() => navigate("/problems")} className="btn btn-outline">Back to Problems</button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#000000] flex flex-col font-sans">
      <Navbar />

      <div className={`flex-1 p-4 pb-6 ${isMobile ? 'overflow-y-auto h-auto min-h-[1200px]' : 'overflow-hidden min-h-0'}`}>
        <PanelGroup direction={isMobile ? "vertical" : "horizontal"}>
          {/* left panel- problem desc */}
          <Panel defaultSize={isMobile ? 35 : 45} minSize={30}>
            <ProblemDescription
              problem={problem}
              currentProblemId={problem.slug}
              onProblemChange={handleProblemChange}
              allProblems={allProblems}
            />
          </Panel>

          <PanelResizeHandle className={`${isMobile ? 'h-4' : 'w-4'} flex items-center justify-center group cursor-${isMobile ? 'row' : 'col'}-resize`}>
            <div className={`${isMobile ? 'h-1.5 w-12' : 'w-1.5 h-12'} bg-white/10 group-hover:bg-emerald-500/50 rounded-full transition-colors flex items-center justify-center`}>
              {isMobile ? (
                <GripHorizontalIcon className="size-3 text-white/20 group-hover:text-emerald-400" />
              ) : (
                <GripVerticalIcon className="size-3 text-white/20 group-hover:text-emerald-400" />
              )}
            </div>
          </PanelResizeHandle>

          {/* right panel- code editor & output */}
          <Panel defaultSize={isMobile ? 65 : 55} minSize={30}>
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
