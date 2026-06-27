import { Outlet } from 'react-router-dom'
import { useState } from 'react'
import Header from '../components/Header'
import Sidebar from '../components/Sidebar'

export default function MainLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  return (
    <div className="flex min-h-screen overflow-x-hidden bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(c => !c)} />
      <div className={`flex min-h-screen w-full flex-col transition-all duration-300 ${sidebarCollapsed ? 'md:ml-16' : 'md:ml-72'}`}>
        <Header sidebarCollapsed={sidebarCollapsed} onToggleSidebar={() => setSidebarCollapsed(c => !c)} />
        <main className="flex-1 overflow-y-auto overflow-x-hidden hide-scrollbar px-4 pb-10 pt-20 sm:px-6 lg:px-10">{/* pt-20 = hauteur header */}
          <Outlet />
        </main>
      </div>
    </div>
  )
}
