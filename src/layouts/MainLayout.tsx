import { Outlet } from 'react-router-dom'
import Header from '../components/Header'
import Sidebar from '../components/Sidebar'

export default function MainLayout() {
  return (
    <div className="flex min-h-screen overflow-x-hidden bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <Sidebar />
      <div className="flex min-h-screen w-full flex-col md:ml-72">
        <Header />
        <main className="flex-1 overflow-y-auto overflow-x-hidden px-4 pb-10 pt-20 sm:px-6 sm:pt-24 lg:px-10 lg:pt-28">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
