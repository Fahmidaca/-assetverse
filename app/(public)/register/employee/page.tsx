"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import toast from "react-hot-toast";
import { MdEmail, MdLock, MdPerson, MdWork, MdVisibility, MdVisibilityOff } from "react-icons/md";

type EmployeeRegisterForm = {
  name: string;
  position: string;
  email: string;
  password: string;
  confirmPassword: string;
  dateOfBirth: string;
};

export default function RegisterEmployeePage() {
  const { login } = useAuth();
  const router = useRouter();
  const [showPw, setShowPw] = useState(false);
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<EmployeeRegisterForm>();
  const pw = watch("password");

  const onSubmit = async (data: EmployeeRegisterForm) => {
    try {
      const res = await axios.post("/api/auth/register", {
        name: data.name,
        position: data.position,
        email: data.email,
        password: data.password,
        dateOfBirth: data.dateOfBirth,
        role: "employee",
      });
      login(res.data.token, res.data.user);
      toast.success("Account created! Browse assets to get started.");
      router.push("/employee");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen hero-gradient flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">A</span>
            </div>
            <span className="text-2xl font-bold gradient-text">AssetVerse</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-6 mb-1">Create your account</h1>
          <p className="text-gray-500 text-sm">Join AssetVerse as an employee to request company assets</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Full Name */}
              <div>
                <label className="label text-sm font-medium text-gray-700 pb-1">Full Name</label>
                <label className="input input-bordered flex items-center gap-2 rounded-xl w-full">
                  <MdPerson className="w-4 h-4 text-gray-400 shrink-0" />
                  <input placeholder="John Doe" className="grow text-sm"
                    {...register("name", { required: "Name is required" })} />
                </label>
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
              </div>

              {/* Position */}
              <div>
                <label className="label text-sm font-medium text-gray-700 pb-1">Job Position</label>
                <label className="input input-bordered flex items-center gap-2 rounded-xl w-full">
                  <MdWork className="w-4 h-4 text-gray-400 shrink-0" />
                  <input placeholder="Software Engineer" className="grow text-sm"
                    {...register("position")} />
                </label>
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="label text-sm font-medium text-gray-700 pb-1">Email address</label>
              <label className="input input-bordered flex items-center gap-2 rounded-xl w-full">
                <MdEmail className="w-4 h-4 text-gray-400 shrink-0" />
                <input type="email" placeholder="you@email.com" className="grow text-sm"
                  {...register("email", { required: "Email is required" })} />
              </label>
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            {/* Date of Birth */}
            <div>
              <label className="label text-sm font-medium text-gray-700 pb-1">Date of Birth</label>
              <input type="date" className="input input-bordered w-full rounded-xl text-sm"
                {...register("dateOfBirth")} />
            </div>

            {/* Password */}
            <div>
              <label className="label text-sm font-medium text-gray-700 pb-1">Password</label>
              <label className="input input-bordered flex items-center gap-2 rounded-xl w-full">
                <MdLock className="w-4 h-4 text-gray-400 shrink-0" />
                <input type={showPw ? "text" : "password"} placeholder="Min. 6 characters" className="grow text-sm"
                  {...register("password", { required: "Password is required", minLength: { value: 6, message: "Min. 6 characters" } })} />
                <button type="button" onClick={() => setShowPw(!showPw)} className="text-gray-400 hover:text-gray-600">
                  {showPw ? <MdVisibilityOff className="w-4 h-4" /> : <MdVisibility className="w-4 h-4" />}
                </button>
              </label>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="label text-sm font-medium text-gray-700 pb-1">Confirm Password</label>
              <label className="input input-bordered flex items-center gap-2 rounded-xl w-full">
                <MdLock className="w-4 h-4 text-gray-400 shrink-0" />
                <input type="password" placeholder="Repeat password" className="grow text-sm"
                  {...register("confirmPassword", {
                    required: "Please confirm your password",
                    validate: (v) => v === pw || "Passwords do not match",
                  })} />
              </label>
              {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
            </div>

            <div className="pt-2">
              <button type="submit" disabled={isSubmitting}
                className="btn btn-primary text-white w-full rounded-xl h-12 text-base font-semibold">
                {isSubmitting ? <span className="loading loading-spinner" /> : "Create Employee Account"}
              </button>
            </div>
          </form>

          <p className="text-center text-sm text-gray-500 mt-5">
            Already have an account?{" "}
            <Link href="/login" className="text-indigo-600 font-medium hover:underline">Sign in</Link>
          </p>
          <p className="text-center text-sm text-gray-500 mt-2">
            Setting up a company?{" "}
            <Link href="/register/hr" className="text-indigo-600 font-medium hover:underline">Register as HR</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
