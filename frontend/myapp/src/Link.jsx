import { useState } from "react";
import api from '../axios/axiosInsorance';
import { Pencil, Trash2 } from "lucide-react";

const EMPTY_FORM = { Title: "", Description: "", "Due Date": "" };

export default function Link() {
  const [url, setUrl] = useState("");
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dbLoading, setDbLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null); // null | "success" | "error"
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [dateInput, setDateInput] = useState("");
  const [editModal, setEditModal] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [editDateInput, setEditDateInput] = useState("");
  const [editId, setEditId] = useState(null);
  const [editError, setEditError] = useState("");
  const [isDBData, setIsDBData] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // ─── CSV Fetch ─────────────────────────────────────────────
  const handleFetch = async () => {
    if (!url.trim()) return alert("Please enter a CSV URL");
    try {
      setLoading(true);
      setTableData([]);
      setSaveStatus(null);
      setIsDBData(false);
      const res = await fetch(url);
      const text = await res.text();
      const rows = text.trim().split("\n").map((row) => row.split(","));
      const headers = rows[0];
      const jsonData = rows.slice(1).map((row) => {
        let obj = {};
        headers.forEach((header, index) => {
          obj[header.trim()] = row[index]?.trim() ?? "";
        });
        return obj;
      });
      setTableData(jsonData);
    } catch (err) {
      alert("Error fetching CSV ❌");
    } finally {
      setLoading(false);
    }
  };

  // ─── CSV Table Inline Edit ─────────────────────────────────
  const handleChange = (rowIndex, key, value) => {
    const updated = [...tableData];
    updated[rowIndex][key] = value;
    setTableData(updated);
  };

  const handleDeleteRow = (rowIndex) => {
    setTableData(tableData.filter((_, i) => i !== rowIndex));
  };

  // ─── Add Task Modal ────────────────────────────────────────
  const openModal = () => {
    setForm(EMPTY_FORM);
    setDateInput("");
    setFormError("");
    setShowModal(true);
  };

  const handleFormChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setFormError("");
  };

  const handleAddManual = () => {
    if (!form.Title.trim() || !form.Description.trim() || !form["Due Date"]) {
      setFormError("All three fields are required.");
      return;
    }
    setTableData((prev) => [...prev, { ...form }]);
    setShowModal(false);
  };

  // ─── Bulk Save to DB ───────────────────────────────────────
  const handleSave = async () => {
    if (tableData.length === 0) return alert("No data to save");
    try {
      setSaveStatus(null);
      await api.post("/task/bulk", { data: tableData });
      setSaveStatus("success");
    } catch (error) {
      console.error("Bulk save error:", error.response?.data);
      setSaveStatus("error");
    }
  };

  // ─── Load from DB ──────────────────────────────────────────
  const handleGet = async () => {
    try {
      setDbLoading(true);
      setSaveStatus(null);
      const res = await api.get("/task/findall");
      const data = res.data;
      if (Array.isArray(data) && data.length > 0) {
        const formatted = data.map((task) => ({
          _id: task._id,
          Title: task.title ?? "",
          Description: task.description ?? "",
          "Due Date": task.dueDate
            ? new Date(task.dueDate).toLocaleDateString("en-GB")
            : "",
        }));
        setTableData(formatted);
        setIsDBData(true);
      } else {
        alert("No tasks found in DB");
      }
    } catch (err) {
      console.error(err);
      alert("Error fetching from DB ❌");
    } finally {
      setDbLoading(false);
    }
  };

  // ─── Delete from DB ────────────────────────────────────────
  const handleDBDelete = async (id, rowIndex) => {
    if (!window.confirm("Delete this task permanently?")) return;
    try {
      setDeletingId(id);
      await api.delete(`/task/delete/${id}`);
      setTableData((prev) => prev.filter((_, i) => i !== rowIndex));
    } catch (err) {
      console.error(err);
      alert("Error deleting task ❌");
    } finally {
      setDeletingId(null);
    }
  };

  // ─── Open Edit Modal ───────────────────────────────────────
  const openEditModal = (row) => {
    setEditId(row._id);
    setEditForm({
      Title: row.Title,
      Description: row.Description,
      "Due Date": row["Due Date"],
    });
    // Convert DD/MM/YYYY → YYYY-MM-DD for <input type="date">
    const parts = row["Due Date"]?.split("/");
    if (parts?.length === 3) {
      setEditDateInput(`${parts[2]}-${parts[1]}-${parts[0]}`);
    } else {
      setEditDateInput("");
    }
    setEditError("");
    setEditModal(true);
  };

  // ─── Save Edit to DB ───────────────────────────────────────
  const handleEditSave = async () => {
    if (!editForm.Title.trim() || !editForm.Description.trim() || !editForm["Due Date"]) {
      setEditError("All three fields are required.");
      return;
    }
    try {
      await api.put(`/task/update/${editId}`, {
        title: editForm.Title,
        description: editForm.Description,
        dueDate: editForm["Due Date"],
      });
      setTableData((prev) =>
        prev.map((row) =>
          row._id === editId ? { ...row, ...editForm } : row
        )
      );
      setEditModal(false);
    } catch (err) {
      console.error(err);
      setEditError("Update failed. Please try again.");
    }
  };

  // ─── Clear All ─────────────────────────────────────────────
  const handleClear = () => {
    setTableData([]);
    setUrl("");
    setSaveStatus(null);
    setIsDBData(false);
  };

  const headers = tableData.length > 0
    ? Object.keys(tableData[0]).filter((k) => k !== "_id")
    : ["Title", "Description", "Due Date"];

  // ─── Shared input class ────────────────────────────────────
  const inputCls =
    "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#088395] focus:border-transparent transition";

  return (
    <div className="min-h-screen bg-[#EBF4F6] p-4 md:p-6">

      {/* ── Page Header ── */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#065a6b] tracking-tight">
          📋 Task Manager
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Import tasks via CSV URL, add manually, or load &amp; manage existing DB tasks
        </p>
      </div>

      {/* ── CSV URL Input ── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
          Import from CSV URL
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="https://example.com/tasks.csv"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleFetch()}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#088395] focus:border-transparent transition"
          />
          <button
            onClick={handleFetch}
            disabled={loading}
            className="bg-[#088395] hover:bg-[#065a6b] disabled:opacity-60 text-white px-5 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 whitespace-nowrap"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Loading…
              </>
            ) : "Load CSV"}
          </button>
        </div>
      </div>

      {/* ── Action Buttons ── */}
      <div className="flex flex-wrap gap-2 mb-4">
        {/* Add Task */}
        <button
          onClick={openModal}
          className="inline-flex items-center gap-1.5 bg-[#088395] hover:bg-[#065a6b] text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm"
        >
          ➕ Add Task
        </button>

        {/* Save to DB — only for CSV/manual data */}
        {!isDBData && (
          <button
            onClick={handleSave}
            disabled={tableData.length === 0}
            className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm"
          >
            💾 Save{tableData.length > 0 ? ` (${tableData.length})` : ""}
          </button>
        )}

        {/* Load from DB */}
        <button
          onClick={handleGet}
          disabled={dbLoading}
          className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm"
        >
          {dbLoading ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              Fetching…
            </>
          ) : "📥 Load from DB"}
        </button>

        {/* Clear */}
        {tableData.length > 0 && (
          <button
            onClick={handleClear}
            className="inline-flex items-center gap-1.5 bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm"
          >
            🗑 Clear
          </button>
        )}
      </div>

      {/* ── Mode Badge + Row Count ── */}
      {tableData.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 mb-3">
         
          <span className="text-xs text-gray-400">
            {tableData.length} row{tableData.length !== 1 ? "s" : ""} · {headers.length} column{headers.length !== 1 ? "s" : ""}
          </span>
        </div>
      )}

      {/* ── Status Banners ── */}
      {saveStatus === "success" && (
        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-300 text-emerald-700 rounded-lg text-sm font-medium">
          ✅ All tasks saved to DB successfully!
        </div>
      )}
      {saveStatus === "error" && (
        <div className="mb-4 p-3 bg-red-50 border border-red-300 text-red-700 rounded-lg text-sm font-medium">
          ❌ Save failed. Please check the console for details.
        </div>
      )}

      {/* ── Data Table ── */}
      {tableData.length > 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-[#088395] text-white">
                <th className="px-3 py-3 text-left font-semibold w-10 text-xs">#</th>
                {headers.map((key) => (
                  <th key={key} className="px-3 py-3 text-left font-semibold whitespace-nowrap text-xs uppercase tracking-wide">
                    {key}
                  </th>
                ))}
                <th className="px-3 py-3 text-center font-semibold w-28 text-xs uppercase tracking-wide">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((row, rowIndex) => (
                <tr
                  key={row._id ?? rowIndex}
                  className={`hover:bg-[#f0fafc] transition-colors ${rowIndex % 2 === 0 ? "bg-white" : "bg-gray-50/60"}`}
                >
                  {/* Row number */}
                  <td className="px-3 py-2.5 text-center text-gray-400 text-xs border-t border-gray-100">
                    {rowIndex + 1}
                  </td>

                  {/* Data cells */}
                  {headers.map((key) => (
                    <td key={key} className="px-3 py-2.5 border-t border-gray-100 max-w-[220px]">
                      {isDBData ? (
                        <span className="text-gray-700 text-sm line-clamp-2 block">{row[key] ?? ""}</span>
                      ) : (
                        <input
                          value={row[key] ?? ""}
                          onChange={(e) => handleChange(rowIndex, key, e.target.value)}
                          className="w-full outline-none bg-transparent text-gray-700 text-sm min-w-[90px] focus:bg-blue-50 focus:px-1.5 focus:rounded transition-all"
                        />
                      )}
                    </td>
                  ))}

                  {/* Action buttons */}
                  <td className="px-3 py-2.5 border-t border-gray-100 text-center">
                    {isDBData ? (
                      <div className="flex items-center justify-center gap-2">
                        {/* Edit */}
                        <button
                          onClick={() => openEditModal(row)}
                          title="Edit task"
                          className="inline-flex items-center gap-1 text-blue-600 hover:text-white hover:bg-blue-600 border border-blue-300 hover:border-blue-600 transition-all text-xs font-semibold px-2.5 py-1 rounded-lg"
                        >
                           <Pencil size={14} />
                        </button>
                        {/* Delete */}
                        <button
                          onClick={() => handleDBDelete(row._id, rowIndex)}
                          disabled={deletingId === row._id}
                          title="Delete task"
                          className="inline-flex items-center gap-1 text-red-500 hover:text-white hover:bg-red-500 border border-red-300 hover:border-red-500 transition-all text-xs font-semibold px-2.5 py-1 rounded-lg disabled:opacity-50"
                        >
                          {deletingId === row._id ? "…" :  <Trash2 size={14} />}
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleDeleteRow(rowIndex)}
                        title="Remove row"
                        className="text-red-400 hover:text-red-600 transition-colors text-xl leading-none font-light"
                      >
                        ×
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        !loading && !dbLoading && (
          <div className="bg-white rounded-xl border-2 border-dashed border-gray-300 p-14 text-center text-gray-400">
            <p className="text-5xl mb-3">📄</p>
            <p className="text-base font-semibold text-gray-500">No data loaded</p>
            <p className="text-sm mt-1">Enter a CSV URL above, click <strong>"Add Task"</strong>, or <strong>"Load from DB"</strong></p>
          </div>
        )
      )}

      {/* ════════════════════════════════════════════
          ADD TASK MODAL
      ════════════════════════════════════════════ */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100">
              <div>
                <h2 className="text-lg font-bold text-[#065a6b]">Add New Task</h2>
                <p className="text-xs text-gray-400 mt-0.5">Fill all fields to continue</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition"
              >
                ×
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-5 flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                  Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Design landing page"
                  value={form.Title}
                  onChange={(e) => handleFormChange("Title", e.target.value)}
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                  Description <span className="text-red-400">*</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="Brief task description…"
                  value={form.Description}
                  onChange={(e) => handleFormChange("Description", e.target.value)}
                  className={`${inputCls} resize-none`}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                  Due Date <span className="text-red-400">*</span>
                </label>
                <input
                  type="date"
                  value={dateInput}
                  onChange={(e) => {
                    setDateInput(e.target.value);
                    const [y, m, d] = e.target.value.split("-");
                    if (y && m && d) handleFormChange("Due Date", `${d}/${m}/${y}`);
                  }}
                  className={inputCls}
                />
              </div>
              {formError && (
                <p className="text-red-500 text-xs font-medium bg-red-50 border border-red-200 px-3 py-2 rounded-lg">
                  ⚠️ {formError}
                </p>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex gap-2 px-6 pb-5">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddManual}
                className="flex-1 py-2.5 bg-[#088395] hover:bg-[#065a6b] text-white rounded-lg text-sm font-bold transition-colors shadow-sm"
              >
                Add Task
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════
          EDIT TASK MODAL
      ════════════════════════════════════════════ */}
      {editModal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={(e) => e.target === e.currentTarget && setEditModal(false)}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100">
              <div>
                <h2 className="text-lg font-bold text-[#065a6b]">Edit Task</h2>
                <p className="text-xs text-gray-400 mt-0.5">ID: <span className="font-mono">{editId}</span></p>
              </div>
              <button
                onClick={() => setEditModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition"
              >
                ×
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-5 flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                  Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={editForm.Title}
                  onChange={(e) => setEditForm((p) => ({ ...p, Title: e.target.value }))}
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                  Description <span className="text-red-400">*</span>
                </label>
                <textarea
                  rows={3}
                  value={editForm.Description}
                  onChange={(e) => setEditForm((p) => ({ ...p, Description: e.target.value }))}
                  className={`${inputCls} resize-none`}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                  Due Date <span className="text-red-400">*</span>
                </label>
                <input
                  type="date"
                  value={editDateInput}
                  onChange={(e) => {
                    setEditDateInput(e.target.value);
                    const [y, m, d] = e.target.value.split("-");
                    if (y && m && d) setEditForm((p) => ({ ...p, "Due Date": `${d}/${m}/${y}` }));
                  }}
                  className={inputCls}
                />
              </div>
              {editError && (
                <p className="text-red-500 text-xs font-medium bg-red-50 border border-red-200 px-3 py-2 rounded-lg">
                  ⚠️ {editError}
                </p>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex gap-2 px-6 pb-5">
              <button
                onClick={() => setEditModal(false)}
                className="flex-1 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleEditSave}
                className="flex-1 py-2.5 bg-[#088395] hover:bg-[#065a6b] text-white rounded-lg text-sm font-bold transition-colors shadow-sm"
              >
                Update Task
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}