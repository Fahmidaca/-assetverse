"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";
import toast from "react-hot-toast";
import { MdCloudUpload, MdBusiness, MdPerson } from "react-icons/md";

export default function EmployeeProfilePage() {
  const { user, authHeaders, updateUser } = useAuth();
  const [uploading, setUploading] = useState(false);
  const { register, handleSubmit, formState: { isSubmitting } } = useForm({
    defaultValues: {
      name: user?.name || "",
      position: user?.position || "",
      dateOfBirth: user?.dateOfBirth || "",
    },
  });

  const uploadImage = async (file: File) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("image", file);
      const res = await axios.post(
        `https://api.imgbb.com/1/upload?key=${process.env.NEXT_PUBLIC_IMAGEBB_API_KEY}`,
        fd
      );
      const url = res.data.data.url;
      await axios.patch("/api/auth/me", { profileImage: url }, { headers: authHeaders });
      updateUser({ profileImage: url });
      toast.success("Profile photo updated");
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
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Profile</h1>

      {/* Affiliation Card */}
      {user?.affiliatedCompany && (
        <div className="bg-gradient-to-r from-indigo-500 to-violet-500 rounded-2xl p-5 text-white mb-6">
          <div className="flex items-center gap-3">
            <MdBusiness className="w-6 h-6 opacity-80" />
            <div>
              <p className="text-xs font-medium opacity-70 uppercase tracking-wider">Affiliated Company</p>
              <p className="text-lg font-bold">{user.affiliatedCompany}</p>
            </div>
          </div>
        </div>
      )}

      {!user?.affiliatedCompany && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6">
          <p className="text-amber-700 text-sm font-medium">No company affiliation yet</p>
          <p className="text-amber-600 text-xs mt-1">Request an asset to automatically join a company.</p>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        {/* Avatar Section */}
        <div className="flex items-center gap-5 mb-6 pb-6 border-b border-gray-100">
          <div className="relative">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-indigo-100 flex items-center justify-center">
              {user?.profileImage ? (
                <Image src={user.profileImage} alt="Profile" width={80} height={80}
                  className="object-cover w-full h-full" unoptimized />
              ) : (
                <span className="text-3xl font-bold text-indigo-400">{user?.name?.[0]?.toUpperCase()}</span>
              )}
            </div>
            <label className="absolute -bottom-1 -right-1 w-7 h-7 bg-indigo-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-indigo-700 transition-colors">
              <MdCloudUpload className="w-4 h-4 text-white" />
              <input type="file" accept="image/*" className="hidden"
                onChange={(e) => e.target.files?.[0] && uploadImage(e.target.files[0])} />
            </label>
          </div>
          <div>
            <p className="font-semibold text-gray-800 text-lg">{user?.name}</p>
            <p className="text-sm text-gray-400">{user?.position || "Employee"}</p>
            <p className="text-xs text-gray-400 mt-0.5">{user?.email}</p>
          </div>
        </div>

        {/* Form */}
        <div className="flex items-center gap-2 mb-4">
          <MdPerson className="w-5 h-5 text-indigo-500" />
          <h2 className="text-base font-semibold text-gray-800">Personal Information</h2>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label text-sm font-medium text-gray-700">Full Name</label>
              <input {...register("name")} className="input input-bordered w-full rounded-xl" placeholder="Your name" />
            </div>
            <div>
              <label className="label text-sm font-medium text-gray-700">Position / Role</label>
              <input {...register("position")} className="input input-bordered w-full rounded-xl" placeholder="e.g. Software Engineer" />
            </div>
          </div>

          <div>
            <label className="label text-sm font-medium text-gray-700">Date of Birth</label>
            <input type="date" {...register("dateOfBirth")} className="input input-bordered w-full rounded-xl" />
          </div>

          <div>
            <label className="label text-sm font-medium text-gray-700">Email</label>
            <input value={user?.email || ""} disabled className="input input-bordered w-full rounded-xl bg-gray-50 text-gray-400" />
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
