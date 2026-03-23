import { useState } from "react";
import api from "../axios/axiosInsorance";
import { Pencil, Trash2 } from "lucide-react";

const EMPTY_FORM = { Title: "", Description: "", "Due Date": "" };
const LIMIT = 15;

export default function Link() {
  const [url, setUrl] = useState("");
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dbLoading, setDbLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);
  const [isDBData, setIsDBData] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [dateInput, setDateInput] = useState("");

  const [editModal, setEditModal] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [editDateInput, setEditDateInput] = useState("");
  const [editId, setEditId] = useState(null);
  const [editError, setEditError] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRows, setTotalRows] = useState(0);

  const [showerror, setShowError]=useState("")

  const getPageNumbers = () => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (currentPage <= 4) return [1, 2, 3, 4, 5, "...", totalPages];
    if (currentPage >= totalPages - 3)
      return [1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages];
  };

  const handleGet = async (page = 1) => {
    try {
      setDbLoading(true);
      setSaveStatus(null);
      const res = await api.get(`/task/findall?page=${page}&limit=${LIMIT}`);
      const { data, pagination } = res.data;

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
      setCurrentPage(pagination.page);
      setTotalPages(pagination.totalPages);
      setTotalRows(pagination.total);
    } catch (err) {
      console.error(err);
      alert("Error fetching from DB ❌");
    } finally {
      setDbLoading(false);
    }
  };

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) handleGet(page);
  };

  const handleFetch = async () => {
    if (!url.trim()) return alert("Please enter a CSV URL");
    try {
      setLoading(true);
      setTableData([]);
      setSaveStatus(null);
      setIsDBData(false);
      setCurrentPage(1); setTotalPages(1); setTotalRows(0);
      const res = await fetch(url);
      const text = await res.text();
      const rows = text.trim().split("\n").map((r) => r.split(","));
      const headers = rows[0];
      const jsonData = rows.slice(1).map((row) => {
        let obj = {};
        headers.forEach((h, i) => { obj[h.trim()] = row[i]?.trim() ?? ""; });
        return obj;
      });
      setTableData(jsonData);
    } catch {
      alert("Error fetching CSV ❌");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (index, key, value) => {
    const updated = [...tableData];
    updated[index][key] = value;
    setTableData(updated);
  };

  const handleDeleteRow = (index) => setTableData(tableData.filter((_, i) => i !== index));

  const openModal = () => { setForm(EMPTY_FORM); setDateInput(""); setFormError(""); setShowModal(true); };

  const handleFormChange = (key, value) => {
    setForm((p) => ({ ...p, [key]: value }));
    setFormError("");
  };

  const handleAddManual = () => {
    if (!form.Title.trim() || !form.Description.trim() || !form["Due Date"]) {
      setFormError("All three fields are required.");
      return;
    }
    setTableData((p) => [...p, { ...form }]);
    setShowModal(false);
  };

  const handleSave = async () => {
    if (tableData.length === 0) return alert("No data to save");
    try {
      setSaveStatus(null);
      const resslt = await api.post("/task/bulk", { data: tableData });
      console.log(resslt);

      setSaveStatus("success");
    } catch (err) {
      // alert(err.response?.data.message);
      setShowError(err.response?.data.message);
    }
  };

  const handleDBDelete = async (id) => {
    if (!window.confirm("Delete this task permanently?")) return;
    try {
      setDeletingId(id);
      await api.delete(`/task/delete/${id}`);
      const newPage = tableData.length === 1 && currentPage > 1 ? currentPage - 1 : currentPage;
      await handleGet(newPage);
    } catch {
      alert("Error deleting task ❌");
    } finally {
      setDeletingId(null);
    }
  };

  const openEditModal = (row) => {
    setEditId(row._id);
    setEditForm({ Title: row.Title, Description: row.Description, "Due Date": row["Due Date"] });
    const parts = row["Due Date"]?.split("/");
    setEditDateInput(parts?.length === 3 ? `${parts[2]}-${parts[1]}-${parts[0]}` : "");
    setEditError("");
    setEditModal(true);
  };

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
      setTableData((p) => p.map((r) => (r._id === editId ? { ...r, ...editForm } : r)));
      setEditModal(false);
    } catch {
      setEditError("Update failed. Please try again.");
    }
  };

  const handleClear = () => {
    setTableData([]); setUrl(""); setSaveStatus(null); setIsDBData(false);
    setCurrentPage(1); setTotalPages(1); setTotalRows(0);
  };

  const headers = tableData.length > 0
    ? Object.keys(tableData[0]).filter((k) => k !== "_id")
    : ["Title", "Description", "Due Date"];

  const inputCls = "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#088395] focus:border-transparent transition";

  const Spinner = () => (
    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
    </svg>
  );

  return (
    <div className="min-h-screen bg-[#EBF4F6] p-4 md:p-6">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#065a6b] tracking-tight">📋 Task Manager</h1>
        <p className="text-sm text-gray-500 mt-1">Import via CSV, add manually, or load &amp; manage DB tasks</p>
      </div>

      {/* CSV URL */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Import from CSV URL</label>
        <div className="flex gap-2">
          <input type="text" placeholder="https://example.com/tasks.csv" value={url}
            onChange={(e) => setUrl(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleFetch()}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#088395] transition" />
          <button onClick={handleFetch} disabled={loading}
            className="bg-[#088395] hover:bg-[#065a6b] disabled:opacity-60 text-white px-5 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 whitespace-nowrap">
            {loading ? <><Spinner /> Loading…</> : "Load CSV"}
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <button onClick={openModal}
          className="inline-flex items-center gap-1.5 bg-[#088395] hover:bg-[#065a6b] text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm">
          ➕ Add Task
        </button>
        {!isDBData && (
          <button onClick={handleSave} disabled={tableData.length === 0}
            className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm">
            💾 Save{tableData.length > 0 ? ` (${tableData.length})` : ""}
          </button>
        )}
        <button onClick={() => handleGet(1)} disabled={dbLoading}
          className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm">
          {dbLoading ? <><Spinner /> Fetching…</> : "📥 Load from DB"}
        </button>
        {tableData.length > 0 && (
          <button onClick={handleClear}
            className="inline-flex items-center gap-1.5 bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm">
            🗑 Clear
          </button>
        )}
      </div>

      {tableData.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 mb-3">

          {isDBData && (
            <span className="text-xs text-gray-400">{totalRows} total rows · Page {currentPage} of {totalPages}</span>
          )}
        </div>
      )}

      {saveStatus === "success" && (
        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-300 text-emerald-700 rounded-lg text-sm font-medium">✅ All tasks saved successfully!</div>
      )}
      {saveStatus === "error" && (
        <div className="mb-4 p-3 bg-red-50 border border-red-300 text-red-700 rounded-lg text-sm font-medium">❌ Save failed. Check console.</div>
      )}

      {showerror  && (
        <div className="mb-4 p-3 bg-red-50 border border-red-300 text-red-700 rounded-lg text-sm font-medium">{showerror}</div>
      )}

      {tableData.length > 0 ? (
        <>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-[#088395] text-white">
                  <th className="px-3 py-3 text-left font-semibold w-10 text-xs">#</th>
                  {headers.map((key) => (
                    <th key={key} className="px-3 py-3 text-left font-semibold whitespace-nowrap text-xs uppercase tracking-wide">{key}</th>
                  ))}
                  <th className="px-3 py-3 text-center font-semibold w-28 text-xs uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tableData.map((row, index) => {
                  const serial = isDBData ? (currentPage - 1) * LIMIT + index + 1 : index + 1;
                  return (
                    <tr key={row._id ?? index}
                      className={`hover:bg-[#f0fafc] transition-colors ${index % 2 === 0 ? "bg-white" : "bg-gray-50/60"}`}>
                      <td className="px-3 py-2.5 text-center text-gray-400 text-xs border-t border-gray-100">{serial}</td>
                      {headers.map((key) => (
                        <td key={key} className="px-3 py-2.5 border-t border-gray-100 max-w-[220px]">
                          {isDBData ? (
                            <span className="text-gray-700 text-sm block">{row[key] ?? ""}</span>
                          ) : (
                            <input value={row[key] ?? ""} onChange={(e) => handleChange(index, key, e.target.value)}
                              className="w-full outline-none bg-transparent text-gray-700 text-sm min-w-[90px] focus:bg-blue-50 focus:px-1.5 focus:rounded transition-all" />
                          )}
                        </td>
                      ))}
                      <td className="px-3 py-2.5 border-t border-gray-100 text-center">
                        {isDBData ? (
                          <div className="flex items-center justify-center gap-2">
                            <button onClick={() => openEditModal(row)}
                              className="inline-flex items-center gap-1 text-blue-600 hover:text-white hover:bg-blue-600 border border-blue-300 hover:border-blue-600 transition-all text-xs font-semibold px-2.5 py-1 rounded-lg">
                              <Pencil size={12} /> Edit
                            </button>
                            <button onClick={() => handleDBDelete(row._id)} disabled={deletingId === row._id}
                              className="inline-flex items-center gap-1 text-red-500 hover:text-white hover:bg-red-500 border border-red-300 hover:border-red-500 transition-all text-xs font-semibold px-2.5 py-1 rounded-lg disabled:opacity-50">
                              <Trash2 size={12} /> {deletingId === row._id ? "…" : "Del"}
                            </button>
                          </div>
                        ) : (
                          <button onClick={() => handleDeleteRow(index)}
                            className="text-red-400 hover:text-red-600 transition-colors text-xl leading-none">×</button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {isDBData && totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between flex-wrap gap-3">
              <p className="text-xs text-gray-500">
                Showing{" "}
                <span className="font-semibold text-gray-700">
                  {(currentPage - 1) * LIMIT + 1}–{Math.min(currentPage * LIMIT, totalRows)}
                </span>{" "}of{" "}
                <span className="font-semibold text-gray-700">{totalRows}</span> rows
              </p>

              <div className="flex items-center gap-1 flex-wrap">
                <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1 || dbLoading}
                  className="px-3 py-1.5 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-[#088395] hover:text-white hover:border-[#088395] disabled:opacity-40 disabled:cursor-not-allowed transition-all font-medium">
                  ‹ Prev
                </button>

                {getPageNumbers().map((page, idx) =>
                  page === "..." ? (
                    <span key={`e-${idx}`} className="px-2 py-1.5 text-gray-400 text-sm select-none">…</span>
                  ) : (
                    <button key={page} onClick={() => goToPage(page)} disabled={dbLoading}
                      className={`min-w-[36px] px-3 py-1.5 rounded-lg border text-sm font-semibold transition-all disabled:opacity-60 ${currentPage === page
                        ? "bg-[#088395] text-white border-[#088395] shadow-sm"
                        : "border-gray-300 text-gray-600 hover:bg-[#088395] hover:text-white hover:border-[#088395]"
                        }`}>
                      {page}
                    </button>
                  )
                )}

                <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages || dbLoading}
                  className="px-3 py-1.5 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-[#088395] hover:text-white hover:border-[#088395] disabled:opacity-40 disabled:cursor-not-allowed transition-all font-medium">
                  Next ›
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        !loading && !dbLoading && (
          <div className="bg-white rounded-xl border-2 border-dashed border-gray-300 p-14 text-center text-gray-400">
            <p className="text-5xl mb-3">📄</p>
            <p className="text-base font-semibold text-gray-500">No data loaded</p>
            <p className="text-sm mt-1">Enter a CSV URL, click <strong>"Add Task"</strong>, or <strong>"Load from DB"</strong></p>
          </div>
        )
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100">
              <div><h2 className="text-lg font-bold text-[#065a6b]">Add New Task</h2><p className="text-xs text-gray-400 mt-0.5">Fill all fields to continue</p></div>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition">×</button>
            </div>
            <div className="px-6 py-5 flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Title <span className="text-red-400">*</span></label>
                <input type="text" placeholder="e.g. Design landing page" value={form.Title} onChange={(e) => handleFormChange("Title", e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Description <span className="text-red-400">*</span></label>
                <textarea rows={3} placeholder="Brief task description…" value={form.Description} onChange={(e) => handleFormChange("Description", e.target.value)} className={`${inputCls} resize-none`} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Due Date <span className="text-red-400">*</span></label>
                <input type="date" value={dateInput} onChange={(e) => { setDateInput(e.target.value); const [y, m, d] = e.target.value.split("-"); if (y && m && d) handleFormChange("Due Date", `${d}/${m}/${y}`); }} className={inputCls} />
              </div>
              {formError && <p className="text-red-500 text-xs font-medium bg-red-50 border border-red-200 px-3 py-2 rounded-lg">⚠️ {formError}</p>}
            </div>
            <div className="flex gap-2 px-6 pb-5">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 font-medium transition-colors">Cancel</button>
              <button onClick={handleAddManual} className="flex-1 py-2.5 bg-[#088395] hover:bg-[#065a6b] text-white rounded-lg text-sm font-bold transition-colors">Add Task</button>
            </div>
          </div>
        </div>
      )}

      {editModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={(e) => e.target === e.currentTarget && setEditModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100">
              <div><h2 className="text-lg font-bold text-[#065a6b]">Edit Task</h2><p className="text-xs text-gray-400 mt-0.5 font-mono">ID: {editId}</p></div>
              <button onClick={() => setEditModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition">×</button>
            </div>
            <div className="px-6 py-5 flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Title <span className="text-red-400">*</span></label>
                <input type="text" value={editForm.Title} onChange={(e) => setEditForm((p) => ({ ...p, Title: e.target.value }))} className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Description <span className="text-red-400">*</span></label>
                <textarea rows={3} value={editForm.Description} onChange={(e) => setEditForm((p) => ({ ...p, Description: e.target.value }))} className={`${inputCls} resize-none`} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Due Date <span className="text-red-400">*</span></label>
                <input type="date" value={editDateInput} onChange={(e) => { setEditDateInput(e.target.value); const [y, m, d] = e.target.value.split("-"); if (y && m && d) setEditForm((p) => ({ ...p, "Due Date": `${d}/${m}/${y}` })); }} className={inputCls} />
              </div>
              {editError && <p className="text-red-500 text-xs font-medium bg-red-50 border border-red-200 px-3 py-2 rounded-lg">⚠️ {editError}</p>}
            </div>
            <div className="flex gap-2 px-6 pb-5">
              <button onClick={() => setEditModal(false)} className="flex-1 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 font-medium transition-colors">Cancel</button>
              <button onClick={handleEditSave} className="flex-1 py-2.5 bg-[#088395] hover:bg-[#065a6b] text-white rounded-lg text-sm font-bold transition-colors">Update Task</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}