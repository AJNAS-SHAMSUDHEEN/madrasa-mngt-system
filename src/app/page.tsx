import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  GraduationCap,
  MessageCircle,
  Phone,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Users,
  XCircle,
} from "lucide-react";
import PublicNavbar from "@/components/PublicNavbar";
import FaqAccordion from "@/components/FaqAccordion";
import InstallAppButton from "@/components/InstallAppButton";
import AppLaunchRedirect from "@/components/AppLaunchRedirect";

const FAQS = [
  {
    q: "What is Madrasa Management System?",
    a: "It is a simple online platform built for Madrasas to record daily attendance, organize student and teacher details, and manage classes from any phone or computer.",
  },
  {
    q: "Can multiple Madrasas use the same platform?",
    a: "Yes. Every Madrasa gets its own private workspace, so your students, teachers, and attendance records stay completely separate from other institutions.",
  },
  {
    q: "Can teachers mark attendance on mobile phones?",
    a: "Yes. Teachers can open the website on any mobile phone or desktop browser, pick their class, and mark Present, Late, Absent, or Excused in seconds.",
  },
  {
    q: "How is our Madrasa's data kept safe and private?",
    a: "Access is controlled by user roles (Madrasa Admin, Teacher, Student) and enforced at the database level so people only see what belongs to their own Madrasa and role.",
  },
  {
    q: "How do we start or request a demo?",
    a: "Call or message us on WhatsApp at 8921202909. Our team will show you a quick live demo and help set up your Madrasa workspace.",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-emerald-100 selection:text-emerald-900">
      <AppLaunchRedirect />
      <PublicNavbar />

      <main className="flex-1">
        {/* HERO */}
        <section className="relative overflow-hidden bg-white border-b border-slate-200/80">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.10),transparent_55%)]" />
          <div className="relative mx-auto max-w-6xl px-6 py-16 sm:py-24">
            <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
              <div className="lg:col-span-7">
                <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 border border-emerald-200 px-3.5 py-1 text-xs font-semibold text-emerald-800 mb-5">
                  <Sparkles className="h-3.5 w-3.5" />
                  Built for Real-World Madrasas
                </span>
                <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 leading-[1.12]">
                  Simple Digital Attendance &amp; Records for Your Madrasa
                </h1>
                <p className="mt-5 max-w-xl text-base sm:text-lg text-slate-600 leading-relaxed">
                  Replace paper registers with one clean, easy-to-use system. Teachers
                  record daily attendance from their phone, administrators stay organized,
                  and students can check their own records anytime.
                </p>

                <div className="mt-8 flex flex-wrap items-center gap-3.5">
                  <a
                    href="#contact"
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-6 py-3.5 text-sm font-semibold text-white shadow-md shadow-emerald-700/20 hover:bg-emerald-800 transition"
                  >
                    Request a Free Demo
                    <ArrowRight className="h-4 w-4" />
                  </a>
                  <a
                    href="https://wa.me/8921202909"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3.5 text-sm font-semibold text-slate-800 hover:bg-slate-50 transition"
                  >
                    <MessageCircle className="h-4 w-4 text-emerald-700" />
                    WhatsApp: 8921202909
                  </a>
                  <InstallAppButton variant="outline" label="Install App" />
                </div>

                <p className="mt-4 text-xs text-slate-500">
                  Already have an account?{" "}
                  <Link href="/login" className="font-semibold text-emerald-700 hover:underline">
                    Sign in to your Madrasa workspace →
                  </Link>
                </p>
              </div>

              {/* Clean Illustrative UI Preview */}
              <div className="lg:col-span-5">
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-xl shadow-slate-200/60">
                  <div className="rounded-2xl bg-white border border-slate-200 p-5 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-700">
                          Daily Roll Call
                        </p>
                        <h2 className="text-sm font-bold text-slate-900">
                          Morning Hifz &amp; Tajweed Class
                        </h2>
                      </div>
                      <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                        Today
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/70 px-3.5 py-2.5">
                        <div>
                          <div className="text-xs font-bold text-slate-900">Yusuf Ali</div>
                          <div className="text-[11px] text-slate-500">Roll No. 101</div>
                        </div>
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-semibold text-emerald-800">
                          <CheckCircle2 className="h-3 w-3" /> Present
                        </span>
                      </div>

                      <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/70 px-3.5 py-2.5">
                        <div>
                          <div className="text-xs font-bold text-slate-900">Zainab Omar</div>
                          <div className="text-[11px] text-slate-500">Roll No. 102</div>
                        </div>
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-semibold text-amber-800">
                          <Clock className="h-3 w-3" /> Late
                        </span>
                      </div>

                      <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/70 px-3.5 py-2.5">
                        <div>
                          <div className="text-xs font-bold text-slate-900">Bilal Siddiqui</div>
                          <div className="text-[11px] text-slate-500">Roll No. 103</div>
                        </div>
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-1 text-[11px] font-semibold text-red-800">
                          <XCircle className="h-3 w-3" /> Absent
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                      <span>Works on phone &amp; desktop</span>
                      <span className="font-semibold text-emerald-700">Saved in seconds</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* WHY USE IT (WHAT & WHY IN PLAIN ENGLISH) */}
        <section id="why" className="mx-auto max-w-6xl px-6 py-18 sm:py-20">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              Why Madrasas Switch
            </span>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              Less Paperwork. Clearer Daily Administration.
            </h2>
            <p className="mt-3 text-slate-600">
              Built specifically for Madrasa committees, principals, and teachers—without
              confusing menus or unnecessary complexity.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              {
                icon: ClipboardCheck,
                title: "No More Lost Paper Registers",
                desc: "Teachers mark attendance in a few taps on their phone or computer. Past dates and remarks are always easy to find.",
              },
              {
                icon: GraduationCap,
                title: "Every Student Record in One Place",
                desc: "Keep roll numbers, guardian phone numbers, class batches, and full attendance history neatly organized.",
              },
              {
                icon: Users,
                title: "Better Staff Coordination",
                desc: "Madrasa Admins manage teachers and classes centrally, while teachers focus only on their classes and students.",
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:border-emerald-300 hover:shadow-md transition"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 text-lg font-bold text-slate-900">{item.title}</h3>
                  <p className="mt-2 text-sm text-slate-600 leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* HOW IT SIMPLIFIES REAL-WORLD MADRASAS */}
        <section id="how" className="border-y border-slate-200 bg-white py-18 sm:py-20">
          <div className="mx-auto max-w-6xl px-6">
            <div className="text-center max-w-2xl mx-auto">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                How It Simplifies Daily Work
              </span>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                Ready for Your Madrasa in 3 Simple Steps
              </h2>
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {[
                {
                  step: "1",
                  title: "We Set Up Your Workspace",
                  desc: "Contact our team for a quick demo. We help create your private Madrasa workspace and Admin account.",
                },
                {
                  step: "2",
                  title: "Add Classes, Teachers & Students",
                  desc: "Your Madrasa Admin adds classes and teachers, and builds clean student profiles with guardian contacts.",
                },
                {
                  step: "3",
                  title: "Mark & View Attendance Daily",
                  desc: "Teachers take daily roll call in seconds. Administrators see summaries, and students can view their own records.",
                },
              ].map((s) => (
                <div
                  key={s.step}
                  className="rounded-2xl border border-slate-200 bg-slate-50/70 p-6"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-700 text-white font-bold text-sm">
                    {s.step}
                  </span>
                  <h3 className="mt-4 text-lg font-bold text-slate-900">{s.title}</h3>
                  <p className="mt-2 text-sm text-slate-600 leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SIMPLE FEATURES OVERVIEW */}
        <section id="features" className="mx-auto max-w-6xl px-6 py-18 sm:py-20">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              What You Get
            </span>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              Everything Needed for Daily Madrasa Operations
            </h2>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: ClipboardCheck,
                title: "Daily Attendance",
                desc: "Mark Present, Late, Absent, or Excused with optional notes for any date.",
              },
              {
                icon: BookOpen,
                title: "Classes & Teachers",
                desc: "Organize batches, schedules, and teacher accounts in one place.",
              },
              {
                icon: Smartphone,
                title: "Student Self-Service",
                desc: "Students can log in to view their own profile and attendance percentage.",
              },
              {
                icon: ShieldCheck,
                title: "Private & Role-Safe",
                desc: "Each Madrasa's data is isolated and protected by backend security rules.",
              },
            ].map((feat) => {
              const Icon = feat.icon;
              return (
                <div
                  key={feat.title}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <Icon className="h-5 w-5 text-emerald-700 mb-3" />
                  <h3 className="font-bold text-slate-900 text-base">{feat.title}</h3>
                  <p className="mt-1.5 text-sm text-slate-600 leading-relaxed">{feat.desc}</p>
                </div>
              );
            })}
          </div>

          <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-4 text-center text-xs sm:text-sm text-slate-600">
            <strong className="text-slate-800">Planned Future Additions:</strong> Parent
            notifications, Hifz &amp; academic progress tracking, and downloadable PDF/CSV
            reports.
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="border-t border-slate-200 bg-white py-18 sm:py-20">
          <div className="mx-auto max-w-3xl px-6">
            <div className="text-center mb-10">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                Common Questions
              </span>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                Quick Answers
              </h2>
            </div>

            <FaqAccordion items={FAQS} />
          </div>
        </section>

        {/* CONTACT & DEMO CTA */}
        <section
          id="contact"
          className="bg-gradient-to-br from-emerald-950 via-emerald-900 to-slate-900 text-white py-18 sm:py-20"
        >
          <div className="mx-auto max-w-4xl px-6 text-center space-y-6">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Ready to Simplify Your Madrasa Administration?
            </h2>
            <p className="mx-auto max-w-xl text-emerald-100/90 text-sm sm:text-base leading-relaxed">
              Call or message us on WhatsApp for a free live demo and guided onboarding for
              your institution.
            </p>

            <div className="inline-flex flex-col sm:flex-row items-center gap-3 rounded-2xl border border-emerald-700/80 bg-emerald-900/60 px-7 py-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-200">
                Phone / WhatsApp
              </span>
              <a
                href="tel:8921202909"
                className="text-2xl sm:text-3xl font-extrabold tracking-wide text-white hover:underline"
              >
                8921202909
              </a>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3.5 pt-2">
              <a
                href="tel:8921202909"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-emerald-950 shadow-sm hover:bg-emerald-50 transition"
              >
                <Phone className="h-4 w-4" />
                Call for Demo
              </a>
              <a
                href="https://wa.me/8921202909"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3.5 text-sm font-semibold text-white hover:bg-emerald-500 transition"
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp Us
              </a>
              <InstallAppButton variant="dark" label="Download / Install App" />
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white py-6 text-xs text-slate-500">
        <div className="mx-auto flex flex-col sm:flex-row max-w-6xl items-center justify-between gap-3 px-6">
          <span>Madrasa Management System</span>
          <span>Phone / WhatsApp: 8921202909</span>
        </div>
      </footer>
    </div>
  );
}
