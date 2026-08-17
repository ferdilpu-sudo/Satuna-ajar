'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import DashboardView from '@/components/DashboardView';
import WizardForm from '@/components/WizardForm';
import RPPDetailView from '@/components/RPPDetailView';
import HistoryView from '@/components/HistoryView';
import TemplateView from '@/components/TemplateView';
import SettingsView from '@/components/SettingsView';
import GenerationProgressModal from '@/components/GenerationProgressModal';
import RPPEditorModal from '@/components/RPPEditorModal';

import { 
  RPPData, 
  MaterialAnalysis, 
  SchoolIdentity, 
  LearningSettings, 
  SelectedDimension, 
  OutputConfig 
} from '@/types/rpp';
import { 
  getSavedRPPs, 
  saveRPP, 
  deleteRPP, 
  duplicateRPP, 
  getUserSettings,
  INITIAL_SAMPLE_RPPS,
  DEFAULT_USER_SETTINGS,
  UserSettings
} from '@/lib/storage';

export default function Home() {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [rppList, setRppList] = useState<RPPData[]>(INITIAL_SAMPLE_RPPS);
  const [userSettings, setUserSettings] = useState<UserSettings>(DEFAULT_USER_SETTINGS);
  const [activeRPP, setActiveRPP] = useState<RPPData | null>(null);

  // Preset template model if user clicks a template
  const [presetTemplateModel, setPresetTemplateModel] = useState<string | undefined>(undefined);

  // Generation Modal State
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [isGenerationQuota, setIsGenerationQuota] = useState<boolean>(false);
  const [generationErrorCode, setGenerationErrorCode] = useState<string | null>(null);
  const [lastGenerationPayload, setLastGenerationPayload] = useState<any>(null);

  // Editing Modal State
  const [isEditingModalOpen, setIsEditingModalOpen] = useState<boolean>(false);
  const [editingRPP, setEditingRPP] = useState<RPPData | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setRppList(getSavedRPPs());
      setUserSettings(getUserSettings());
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const handleSaveRPP = (rpp: RPPData) => {
    const updatedList = saveRPP(rpp);
    setRppList(updatedList);
  };

  const handleDeleteRPP = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus dokumen ini?')) {
      const updatedList = deleteRPP(id);
      setRppList(updatedList);
      if (activeRPP?.id === id) {
        setActiveRPP(null);
        setCurrentTab('dashboard');
      }
    }
  };

  const handleDuplicateRPP = (id: string) => {
    const updatedList = duplicateRPP(id);
    setRppList(updatedList);
  };

  const handleViewRPP = (rpp: RPPData) => {
    setActiveRPP(rpp);
    setCurrentTab('detail');
  };

  const handleEditRPP = (rpp: RPPData) => {
    setEditingRPP(rpp);
    setIsEditingModalOpen(true);
  };

  const handleUseTemplate = (modelName: string) => {
    setPresetTemplateModel(modelName);
    setCurrentTab('create');
  };

  // Execute Generate RPP API Call
  const handleGenerateSubmit = async (payload: {
    materialAnalysis: MaterialAnalysis;
    identity: SchoolIdentity;
    settings: LearningSettings;
    selectedDimensions: SelectedDimension[];
    outputConfig: OutputConfig;
    sourceFiles: string[];
  }) => {
    setIsGenerating(true);
    setGenerationError(null);
    setIsGenerationQuota(false);
    setGenerationErrorCode(null);
    setLastGenerationPayload(payload);

    try {
      const res = await fetch('/api/gemini/generate-rpp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setGenerationErrorCode(typeof data.code === 'string' ? data.code : null);
        setIsGenerationQuota(Boolean((data.isQuota || res.status === 429) && data.code !== 'TRIAL_EXHAUSTED'));
        throw new Error(data.error || 'Gagal membuat perangkat pembelajaran. Silakan coba kembali.');
      }

      if (data.rppData) {
        const generated: RPPData = data.rppData;
        handleSaveRPP(generated);
        setActiveRPP(generated);
        setCurrentTab('detail');
        setIsGenerating(false);
      }
    } catch (err: any) {
      setGenerationError(err.message || 'Gagal membuat perangkat pembelajaran. Silakan coba kembali.');
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F6F2] text-slate-700 flex antialiased font-sans">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onTabChange={(tab) => {
          setCurrentTab(tab);
          if (tab === 'create') setPresetTemplateModel(undefined);
        }}
        isOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          currentTab={currentTab}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          onNewRPPClick={() => {
            setPresetTemplateModel(undefined);
            setCurrentTab('create');
          }}
          onOpenSettings={() => setCurrentTab('settings')}
          teacherName={userSettings.defaultTeacherName}
          schoolName={userSettings.defaultSchoolName}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1500px] w-full mx-auto">
          {currentTab === 'dashboard' && (
            <DashboardView
              rppList={rppList}
              onNewRPPClick={() => {
                setPresetTemplateModel(undefined);
                setCurrentTab('create');
              }}
              onViewRPP={handleViewRPP}
              onEditRPP={handleEditRPP}
              onDuplicateRPP={handleDuplicateRPP}
              onDeleteRPP={handleDeleteRPP}
              teacherName={userSettings.defaultTeacherName}
              onOpenHistory={() => setCurrentTab('history')}
            />
          )}

          {currentTab === 'create' && (
            <WizardForm
              onGenerateSubmit={handleGenerateSubmit}
              presetTemplateModel={presetTemplateModel}
            />
          )}

          {currentTab === 'detail' && activeRPP && (
            <RPPDetailView
              rppData={activeRPP}
              onBack={() => setCurrentTab('dashboard')}
              onSave={handleSaveRPP}
            />
          )}

          {currentTab === 'history' && (
            <HistoryView
              rppList={rppList}
              onViewRPP={handleViewRPP}
              onEditRPP={handleEditRPP}
              onDuplicateRPP={handleDuplicateRPP}
              onDeleteRPP={handleDeleteRPP}
              onNewRPPClick={() => {
                setPresetTemplateModel(undefined);
                setCurrentTab('create');
              }}
            />
          )}

          {currentTab === 'template' && (
            <TemplateView onUseTemplate={handleUseTemplate} />
          )}

          {currentTab === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* Generation Progress Modal */}
      <GenerationProgressModal
        isOpen={isGenerating}
        error={generationError}
        isQuota={isGenerationQuota}
        errorCode={generationErrorCode}
        onRetry={lastGenerationPayload ? () => handleGenerateSubmit(lastGenerationPayload) : undefined}
        onClose={() => {
          setIsGenerating(false);
          setGenerationError(null);
          setIsGenerationQuota(false);
          setGenerationErrorCode(null);
        }}
      />

      {/* RPP Editor Modal */}
      {editingRPP && (
        <RPPEditorModal
          rpp={editingRPP}
          isOpen={isEditingModalOpen}
          onClose={() => setIsEditingModalOpen(false)}
          onSaveRPP={(updated) => {
            handleSaveRPP(updated);
            if (activeRPP?.id === updated.id) {
              setActiveRPP(updated);
            }
          }}
        />
      )}
    </div>
  );
}
