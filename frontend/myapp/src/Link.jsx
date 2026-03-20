import { useState } from "react";
import api from '../axios/axiosInsorance';

const EMPTY_FORM = { Title: "", Description: "", "Due Date": "" };

export default function Link() {
  const [url, setUrl] = useState("");
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [dateInput, setDateInput] = useState("")

  const handleFetch = async () => {
    if (!url.trim()) return alert("Please enter a CSV URL");
    try {
      setLoading(true);
      setTableData([]);
      setSaveStatus(null);
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

  const handleChange = (rowIndex, key, value) => {
    const updated = [...tableData];
    updated[rowIndex][key] = value;
    setTableData(updated);
  };

  const handleDeleteRow = (rowIndex) => {
    setTableData(tableData.filter((_, i) => i !== rowIndex));
  };

  // ─── Manual Add Task ───────────────────────────────────────
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
  // ──────────────────────────────────────────────────────────

  const handleSave = async () => {
    if (tableData.length === 0) return alert("No data to save");
    try {
      setSaveStatus(null);
      const res = await api.post("/task/", { data: tableData });
      setSaveStatus("success");
    } catch (error) {
      console.error("Error response:", error.response?.data);
      setSaveStatus("error");
    }
  };

  const handleGet = async () => {
    try {
      const res = await api.get("/task/findall");
      const data = res.data;
      if (Array.isArray(data) && data.length > 0) {
        setTableData(data[data.length - 1].table ?? data);
      }
    } catch (err) {
      alert("Error fetching from DB ❌");
    }
  };

  const handleClear = () => {
    setTableData([]);
    setUrl("");
    setSaveStatus(null);
  };

  const headers = tableData.length > 0
    ? Object.keys(tableData[0])
    : ["Title", "Description", "Due Date"];

  return (
    <div className="min-h-screen bg-[#EBF4F6] p-6">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-[#065a6b]">CSV Task Importer</h1>
        <p className="text-sm text-gray-500 mt-1">Load CSV or add tasks manually, then save to DB</p>
      </div>

      {/* URL Input */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
        <label className="block text-sm font-medium text-gray-600 mb-2">CSV URL</label>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="https://example.com/data.csv"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleFetch()}
            className="flex-1 p-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#088395]"
          />
          <button
            onClick={handleFetch}
            disabled={loading}
            className="bg-[#088395] hover:bg-[#065a6b] disabled:opacity-60 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Loading...
              </span>
            ) : "Load CSV"}
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={openModal}
          className="bg-[#088395] hover:bg-[#065a6b] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          ➕ Add Task
        </button>

        <button
          onClick={handleSave}
          disabled={tableData.length === 0}
          className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          💾 Save {tableData.length > 0 ? `(${tableData.length} tasks)` : ""}
        </button>

        {/* <button
          onClick={handleGet}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          📥 Load from DB
        </button> */}

        {tableData.length > 0 && (
          <button
            onClick={handleClear}
            className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            🗑 Clear
          </button>
        )}
      </div>

      {/* Save Status Banner */}
      {saveStatus === "success" && (
        <div className="mb-4 p-3 bg-green-100 border border-green-300 text-green-700 rounded-lg text-sm">
          ✅ All tasks saved successfully!
        </div>
      )}
      {saveStatus === "error" && (
        <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg text-sm">
          ❌ Failed to save. Check console for details.
        </div>
      )}

      {/* Stats */}
      {tableData.length > 0 && (
        <div className="mb-3 text-sm text-gray-500">
          {tableData.length} rows · {headers.length} columns
        </div>
      )}

      {/* Table */}
      {tableData.length > 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-[#088395] text-white">
                <th className="p-3 text-left font-medium w-10">#</th>
                {headers.map((key) => (
                  <th key={key} className="p-3 text-left font-medium whitespace-nowrap">{key}</th>
                ))}
                <th className="p-3 text-center font-medium w-16">Del</th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((row, rowIndex) => (
                <tr key={rowIndex} className={rowIndex % 2 === 0 ? "bg-white" : "bg-[#f0fafc]"}>
                  <td className="p-2 text-center text-gray-400 text-xs">{rowIndex + 1}</td>
                  {headers.map((key) => (
                    <td key={key} className="p-2 border-t border-gray-100">
                      <input
                        value={row[key] ?? ""}
                        onChange={(e) => handleChange(rowIndex, key, e.target.value)}
                        className="w-full outline-none bg-transparent text-gray-700 min-w-[100px] focus:bg-blue-50 focus:px-1 rounded transition-all"
                      />
                    </td>
                  ))}
                  <td className="p-2 border-t border-gray-100 text-center">
                    <button
                      onClick={() => handleDeleteRow(rowIndex)}
                      className="text-red-400 hover:text-red-600 transition-colors text-lg leading-none"
                    >×</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        !loading && (
          <div className="bg-white rounded-xl border-2 border-dashed border-gray-300 p-12 text-center text-gray-400">
            <p className="text-4xl mb-3">📄</p>
            <p className="text-base font-medium">No data loaded</p>
            <p className="text-sm mt-1">Load a CSV or click "Add Task" to start</p>
          </div>
        )
      )}

      {/* ─── Add Task Modal ─────────────────────────────────── */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
          onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
        >
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 mx-4">

            {/* Modal Header */}
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-[#065a6b]">Add New Task</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
              >×</button>
            </div>

            {/* Fields */}
            <div className="flex flex-col gap-4">

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Title</label>
                <input
                  type="text"
                  placeholder="Enter task title"
                  value={form.Title}
                  onChange={(e) => handleFormChange("Title", e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#088395]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="Enter task description"
                  value={form.Description}
                  onChange={(e) => handleFormChange("Description", e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#088395] resize-none"
                />
              </div>

              <div>
  <label className="block text-sm font-medium text-gray-600 mb-1">Due Date</label>
  <input
    type="date"
    value={dateInput}
    onChange={(e) => {
      setDateInput(e.target.value); // "2024-12-25" — input ke liye
      const [y, m, d] = e.target.value.split("-");
      if (y && m && d) {
        handleFormChange("Due Date", `${d}/${m}/${y}`); // "25/12/2024" — save ke liye
      }
    }}
    className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#088395]"
  />
</div>

              {/* Error */}
              {formError && (
                <p className="text-red-500 text-xs">{formError}</p>
              )}

            </div>

            {/* Modal Footer */}
            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddManual}
                className="flex-1 py-2 bg-[#088395] hover:bg-[#065a6b] text-white rounded-lg text-sm font-medium transition-colors"
              >
                Add Task
              </button>
            </div>

          </div>
        </div>
      )}
      {/* ──────────────────────────────────────────────────── */}

    </div>
  );
}