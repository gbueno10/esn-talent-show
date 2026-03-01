import { createClient } from '@/lib/supabase/server'
import { isProjectAdmin, getProjectRole } from '@/lib/auth/permissions'
import Link from 'next/link'

const projectName = process.env.NEXT_PUBLIC_PROJECT_NAME || 'App'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isAdmin = await isProjectAdmin()
  const role = await getProjectRole()

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">{projectName}</h1>
                {isAdmin && (
                  <span className="text-xs font-medium text-[var(--secondary)]">Admin Mode</span>
                )}
              </div>
            </div>
            <form action="/auth/signout" method="POST">
              <button
                type="submit"
                className="text-sm text-slate-500 hover:text-slate-700 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Sign Out
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Banner - Different for Admin */}
        {isAdmin ? (
          <div className="bg-gradient-to-r from-[var(--secondary)] to-[var(--primary)] rounded-2xl p-6 mb-8 text-white">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span className="text-sm font-semibold uppercase tracking-wider text-white/80">Admin Dashboard</span>
                </div>
                <h2 className="text-2xl font-bold">
                  Welcome back, Admin!
                </h2>
                <p className="text-white/80 mt-1">
                  You have full access to manage {projectName}
                </p>
              </div>
              <div className="hidden sm:block">
                <div className="w-20 h-20 rounded-2xl bg-white/10 flex items-center justify-center">
                  <svg className="w-10 h-10 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="gradient-primary rounded-2xl p-6 mb-8 text-white">
            <h2 className="text-2xl font-bold mb-2">
              Welcome back!
            </h2>
            <p className="text-white/80">
              You&apos;re signed in as {user?.email}
            </p>
          </div>
        )}

        {/* Admin Stats Row */}
        {isAdmin && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
              <div className="text-2xl font-bold text-slate-900">128</div>
              <div className="text-sm text-slate-500">Total Users</div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
              <div className="text-2xl font-bold text-[var(--accent)]">45</div>
              <div className="text-sm text-slate-500">Active Today</div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
              <div className="text-2xl font-bold text-[var(--primary)]">12</div>
              <div className="text-sm text-slate-500">Events</div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
              <div className="text-2xl font-bold text-[var(--secondary)]">89%</div>
              <div className="text-sm text-slate-500">Match Rate</div>
            </div>
          </div>
        )}

        {/* Cards Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* User Info Card */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-[var(--primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-slate-900">Your Account</h2>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Email</span>
                <span className="text-slate-900 font-medium truncate ml-2">{user?.email}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">User ID</span>
                <code className="text-xs bg-slate-100 px-2 py-1 rounded-lg text-slate-600">
                  {user?.id?.slice(0, 8)}...
                </code>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Role</span>
                <span
                  className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${
                    isAdmin
                      ? 'bg-[var(--secondary)]/10 text-[var(--secondary)]'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {isAdmin ? 'Admin' : role || 'User'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions Card - Different for Admin */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isAdmin ? 'bg-[var(--secondary)]/10' : 'bg-[var(--accent)]/10'}`}>
                <svg className={`w-5 h-5 ${isAdmin ? 'text-[var(--secondary)]' : 'text-[var(--accent)]'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-slate-900">
                {isAdmin ? 'Admin Actions' : 'Quick Actions'}
              </h2>
            </div>
            <div className="space-y-2">
              {isAdmin ? (
                <>
                  <button className="w-full text-left px-4 py-3 text-sm bg-[var(--secondary)]/5 hover:bg-[var(--secondary)]/10 rounded-xl transition-colors text-[var(--secondary)] font-medium flex items-center gap-3">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    Manage Users
                  </button>
                  <button className="w-full text-left px-4 py-3 text-sm bg-[var(--secondary)]/5 hover:bg-[var(--secondary)]/10 rounded-xl transition-colors text-[var(--secondary)] font-medium flex items-center gap-3">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Manage Events
                  </button>
                  <button className="w-full text-left px-4 py-3 text-sm bg-[var(--secondary)]/5 hover:bg-[var(--secondary)]/10 rounded-xl transition-colors text-[var(--secondary)] font-medium flex items-center gap-3">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    View Analytics
                  </button>
                  <button className="w-full text-left px-4 py-3 text-sm bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors text-slate-700 font-medium flex items-center gap-3">
                    <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Settings
                  </button>
                </>
              ) : (
                <>
                  <button className="w-full text-left px-4 py-3 text-sm bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors text-slate-700 font-medium flex items-center gap-3">
                    <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Edit Profile
                  </button>
                  <button className="w-full text-left px-4 py-3 text-sm bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors text-slate-700 font-medium flex items-center gap-3">
                    <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    My Matches
                  </button>
                  <button className="w-full text-left px-4 py-3 text-sm bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors text-slate-700 font-medium flex items-center gap-3">
                    <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Upcoming Events
                  </button>
                  <button className="w-full text-left px-4 py-3 text-sm bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors text-slate-700 font-medium flex items-center gap-3">
                    <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Settings
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Info Card - Different for Admin */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[var(--warning)]/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-[var(--warning)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-slate-900">
                {isAdmin ? 'Admin Tips' : 'Getting Started'}
              </h2>
            </div>
            {isAdmin ? (
              <div className="space-y-3">
                <p className="text-sm text-slate-600 leading-relaxed">
                  As an admin, you can manage users, create events, and view analytics for {projectName}.
                </p>
                <ul className="text-sm text-slate-500 space-y-2">
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-[var(--accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Manage user access & roles
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-[var(--accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Create and manage events
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-[var(--accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    View detailed analytics
                  </li>
                </ul>
              </div>
            ) : (
              <>
                <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                  Welcome to {projectName}! Complete your profile to get started and discover matches.
                </p>
                <Link
                  href="#"
                  className="inline-flex items-center gap-2 text-sm text-[var(--primary)] hover:underline font-medium"
                >
                  Complete your profile
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Admin-only: Recent Activity */}
        {isAdmin && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Recent Activity</h3>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="divide-y divide-slate-100">
                {[
                  { action: 'New user registered', user: 'maria@example.com', time: '2 min ago', icon: '👤' },
                  { action: 'Event created', user: 'Speed Dating Night', time: '1 hour ago', icon: '📅' },
                  { action: 'Match made', user: '2 users matched', time: '3 hours ago', icon: '💕' },
                  { action: 'User updated profile', user: 'john@example.com', time: '5 hours ago', icon: '✏️' },
                ].map((activity, i) => (
                  <div key={i} className="px-6 py-4 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                    <span className="text-2xl">{activity.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900">{activity.action}</p>
                      <p className="text-sm text-slate-500 truncate">{activity.user}</p>
                    </div>
                    <span className="text-xs text-slate-400 whitespace-nowrap">{activity.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
