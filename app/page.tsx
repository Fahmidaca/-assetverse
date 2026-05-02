import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  MdInventory, MdGroups, MdAnalytics, MdSecurity, MdNotifications, MdCloudUpload,
  MdAssignment, MdCheckCircle, MdBusiness, MdStar, MdArrowForward,
  MdKeyboardArrowDown,
} from "react-icons/md";

const FEATURES = [
  { icon: MdInventory, title: "Smart Asset Tracking", desc: "Track every asset — laptops, furniture, tools — with real-time availability counts and full lifecycle history.", color: "bg-blue-100 text-blue-600" },
  { icon: MdAssignment, title: "Request & Approval Workflow", desc: "Employees browse and request assets. HR approves or rejects with one click. Returnable assets go back to stock automatically.", color: "bg-indigo-100 text-indigo-600" },
  { icon: MdGroups, title: "Employee Management", desc: "Auto-affiliate employees when their first request is approved. See your full team, birthdays, and asset usage at a glance.", color: "bg-violet-100 text-violet-600" },
  { icon: MdAnalytics, title: "Analytics Dashboard", desc: "Recharts-powered visual analytics: top requested assets, request trends by month, approval rates, and team activity.", color: "bg-purple-100 text-purple-600" },
  { icon: MdSecurity, title: "Role-Based Access", desc: "HR managers and employees have completely separate dashboards, APIs, and permissions. JWT-secured, always.", color: "bg-rose-100 text-rose-600" },
  { icon: MdCloudUpload, title: "Image Uploads", desc: "Add product photos for every asset. Employees can personalize their profiles. All images hosted on fast CDN.", color: "bg-orange-100 text-orange-600" },
  { icon: MdNotifications, title: "Birthday Reminders", desc: "Never miss a teammate's birthday. The My Team page surfaces upcoming birthdays within the next 30 days.", color: "bg-amber-100 text-amber-600" },
  { icon: MdCheckCircle, title: "PDF Reports", desc: "Print a formatted asset report for any approved request — great for audits, onboarding packs, and compliance.", color: "bg-green-100 text-green-600" },
];

const STEPS = [
  { step: "01", title: "Create an HR account", desc: "Register your company in seconds. No credit card required for the Basic plan." },
  { step: "02", title: "Add your assets", desc: "Upload assets with images, set type (returnable / non-returnable) and quantity." },
  { step: "03", title: "Employees request assets", desc: "Employees join, browse your catalog, and submit requests with optional notes." },
  { step: "04", title: "Approve & track", desc: "HR approves requests, employees get auto-affiliated, and stock updates in real-time." },
];

const PACKAGES = [
  {
    name: "Basic",
    price: "$0",
    period: "forever",
    limit: "Up to 5 employees",
    features: ["Asset CRUD", "Request workflow", "Employee management", "Basic analytics", "PDF reports"],
    cta: "Start Free",
    href: "/register/hr",
    highlight: false,
  },
  {
    name: "Standard",
    price: "$5",
    period: "per month",
    limit: "Up to 10 employees",
    features: ["Everything in Basic", "Advanced analytics", "Birthday reminders", "Priority support", "Team insights"],
    cta: "Get Standard",
    href: "/register/hr",
    highlight: true,
  },
  {
    name: "Premium",
    price: "$10",
    period: "per month",
    limit: "Up to 20 employees",
    features: ["Everything in Standard", "Unlimited assets", "Export reports", "Custom branding", "Dedicated support"],
    cta: "Get Premium",
    href: "/register/hr",
    highlight: false,
  },
];

const TESTIMONIALS = [
  { name: "Sarah K.", role: "HR Manager · TechFlow", quote: "We used to track assets in spreadsheets. AssetVerse cut our admin time in half and our employees love the self-service request flow.", stars: 5 },
  { name: "Marcus O.", role: "Operations Lead · NovaBuild", quote: "The analytics alone are worth it. I can see which assets are in high demand and plan procurement before stock runs out.", stars: 5 },
  { name: "Priya S.", role: "People Ops · Crescent Digital", quote: "Setting up took less than 10 minutes. Employees onboard themselves and the birthday reminder in My Team is a fun touch.", stars: 5 },
];

