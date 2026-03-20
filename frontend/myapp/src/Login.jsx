import { useState } from "react";
import api from "../axios/axiosInsorance"
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const naveget=useNavigate()

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validate = () => {
    let newErrors = {};

    if (!form.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = "Invalid email";
    }

    if (!form.password) {
      newErrors.password = "Password is required";
    }

    return newErrors;
  };

  const handleSubmit = async(e) => {
    e.preventDefault();

    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
    } else {
          try {
                const response = await api.post("/user/login", form);

                console.log(response.data);

                setErrors({});
                alert("Login Successful 🎉");
                naveget("/link")
            } catch (error) {
                console.log(error);
                alert("Login Failed ❌");
            }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#EBF4F6]">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md"
      >
        <h2 className="text-2xl font-bold text-center mb-6 text-[#09637E]">
          Login
        </h2>

        {/* Email */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-[#09637E]">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            className="w-full mt-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7AB2B2]"
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email}</p>
          )}
        </div>

        {/* Password */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-[#09637E]">
            Password
          </label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            className="w-full mt-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7AB2B2]"
          />
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">{errors.password}</p>
          )}
        </div>

        <button
          type="submit"
          className="w-full bg-[#088395] text-white py-2 rounded-lg hover:bg-[#09637E] transition"
        >
          Login
        </button>
        <Link to="/sign">Signup</Link>
      </form>
      
    </div>
  );
}