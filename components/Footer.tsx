import Link from "next/link";
import { MdEmail } from "react-icons/md";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">A</span>
              </div>
              <span className="text-xl font-bold text-white">AssetVerse</span>
            </div>
            <p className="text-sm leading-relaxed max-w-xs">
              The modern corporate asset management platform that helps HR teams track, manage, and allocate company resources efficiently.
            </p>
            <div className="flex items-center gap-2 mt-4 text-sm">
              <MdEmail className="w-4 h-4 text-indigo-400" />
              <a href="mailto:support@assetverse.io" className="hover:text-white transition-colors">support@assetverse.io</a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">Product</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
              <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
              <li><a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a></li>
              <li><a href="#faq" className="hover:text-white transition-colors">FAQ</a></li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">Account</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/login" className="hover:text-white transition-colors">Sign In</Link></li>
              <li><Link href="/register/hr" className="hover:text-white transition-colors">Register as HR</Link></li>
              <li><Link href="/register/employee" className="hover:text-white transition-colors">Register as Employee</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500">© {new Date().getFullYear()} AssetVerse. All rights reserved.</p>
          <p className="text-xs text-gray-600">Built with ❤️ for modern HR teams</p>
        </div>
      </div>
    </footer>
  );
}
