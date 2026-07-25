import { useContext, useEffect, useMemo, useState } from "react";
import { FiCalendar, FiTrendingUp } from "react-icons/fi";
import { FaRegShareSquare } from "react-icons/fa";
import { SkeletonTheme } from "react-loading-skeleton";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import axios from "../routs/Axios";
import { User_nameContext, User_dataContext, error_context } from "../routs/CreateContext";
import { useNavigate } from "react-router-dom";
import ShareFeed from "./ShareFeed";



const getInitials = (username = "") =>
  username
    .split(/[_-]/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("") || username[0]?.toUpperCase() || "?";

const difficultyBadge = (difficulty = "easy") => {
  const map = {
    easy: "border-emerald-400/40 bg-emerald-500/10 text-emerald-300",
    medium: "border-blue-400/40 bg-blue-500/10 text-blue-300",
    hard: "border-rose-400/40 bg-rose-500/10 text-rose-300",
  };
  return map[difficulty?.toLowerCase()] || map.easy;
};

const Profile = () => {
  const { submittedUsername } = useContext(User_nameContext);
  const { UserData } = useContext(User_dataContext);
  const { error } = useContext(error_context);
  const [solvedQuestions, setSolvedQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [shareTarget, setShareTarget] = useState(null);



  useEffect(() => {
    if (!submittedUsername) {
      setSolvedQuestions([]);
      setLoading(false);
      return;
    }

    const fetchSolved = async () => {
      setLoading(true);
      try {
        const res = await axios.post("/LeetCode/solvedData");
        setSolvedQuestions(
          res.data?.status && Array.isArray(res.data.solvedQuestions)
            ? res.data.solvedQuestions
            : []
        );
      } catch {
        setSolvedQuestions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSolved();
  }, [submittedUsername]);


  const stats = useMemo(() => {
    const total = solvedQuestions.length;

    const languageCounts = solvedQuestions.reduce((acc, q) => {
      const lang = q.answer?.language?.trim().toLowerCase();
      if (!lang) return acc;
      acc[lang] = (acc[lang] || 0) + 1;
      return acc;
    }, {});



    return {
      total,
      languageCounts,
    };
  }, [solvedQuestions]);

  const isLeetCodeActive = Boolean(UserData?.username);

  if (!submittedUsername) {
    return (
      <section className="mx-auto w-full max-w-5xl px-3 py-4 sm:px-4 md:px-6 md:py-6">
        <div className="flex min-h-[50vh] items-center justify-center rounded-2xl border border-dashed border-slate-700 bg-slate-900/40 p-8 text-center">
          <div>
            <h2 className="text-xl font-semibold text-slate-100">Username required</h2>
            <p className="mt-2 text-sm text-slate-400">
              Enter your LeetCode username to view your profile.
            </p>
            {error ? (
              <p className="mt-2 text-sm text-rose-400">
                LeetCode username is not valid. Enter a valid username.
              </p>
            ) : null}
          </div>
        </div>
      </section>
    );
  }

  if (loading) {
    return (
      <section className="mx-auto w-full max-w-5xl px-3 py-4 sm:px-4 md:px-6 md:py-6">
        <SkeletonTheme baseColor="#1e293b" highlightColor="#334155">
          <div className="overflow-hidden rounded-2xl border border-slate-800 bg-[#0b0e14] p-5 sm:p-6 md:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <Skeleton width={88} height={88} borderRadius={16} />
                <div className="space-y-2">
                  <Skeleton width={180} height={28} />
                  <Skeleton width={220} height={16} />
                  <Skeleton width={120} height={24} borderRadius={999} />
                </div>
              </div>
              <Skeleton width={100} height={72} />
            </div>
           
          </div>
        </SkeletonTheme>
      </section>
    );
  }


  return (
    <section className="mx-auto w-full max-w-5xl px-3 py-4 sm:px-4 md:px-6 md:py-6">
      <article className="relative overflow-hidden rounded-2xl border border-slate-800/80 bg-[#0b0e14] shadow-xl shadow-black/20">
        <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-emerald-400/80 via-emerald-500/40 to-blue-500/80" />

        <div className="p-5 sm:p-6 md:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">
              <div className="relative shrink-0 self-start">
                <div className="grid h-20 w-20 place-items-center rounded-2xl bg-linear-to-br from-emerald-300 to-emerald-600 text-2xl font-bold text-slate-950 shadow-lg shadow-emerald-500/20 sm:h-22 sm:w-22">
                  {getInitials(submittedUsername)}
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full border-2 border-[#0b0e14] bg-emerald-400" />
              </div>

              <div className="min-w-0">
                <h1 className="truncate text-2xl font-bold tracking-tight text-slate-50 sm:text-3xl">
                  {submittedUsername}
                </h1>

                <div className="mt-2 flex flex-col gap-1.5 text-sm text-slate-400 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-4 sm:gap-y-1">
                  {isLeetCodeActive ? (
                    <span className="inline-flex items-center gap-1.5 text-emerald-400/90">
                      <FiTrendingUp className="shrink-0" size={14} />
                      LeetCode Active
                    </span>
                  ) : null}
                </div>

                {stats.languageCounts ? (
                  Object.entries(stats.languageCounts).map(([lang, count]) => (
                    <span
                      key={lang}
                      className="mt-3 inline-flex rounded-full border border-amber-400/40 bg-amber-500/5 px-3 py-1 text-xs font-medium text-amber-300 m-2"
                    >
                      {lang} • {count}
                    </span>
                  ))
                ) : null}
              </div>
            </div>

            <div className="shrink-0 text-left lg:text-right">
              <p className="text-4xl font-bold tracking-tight text-slate-50 sm:text-5xl">
                {stats.total}
              </p>
              <p className="mt-1 text-[11px] font-medium uppercase tracking-wider text-slate-500">
                Solved in LeetLens
              </p>
              <p className="mt-0.5 text-xs text-slate-600">from your LeetCode account</p>
            </div>
          </div>


        </div>
      </article>
      <article className="mt-6 overflow-hidden rounded-2xl border border-slate-800/80 bg-[#0b0e14] shadow-xl shadow-black/20">
        <div className="border-b border-slate-800 px-4 py-4 sm:px-6 sm:py-5">
          <h2 className="text-lg font-semibold text-slate-100">Solved Problems</h2>
          <p className="mt-1 text-sm text-slate-400">
            Questions you&apos;ve completed in LeetLens
          </p>
        </div>

        {solvedQuestions.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <p className="text-slate-300">No solved problems yet.</p>
            <p className="mt-1 text-sm text-slate-500">
              Solve a problem to see it listed here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {solvedQuestions.map((question, index) => (
              <div
                key={question.questionId || index}
                className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:gap-4 sm:px-5 lg:px-6"
              >
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-slate-700 bg-slate-900/80 text-xs font-medium text-slate-400">
                    {index + 1}
                  </span>
                  <p className="min-w-0 flex-1 font-medium text-slate-100 wrap-break-word">
                    {question.questionTitle || question.title}
                  </p>
                </div>

                <div className="flex items-center justify-between gap-3 pl-10 sm:shrink-0 sm:justify-end sm:pl-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full border px-2.5 py-0.5 text-xs capitalize ${difficultyBadge(
                        question.difficulty
                      )}`}
                    >
                      {question.difficulty || "easy"}
                    </span>
                    {question.answer?.language ? (
                      <span className="rounded-lg border border-slate-700/80 bg-slate-950/60 px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-slate-300">
                        {question.answer.language}
                      </span>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    onClick={() => setShareTarget(question)}
                    aria-label="Share to feed"
                    className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-700/80 bg-slate-900/60 text-slate-400 transition hover:border-emerald-400/40 hover:bg-emerald-500/10 hover:text-emerald-300"
                  >
                    <FaRegShareSquare size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </article>

      {shareTarget ? (
        <ShareFeed
          data={shareTarget}
          onClose={() => setShareTarget(null)}

        />
      ) : null}
    </section>
  );
};

export default Profile;