const STATS = [
  { value: "2,400+", label: "Assets Managed" },
  { value: "180+", label: "Companies" },
  { value: "98%", label: "Approval Accuracy" },
  { value: "< 10 min", label: "Avg. Setup Time" },
];

const FAQS = [
  { q: "Do employees need to pay for AssetVerse?", a: "No. Employees register for free. Only HR managers need a subscription if they go beyond 5 employees." },
  { q: "Can I upgrade or downgrade my plan at any time?", a: "Yes. You can upgrade instantly via Stripe. Downgrades take effect at the next billing cycle." },
  { q: "What happens to assets when an employee is removed?", a: "Removing an employee from your company clears their affiliation. Their pending/approved requests remain in the audit log." },
  { q: "Is my data secure?", a: "Yes. All API routes are JWT-protected. HR and employee data are completely isolated by role-based access control." },
  { q: "What is the difference between returnable and non-returnable assets?", a: "Returnable assets (laptops, chairs) go back to stock when returned. Non-returnable assets (notebooks, cables) are consumed permanently." },
  { q: "Can I add photos to assets?", a: "Yes. HR can upload product images for each asset. They're hosted on a fast CDN via ImageBB." },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* ─── HERO ─── */}
      <section className="hero-gradient min-h-screen flex items-center pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 rounded-full px-4 py-1.5 text-xs font-semibold text-indigo-700 mb-8">
            <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
            Corporate Asset Management — Simplified
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-gray-900 leading-tight mb-6">
            Manage Company Assets
            <br />
            <span className="gradient-text">Without the Chaos</span>
          </h1>

          <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            AssetVerse gives HR managers a full-stack platform to add assets, approve employee requests, and gain real-time visibility — all from one beautiful dashboard.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register/hr"
              className="btn btn-primary text-white rounded-xl px-8 h-12 text-base font-semibold gap-2 shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transition-shadow">
              Start for Free <MdArrowForward className="w-5 h-5" />
            </Link>
            <Link href="/register/employee"
              className="btn btn-outline border-gray-300 text-gray-700 rounded-xl px-8 h-12 text-base font-semibold hover:bg-gray-50">
              Join as Employee
            </Link>
          </div>

          <p className="text-xs text-gray-400 mt-5">No credit card required · Free plan includes 5 employees</p>

          {/* Scroll indicator */}
          <div className="flex justify-center mt-16 animate-bounce">
            <MdKeyboardArrowDown className="w-6 h-6 text-gray-400" />
          </div>
        </div>
      </section>

      {/* ─── STATS ─── */}
      <section className="bg-indigo-600 py-14">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {STATS.map((s) => (
              <div key={s.label}>
                <p className="text-4xl font-black text-white mb-1">{s.value}</p>
                <p className="text-indigo-200 text-sm font-medium">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section id="features" className="section-padding bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-gray-900 mb-4">Everything you need to manage assets</h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">From request to return, AssetVerse handles the full asset lifecycle — so you can focus on your people, not spreadsheets.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((f) => (
              <div key={f.title} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className={`w-12 h-12 rounded-2xl ${f.color} flex items-center justify-center mb-4`}>
                  <f.icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section id="how-it-works" className="section-padding bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-gray-900 mb-4">Up and running in minutes</h2>
            <p className="text-lg text-gray-500">Four simple steps to get your entire team managing assets on AssetVerse.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {STEPS.map((s, i) => (
              <div key={s.step} className="relative text-center">
                {i < STEPS.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-[calc(50%+2rem)] right-0 h-0.5 bg-indigo-100" />
                )}
                <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-200">
                  <span className="text-white font-black text-lg">{s.step}</span>
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{s.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PRICING ─── */}
      <section id="pricing" className="section-padding bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-gray-900 mb-4">Simple, transparent pricing</h2>
            <p className="text-lg text-gray-500">Start free. Upgrade when your team grows.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PACKAGES.map((pkg) => (
              <div key={pkg.name} className={`rounded-2xl p-8 border ${pkg.highlight ? "bg-indigo-600 border-indigo-500 shadow-xl shadow-indigo-200 scale-105" : "bg-white border-gray-100 shadow-sm"}`}>
                <p className={`text-sm font-bold uppercase tracking-wider mb-2 ${pkg.highlight ? "text-indigo-200" : "text-indigo-600"}`}>{pkg.name}</p>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className={`text-5xl font-black ${pkg.highlight ? "text-white" : "text-gray-900"}`}>{pkg.price}</span>
                  <span className={`text-sm ${pkg.highlight ? "text-indigo-200" : "text-gray-400"}`}>{pkg.period}</span>
                </div>
                <p className={`text-sm mb-6 ${pkg.highlight ? "text-indigo-200" : "text-gray-500"}`}>{pkg.limit}</p>
                <ul className="space-y-3 mb-8">
                  {pkg.features.map((f) => (
                    <li key={f} className={`flex items-center gap-2 text-sm ${pkg.highlight ? "text-indigo-100" : "text-gray-600"}`}>
                      <MdCheckCircle className={`w-4 h-4 shrink-0 ${pkg.highlight ? "text-indigo-300" : "text-indigo-500"}`} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href={pkg.href}
                  className={`btn w-full rounded-xl font-semibold ${pkg.highlight ? "bg-white text-indigo-600 hover:bg-indigo-50 border-0" : "btn-primary text-white"}`}>
                  {pkg.cta}
                </Link>
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-gray-400 mt-8">All plans include unlimited assets. Employee count determines plan tier.</p>
        </div>
      </section>

      {/* ─── TESTIMONIALS ─── */}
      <section className="section-padding bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-gray-900 mb-4">Loved by HR teams</h2>
            <p className="text-lg text-gray-500">Join hundreds of companies that trust AssetVerse to manage their resources.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                <div className="flex mb-3">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <MdStar key={i} className="w-4 h-4 text-amber-400" />
                  ))}
                </div>
                <p className="text-gray-700 text-sm leading-relaxed mb-4">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{t.name}</p>
                    <p className="text-xs text-gray-400">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section id="faq" className="section-padding bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-gray-900 mb-4">Frequently asked questions</h2>
            <p className="text-lg text-gray-500">Everything you need to know about AssetVerse.</p>
          </div>
          <div className="space-y-4">
            {FAQS.map((faq) => (
              <details key={faq.q} className="bg-white rounded-2xl border border-gray-100 shadow-sm group">
                <summary className="flex items-center justify-between p-6 cursor-pointer font-semibold text-gray-800 list-none">
                  {faq.q}
                  <MdKeyboardArrowDown className="w-5 h-5 text-gray-400 transition-transform group-open:rotate-180" />
                </summary>
                <div className="px-6 pb-6 text-sm text-gray-500 leading-relaxed border-t border-gray-100 pt-4">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="section-padding bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <MdBusiness className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-4xl sm:text-5xl font-black text-white mb-6">Ready to bring order to your assets?</h2>
          <p className="text-xl text-indigo-200 max-w-2xl mx-auto mb-10">
            Start for free with up to 5 employees. No setup fees, no complexity — just a better way to manage what your team uses every day.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register/hr"
              className="btn bg-white text-indigo-700 hover:bg-indigo-50 rounded-xl px-10 h-12 text-base font-bold gap-2 border-0">
              Start Free Today <MdArrowForward className="w-5 h-5" />
            </Link>
            <Link href="/login"
              className="btn btn-outline border-white/30 text-white hover:bg-white/10 rounded-xl px-8 h-12 text-base font-semibold">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
