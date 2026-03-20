import { useState } from "react";
import api from "../axios/axiosInsorance"
import { Link ,useNavigate} from "react-router-dom";


export default function SignUp() {
    const [form, setForm] = useState({
        name: "",
        email: "",
        phone: "",
        password: "",
        gender: "",
    });

    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };
    const navigate=useNavigate();
    const validate = () => {
        let newErrors = {};

        if (!form.name.trim()) newErrors.name = "Name is required";

        if (!form.email) {
            newErrors.email = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(form.email)) {
            newErrors.email = "Invalid email";
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

        const validationErrors = validate();

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
        } else {
            // console.log(">>>>>>>>",form)
            try {
                const response = await api.post("/user/", form);

                // console.log(response.data);
 alert("Signup Successful 🎉");
                setErrors({});
                // alert("Signup Successful 🎉");
                navigate("/");
            } catch (error) {
                console.log(error);
                alert("Signup Failed ❌");
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
                    Sign Up
                </h2>


                <div className="mb-4">
                    <label className="block text-sm font-medium text-[#09637E]">
                        Name
                    </label>
                    <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        className="w-full mt-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7AB2B2]"
                    />
                    {errors.name && (
                        <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                    )}
                </div>


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

                <div className="mb-4">
                    <label className="block text-sm font-medium text-[#09637E]">
                        Phone
                    </label>
                    <input
                        type="number"
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        className="w-full mt-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7AB2B2]"
                    />
                    {errors.phone && (
                        <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                    )}
                </div>

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

                <div className="mb-4">
                    <label className="block text-sm font-medium text-[#09637E]">
                        Gender
                    </label>
                    <input
                        type="rext"
                        name="gender"
                        value={form.gender}
                        onChange={handleChange}
                        className="w-full mt-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7AB2B2]"
                    />
                    {errors.gender && (
                        <p className="text-red-500 text-sm mt-1">
                            {errors.gender}
                        </p>
                    )}
                </div>

                <button
                    type="submit"
                    className="w-full bg-[#088395] text-white py-2 rounded-lg hover:bg-[#09637E] transition"
                >
                    Create Account
                </button>
                 <p className="text-center mt-4 text-sm text-gray-600">
  Already have an account?{" "}
  <Link
    to="/"
    className="text-[#088395] font-semibold hover:underline"
  >
    Login
  </Link>
</p>
            </form>
           
        </div>
    );
}
