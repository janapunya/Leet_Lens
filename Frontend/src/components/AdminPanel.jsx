import { useCallback, useEffect, useState } from "react";
import { FiPlus, FiTrash2, FiEdit2, FiX, FiLoader } from "react-icons/fi";
import axios from "../routs/Axios";

const emptyTestCase = () => ({ input: "", output: "" });

const emptyForm = () => ({
  title: "",
  slug: "",
  description: "",
  difficulty: "easy",
  functionName: "",
  functionSignature: "",
  tagsText: "",
  starterCode: { javascript: "", python: "", java: "" },
  sampleTestCases: [emptyTestCase()],
});

function formFromDoc(doc) {
  if (!doc) return emptyForm();
  return {
    title: doc.title ?? "",
    slug: doc.slug ?? "",
    description: doc.description ?? "",
    difficulty: doc.difficulty ?? "easy",
    functionName: doc.functionName ?? "",
    functionSignature: doc.functionSignature ?? "",
    tagsText: Array.isArray(doc.tags) ? doc.tags.join(", ") : "",
    starterCode: {
      javascript: doc.starterCode?.javascript ?? "",
      python: doc.starterCode?.python ?? "",
      cpp: doc.starterCode?.cpp ?? "",
    },
    sampleTestCases:
      doc.sampleTestCases?.length > 0
        ? doc.sampleTestCases.map((t) => ({ input: t.input, output: t.output }))
        : [emptyTestCase()],
  };
}

function payloadFromForm(form) {
  const sampleTestCases = (form.sampleTestCases || []).filter(
    (t) => String(t.input).trim() && String(t.output).trim()
  );
  const tags = String(form.tagsText || "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
  const body = {
    title: form.title.trim(),
    description: form.description.trim(),
    difficulty: form.difficulty,
    functionName: form.functionName.trim(),
    functionSignature: form.functionSignature.trim(),
    tags,
    starterCode: form.starterCode,
    sampleTestCases,
  };
  if (form.slug?.trim()) body.slug = form.slug.trim();
  return body;
}

const Field = ({ label, children, hint }) => (
  <div className="space-y-1.5">
    <label className="block text-xs font-medium uppercase tracking-wide text-slate-400">
      {label}
    </label>
    {children}
    {hint ? <p className="text-xs text-slate-500">{hint}</p> : null}
  </div>
);

const TestCaseList = ({ label, items, onChange, onAdd, onRemove }) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between">
      <span className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</span>
      <button
        type="button"
        onClick={onAdd}
        className="text-xs text-emerald-400 hover:text-emerald-300"
      >
        + Add case
      </button>
    </div>
    <div className="space-y-2">
      {items.map((row, i) => (
        <div
          key={`${label}-${i}`}
          className="grid gap-2 rounded-lg border border-slate-800 bg-slate-950/50 p-3 sm:grid-cols-[1fr_1fr_auto]"
        >
          <input
            value={row.input}
            onChange={(e) => onChange(i, "input", e.target.value)}
            placeholder="Input"
            className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/30"
          />
          <input
            value={row.output}
            onChange={(e) => onChange(i, "output", e.target.value)}
            placeholder="Expected output"
            className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/30"
          />
          <button
            type="button"
            onClick={() => onRemove(i)}
            disabled={items.length <= 1}
            className="grid h-9 w-9 place-self-end place-items-center rounded-lg border border-slate-700 text-slate-400 transition hover:border-rose-500/40 hover:text-rose-300 disabled:opacity-30"
            aria-label="Remove test case"
          >
            <FiTrash2 size={16} />
          </button>
        </div>
      ))}
    </div>
  </div>
);

