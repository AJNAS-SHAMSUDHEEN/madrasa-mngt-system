import Link from "next/link";
import {
  CheckCircle2,
  ClipboardCheck,
  GraduationCap,
  ShieldCheck,
  Users,
  Building2,
  ArrowRight,
  BarChart3,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2.5 font-bold text-lg text-slate-900">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
              <ClipboardCheck className="h-5 w-5" />
            </span>
            <span>AttendFlow</span>
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
              SaaS
            </span>
          </Link>
          <nav className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 transition"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 transition"
            >
              Start Free Workspace
              <ArrowRight className="h-4 w-4" />
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="mx-auto max-w-6xl px-6 pt-16 pb-20 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-1 text-xs font-semibold text-emerald-800 mb-6">
            <Building2 className="h-3.5 w-3.5" />
            Multi-Tenant Attendance & Student Profile SaaS
          </div>
          <h1 className="mx-auto max-w-3xl text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
            Effortless attendance tracking for teachers, admins, and students.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-600">
            Launch an isolated workspace for your school, academy, or madrasa in seconds.
            Teachers mark daily attendance and maintain student profiles, while students
            view their live attendance records and stats anytime.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3.5 text-sm font-semibold text-white shadow-md hover:bg-emerald-700 transition"
            >
              Create Institution Workspace
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition"
            >
              Try Live Demo (Teacher / Student / Admin)
            </Link>
          </div>
        </section>

        {/* Feature Grid */}
        <section className="mx-auto max-w-6xl px-6 pb-20">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 mb-4">
                <ClipboardCheck className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Fast Teacher Roll-Call</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Mark Present, Absent, Late, or Excused for an entire class in one click, add
                per-student remarks, and update past dates anytime.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-50 text-sky-600 mb-4">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Rich Student Profiles</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Store roll numbers, class assignments, guardian contact details, date of birth,
                address, and teacher notes with full attendance history.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-600 mb-4">
                <GraduationCap className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Student Self-Service Portal</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Students log in to view their profile, real-time attendance percentage,
                breakdown of present/late/absent days, and date-by-date remarks.
              </p>
            </div>
          </div>
        </section>

        {/* SaaS Plans */}
        <section className="border-t border-slate-200 bg-white py-16">
          <div className="mx-auto max-w-6xl px-6">
            <div className="text-center mb-12">
              <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                Simple SaaS Plans for Every Institution
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                Every workspace is tenant-isolated with role-based access control.
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {[
                {
                  name: "Starter",
                  price: "$0",
                  desc: "For small study circles & pilot classes",
                  features: ["Up to 50 students", "2 teacher accounts", "Daily attendance & profiles"],
                  highlight: false,
                },
                {
                  name: "Pro",
                  price: "$29",
                  desc: "For growing schools & madrasas",
                  features: [
                    "Unlimited students & classes",
                    "Unlimited teacher accounts",
                    "Student self-service portal",
                  ],
                  highlight: true,
                },
                {
                  name: "Enterprise",
                  price: "$79",
                  desc: "For multi-branch institutions",
                  features: [
                    "Everything in Pro",
                    "Dedicated tenant isolation",
                    "Priority onboarding & support",
                  ],
                  highlight: false,
                },
              ].map((tier) => (
                <div
                  key={tier.name}
                  className={`rounded-2xl border p-6 flex flex-col justify-between ${
                    tier.highlight
                      ? "border-emerald-500 bg-emerald-50/30 shadow-md ring-1 ring-emerald-500"
                      : "border-slate-200 bg-white shadow-sm"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold text-slate-900">{tier.name}</h3>
                      {tier.highlight && (
                        <span className="rounded-full bg-emerald-600 px-2.5 py-0.5 text-xs font-semibold text-white">
                          Popular
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-slate-500">{tier.desc}</p>
                    <p className="mt-4 text-3xl font-extrabold text-slate-900">
                      {tier.price}
                      <span className="text-sm font-normal text-slate-500">/month</span>
                    </p>
                    <ul className="mt-5 space-y-2.5 text-sm text-slate-700">
                      {tier.features.map((feat) => (
                        <li key={feat} className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Link
                    href={`/signup?plan=${tier.name.toLowerCase()}`}
                    className={`mt-6 block rounded-xl py-2.5 text-center text-sm font-semibold transition ${
                      tier.highlight
                        ? "bg-emerald-600 text-white hover:bg-emerald-700"
                        : "border border-slate-300 bg-white text-slate-800 hover:bg-slate-50"
                    }`}
                  >
                    Choose {tier.name}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-slate-50 py-6 text-center text-xs text-slate-500">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6">
          <span>AttendFlow SaaS • Multi-Tenant Attendance Platform</span>
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            Role-based access & tenant isolation
          </span>
        </div>
      </footer>
    </div>
  );
}
