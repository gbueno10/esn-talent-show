import Link from 'next/link'

const projectName = process.env.NEXT_PUBLIC_PROJECT_NAME || 'My App'

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-[-20%] right-[-10%] w-96 h-96 bg-[var(--primary)]/10 rounded-full blur-3xl" />
      <div className="absolute bottom-[-20%] left-[-10%] w-96 h-96 bg-[var(--secondary)]/10 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[var(--accent)]/5 rounded-full blur-3xl" />

      <div className="text-center z-10 max-w-2xl">
        {/* Logo */}
        <div className="w-20 h-20 mx-auto mb-8 rounded-2xl gradient-primary flex items-center justify-center shadow-2xl shadow-[var(--primary)]/30">
          <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>

        {/* Title */}
        <h1 className="text-5xl font-bold mb-4 text-slate-900">
          {projectName}
        </h1>
        <p className="text-xl text-slate-500 mb-10 leading-relaxed">
          Welcome to your new project. Built with Next.js and Supabase for speed and scalability.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/login"
            className="px-8 py-4 gradient-primary text-white font-semibold rounded-xl hover:opacity-90 transition-all shadow-lg shadow-[var(--primary)]/30 flex items-center justify-center gap-2"
          >
            Get Started
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
          <Link
            href="/dashboard"
            className="px-8 py-4 bg-white border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-all shadow-sm flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            Dashboard
          </Link>
        </div>

        {/* Features Grid */}
        <div className="mt-20 grid sm:grid-cols-3 gap-6 text-left">
          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center mb-4">
              <svg className="w-5 h-5 text-[var(--primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="font-semibold text-slate-900 mb-2">Secure Auth</h3>
            <p className="text-sm text-slate-500">Built-in authentication with Supabase Auth.</p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-[var(--secondary)]/10 flex items-center justify-center mb-4">
              <svg className="w-5 h-5 text-[var(--secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
              </svg>
            </div>
            <h3 className="font-semibold text-slate-900 mb-2">Schema Isolation</h3>
            <p className="text-sm text-slate-500">Your data in its own PostgreSQL schema.</p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-[var(--accent)]/10 flex items-center justify-center mb-4">
              <svg className="w-5 h-5 text-[var(--accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="font-semibold text-slate-900 mb-2">Fast & Modern</h3>
            <p className="text-sm text-slate-500">Next.js 15 with App Router and Turbopack.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
