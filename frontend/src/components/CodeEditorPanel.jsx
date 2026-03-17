import Editor from "@monaco-editor/react";
import { Loader2Icon, PlayIcon, Code2Icon, ChevronDownIcon } from "lucide-react";
import { LANGUAGE_CONFIG } from "../data/problems";
import { useState, useRef, useEffect } from "react";

function CodeEditorPanel({
  selectedLanguage,
  code,
  isRunning,
  onLanguageChange,
  onCodeChange,
  onRunCode,
}) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLanguageSelect = (langKey) => {
    // Send pseudo-event to parent
    onLanguageChange({ target: { value: langKey } });
    setIsDropdownOpen(false);
  };

  return (
    <div className="h-full bg-[#1e1e1e] flex flex-col rounded-xl overflow-hidden border border-white/10">
      {/* HEADER */}
      <div className="flex items-center justify-between px-4 h-12 bg-[#2d2d2d] border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-black/40 rounded-md border border-white/5">
            <Code2Icon className="size-4 text-emerald-400" />
            <span className="text-xs font-medium text-neutral-300">Code</span>
          </div>

          <div className="h-4 w-px bg-white/10" />

          {/* CUSTOM DROPDOWN */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 bg-[#1e1e1e] hover:bg-[#252525] rounded-md border border-white/10 transition-colors w-32 justify-between group"
            >
              <div className="flex items-center gap-2">
                <img
                  src={LANGUAGE_CONFIG[selectedLanguage].icon}
                  alt={LANGUAGE_CONFIG[selectedLanguage].name}
                  className="size-4 object-contain"
                />
                <span className="text-xs font-medium text-neutral-300">
                  {LANGUAGE_CONFIG[selectedLanguage].name}
                </span>
              </div>
              <ChevronDownIcon
                className={`size-3.5 text-neutral-500 group-hover:text-white transition-all ${isDropdownOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {/* DROPDOWN MENU */}
            {isDropdownOpen && (
              <div className="absolute top-full left-0 mt-1 w-full bg-[#1e1e1e] border border-white/10 rounded-md shadow-2xl py-1 z-50 overflow-hidden">
                {Object.entries(LANGUAGE_CONFIG).map(([key, lang]) => (
                  <button
                    key={key}
                    onClick={() => handleLanguageSelect(key)}
                    className={`flex items-center gap-2 w-full px-3 py-2 text-xs font-medium transition-colors
                      ${selectedLanguage === key ? 'bg-white/10 text-white' : 'text-neutral-400 hover:bg-[#2d2d2d] hover:text-neutral-200'}
                    `}
                  >
                    <img
                      src={lang.icon}
                      alt={lang.name}
                      className="size-4 object-contain"
                    />
                    {lang.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <button
          className="px-4 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-md flex items-center gap-2 text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isRunning}
          onClick={onRunCode}
        >
          {isRunning ? (
            <>
              <Loader2Icon className="size-3.5 animate-spin" />
              Running...
            </>
          ) : (
            <>
              <PlayIcon className="size-3.5" />
              Run Code
            </>
          )}
        </button>
      </div>

      {/* EDITOR */}
      <div className="flex-1 w-full bg-[#1e1e1e] pt-3">
        <Editor
          height={"100%"}
          language={LANGUAGE_CONFIG[selectedLanguage].monacoLang}
          value={code}
          onChange={onCodeChange}
          theme="vs-dark"
          options={{
            fontSize: 14,
            fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', Consolas, monospace",
            lineNumbers: "on",
            scrollBeyondLastLine: false,
            automaticLayout: true,
            minimap: { enabled: false },
            padding: { top: 10 },
            renderLineHighlight: "all",
            lineHeight: 24,
            cursorBlinking: "smooth",
            cursorSmoothCaretAnimation: "on"
          }}
        />
      </div>
    </div>
  );
}
export default CodeEditorPanel;
