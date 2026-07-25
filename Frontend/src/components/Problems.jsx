import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiLoader, FiLock } from "react-icons/fi";
import axios from "../routs/Axios";
import { CurrentQuestionContext } from "../routs/CreateContext";
import { SkeletonTheme } from "react-loading-skeleton";
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
const difficultyBadge = (difficulty) => {
  const map = {
    easy: "border-emerald-400/40 bg-emerald-500/10 text-emerald-300",
    medium: "border-blue-400/40 bg-blue-500/10 text-blue-300",
    hard: "border-rose-400/40 bg-rose-500/10 text-rose-300",
  };
  return map[difficulty] || map.easy;
};

const Problems = () => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const { currentQuestion, setCurrentQuestion } = useContext(CurrentQuestionContext);
  const [isSolvedQuestion, setisSolvedQuestion] = useState([])
  useEffect(() => {
    
    loadQuestions();
    solved_question();
  }, []);
  const loadQuestions = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await axios.get("/api/questions");
      setQuestions(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Failed to load questions.");
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  const solved_question = async ()=>{
    try{
      setLoading(true);
      const res = await axios.post('/LeetCode/solvedData')
      setisSolvedQuestion(res.data?.solvedQuestions ? res.data.solvedQuestions : []);
 
    }catch(err){
      console.log(err)
    }
    finally{
      setLoading(false);
    }
  }
  
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredQuestions = questions.filter((question) => {
    if (!normalizedQuery) return true;
    const title = String(question.title || "").toLowerCase();
    const difficulty = String(question.difficulty || "").toLowerCase();
    const functionName = String(question.functionName || "").toLowerCase();
    const tags = Array.isArray(question.tags) ? question.tags.join(" ").toLowerCase() : "";
    return (
      title.includes(normalizedQuery) ||
      difficulty.includes(normalizedQuery) ||
      functionName.includes(normalizedQuery) ||
      tags.includes(normalizedQuery)
    );
  });

  const isCompleted = (id)=>{
    return isSolvedQuestion.some(
      element => element.questionId === id
    );
  }


  const isEven = (index) => {
    return index % 2 === 0;
  };
  return (
    <section className="mx-auto w-full max-w-425 px-3 py-4 sm:px-4 md:px-6 md:py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-100">All Problems</h1>
        <p className="mt-1 text-sm text-slate-400">
          Browse all coding questions available in LeetLens.
        </p>
      </div>

      <div className="mb-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by title or difficulty..."
          className="w-full max-w-md rounded-lg border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500/30"
        />
      </div>

      {error ? (
        <div className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {error}
        </div>
      ) : null}

      <article className="overflow-hidden rounded-xl border border-slate-800 bg-[#1a1a1a]">
        {loading ? (
          <SkeletonTheme
            baseColor="#2d2d2d"
            highlightColor="#444"
          >
            {[...Array(8)].map((_, index) => (
              <div key={index} className="grid grid-cols-[50px_60px_1fr_100px] items-center gap-4 p-4 border-b border-slate-800">
        <Skeleton circle width={20} height={20} />
        <Skeleton height={20} className="w-full" />
        <Skeleton height={24} />
              </div>
            ))}
          </SkeletonTheme>
        ) : questions.length === 0 ? (
          <div className="px-6 py-16 text-center text-slate-400">
            <p className="text-slate-300">No questions found.</p>
          </div>
        ) : filteredQuestions.length === 0 ? (
          <div className="px-6 py-16 text-center text-slate-400">
            <p className="text-slate-300">No matching questions.</p>
            <p className="mt-1 text-sm">Try another keyword.</p>
          </div>
        ) : (
          <div>
            <table className="w-full table-fixed text-left text-sm">
              <colgroup>
                <col className="w-12 sm:w-14" />
                <col className="w-16 sm:w-20" />
                <col className="w-[54%]" />
                <col className="w-[30%]" />
              </colgroup>
              <thead>
                <tr className="border-b border-slate-800 bg-[#262626] text-xs uppercase tracking-wide text-slate-400">
                  <th className="px-4 py-3 font-medium">#</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Title</th>
                  <th className="px-4 py-3 font-medium">Difficulty</th>
                </tr>
              </thead>
              <tbody>
                {filteredQuestions.map((question, index) => (
                  <tr
                    key={question._id || `${question.title}-${index}`}
                    role="link"
                    tabIndex={0}
                    onClick={() => { question._id && navigate(`/problems/${question._id}/${question.slug}`); setCurrentQuestion(question) }}

                    className={`cursor-pointer transition-colors hover:bg-slate-800/60 focus-visible:bg-slate-800/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 ${isEven(index) ? "bg-[#2d2d2d]" : "bg-[#1a1a1a]"}`}
                  >
                    <td className="px-2 py-3 text-slate-400 sm:px-4">{index + 1}</td>
                    <td className="px-2 py-3 sm:px-4">
                      {isCompleted(question._id) ? (
                        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-emerald-400/50 bg-emerald-500/10 text-xs text-emerald-300">
                          ✓
                        </span>
                      ) : (
                        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-amber-400/30 bg-amber-500/10 text-amber-300">
                          <FiLock size={11} />
                        </span>
                      )}
                    </td>
                    <td className="px-2 py-3 font-medium text-slate-100 wrap-break-word sm:px-4">
                      {question.title}
                    </td>
                    <td className="px-2 py-3 sm:px-4">
                      <span
                        className={`inline-block rounded-full border px-2.5 py-0.5 text-xs capitalize ${difficultyBadge(
                          question.difficulty
                        )}`}
                      >
                        {question.difficulty || "easy"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </article>
    </section>
  );
};

export default Problems;
