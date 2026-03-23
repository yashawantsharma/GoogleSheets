import { useState } from "react";
import api from "../axios/axiosInsorance";
import { Link, useNavigate } from "react-router-dom";

export default function SignUp() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    gender: "",
  });

  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState(""); 
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    // clear field error on change
    if (errors[e.target.name]) {
      setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
    }
    setSubmitError("");
  };

  const validate = () => {
    let newErrors = {};

    if (!form.name.trim()) newErrors.name = "Name is required";

    if (!form.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!form.password) {
      newErrors.password = "Password is required";
    } else if (form.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setLoading(true);
      await api.post("/user/", form);
      alert("Signup Successful 🎉");
      setErrors({});
      navigate("/");
    } catch (error) {
      console.error(error);

      const msg = error.response?.data?.message || "";
      if (
        error.response?.status === 409 ||
        msg.toLowerCase().includes("duplicate") ||
        msg.toLowerCase().includes("already") ||
        error.response?.data?.code === 11000
      ) {
        setSubmitError("This email is already registered. Please login instead.");
      } else if (error.response?.status === 400) {
        setSubmitError(msg || "Invalid data. Please check your inputs.");
      } else {
        setSubmitError("Signup failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const inputCls =
    "w-full mt-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7AB2B2] transition";

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#EBF4F6]">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md"
      >
        <h2 className="text-2xl font-bold text-center mb-6 text-[#09637E]">
          Sign Up
        </h2>

        {submitError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-300 text-red-600 rounded-lg text-sm font-medium">
            ❌ {submitError}
          </div>
        )}

        {/* Name */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-[#09637E]">Name</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            className={inputCls}
          />
          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
        </div>

        {/* Email */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-[#09637E]">Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            className={inputCls}
          />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
        </div>

        {/* Phone */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-[#09637E]">Phone</label>
          <input
            type="number"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            className={inputCls}
          />
          {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-[#09637E]">Password</label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            className={inputCls}
          />
          {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-[#09637E]">Gender</label>
          <select
            name="gender"
            value={form.gender}
            onChange={handleChange}
            className={inputCls}
          >
            <option value="">Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
          {errors.gender && <p className="text-red-500 text-sm mt-1">{errors.gender}</p>}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#088395] text-white py-2 rounded-lg hover:bg-[#09637E] transition disabled:opacity-60 flex items-center justify-center gap-2 font-semibold"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              Creating…
            </>
          ) : "Create Account"}
        </button>

        <p className="text-center mt-4 text-sm text-gray-600">
          Already have an account?{" "}
          <Link to="/" className="text-[#088395] font-semibold hover:underline">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}