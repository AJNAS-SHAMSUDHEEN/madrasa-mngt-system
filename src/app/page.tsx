import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  FileText,
  GraduationCap,
  HelpCircle,
  Lock,
  MessageCircle,
  Phone,
  ShieldCheck,
  Sparkles,
  UserCheck,
  Users,
} from "lucide-react";

const PROBLEMS = [
  {
    title: "Paper-Based Attendance Registers",
    desc: "Physical registers are easy to misplace, slow to review, and difficult to summarize across weeks or months.",
  },
  {
    title: "Scattered Student Records",
    desc: "Keeping enrollment details, guardian contacts, and class histories in separate notebooks makes retrieval slow.",
  },
  {
    title: "Manual Class & Teacher Coordination",
    desc: "Assigning teachers to classes and tracking which students belong to which batch becomes error-prone as an institution grows.",
  },
  {
    title: "Time-Consuming Administrative Work",
    desc: "Staff spend hours rewriting lists, checking attendance totals, and updating records manually.",
  },
  {
    title: "Difficulty Preparing Summaries",
    desc: "Compiling class-wise or student-wise attendance overviews for committee meetings requires tedious manual counting.",
  },
  {
    title: "Lack of Centralized Information",
    desc: "When records sit with different individuals, leadership lacks a single reliable view of daily institutional operations.",
  },
  {
    title: "Communication & Coordination Gaps",
    desc: "Administrators and teachers need a shared, structured system so everyone works from the same up-to-date information.",
  },
  {
    title: "Limited Visibility into Daily Activity",
    desc: "Without digital logs, it is hard for principals and committees to monitor daily attendance consistency across classes.",
  },
];

const FEATURE_CATEGORIES = [
  {
    code: "A",
    title: "Attendance Management",
    status: "Available Now",
    statusStyle: "bg-emerald-100 text-emerald-800 border-emerald-200",
    icon: ClipboardCheck,
    items: [
      "Daily student attendance marking (Present, Late, Absent, Excused)",
      "Class-wise attendance rosters and date selection",
      "Per-student attendance remarks and notes",
      "Complete attendance history and student attendance summaries",
      "Dedicated teacher attendance responsibilities",
    ],
  },
  {
    code: "B",
    title: "Student Management",
    status: "Available Now",
    statusStyle: "bg-emerald-100 text-emerald-800 border-emerald-200",
    icon: GraduationCap,
    items: [
      "Organized digital student profiles with roll numbers",
      "Enrollment dates, date of birth, and address details",
      "Guardian name and contact number records",
      "Class assignments and active/inactive status management",
      "Student self-service view for personal profile and attendance history",
    ],
  },
  {
    code: "C",
    title: "Class Management",
    status: "Available Now",
    statusStyle: "bg-emerald-100 text-emerald-800 border-emerald-200",
    icon: BookOpen,
    items: [
      "Class and batch creation with schedule details",
      "Class-wise student organization and filtering",
      "Assigning teachers to specific classes",
      "Structured academic grouping within each institution",
    ],
  },
  {
    code: "D",
    title: "Teacher Management",
    status: "Available Now",
    statusStyle: "bg-emerald-100 text-emerald-800 border-emerald-200",
    icon: UserCheck,
    items: [
      "Institution-specific teacher accounts and profiles",
      "Centralized teacher onboarding by Madrasa Administrators",
      "Clear class assignments and teaching responsibilities",
      "Focused workspace showing assigned attendance and student tools",
    ],
  },
  {
    code: "E",
    title: "Institution Management",
    status: "Available Now",
    statusStyle: "bg-emerald-100 text-emerald-800 border-emerald-200",
    icon: Building2,
    items: [
      "Dedicated workspace for each registered Madrasa",
      "Institution profile, slug, and plan configuration",
      "Institution status management (Active / Suspended)",
      "Centralized multi-institution oversight for platform governance",
    ],
  },
  {
    code: "F",
    title: "Reports & Analytics",
    status: "Partially Available",
    statusStyle: "bg-amber-100 text-amber-800 border-amber-200",
    icon: BarChart3,
    items: [
      "Available: Live attendance rate percentages and status breakdowns",
      "Available: Institution-level totals for students, teachers, and classes",
      "Available: Student-level attendance history filtering",
      "Planned: Downloadable PDF/CSV reports and advanced class-wise exports",
    ],
  },
  {
    code: "G",
    title: "User & Role Management",
    status: "Available Now",
    statusStyle: "bg-emerald-100 text-emerald-800 border-emerald-200",
    icon: Users,
    items: [
      "Super Admin: Platform-level institution governance and workspace status",
      "Madrasa Admin: Full management of their own institution, teachers, and classes",
      "Teacher: Attendance marking and student profile management",
      "Student: Read-only access to personal profile and attendance records",
    ],
  },
  {
    code: "H",
    title: "Future Enhancements",
    status: "Planned / Roadmap",
    statusStyle: "bg-slate-100 text-slate-700 border-slate-300",
    icon: Sparkles,
    items: [
      "Planned: Direct parent communication tools",
      "Planned: Automated attendance and announcement notifications",
      "Planned: Academic progress and Hifz/syllabus tracking",
      "Planned: Extended administrative and reporting utilities",
    ],
  },
];

