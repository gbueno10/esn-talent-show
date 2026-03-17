import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { isProjectAdmin } from '@/lib/auth/permissions'

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get user role for the nav
  const isAdmin = await isProjectAdmin()

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="font-semibold text-lg">
                {process.env.NEXT_PUBLIC_PROJECT_NAME || 'My App'}
              </span>
            </div>

            <div className="flex items-center gap-4">
              {isAdmin && (
                <a
                  href="/talent-admin"
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Talent Admin
                </a>
              )}
              <span className="text-sm text-gray-600">{user.email}</span>
              <form action="/auth/signout" method="post">
                <button
                  type="submit"
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  Sign out
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main>{children}</main>
    </div>
  )
}
