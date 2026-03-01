import Link from 'next/link'

const projectName = process.env.NEXT_PUBLIC_PROJECT_NAME || 'this application'

export default function UnauthorizedPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-4">🚫</div>
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p className="text-gray-600 mb-6">
          You don&apos;t have permission to access {projectName}. If you believe this is
          an error, please contact an administrator.
        </p>
        <Link
          href="/"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-block"
        >
          Go Home
        </Link>
      </div>
    </main>
  )
}
