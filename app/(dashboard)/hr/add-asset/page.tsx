"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useAuth } from "@/hooks/useAuth";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { MdCloudUpload } from "react-icons/md";

interface AssetForm {
  productName: string;
  productType: "returnable" | "non-returnable";
  productQuantity: number;
}

export default function AddAssetPage() {
  const { authHeaders } = useAuth();
  const router = useRouter();
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<AssetForm>();

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const apiKey = process.env.NEXT_PUBLIC_IMAGEBB_API_KEY;
      const res = await axios.post(`https://api.imgbb.com/1/upload?key=${apiKey}`, formData);
      setImageUrl(res.data.data.url);
      toast.success("Image uploaded");
    } catch {
      toast.error("Image upload failed");
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (data: AssetForm) => {
    try {
      await axios.post("/api/assets", { ...data, productImage: imageUrl }, { headers: authHeaders });
      toast.success("Asset added successfully!");
      router.push("/hr/assets");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to add asset");
    }
  };

  return (
    <div className="max-w-xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Add New Asset</h1>
        <p className="text-gray-500 text-sm mt-1">Add a new asset to your company inventory</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Product Name */}
          <div className="form-control">
            <label className="label"><span className="label-text font-medium text-gray-700">Product Name *</span></label>
            <input
              {...register("productName", { required: "Product name is required" })}
              className="input input-bordered w-full rounded-xl"
              placeholder="e.g. MacBook Pro 14 inch"
            />
            {errors.productName && <span className="text-red-500 text-xs mt-1">{errors.productName.message}</span>}
          </div>

          {/* Image Upload */}
          <div className="form-control">
            <label className="label"><span className="label-text font-medium text-gray-700">Product Image</span></label>
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center">
              {imageUrl ? (
                <div className="flex flex-col items-center gap-3">
                  <Image src={imageUrl} alt="Preview" width={120} height={120} className="rounded-xl object-cover" unoptimized />
                  <button type="button" onClick={() => setImageUrl("")} className="btn btn-ghost btn-xs text-red-500">Remove</button>
                </div>
              ) : (
                <label className="cursor-pointer">
                  <div className="flex flex-col items-center gap-2 text-gray-400">
                    {uploading ? (
                      <span className="loading loading-spinner loading-md text-primary" />
                    ) : (
                      <>
                        <MdCloudUpload className="w-10 h-10" />
                        <p className="text-sm">Click to upload image</p>
                        <p className="text-xs">PNG, JPG up to 10MB</p>
                      </>
                    )}
                  </div>
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
                </label>
              )}
            </div>
          </div>

          {/* Type */}
          <div className="form-control">
            <label className="label"><span className="label-text font-medium text-gray-700">Product Type *</span></label>
            <select
              {...register("productType", { required: "Type is required" })}
              className="select select-bordered w-full rounded-xl"
            >
              <option value="">Select type</option>
              <option value="returnable">Returnable</option>
              <option value="non-returnable">Non-Returnable</option>
            </select>
            {errors.productType && <span className="text-red-500 text-xs mt-1">{errors.productType.message}</span>}
          </div>

          {/* Quantity */}
          <div className="form-control">
            <label className="label"><span className="label-text font-medium text-gray-700">Quantity *</span></label>
            <input
              type="number"
              min={1}
              {...register("productQuantity", { required: "Quantity is required", min: { value: 1, message: "Min 1" } })}
              className="input input-bordered w-full rounded-xl"
              placeholder="e.g. 10"
            />
            {errors.productQuantity && <span className="text-red-500 text-xs mt-1">{errors.productQuantity.message}</span>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting || uploading}
            className="btn btn-primary text-white w-full rounded-xl"
          >
            {isSubmitting ? <span className="loading loading-spinner loading-sm" /> : "Add Asset"}
          </button>
        </form>
      </div>
    </div>
  );
}
