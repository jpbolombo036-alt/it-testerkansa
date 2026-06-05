import { useEffect, useState } from 'react'
import { fetchUsers } from '../../api/userApi'
import { User } from '../../types/user'

function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUsers()
      .then(setUsers)
      .finally(() => setLoading(false))
  }, [])

  return (
    <section className="space-y-6">
      <div className="rounded-[2rem] bg-white p-4 shadow-sm transition-colors duration-300 dark:bg-slate-900 sm:p-6">
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100 sm:text-2xl">Utilisateurs</h1>
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 sm:text-sm">Tous les profils utilisateurs liés aux accès IT.</p>
      </div>

      <div className="rounded-[2rem] bg-white p-4 shadow-sm transition-colors duration-300 dark:bg-slate-900 sm:p-6">
        {loading ? (
          <p className="text-sm text-slate-500">Chargement des utilisateurs…</p>
        ) : (
          <div className="space-y-4">
            {users.map((user) => (
              <div key={user.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-3 transition-colors duration-300 dark:border-slate-800 dark:bg-slate-800 sm:p-4">
                <p className="font-semibold text-sm text-slate-900 dark:text-slate-100">{user.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 sm:text-sm">{user.email}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default UsersPage
