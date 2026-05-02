"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import toast from "react-hot-toast";
import { MdEmail, MdLock, MdVisibility, MdVisibilityOff } from "react-icons/md";

type LoginForm = { email: string; password: string };

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [showPw, setShowPw] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>();

  const onSubmit = async (data: LoginForm) => {
    try {
      const res = await axios.post("/api/auth/login", data);
      login(res.data.token, res.data.user);
      toast.success(`Welcome back, ${res.data.user.name}!`);
      router.push(res.data.user.role === "hr" ? "/hr" : "/employee");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Login failed");
    }
  };

  return (
    <div className="min-h-screen hero-gradient flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">A</span>
            </div>
            <span className="text-2xl font-bold gradient-text">AssetVerse</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-6 mb-1">Welcome back</h1>
          <p className="text-gray-500 text-sm">Sign in to your account</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email */}
            <div>
              <label className="label text-sm font-medium text-gray-700 pb-1">Email address</label>
              <label className="input input-bordered flex items-center gap-2 rounded-xl w-full">
                <MdEmail className="w-4 h-4 text-gray-400 shrink-0" />
                <input
                  type="email"
                  placeholder="you@company.com"
                  className="grow text-sm"
                  {...register("email", { required: "Email is required" })}
                />
              </label>
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="label text-sm font-medium text-gray-700 pb-1">Password</label>
              <label className="input input-bordered flex items-center gap-2 rounded-xl w-full">
                <MdLock className="w-4 h-4 text-gray-400 shrink-0" />
                <input
                  type={showPw ? "text" : "password"}
                  placeholder="••••••••"
                  className="grow text-sm"
                  {...register("password", { required: "Password is required" })}
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="text-gray-400 hover:text-gray-600">
                  {showPw ? <MdVisibilityOff className="w-4 h-4" /> : <MdVisibility className="w-4 h-4" />}
                </button>
              </label>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary text-white w-full rounded-xl h-12 text-base font-semibold"
            >
              {isSubmitting ? <span className="loading loading-spinner" /> : "Sign In"}
            </button>
          </form>

          <div className="divider text-xs text-gray-400 my-5">New to AssetVerse?</div>

          <div className="grid grid-cols-2 gap-3">
            <Link href="/register/hr"
              className="btn btn-outline rounded-xl text-sm font-medium border-indigo-200 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-400">
              Join as HR
            </Link>
            <Link href="/register/employee"
              className="btn btn-outline rounded-xl text-sm font-medium border-violet-200 text-violet-600 hover:bg-violet-50 hover:border-violet-400">
              Join as Employee
            </Link>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          © {new Date().getFullYear()} AssetVerse · All rights reserved
        </p>
      </div>
    </div>
  );
}
