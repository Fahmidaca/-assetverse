"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";
import toast from "react-hot-toast";
import { MdCloudUpload, MdEdit } from "react-icons/md";

export default function HRProfilePage() {
  const { user, authHeaders, updateUser } = useAuth();
  const [uploading, setUploading] = useState(false);
  const { register, handleSubmit, formState: { isSubmitting } } = useForm({
    defaultValues: {
      name: user?.name || "",
      companyName: user?.companyName || "",
      dateOfBirth: user?.dateOfBirth || "",
    },
  });

  const uploadImage = async (file: File, field: "profileImage" | "companyLogo") => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("image", file);
      const res = await axios.post(
        `https://api.imgbb.com/1/upload?key=${process.env.NEXT_PUBLIC_IMAGEBB_API_KEY}`,
        fd
      );
      const url = res.data.data.url;
      await axios.patch("/api/auth/me", { [field]: url }, { headers: authHeaders });
      updateUser({ [field]: url });
      toast.success("Image updated");
    } catch { toast.error("Upload failed"); }
    finally { setUploading(false); }
  };

  const onSubmit = async (data: any) => {
    try {
      await axios.patch("/api/auth/me", data, { headers: authHeaders });
      updateUser(data);
      toast.success("Profile updated");
    } catch { toast.error("Update failed"); }
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">HR Profile</h1>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
        <h2 className="text-base font-semibold text-gray-800 mb-4">Company Info</h2>
        <div className="flex items-center gap-6 mb-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl overflow-hidden bg-indigo-100 flex items-center justify-center">
              {user?.companyLogo ? (
                <Image src={user.companyLogo} alt="Company" width={80} height={80} className="object-cover w-full h-full" unoptimized />
              ) : (
                <span className="text-3xl font-bold text-indigo-400">{user?.companyName?.[0]}</span>
              )}
            </div>
            <label className="absolute -bottom-1 -right-1 w-7 h-7 bg-indigo-600 rounded-full flex items-center justify-center cursor-pointer">
              <MdEdit className="w-4 h-4 text-white" />
              <input type="file" accept="image/*" className="hidden"
                onChange={(e) => e.target.files?.[0] && uploadImage(e.target.files[0], "companyLogo")} />
            </label>
          </div>
          <div>
            <p className="text-lg font-bold text-gray-900">{user?.companyName}</p>
            <p className="text-sm text-gray-400">{user?.email}</p>
            <span className="badge badge-primary text-white badge-sm capitalize mt-1">{user?.subscription} Plan</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative">
            <div className="w-16 h-16 rounded-full overflow-hidden bg-indigo-100 flex items-center justify-center">
              {user?.profileImage ? (
                <Image src={user.profileImage} alt="Profile" width={64} height={64} className="object-cover w-full h-full" unoptimized />
              ) : (
                <span className="text-2xl font-bold text-indigo-400">{user?.name?.[0]}</span>
              )}
            </div>
            <label className="absolute -bottom-1 -right-1 w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center cursor-pointer">
              <MdCloudUpload className="w-3 h-3 text-white" />
              <input type="file" accept="image/*" className="hidden"
                onChange={(e) => e.target.files?.[0] && uploadImage(e.target.files[0], "profileImage")} />
            </label>
          </div>
          <div>
            <p className="font-semibold text-gray-800">{user?.name}</p>
            <p className="text-xs text-gray-400">HR Manager</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label text-sm font-medium text-gray-700">Full Name</label>
              <input {...register("name")} className="input input-bordered w-full rounded-xl" />
            </div>
            <div>
              <label className="label text-sm font-medium text-gray-700">Company Name</label>
              <input {...register("companyName")} className="input input-bordered w-full rounded-xl" />
            </div>
          </div>
          <div>
            <label className="label text-sm font-medium text-gray-700">Date of Birth</label>
            <input type="date" {...register("dateOfBirth")} className="input input-bordered w-full rounded-xl" />
          </div>
          <div>
            <label className="label text-sm font-medium text-gray-700">Email</label>
            <input value={user?.email || ""} disabled className="input input-bordered w-full rounded-xl bg-gray-50" />
          </div>
          <button type="submit" disabled={isSubmitting || uploading}
            className="btn btn-primary text-white w-full rounded-xl">
            {isSubmitting ? <span className="loading loading-spinner loading-sm" /> : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}
