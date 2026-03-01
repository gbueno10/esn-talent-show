import { createClient } from '@/lib/supabase/server'
import { isProjectAdmin, getProjectRole } from '@/lib/auth/permissions'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isAdmin = await isProjectAdmin()
  const role = await getProjectRole()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* User Info Card */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <h2 className="text-lg font-semibold mb-4">Your Account</h2>
          <div className="space-y-2 text-sm">
            <p>
              <span className="text-gray-500">Email:</span> {user?.email}
            </p>
            <p>
              <span className="text-gray-500">User ID:</span>{' '}
              <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">
                {user?.id?.slice(0, 8)}...
              </code>
            </p>
            <p>
              <span className="text-gray-500">Project Role:</span>{' '}
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                  isAdmin
                    ? 'bg-purple-100 text-purple-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {role}
              </span>
            </p>
          </div>
        </div>

        {/* Quick Actions Card */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-2">
            <button className="w-full text-left px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 rounded transition-colors">
              View Profile
            </button>
            <button className="w-full text-left px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 rounded transition-colors">
              Settings
            </button>
            {isAdmin && (
              <button className="w-full text-left px-3 py-2 text-sm bg-purple-50 hover:bg-purple-100 text-purple-700 rounded transition-colors">
                Admin Panel
              </button>
            )}
          </div>
        </div>

        {/* Getting Started Card */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <h2 className="text-lg font-semibold mb-4">Getting Started</h2>
          <p className="text-sm text-gray-600 mb-4">
            This is your project dashboard. Start building by editing the pages
            in the <code className="bg-gray-100 px-1 py-0.5 rounded">app/</code>{' '}
            directory.
          </p>
          <a
            href="https://nextjs.org/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:underline"
          >
            Next.js Documentation →
          </a>
        </div>
      </div>
    </div>
  )
}
