import { redirect } from 'next/navigation'
import { isProjectAdmin } from '@/lib/auth/permissions'
import TalentAdminPanel from './components/TalentAdminPanel'

export default async function TalentAdminPage() {
  const isAdmin = await isProjectAdmin()

  if (!isAdmin) {
    redirect('/unauthorized')
  }

  return <TalentAdminPanel />
}