const AdminPanel = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm());
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = useCallback(async () => {
    setError("");
    setLoading(true);
    try {
      const { data } = await axios.get("/api/questions");
      setQuestions(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.response?.data?.error || e.message || "Failed to load questions");
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm());
    setModalOpen(true);
    setError("");
  };

  const openEdit = (qdoc) => {
    setEditingId(qdoc._id);
    setForm(formFromDoc(qdoc));
    setModalOpen(true);
    setError("");
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
    setForm(emptyForm());
  };

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const updateStarter = (lang, value) => {
    setForm((prev) => ({
      ...prev,
      starterCode: { ...prev.starterCode, [lang]: value },
    }));
  };

  const updateSampleTestCase = (index, field, value) => {
    setForm((prev) => {
      const list = [...prev.sampleTestCases];
      list[index] = { ...list[index], [field]: value };
      return { ...prev, sampleTestCases: list };
    });
  };

  const addSampleTestCase = () => {
    setForm((prev) => ({ ...prev, sampleTestCases: [...prev.sampleTestCases, emptyTestCase()] }));
  };

  const removeSampleTestCase = (index) => {
    setForm((prev) => {
      const list = prev.sampleTestCases.filter((_, i) => i !== index);
      return { ...prev, sampleTestCases: list.length ? list : [emptyTestCase()] };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    const body = payloadFromForm(form);
    if (!body.title || !body.description || !body.functionName || !body.functionSignature) {
      setError("Title, description, function name, and signature are required.");
      setSaving(false);
      return;
    }
    try {
      if (editingId) {
        await axios.put(`/api/questions/${editingId}`, body);
      } else {
        await axios.post("/api/questions", body);
      }
      await load();
      closeModal();
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setSaving(true);
    setError("");
    try {
      await axios.delete(`/api/questions/${deleteTarget._id}`);
      setDeleteTarget(null);
      await load();
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Delete failed");
    } finally {
      setSaving(false);
    }
  };

  const difficultyBadge = (d) => {
    const map = {
      easy: "border-emerald-400/40 bg-emerald-500/10 text-emerald-300",
      medium: "border-blue-400/40 bg-blue-500/10 text-blue-300",
      hard: "border-rose-400/40 bg-rose-500/10 text-rose-300",
    };
    return map[d] || map.easy;
  };

  return (
    <section className="mx-auto w-full max-w-425 px-3 py-4 sm:px-4 md:px-6 md:py-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-100">Admin · Questions</h1>
          <p className="mt-1 text-sm text-slate-400">
            Create, edit, or remove coding problems. Data matches your MongoDB question schema.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/15 px-4 py-2.5 text-sm font-medium text-emerald-200 transition hover:bg-emerald-500/25"
        >
          <FiPlus size={18} />
          New question
        </button>
      </div>

      {error && !modalOpen && (
        <div className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {error}
        </div>
      )}

      <article className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-20 text-slate-400">
            <FiLoader className="animate-spin" size={22} />
            Loading…
          </div>
        ) : questions.length === 0 ? (
          <div className="px-6 py-16 text-center text-slate-400">
            <p className="text-slate-300">No questions yet.</p>
            <p className="mt-2 text-sm">Add your first problem with the button above.</p>
          </div>
        ) : (
          <div className="overflow-x-auto scrollbar-hide">
            <table className="w-full min-w-160 text-left text-sm">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/50 text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-3 font-medium">Title</th>
                  <th className="px-4 py-3 font-medium">Slug</th>
                  <th className="px-4 py-3 font-medium">Tags</th>
                  <th className="px-4 py-3 font-medium">Difficulty</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {questions.map((q) => (
                  <tr
                    key={q._id}
                    className="border-b border-slate-800/80 transition hover:bg-slate-800/30 "
                  >
                    <td className="px-4 py-3 font-medium text-slate-100">{q.title}</td>
                    <td className="px-4 py-3 text-slate-400">{q.slug || "—"}</td>
                    <td className="px-4 py-3 text-slate-400">
                      {Array.isArray(q.tags) ? q.tags.join(", ") || "—" : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded-full border px-2.5 py-0.5 text-xs capitalize ${difficultyBadge(q.difficulty)}`}
                      >
                        {q.difficulty}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(q)}
                          className="rounded-lg border border-slate-700 p-2 text-slate-300 transition hover:border-emerald-500/40 hover:text-emerald-300"
                          aria-label="Edit"
                        >
                          <FiEdit2 size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(q)}
                          className="rounded-lg border border-slate-700 p-2 text-slate-300 transition hover:border-rose-500/40 hover:text-rose-300"
                          aria-label="Delete"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </article>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/70 p-0 sm:items-center sm:p-4">
          <div
            className="absolute inset-0"
            role="presentation"
            onClick={closeModal}
            aria-hidden="true"
          />
          <form
            onSubmit={handleSubmit}
            className="relative z-10 flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-2xl border border-slate-800 bg-slate-900 shadow-2xl sm:rounded-2xl"
          >
            <div className="flex items-start justify-between border-b border-slate-800 px-5 py-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-100">
                  {editingId ? "Edit question" : "New question"}
                </h2>
                <p className="mt-0.5 text-xs text-slate-500">
                  Slug is optional on create; a unique slug is generated from the title if omitted.
                </p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                aria-label="Close"
              >
                <FiX size={22} />
              </button>
            </div>

            <div className="flex-1 space-y-5 overflow-y-auto px-5 py-4">
              {error && (
                <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
                  {error}
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Title">
                  <input
                    required
                    value={form.title}
                    onChange={(e) => updateField("title", e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/30"
                  />
                </Field>
                <Field label="Slug (optional)" hint="Leave blank to auto-generate on create.">
                  <input
                    value={form.slug}
                    onChange={(e) => updateField("slug", e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/30"
                  />
                </Field>
              </div>

              <Field label="Description">
                <textarea
                  required
                  rows={4}
                  value={form.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  className="w-full resize-y rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/30"
                />
              </Field>

              <Field label="Difficulty">
                <select
                  value={form.difficulty}
                  onChange={(e) => updateField("difficulty", e.target.value)}
                  className="w-full max-w-xs rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/30"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </Field>

              <Field
                label="Tags (comma separated)"
                hint='Example: "arrays, two pointers, hashing"'
              >
                <input
                  value={form.tagsText}
                  onChange={(e) => updateField("tagsText", e.target.value)}
                  placeholder="arrays, hashing"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/30"
                />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Function name">
                  <input
                    required
                    value={form.functionName}
                    onChange={(e) => updateField("functionName", e.target.value)}
                    placeholder="e.g. twoSum"
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/30"
                  />
                </Field>
                <Field label="Function signature">
                  <input
                    required
                    value={form.functionSignature}
                    onChange={(e) => updateField("functionSignature", e.target.value)}
                    placeholder="e.g. twoSum(nums, target)"
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/30"
                  />
                </Field>
              </div>

              <div className="space-y-3 rounded-xl border border-slate-800 bg-slate-950/40 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Starter code
                </p>
                <Field label="JavaScript">
                  <textarea
                    rows={4}
                    value={form.starterCode.javascript}
                    onChange={(e) => updateStarter("javascript", e.target.value)}
                    className="w-full resize-y rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 font-mono text-xs text-slate-100 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/30"
                  />
                </Field>
                <Field label="Python">
                  <textarea
                    rows={4}
                    value={form.starterCode.python}
                    onChange={(e) => updateStarter("python", e.target.value)}
                    className="w-full resize-y rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 font-mono text-xs text-slate-100 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/30"
                  />
                </Field>
                <Field label="java">
                  <textarea
                    rows={4}
                    value={form.starterCode.java}
                    onChange={(e) => updateStarter("java", e.target.value)}
                    className="w-full resize-y rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 font-mono text-xs text-slate-100 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/30"
                  />
                </Field>
              </div>

              <TestCaseList
                label="Sample test cases (visible)"
                items={form.sampleTestCases}
                onChange={updateSampleTestCase}
                onAdd={addSampleTestCase}
                onRemove={removeSampleTestCase}
              />
            </div>

            <div className="flex flex-col-reverse gap-2 border-t border-slate-800 px-5 py-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeModal}
                className="rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/20 px-4 py-2.5 text-sm font-medium text-emerald-100 transition hover:bg-emerald-500/30 disabled:opacity-50"
              >
                {saving ? <FiLoader className="animate-spin" size={18} /> : null}
                {editingId ? "Save changes" : "Create question"}
              </button>
            </div>
          </form>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-950/80 p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-slate-100">Delete question?</h3>
            <p className="mt-2 text-sm text-slate-400">
              This will permanently remove{" "}
              <span className="font-medium text-slate-200">{deleteTarget.title}</span> from the
              database.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={saving}
                className="rounded-xl border border-rose-500/40 bg-rose-500/20 px-4 py-2 text-sm font-medium text-rose-100 hover:bg-rose-500/30 disabled:opacity-50"
              >
                {saving ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default AdminPanel;
