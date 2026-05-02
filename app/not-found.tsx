import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen hero-gradient flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-8xl font-black gradient-text mb-4">404</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Page Not Found</h1>
        <p className="text-gray-500 mb-8">
          The page you are looking for doesn&apos;t exist or has been moved.
        </p>
        <Link href="/" className="btn btn-primary text-white px-8 rounded-xl">
          Go Home
        </Link>
      </div>
    </div>
  );
}
