import { useCallback, useContext, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Editor from "@monaco-editor/react";
import { Group, Panel, Separator } from "react-resizable-panels";
import ConfettiExplosion from 'react-confetti-explosion';
import { SkeletonTheme } from "react-loading-skeleton";
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import {
    FiArrowLeft,
    FiLoader,
    FiPlay,
    FiRotateCcw,
} from "react-icons/fi";
import axios from "../routs/Axios";
import { CurrentQuestionContext } from "../routs/CreateContext";
import executetestcode from "../utils/executeTestCode";
const LC = {
    bg: "#1a1a1a",
    panel: "#282828",
    surface: "#2d2d2d",
    border: "#3e3e3e",
    text: "#eff1f6",
    muted: "#9ca3af",
    easy: "#00b8a3",
    medium: "#ffc01a",
    hard: "#ff375f",
    run: "#ffffff",
    submit: "#ffa116",
};

const difficultyStyle = (difficulty) => {
    const d = String(difficulty || "easy").toLowerCase();
    const color = d === "hard" ? LC.hard : d === "medium" ? LC.medium : LC.easy;
    return { color, borderColor: `${color}55`, backgroundColor: `${color}18` };
};

const LANG_OPTIONS = [
    { value: "javascript", label: "JavaScript" },
    { value: "python", label: "Python" },
    { value: "java", label: "Java" },
];

const panelShell = { overflow: "hidden", minHeight: 0, minWidth: 0 };

const ResizeBar = ({ direction }) => (
    <Separator
        className="group relative z-10 flex items-center justify-center outline-none transition-colors"
        style={{
            ...(direction === "horizontal"
                ? { minWidth: 5, width: 5 }
                : { minHeight: 5, height: 5 }),
            backgroundColor: LC.bg,
            boxSizing: "border-box",
        }}
    >
        <span
            className={
                direction === "horizontal"
                    ? "pointer-events-none h-8 w-px rounded-full bg-[#3e3e3e] group-hover:bg-[#5a5a5a]"
                    : "pointer-events-none h-px w-8 rounded-full bg-[#3e3e3e] group-hover:bg-[#5a5a5a]"
            }
        />
    </Separator>
);

const useWideLayout = () => {
    const query = "(min-width: 1024px)";
    const [wide, setWide] = useState(
        () => typeof window !== "undefined" && window.matchMedia(query).matches
    );

    useEffect(() => {
        const mq = window.matchMedia(query);
        const onChange = () => setWide(mq.matches);
        onChange();
        mq.addEventListener("change", onChange);
        return () => mq.removeEventListener("change", onChange);
    }, []);

    return wide;
};

const ExampleBlock = ({ index, input, output, explanation }) => (
    <div className="mb-6">
        <p className="mb-2 text-sm font-semibold text-[#eff1f6]">Example {index + 1}:</p>
        <div className="space-y-2 text-sm leading-relaxed text-[#c9cdd4]">
            <div>
                <strong className="font-semibold text-[#eff1f6]">Input: </strong>
                <code className="font-mono text-[13px] text-[#eff1f6]">{input}</code>
            </div>
            <div>
                <strong className="font-semibold text-[#eff1f6]">Output: </strong>
                <code className="font-mono text-[13px] text-[#eff1f6]">{output}</code>
            </div>
            {explanation ? (
                <div>
                    <strong className="font-semibold text-[#eff1f6]">Explanation: </strong>
                    <span>{explanation}</span>
                </div>
            ) : null}
        </div>
    </div>
);

const ProblemPanel = ({ question, submitResult, isSubmitting }) => {
    const [problemTab, setProblemTab] = useState("description");

    useEffect(() => {
        if (submitResult) setProblemTab("status");
    }, [submitResult]);

    return (
        <div className="flex h-full min-h-0 flex-col" style={{ backgroundColor: LC.bg }}>
            <div
                className="flex shrink-0 items-center gap-0 border-b px-1"
                style={{ borderColor: LC.border, backgroundColor: LC.panel }}
            >
                <button
                    type="button"
                    onClick={() => setProblemTab("description")}
                    className="px-3 py-3 text-sm font-medium transition-colors"
                    style={{
                        color: problemTab === "description" ? LC.text : LC.muted,
                        borderBottom:
                            problemTab === "description" ? `2px solid ${LC.text}` : "2px solid transparent",
                    }}
                >
                    Description
                </button>
                <button
                    type="button"
                    onClick={() => setProblemTab("status")}
                    className="px-3 py-3 text-sm font-medium transition-colors"
                    style={{
                        color: problemTab === "status" ? LC.text : LC.muted,
                        borderBottom:
                            problemTab === "status" ? `2px solid ${LC.text}` : "2px solid transparent",
                    }}
                >
                    Submit Status
                </button>

            </div>
            {problemTab === "description" ? (
                <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 scrollbar-hide">
                    <div className="mb-4 flex flex-wrap items-center gap-2">
                        <h1 className="text-xl font-semibold text-[#eff1f6]">{question.title}</h1>
                        <span
                            className="rounded-full border px-2 py-0.5 text-xs font-medium capitalize"
                            style={difficultyStyle(question.difficulty)}
                        >
                            {question.difficulty || "easy"}
                        </span>
                    </div>
                    {Array.isArray(question.tags) && question.tags.length > 0 ? (
                        <div className="mb-4 flex flex-wrap gap-2">
                            {question.tags.map((tag) => (
                                <span
                                    key={tag}
                                    className="rounded-md px-2 py-0.5 text-xs"
                                    style={{ backgroundColor: LC.surface, color: LC.muted }}
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    ) : null}
                    <div className="prose-invert text-sm leading-7 text-[#c9cdd4]">
                        <p className="whitespace-pre-wrap">{question.description}</p>
                    </div>
                    {question.sampleTestCases?.length > 0 ? (
                        <div className="mt-6 border-t pt-6" style={{ borderColor: LC.border }}>
                            {question.sampleTestCases.map((tc, i) => (
                                <ExampleBlock
                                    key={`ex-${i}-${tc.input}`}
                                    index={i}
                                    input={tc.input}
                                    output={tc.output}
                                    explanation={tc.explanation}
                                />
                            ))}
                        </div>
                    ) : null}
                    {question.constraints ? (
                        <div className="mt-4">
                            <p className="mb-2 text-sm font-semibold text-[#eff1f6]">Constraints:</p>
                            <p className="whitespace-pre-wrap text-sm text-[#c9cdd4]">{question.constraints}</p>
                        </div>
                    ) : null}
                </div>
            ) : (
                <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 scrollbar-hide">
                    {isSubmitting ? (
                        <div className="flex items-center gap-2 text-sm" style={{ color: LC.muted }}>
                            <FiLoader className="animate-spin" size={16} />
                            Running submission…
                        </div>
                    ) : !submitResult ? (
                        <p className="text-sm" style={{ color: LC.muted }}>
                            Submit your solution to see results here.
                        </p>
                    ) : submitResult.success ? (
                        <div
                            className="rounded-lg border px-4 py-3 text-sm"
                            style={{
                                borderColor: `${LC.easy}44`,
                                backgroundColor: `${LC.easy}14`,
                                color: LC.easy,
                            }}
                        >
                            <p className="font-semibold">Accepted</p>
                            <p className="mt-1 text-[#c9cdd4]">All test cases passed.</p>
                        </div>
                    ) : (
                        <div
                            className="rounded-lg border px-4 py-3 text-sm"
                            style={{
                                borderColor: `${LC.hard}44`,
                                backgroundColor: `${LC.hard}14`,
                                color: LC.hard,
                            }}
                        >
                            <p className="font-semibold">Wrong Answer</p>
                            {submitResult.error ? (
                                <p className="mt-1 text-[#c9cdd4]">{submitResult.error}</p>
                            ) : null}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const ConsolePanel = ({
    sampleTestCases,
    activeCase,
    onSelectCase,
    consoleTab,
    onConsoleTab,
    outputs,
    consoleError,
}) => {
    const cases = sampleTestCases ?? [];
    const active = cases[activeCase];
    const index = activeCase;
    return (
        <div className="flex h-full min-h-0 flex-col" style={{ backgroundColor: LC.bg }}>
            <div
                className="flex shrink-0 items-center border-b"
                style={{ borderColor: LC.border, backgroundColor: LC.panel }}
            >
                <button
                    type="button"
                    onClick={() => onConsoleTab("testcase")}
                    className="px-3 py-2 text-sm font-medium transition-colors"
                    style={{
                        color: consoleTab === "testcase" ? LC.text : LC.muted,
                        borderBottom:
                            consoleTab === "testcase" ? `2px solid ${LC.text}` : "2px solid transparent",
                    }}
                >
                    Testcase
                </button>
                <button
                    type="button"
                    onClick={() => onConsoleTab("result")}
                    className="px-3 py-2 text-sm font-medium transition-colors"
                    style={{
                        color: consoleTab === "result" ? LC.text : LC.muted,
                        borderBottom:
                            consoleTab === "result" ? `2px solid ${LC.text}` : "2px solid transparent",
                    }}
                >
                    Test Result
                </button>
            </div>

            {consoleTab === "testcase" ? (
                <>
                    <div
                        className="flex shrink-0 items-center gap-1 border-b px-2 py-1.5"
                        style={{ borderColor: LC.border }}
                    >
                        {cases.map((_, i) => (
                            <button
                                key={`case-pill-${i}`}
                                type="button"
                                onClick={() => onSelectCase(i)}
                                className="rounded px-2.5 py-1 text-xs font-medium transition-colors"
                                style={{
                                    backgroundColor: activeCase === i ? LC.surface : "transparent",
                                    color: activeCase === i ? LC.text : LC.muted,
                                }}
                            >
                                Case {i + 1}
                            </button>
                        ))}
                        {cases.length === 0 ? (
                            <span className="px-2 text-xs text-[#6b7280]">No cases</span>
                        ) : null}
                    </div>
                    <div className="min-h-0 flex-1 overflow-y-auto p-3 scrollbar-hide">
                        {active ? (
                            <div className="space-y-3 text-sm">
                                <div>
                                    <label className="mb-1 block text-xs font-medium text-[#9ca3af]">
                                        Input
                                    </label>
                                    <textarea
                                        readOnly
                                        value={active.input}
                                        className=" w-full resize-none rounded border px-3 py-2 font-mono text-xs outline-none focus:border-[#5a5a5a]"
                                        style={{
                                            backgroundColor: LC.surface,
                                            borderColor: LC.border,
                                            color: LC.text,
                                        }}
                                    />
                                </div>
                                <div>
                                    <span className="text-xs text-[#9ca3af]">Expected = </span>
                                    <code className="font-mono text-xs text-[#9ca3af]">{active.output}</code>
                                </div>
                                <div>
                                    {outputs.length > 0 && (
                                        <>
                                            <span className="text-xs text-[#9ca3af]">Output = </span>
                                            <code className={`font-mono text-sm ${outputs[index].replace(/\s/g, "") === active.output.replace(/\s/g, "") ? "text-green-500" : "text-red-500"}`}>
                                                {outputs[index]}
                                            </code>
                                        </>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <p className="text-sm text-[#6b7280]">No sample test cases.</p>
                        )}
                    </div>
                </>
            ) : (
                <div className="p-3 border-l-15 h-full" style={{ borderColor: LC.border }}>
                    <p className="text-sm text-[#9ca3af]">{consoleError}</p>
                </div>
            )}
        </div>
    );
};

const EditorPanel = ({
    code,
    onChange,
    lang,
    onLangChange,
    onRun,
    onSubmit,
    onReset,
    isRunning,
    success_submit
}) => (
    <div className="flex h-full min-h-0 flex-col" style={{ backgroundColor: LC.bg }}>
        <div
            className="flex shrink-0 items-center justify-between gap-2 border-b px-2 py-1.5 sm:px-3"
            style={{ borderColor: LC.border, backgroundColor: LC.panel }}
        >
            <span className="truncate pl-1 text-xs text-[#6b7280]">&nbsp;</span>
            <div className="flex items-center gap-2">
                <select
                    value={lang}
                    onChange={(e) => onLangChange(e.target.value)}
                    className="cursor-pointer rounded border px-2 py-1 text-xs outline-none"
                    style={{
                        backgroundColor: LC.surface,
                        borderColor: LC.border,
                        color: LC.text,
                    }}
                >
                    {LANG_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
                <button
                    type="button"
                    onClick={onReset}
                    title="Reset code"
                    className="grid h-8 w-8 place-items-center rounded transition-colors hover:bg-[#3a3a3a]"
                    style={{ color: LC.muted }}
                >
                    <FiRotateCcw size={14} />
                </button>
                <button
                    type="button"
                    onClick={onRun}
                    disabled={isRunning}
                    className="inline-flex items-center gap-1.5 rounded border px-3 py-1 text-xs font-medium transition hover:opacity-90 disabled:opacity-50"
                    style={{
                        borderColor: LC.border,
                        backgroundColor: LC.surface,
                        color: LC.run,
                    }}
                >
                    {isRunning ? (
                        <FiLoader className="animate-spin" size={12} />
                    ) : (
                        <FiPlay size={12} />
                    )}
                    Run
                </button>
                <button
                    type="button"
                    onClick={onSubmit}
                    disabled={isRunning}
                    className={`rounded px-3 py-1 text-xs font-semibold transition hover:opacity-90 disabled:opacity-50 ${success_submit ? "cursor-not-allowed" : "bg-submit"}`}
                    style={{ backgroundColor: success_submit ? "#6b7280" : LC.submit, color: "#1a1a1a" }}
                >
                    Submit
                </button>
            </div>
        </div>
        <div className="min-h-0 flex-1">
            <Editor
                height="100%"
                language={lang}
                theme="vs-dark"
                value={code}
                onChange={onChange}
                options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    fontFamily: "Menlo, Monaco, 'Courier New', monospace",
                    lineHeight: 20,
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    tabSize: 4,
                    wordWrap: "off",
                    padding: { top: 12 },
                    renderLineHighlight: "line",
                    scrollbar: {
                        verticalScrollbarSize: 8,
                        horizontalScrollbarSize: 8,
                    },
                }}
            />
        </div>
    </div>
);

const buildStarterCode = (question) => ({
    javascript: `${question?.starterCode?.javascript ?? ""}\n\n`,
    python: `${question?.starterCode?.python ?? ""}\n\n`,
    java: `${question?.starterCode?.java ?? ""}\n\n`,
});

const Coding = () => {
    const { id } = useParams();
    const { currentQuestion, setCurrentQuestion } = useContext(CurrentQuestionContext);
    const navigate = useNavigate();
    const wide = useWideLayout();
    const [question, setQuestion] = useState(currentQuestion);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [lang, setLang] = useState("javascript");
    const [codeByLang, setCodeByLang] = useState(() => buildStarterCode(currentQuestion));
    const [activeCase, setActiveCase] = useState(0);
    const [consoleTab, setConsoleTab] = useState("testcase");
    const [isRunning, setIsRunning] = useState(false);
    const [outputs, setOutputs] = useState([]);
    const [consoleError, setConsoleError] = useState("");
    const [submitResult, setSubmitResult] = useState(null);
    const [showCelebration, setShowCelebration] = useState(false);
    const [success_submit, setSuccess_submit] = useState(false);
    useEffect(() => {
        if (showCelebration) {
            const timer = setTimeout(() => setShowCelebration(false), 5000);
            return () => clearTimeout(timer);
        }
    }, [showCelebration]);
    useEffect(() => {
        if(!currentQuestion?._id) return;
        question_data();
    }, [currentQuestion]);

    const question_data = async () => {
        try{
            setLoading(true);
            
            const res = await axios.post('/api/questions/data',{
                id: currentQuestion?._id ,
            })
            if(res.data.status === false) setQuestion(currentQuestion)
            else {
                setCodeByLang({
                    javascript: res.data.question.answer.language === "javascript" ? res.data.question.answer.code : question?.starterCode?.javascript ?? "",
                    python: res.data.question.answer.language === "python" ? res.data.question.answer.code : question?.starterCode?.python ?? "",
                    java: res.data.question.answer.language === "java" ? res.data.question.answer.code : question?.starterCode?.java ?? "",
                });
                setSuccess_submit(true);
            };
        }catch(err){
            setError(err.message);
        }finally{
            setLoading(false);
        }
    }

    const finalcode = (index) => {
        const tc = question.sampleTestCases[index];
        return `
            ${tc.input.split(", ").map((line) => `const ${line}`).join("\n")}\n\n
            ${codeByLang[lang]}\n\n
            console.log(${question.functionSignature})
            `;
    };

    const runCode = async () => {
        setIsRunning(true);
        try {
            for (const [index] of question.sampleTestCases.entries()) {
                const result = finalcode(index);
                const response = await executetestcode(result, lang);
                setOutputs((prev) => [...prev, response.data?.stdout ?? ""]);
                setConsoleError(response.data?.stderr ?? "")

            }
        } catch (err) {
            setConsoleError(err?.message ?? String(err));
        } finally {
            setIsRunning(false);
        }
    };

    const submitCode = async () => {
        setIsRunning(true);
        try {
            const response = await axios.post('/execute/executecode', {
                language: lang,
                code: codeByLang[lang],
                question
            });
            setSubmitResult({
                success: response.data.status,
                error: response.data?.error ?? "",
            });
            if (response.data.status) {
                setShowCelebration(true);
                setSuccess_submit(true);
            }
            setConsoleError(response.data?.error ?? "");
        } catch (err) {
            setSubmitResult({ success: false, error: err.message });
            setConsoleError(err.message);
        } finally {
            setIsRunning(false);
        }
    }

    const onEditorChange = useCallback(
        (value) => {
            setCodeByLang((prev) => ({ ...prev, [lang]: value ?? "" }));
        },
        [lang]
    );

    const handleReset = () => {
        if (!question) return;
        setCodeByLang(buildStarterCode(question));
    };

    const handleLangChange = (next) => {
        setLang(next);
    };

    if (loading) {
        return (
          <SkeletonTheme
            baseColor="#2d2d2d"
            highlightColor="#444"
          >
            <section
              className="flex h-[calc(100dvh-4.25rem)] flex-col overflow-hidden"
              style={{ backgroundColor: LC.bg }}
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-stone-600 px-3 py-2">
                <div className="flex items-center gap-3">
                  <Skeleton circle width={32} height={32} />
                  <Skeleton width={150} height={20} />
                </div>
                <Skeleton width={90} height={30} />
              </div>
      
              {/* Mobile */}
              <div className="flex flex-1 flex-col lg:hidden overflow-hidden p-3 gap-3">
                <Skeleton height={180} />
      
                <Skeleton height={250} />
      
                <Skeleton height={120} />
              </div>
      
              {/* Desktop */}
              <div className="hidden lg:flex flex-1 overflow-hidden">
                {/* Problem Panel */}
                <div className="w-[42%] p-4">
                  <Skeleton width={220} height={28} />
                  <Skeleton width={80} height={22} className="mt-3" />
      
                  <div className="mt-5 space-y-3">
                    <Skeleton count={8} />
                  </div>
      
                  <div className="mt-6 space-y-3">
                    <Skeleton height={80} />
                    <Skeleton height={80} />
                  </div>
                </div>
      
                {/* Editor + Console */}
                <div className="flex flex-1 flex-col border-l border-stone-600">
                  <div className="flex items-center justify-end gap-2 p-3 border-b border-stone-600">
                    <Skeleton width={100} height={30} />
                    <Skeleton width={35} height={30} />
                    <Skeleton width={70} height={30} />
                    <Skeleton width={80} height={30} />
                  </div>
      
                  <div className="flex-1 p-3">
                    <Skeleton height="100%" />
                  </div>
      
                  <div className="h-55 border-t border-stone-600 p-3">
                    <div className="flex gap-2 mb-3">
                      <Skeleton width={80} height={24} />
                      <Skeleton width={100} height={24} />
                    </div>
      
                    <Skeleton height={120} />
                  </div>
                </div>
              </div>
            </section>
          </SkeletonTheme>
        );
      }

    if (!question) {
        return (
            <div className="p-6" style={{ backgroundColor: LC.bg }}>
                <button
                    type="button"
                    onClick={() => navigate("/problems")}
                    className="mb-4 inline-flex items-center gap-2 text-sm transition hover:opacity-80"
                    style={{ color: LC.muted }}
                >
                    <FiArrowLeft size={16} />
                    Back to problems
                </button>
                <div
                    className="rounded-lg border px-4 py-3 text-sm"
                    style={{
                        borderColor: `${LC.hard}44`,
                        backgroundColor: `${LC.hard}14`,
                        color: LC.hard,
                    }}
                >
                    {"Question not found."}
                </div>
            </div>
        );
    }

    if(error) {
        return (
            <div className="p-6" style={{ backgroundColor: LC.bg }}>
                <div className="rounded-lg border px-4 py-3 text-sm" style={{ borderColor: `${LC.hard}44`, backgroundColor: `${LC.hard}14`, color: LC.hard }}>
                    {error}
                </div>
            </div>
        )
    }

    const editorCode = codeByLang?.[lang] ?? "";

    const workspace = wide ? (
        <Group orientation="horizontal" className="h-full min-h-0">
            <Panel
                id="problem"
                defaultSize="42"
                minSize="28"
                maxSize="58"
                className="min-h-0 min-w-0"
                style={panelShell}
            >
                <ProblemPanel
                    question={question}
                    submitResult={submitResult}
                    isSubmitting={isRunning}
                />
            </Panel>
            <ResizeBar direction="horizontal" />
            <Panel
                id="editor-console"
                defaultSize="58"
                minSize="35"
                className="min-h-0 min-w-0"
                style={panelShell}
            >
                <Group orientation="vertical" className="h-full min-h-0">
                    <Panel id="editor" defaultSize="62" minSize="35" className="min-h-0 min-w-0" style={panelShell}>
                        <EditorPanel
                            code={editorCode}
                            onChange={onEditorChange}
                            lang={lang}
                            onLangChange={handleLangChange}
                            onRun={runCode}
                            onSubmit={submitCode}
                            onReset={handleReset}
                            isRunning={isRunning}
                            success_submit={success_submit}
                        />
                    </Panel>
                    <ResizeBar direction="vertical" />
                    <Panel
                        id="console"
                        defaultSize="38"
                        minSize="18"
                        maxSize="50"
                        className="min-h-0 min-w-0"
                        style={panelShell}
                    >
                        <ConsolePanel
                            sampleTestCases={question.sampleTestCases}
                            activeCase={activeCase}
                            onSelectCase={setActiveCase}
                            consoleTab={consoleTab}
                            onConsoleTab={setConsoleTab}
                            outputs={outputs}
                            consoleError={consoleError}
                        />
                    </Panel>
                </Group>
            </Panel>
        </Group>
    ) : (
        <Group orientation="vertical" className="h-full min-h-0">
            <Panel id="m-problem" defaultSize="32" minSize="18" className="min-h-0 min-w-0" style={panelShell}>
                <ProblemPanel
                    question={question}
                    submitResult={submitResult}
                    isSubmitting={isRunning}
                />
            </Panel>
            <ResizeBar direction="vertical" />
            <Panel id="m-editor" defaultSize="38" minSize="22" className="min-h-0 min-w-0 " style={panelShell}>
                <EditorPanel
                    code={editorCode}
                    onChange={onEditorChange}
                    lang={lang}
                    onLangChange={handleLangChange}
                    onRun={runCode}
                    onSubmit={runCode}
                    onReset={handleReset}
                    isRunning={isRunning}
                    success_submit={success_submit}
                />
            </Panel>
            <ResizeBar direction="vertical" />
            <Panel id="m-console" defaultSize="30" minSize="16" className="min-h-0 min-w-0" style={panelShell}>
                <ConsolePanel
                    sampleTestCases={question.sampleTestCases}
                    activeCase={activeCase}
                    onSelectCase={setActiveCase}
                    consoleTab={consoleTab}
                    onConsoleTab={setConsoleTab}
                    outputs={outputs}
                    consoleError={consoleError}
                />
            </Panel>
        </Group>
    );

    return (
        <section
            className="flex h-[calc(100dvh-4.25rem)] max-h-[calc(100dvh-4.25rem)] min-h-0 flex-col overflow-hidden"
            style={{ backgroundColor: LC.bg }}
        >
            <header
                className="flex shrink-0 items-center justify-between gap-2 border-b px-2 py-1.5 sm:px-3"
                style={{ borderColor: LC.border, backgroundColor: LC.panel }}
            >
                <div className="flex min-w-0 items-center gap-1">
                    <Link
                        to="/problems"
                        className="grid h-8 w-8 shrink-0 place-items-center rounded transition-colors hover:bg-[#3a3a3a]"
                        style={{ color: LC.muted }}
                        aria-label="Back to problems"
                    >
                        <FiArrowLeft size={16} />
                    </Link>

                    <span className="mx-1 hidden h-4 w-px sm:block" style={{ backgroundColor: LC.border }} />
                    <span className="truncate text-sm font-medium" style={{ color: LC.text }}>
                        {question.title}
                    </span>
                </div>
                <Link
                    to="/problems"
                    className="shrink-0 rounded px-2.5 py-1 text-xs font-medium transition-colors hover:bg-[#3a3a3a]"
                    style={{ color: LC.muted }}
                >
                    Problem List
                </Link>
            </header>

            <div className="min-h-0 flex-1 overflow-hidden ">
                {workspace}
                {showCelebration && (
                    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden flex justify-center items-center">
                        <ConfettiExplosion force={0.9}
                            duration={5000}
                            particleCount={300}
                            width={1800} />
                    </div>
                )}
            </div>
        </section>
    );
};

export default Coding;
