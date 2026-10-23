/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { ChatAssistantView } from './components/ChatAssistantView';
import { DocumentBuilderView } from './components/DocumentBuilderView';
import { KnowledgeSearchView } from './components/KnowledgeSearchView';
import { TasksView } from './components/TasksView';
import { AuditLogView } from './components/AuditLogView';
import { ProfileSettingsView } from './components/ProfileSettingsView';
import { LegalAdvisorView } from './components/LegalAdvisorView';
import { CitizenAppealsView } from './components/CitizenAppealsView';
import { AnalyticsView } from './components/AnalyticsView';
import { TrainingExamView } from './components/TrainingExamView';
import { VoiceDictationModal } from './components/VoiceDictationModal';
import { LoginView } from './components/LoginView';
import { EPatrolSearchView } from './components/EPatrolSearchView';
import { CrimeMapView } from './components/CrimeMapView';
import { ProtectionOrderView } from './components/ProtectionOrderView';
import { User, DashboardStats, UserSettings, DocumentItem } from './types';
import { Menu } from 'lucide-react';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('iiv_auth_token') === 'true';
  });
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [voiceModalOpen, setVoiceModalOpen] = useState<boolean>(false);

  // Cross-view state transfer
  const [chatInitialPrompt, setChatInitialPrompt] = useState<string>('');
  const [incomingDraftText, setIncomingDraftText] = useState<string | null>(null);
  const [incomingDraftTitle, setIncomingDraftTitle] = useState<string | null>(null);
  const [selectedDocForEditor, setSelectedDocForEditor] = useState<DocumentItem | null>(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const handleLoginSuccess = (user: User, method: string) => {
    sessionStorage.setItem('iiv_auth_token', 'true');
    sessionStorage.setItem('iiv_auth_user', user.id);
    setCurrentUser(user);
    setIsAuthenticated(true);
    fetchStats();
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      console.error('Logout error:', err);
    }
    sessionStorage.removeItem('iiv_auth_token');
    sessionStorage.removeItem('iiv_auth_user');
    setIsAuthenticated(false);
  };

  const fetchInitialData = async () => {
    try {
      // 1. Current user
      const userRes = await fetch('/api/auth/me');
      if (userRes.ok) {
        const data = await userRes.json();
        setCurrentUser(data.user);
        setSettings(data.settings);
      }

      // 2. All users for switcher
      const usersRes = await fetch('/api/auth/users');
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setAllUsers(usersData);
      }

      // 3. Stats
      fetchStats();
    } catch (err) {
      console.error('Initialization error:', err);
    }
  };

  const fetchStats = async () => {
    try {
      const statsRes = await fetch('/api/dashboard/stats', {
        headers: { 'x-user-id': currentUser?.id || '' },
      });
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }
    } catch (err) {
      console.error('Stats fetch error:', err);
    }
  };

  const handleSwitchUser = async (userId: string) => {
    try {
      const res = await fetch('/api/auth/switch-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
        setSettings(data.settings);
        fetchStats();
      }
    } catch (err) {
      console.error('Switch user error:', err);
    }
  };

  const handleQuickAiPrompt = (prompt: string) => {
    setChatInitialPrompt(prompt);
    setCurrentView('chat');
  };

  const handleSendToDocumentBuilder = (text: string, title?: string) => {
    setIncomingDraftText(text);
    setIncomingDraftTitle(title || 'Yangi xizmat xati');
    setSelectedDocForEditor(null);
    setCurrentView('documents');
  };

  const handleOpenDocument = (doc: DocumentItem) => {
    setSelectedDocForEditor(doc);
    setIncomingDraftText(null);
    setCurrentView('documents');
  };

  const handleUpdateSettings = async (newSettings: Partial<UserSettings>) => {
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser?.id || '',
        },
        body: JSON.stringify(newSettings),
      });
      if (res.ok) {
        const updated = await res.json();
        setSettings(updated);
      }
    } catch (err) {
      console.error('Update settings error:', err);
    }
  };

  // If not authenticated, render Institutional Login Gateway
  if (!isAuthenticated) {
    return (
      <LoginView
        allUsers={
          allUsers.length > 0
            ? allUsers
            : [
                {
                  id: 'usr-2',
                  badgeNumber: 'IIV-77241',
                  fullName: 'Karimov Sardor Baxtiyorovich',
                  rank: 'Katta leytenant',
                  role: 'xodim',
                  department: 'Huquqbuzarliklar profilaktikasi boshqarmasi',
                  email: 's.karimov@iiv.gov.uz',
                  avatar: 'SK',
                  status: 'faol',
                },
                {
                  id: 'usr-1',
                  badgeNumber: 'IIV-04892',
                  fullName: 'Rustamov Alisher Xamidovich',
                  rank: 'Mayor',
                  role: 'rahbar',
                  department: 'Toshkent shahar IIBB',
                  email: 'a.rustamov@iiv.gov.uz',
                  avatar: 'AR',
                  status: 'faol',
                },
                {
                  id: 'usr-3',
                  badgeNumber: 'IIV-91304',
                  fullName: 'Saidov Jasur Shavkatovich',
                  rank: 'Leytenant',
                  role: 'admin',
                  department: 'Axborot texnologiyalari va aloqa bo‘limi',
                  email: 'j.saidov@iiv.gov.uz',
                  avatar: 'JS',
                  status: 'faol',
                },
              ]
        }
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        currentUser={currentUser}
        allUsers={allUsers}
        onSwitchUser={handleSwitchUser}
        pendingReviewsCount={stats?.reviewDocuments || 0}
        urgentTasksCount={stats?.overdueTasks || stats?.pendingTasks || 0}
        onNavigate={(view) => setCurrentView(view)}
        onLogout={handleLogout}
      />

      {/* Mobile Menu Toggle Bar */}
      <div className="lg:hidden bg-slate-900 border-b border-slate-800 px-4 py-2 flex items-center justify-between">
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="flex items-center space-x-2 text-xs font-semibold text-slate-300 hover:text-white p-1 rounded"
        >
          <Menu className="w-4 h-4 text-sky-400" />
          <span>Menyu</span>
        </button>
        <span className="text-[11px] text-slate-400 font-mono">
          {currentUser?.rank} {currentUser?.fullName.split(' ')[0]}
        </span>
      </div>

      {/* Main Workspace */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar
          currentView={currentView}
          onNavigate={(view) => {
            setCurrentView(view);
            if (view !== 'documents') {
              setIncomingDraftText(null);
              setSelectedDocForEditor(null);
            }
          }}
          currentUser={currentUser}
          tasksCount={stats?.pendingTasks || 0}
          docsCount={stats?.totalDocuments || 0}
          mobileOpen={mobileMenuOpen}
          onCloseMobile={() => setMobileMenuOpen(false)}
          onOpenVoiceModal={() => setVoiceModalOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 overflow-y-auto">
          {currentView === 'dashboard' && (
            <DashboardView
              currentUser={currentUser}
              stats={stats}
              onNavigate={(view) => setCurrentView(view)}
              onQuickAiPrompt={handleQuickAiPrompt}
              onOpenDocument={handleOpenDocument}
              onOpenVoiceModal={() => setVoiceModalOpen(true)}
            />
          )}

          {currentView === 'chat' && (
            <ChatAssistantView
              currentUser={currentUser}
              onSendToDocumentBuilder={handleSendToDocumentBuilder}
              initialPrompt={chatInitialPrompt}
            />
          )}

          {currentView === 'epatrol' && (
            <EPatrolSearchView
              currentUser={currentUser}
              onSendToDocumentBuilder={handleSendToDocumentBuilder}
            />
          )}

          {currentView === 'crimemap' && (
            <CrimeMapView
              currentUser={currentUser}
              onSendToDocumentBuilder={handleSendToDocumentBuilder}
            />
          )}

          {currentView === 'protection' && (
            <ProtectionOrderView
              currentUser={currentUser}
              onSendToDocumentBuilder={handleSendToDocumentBuilder}
            />
          )}

          {currentView === 'documents' && (
            <DocumentBuilderView
              currentUser={currentUser}
              onRefreshDashboard={fetchStats}
              incomingDraftText={incomingDraftText}
              incomingDraftTitle={incomingDraftTitle}
              initialSelectedDoc={selectedDocForEditor}
            />
          )}

          {currentView === 'legal' && (
            <LegalAdvisorView
              currentUser={currentUser}
              onSendToDocumentBuilder={handleSendToDocumentBuilder}
            />
          )}

          {currentView === 'appeals' && (
            <CitizenAppealsView
              currentUser={currentUser}
              onSendToDocumentBuilder={handleSendToDocumentBuilder}
            />
          )}

          {currentView === 'analytics' && (
            <AnalyticsView currentUser={currentUser} />
          )}

          {currentView === 'training' && (
            <TrainingExamView currentUser={currentUser} />
          )}

          {currentView === 'knowledge' && (
            <KnowledgeSearchView currentUser={currentUser} />
          )}

          {currentView === 'tasks' && (
            <TasksView
              currentUser={currentUser}
              allUsers={allUsers}
              onRefreshDashboard={fetchStats}
            />
          )}

          {currentView === 'audit' && (
            <AuditLogView currentUser={currentUser} />
          )}

          {currentView === 'settings' && (
            <ProfileSettingsView
              currentUser={currentUser}
              settings={settings}
              onUpdateSettings={handleUpdateSettings}
              onSwitchUser={handleSwitchUser}
              onLogout={handleLogout}
            />
          )}
        </main>
      </div>

      {/* Voice Dictation Modal */}
      <VoiceDictationModal
        isOpen={voiceModalOpen}
        onClose={() => setVoiceModalOpen(false)}
        currentUser={currentUser}
        onSendToDocumentBuilder={handleSendToDocumentBuilder}
      />
    </div>
  );
}
