'use client';

import { useState } from 'react';
import type { AdminSection } from '@/types/admin';
import AdminHeader from './AdminHeader';
import AdminSidebar from './AdminSidebar';
import AiUsageView from './views/AiUsageView';
import OverviewView from './views/OverviewView';
import RevenueView from './views/RevenueView';
import SubscriptionsView from './views/SubscriptionsView';
import SystemView from './views/SystemView';
import UsersView from './views/UsersView';

export default function AdminPanel() {
  const [section, setSection] = useState<AdminSection>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#F4F6F2] text-slate-700 antialiased">
      <AdminSidebar section={section} open={sidebarOpen} onChange={setSection} onClose={() => setSidebarOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminHeader section={section} onMenu={() => setSidebarOpen(true)} />
        <main className="w-full max-w-[1500px] flex-1 px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
          <div className="mb-5 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-xs leading-5 text-blue-800">
            <b>Frontend preview.</b> Data di halaman ini masih mock. RBAC admin server-side, payment webhook, dan agregasi usage belum diaktifkan.
          </div>
          {section === 'overview' && <OverviewView />}
          {section === 'users' && <UsersView />}
          {section === 'subscriptions' && <SubscriptionsView />}
          {section === 'revenue' && <RevenueView />}
          {section === 'ai' && <AiUsageView />}
          {section === 'system' && <SystemView />}
        </main>
      </div>
    </div>
  );
}