const FAQS = [
  {
    q: "What is Madrasa Management System?",
    a: "It is a dedicated multi-institution SaaS web platform built to help Madrasas organize daily attendance, student profiles, classes, teachers, and institutional administration in one centralized system.",
  },
  {
    q: "Who can use this platform?",
    a: "It is designed for Madrasa management committees, Madrasa administrators, principals, head teachers, classroom teachers, and Islamic educational organizations overseeing one or multiple Madrasas. Students can also log in to view their own attendance records.",
  },
  {
    q: "Can multiple Madrasas use the same platform?",
    a: "Yes. The platform uses a multi-institution (multi-tenant) architecture, allowing multiple Madrasas to operate on the same platform while keeping each institution's data completely separate.",
  },
  {
    q: "Does each Madrasa have a separate administration area?",
    a: "Yes. Each Madrasa has its own isolated workspace where its Madrasa Administrator manages its teachers, classes, students, and attendance records independently.",
  },
  {
    q: "Can teachers access the platform?",
    a: "Yes. Teachers receive dedicated accounts created by their Madrasa Administrator so they can record daily attendance, add remarks, and maintain student profiles.",
  },
  {
    q: "Can it be accessed on mobile phones?",
    a: "Yes. The web application is responsive and works across desktop computers, tablets, and mobile phone browsers without requiring separate software installation.",
  },
  {
    q: "How is institutional information protected?",
    a: "Access is governed by role-based permissions and institution-level data isolation enforced at the backend and database security rules level, ensuring users only access data authorized for their institution and role.",
  },
  {
    q: "How can a Madrasa register?",
    a: "You can contact our team by phone or WhatsApp on 8921202909 to schedule a demonstration and receive guided onboarding assistance, or explore the workspace signup flow with our team.",
  },
  {
    q: "Is a product demonstration available?",
    a: "Yes. We provide personal product demonstrations so committees, principals, and administrators can see how the platform works before adopting it.",
  },
  {
    q: "Which features are currently available?",
    a: "Daily attendance marking, class management, teacher accounts, student profiles, student self-service attendance viewing, basic attendance summaries, and multi-institution role management are available now. Parent communication, automated notifications, academic progress tracking, and downloadable report exports are planned future enhancements.",
  },
  {
    q: "How can we contact the team?",
    a: "You can reach our team directly by phone or WhatsApp at 8921202909 for demos, onboarding questions, or general information.",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 gap-4">
          <Link href="/" className="flex items-center gap-2.5 font-bold text-base sm:text-lg text-slate-900">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-700 text-white shadow-sm shrink-0">
              <ClipboardCheck className="h-5 w-5" />
            </span>
            <span className="leading-tight">Madrasa Management System</span>
          </Link>

          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-600">
            <a href="#about" className="hover:text-emerald-700 transition">About</a>
            <a href="#features" className="hover:text-emerald-700 transition">Features</a>
            <a href="#security" className="hover:text-emerald-700 transition">Security</a>
            <a href="#how-it-works" className="hover:text-emerald-700 transition">How It Works</a>
            <a href="#faq" className="hover:text-emerald-700 transition">FAQ</a>
            <a href="#contact" className="hover:text-emerald-700 transition">Contact</a>
          </nav>

          <div className="flex items-center gap-2.5">
            <Link
              href="/login"
              className="rounded-lg px-3.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 transition"
            >
              Sign In
            </Link>
            <a
              href="#contact"
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-800 transition"
            >
              Request a Free Demo
            </a>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* 1. HERO SECTION */}
        <section className="border-b border-slate-200 bg-gradient-to-b from-white to-slate-50">
          <div className="mx-auto max-w-6xl px-6 py-16 sm:py-24 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-xs font-semibold text-emerald-800 mb-6">
              <Building2 className="h-3.5 w-3.5" />
              Dedicated Multi-Institution SaaS for Madrasas
            </div>
            <h1 className="mx-auto max-w-4xl text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl leading-tight">
              Organized Daily Administration for Modern Madrasa Institutions
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base sm:text-lg text-slate-600 leading-relaxed">
              Replace scattered paper registers with a centralized, easy-to-use platform built
              specifically for Madrasas. Coordinate administrators and teachers effortlessly,
              maintain accurate student and attendance records, and access institutional
              activities from any desktop or mobile device.
            </p>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-3.5">
              <a
                href="#contact"
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-6 py-3.5 text-sm font-semibold text-white shadow-md hover:bg-emerald-800 transition"
              >
                Request a Free Demo
                <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href="tel:8921202909"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3.5 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50 transition"
              >
                <Phone className="h-4 w-4 text-emerald-700" />
                Contact Our Team
              </a>
              <a
                href="#features"
                className="inline-flex items-center gap-2 rounded-xl px-5 py-3.5 text-sm font-semibold text-emerald-800 hover:bg-emerald-50 transition"
              >
                Explore Features
              </a>
            </div>
          </div>
        </section>

        {/* 2. ABOUT THE PLATFORM */}
        <section id="about" className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                About the Platform
              </span>
              <h2 className="mt-2 text-3xl font-bold text-slate-900">
                Built Specifically for Madrasa Administration—Not a Generic School Tool
              </h2>
              <p className="mt-4 text-slate-600 leading-relaxed">
                Madrasa Management System was created to support Islamic educational
                institutions that need a practical, dependable way to manage daily
                operations without the complexity of oversized enterprise school software.
              </p>
              <p className="mt-3 text-slate-600 leading-relaxed">
                Many Madrasas still rely on handwritten registers and disconnected files to
                track attendance, student details, and class assignments. Our vision is to
                bring simple, accessible digital administration to every Madrasa—helping
                committees, principals, and teachers spend less time on paperwork and more
                time supporting students.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                {
                  title: "Purpose-Built Workflows",
                  desc: "Focused on the core daily realities of Madrasa classes, teachers, and student oversight.",
                },
                {
                  title: "Clear Coordination",
                  desc: "Connects Madrasa Administrators and teachers in one shared, structured workspace.",
                },
                {
                  title: "Simple & Accessible",
                  desc: "Designed so staff can adopt digital attendance and records without heavy training.",
                },
                {
                  title: "Multi-Institution Ready",
                  desc: "Supports individual Madrasas as well as organizations overseeing multiple branches.",
                },
              ].map((card) => (
                <div
                  key={card.title}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <h3 className="font-bold text-slate-900 text-sm">{card.title}</h3>
                  <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">{card.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 3. THE PROBLEMS WE SOLVE */}
        <section className="border-y border-slate-200 bg-white py-16 sm:py-20">
          <div className="mx-auto max-w-6xl px-6">
            <div className="max-w-2xl">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                The Problems We Solve
              </span>
              <h2 className="mt-2 text-3xl font-bold text-slate-900">
                Addressing Everyday Administrative Challenges in Madrasas
              </h2>
              <p className="mt-3 text-slate-600">
                A centralized digital workspace helps institutions move past manual bottlenecks
                and maintain clear, reliable records across every class.
              </p>
            </div>

            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {PROBLEMS.map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5"
                >
                  <h3 className="font-bold text-slate-900 text-sm">{item.title}</h3>
                  <p className="mt-2 text-xs text-slate-600 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 4. PLATFORM FEATURES */}
        <section id="features" className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              Platform Capabilities
            </span>
            <h2 className="mt-2 text-3xl font-bold text-slate-900">
              Transparent Overview of Available & Planned Features
            </h2>
            <p className="mt-3 text-slate-600 text-sm sm:text-base">
              We believe in complete clarity. Each module below clearly indicates what is
              currently available and what is planned for future releases.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {FEATURE_CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              return (
                <div
                  key={cat.code}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 shrink-0">
                        <Icon className="h-5 w-5" />
                      </span>
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                          Module {cat.code}
                        </span>
                        <h3 className="text-lg font-bold text-slate-900">{cat.title}</h3>
                      </div>
                    </div>
                    <span
                      className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold shrink-0 ${cat.statusStyle}`}
                    >
                      {cat.status}
                    </span>
                  </div>

                  <ul className="mt-4 space-y-2 text-sm text-slate-600">
                    {cat.items.map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </section>

        {/* 5. WHO CAN USE THIS PLATFORM? */}
        <section className="border-y border-slate-200 bg-white py-16 sm:py-20">
          <div className="mx-auto max-w-6xl px-6">
            <div className="text-center max-w-2xl mx-auto">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                Who Can Use This Platform?
              </span>
              <h2 className="mt-2 text-3xl font-bold text-slate-900">
                Tailored Value for Every Institutional Role
              </h2>
            </div>

            <div className="mt-10 grid gap-6 md:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
                <h3 className="text-lg font-bold text-slate-900">
                  Madrasa Management Committee
                </h3>
                <ul className="mt-4 space-y-2.5 text-sm text-slate-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Better institutional organization and record continuity</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Easier administrative oversight across classes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Access to clear institutional attendance summaries</span>
                  </li>
                </ul>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
                <h3 className="text-lg font-bold text-slate-900">Madrasa Administrators</h3>
                <ul className="mt-4 space-y-2.5 text-sm text-slate-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Centralized workspace for teachers, classes, and students</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Easier coordination of class schedules and assignments</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Organized, searchable institutional records</span>
                  </li>
                </ul>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
                <h3 className="text-lg font-bold text-slate-900">Teachers</h3>
                <ul className="mt-4 space-y-2.5 text-sm text-slate-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Convenient access to assigned classes from phone or desktop</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Simplified daily attendance marking with remarks</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Quick access to student profiles and attendance history</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* 6. KEY BENEFITS & 9. WHY CHOOSE OUR PLATFORM */}
        <section className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
          <div className="grid gap-10 lg:grid-cols-2">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                Key Benefits
              </span>
              <h2 className="mt-2 text-3xl font-bold text-slate-900">
                Practical Advantages for Daily Operations
              </h2>
              <div className="mt-6 grid gap-3 sm:grid-cols-2 text-sm">
                {[
                  "Less manual administrative work",
                  "Organized digital student & attendance records",
                  "Easier daily attendance management",
                  "Better coordination between staff",
                  "Clear role-based access control",
                  "Mobile-friendly web accessibility",
                  "Centralized institutional information",
                  "Designed specifically for Madrasas",
                  "A foundation that grows with your institution",
                ].map((benefit) => (
                  <div
                    key={benefit}
                    className="flex items-start gap-2 rounded-xl border border-slate-200 bg-white p-3.5"
                  >
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="text-slate-700 font-medium">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-7">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                Why Choose Our Platform
              </span>
              <h3 className="mt-2 text-2xl font-bold text-slate-900">
                Built for Trust, Simplicity & Long-Term Reliability
              </h3>
              <ul className="mt-5 space-y-3 text-sm text-slate-700">
                {[
                  "Dedicated focus on Madrasa institutions and Islamic educational administration",
                  "Simple, practical workflows that require minimal technical familiarity",
                  "Separate role-based experiences for Super Admin, Madrasa Admin, Teacher, and Student",
                  "Centralized institutional workspace with isolated records",
                  "Continuous, transparent product improvement",
                  "Scalable multi-institution SaaS architecture",
                  "Privacy-first design with responsible data access controls",
                ].map((point) => (
                  <li key={point} className="flex items-start gap-2.5">
                    <ShieldCheck className="h-4 w-4 text-emerald-700 shrink-0 mt-0.5" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* 7. SECURITY & PRIVACY */}
        <section id="security" className="border-y border-slate-200 bg-slate-900 text-white py-16 sm:py-20">
          <div className="mx-auto max-w-6xl px-6">
            <div className="max-w-2xl">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Security & Privacy
              </span>
              <h2 className="mt-2 text-3xl font-bold">
                Privacy-First Architecture Enforced at the Database Level
              </h2>
              <p className="mt-3 text-slate-300 text-sm sm:text-base">
                Institutional records are sensitive. Security is enforced through backend
                database rules—not just hidden buttons in the user interface.
              </p>
            </div>

            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  title: "Institution-Level Data Isolation",
                  desc: "Every Madrasa operates inside its own tenant boundary so records never leak across institutions.",
                },
                {
                  title: "Role-Based Access Control",
                  desc: "Permissions are strictly scoped to Super Admin, Madrasa Admin, Teacher, and Student roles.",
                },
                {
                  title: "Scoped Teacher & Admin Access",
                  desc: "Madrasa Administrators manage only their own institution, while Teachers access their institutional teaching and attendance duties.",
                },
                {
                  title: "Governed Super Admin Scope",
                  desc: "Super Admin access is focused on platform-level administration, institution metadata, and aggregate summaries.",
                },
                {
                  title: "Protected Student & Staff Records",
                  desc: "Student profiles and attendance logs are restricted to authorized staff and the individual student.",
                },
                {
                  title: "Backend Rules Enforcement",
                  desc: "Database security rules validate authentication, institution membership, and role permissions on every read and write.",
                },
              ].map((sec) => (
                <div
                  key={sec.title}
                  className="rounded-2xl border border-slate-800 bg-slate-800/60 p-5"
                >
                  <Lock className="h-5 w-5 text-emerald-400 mb-3" />
                  <h3 className="font-bold text-white text-sm">{sec.title}</h3>
                  <p className="mt-2 text-xs text-slate-300 leading-relaxed">{sec.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 8. HOW THE PLATFORM WORKS */}
        <section id="how-it-works" className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              How the Platform Works
            </span>
            <h2 className="mt-2 text-3xl font-bold text-slate-900">
              Guided Onboarding for Your Madrasa
            </h2>
            <p className="mt-3 text-slate-600 text-sm sm:text-base">
              We support each institution step by step from initial inquiry to daily use.
            </p>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                step: "01",
                title: "Contact Our Team",
                desc: "Reach out to our team by phone or WhatsApp to share your Madrasa's needs.",
              },
              {
                step: "02",
                title: "Request a Demonstration",
                desc: "See a live walkthrough of administrator, teacher, and student workflows.",
              },
              {
                step: "03",
                title: "Receive Onboarding Assistance",
                desc: "Our team assists your institution with setting up your dedicated workspace.",
              },
              {
                step: "04",
                title: "Create Authorized Accounts",
                desc: "Madrasa Administrator and teacher accounts are provisioned for your staff.",
              },
              {
                step: "05",
                title: "Role-Based Access",
                desc: "Administrators and teachers sign in to their respective management areas.",
              },
              {
                step: "06",
                title: "Gradual Adoption",
                desc: "Start with classes, student profiles, and daily attendance at your own pace.",
              },
            ].map((s) => (
              <div
                key={s.step}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <span className="inline-block rounded-lg bg-emerald-50 px-2.5 py-1 font-mono text-xs font-bold text-emerald-700">
                  Step {s.step}
                </span>
                <h3 className="mt-3 font-bold text-slate-900">{s.title}</h3>
                <p className="mt-1.5 text-sm text-slate-600">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 10. DEMO REQUEST */}
        <section className="border-y border-slate-200 bg-emerald-50/50 py-14">
          <div className="mx-auto max-w-5xl px-6 flex flex-col md:flex-row md:items-center md:justify-between gap-8">
            <div className="max-w-xl">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                Personal Product Demonstration
              </span>
              <h2 className="mt-2 text-2xl sm:text-3xl font-bold text-slate-900">
                See How the Platform Fits Your Madrasa Before You Decide
              </h2>
              <p className="mt-3 text-sm text-slate-600">
                During a personal demo, our team walks your committee or principal through:
              </p>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2 text-xs text-slate-700 font-medium">
                <li className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-emerald-700" />
                  How the platform works day-to-day
                </li>
                <li className="flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 text-emerald-700" />
                  How administrators manage records
                </li>
                <li className="flex items-center gap-1.5">
                  <UserCheck className="h-3.5 w-3.5 text-emerald-700" />
                  How teachers record attendance
                </li>
                <li className="flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5 text-emerald-700" />
                  Which modules are available today
                </li>
              </ul>
            </div>
            <div className="shrink-0">
              <a
                href="https://wa.me/8921202909"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-6 py-3.5 text-sm font-semibold text-white shadow-md hover:bg-emerald-800 transition"
              >
                <MessageCircle className="h-4 w-4" />
                Request a Demo
              </a>
            </div>
          </div>
        </section>

        {/* 11. FREQUENTLY ASKED QUESTIONS */}
        <section id="faq" className="mx-auto max-w-4xl px-6 py-16 sm:py-20">
          <div className="text-center mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              Frequently Asked Questions
            </span>
            <h2 className="mt-2 text-3xl font-bold text-slate-900">
              Clear Answers for Committees & Administrators
            </h2>
          </div>

          <div className="space-y-4">
            {FAQS.map((faq) => (
              <div
                key={faq.q}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <h3 className="flex items-start gap-2.5 font-bold text-slate-900 text-sm sm:text-base">
                  <HelpCircle className="h-5 w-5 text-emerald-700 shrink-0 mt-0.5" />
                  <span>{faq.q}</span>
                </h3>
                <p className="mt-2 pl-7 text-sm text-slate-600 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 12. CONTACT INFORMATION & 13. FINAL CALL TO ACTION */}
        <section id="contact" className="border-t border-slate-200 bg-emerald-900 text-white py-16">
          <div className="mx-auto max-w-5xl px-6 text-center space-y-6">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Step Into Organized, Reliable Administration for Your Madrasa
            </h2>
            <p className="mx-auto max-w-2xl text-emerald-100 text-sm sm:text-base leading-relaxed">
              Connect with our team to request a personal demonstration, ask about institutional
              onboarding, or learn how the platform can support your Madrasa&apos;s daily work.
            </p>

            <div className="inline-flex flex-col sm:flex-row items-center gap-3 rounded-2xl border border-emerald-700 bg-emerald-800/70 px-6 py-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-200">
                Official Phone / WhatsApp
              </span>
              <a
                href="tel:8921202909"
                className="text-2xl font-extrabold tracking-wide text-white hover:underline"
              >
                8921202909
              </a>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <a
                href="tel:8921202909"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-emerald-900 shadow-sm hover:bg-emerald-50 transition"
              >
                <Phone className="h-4 w-4" />
                Request a Demo
              </a>
              <a
                href="tel:8921202909"
                className="inline-flex items-center gap-2 rounded-xl border border-emerald-500 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-800 transition"
              >
                Contact Us
              </a>
              <a
                href="https://wa.me/8921202909"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-500 transition"
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp Us
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white py-6 text-xs text-slate-500">
        <div className="mx-auto flex flex-col sm:flex-row max-w-6xl items-center justify-between gap-3 px-6">
          <span>Madrasa Management System — Multi-Institution SaaS Platform</span>
          <span>Phone / WhatsApp: 8921202909</span>
        </div>
      </footer>
    </div>
  );
}
