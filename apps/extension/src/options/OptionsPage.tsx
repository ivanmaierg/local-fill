import React, { useState, useEffect, useRef } from 'react';
import { Button, Input, Label, useToast, Modal } from 'ui';
import { profileManager, storage } from 'lib';

interface Profile {
  id: string;
  name: string;
  data: any;
}

interface Settings {
  aiAssist: boolean;
  hotkey: string;
  allowlist: string[];
}

export const OptionsPage: React.FC = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [activeProfile, setActiveProfile] = useState<Profile | null>(null);
  const [settings, setSettings] = useState<Settings>({
    aiAssist: false,
    hotkey: 'Alt+A',
    allowlist: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importText, setImportText] = useState('');
  const [importName, setImportName] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addToast } = useToast();

  useEffect(() => {
    loadData();
    
    // Check for dark mode preference
    const checkDarkMode = () => {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDarkMode(prefersDark);
      
      // Apply dark mode to body
      if (prefersDark) {
        document.body.classList.add('dark-mode');
      } else {
        document.body.classList.remove('dark-mode');
      }
    };

    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleDarkModeChange = (e: MediaQueryListEvent) => {
      setIsDarkMode(e.matches);
      if (e.matches) {
        document.body.classList.add('dark-mode');
      } else {
        document.body.classList.remove('dark-mode');
      }
    };

    checkDarkMode();
    darkModeQuery.addEventListener('change', handleDarkModeChange);

    return () => {
      darkModeQuery.removeEventListener('change', handleDarkModeChange);
    };
  }, []);

  const loadData = async () => {
    try {
      // Load profiles and settings from storage
      const [allProfiles, activeProfileData, settingsData] = await Promise.all([
        storage.getAllProfiles(),
        storage.getActiveProfile(),
        storage.getSettings()
      ]);
      
      setProfiles(allProfiles);
      setActiveProfile(activeProfileData);
      setSettings(settingsData);
    } catch (error) {
      console.error('Error loading data:', error);
      addToast({
        title: 'Error',
        description: 'Failed to load data',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportProfile = () => {
    setShowImportModal(true);
  };

  const handleImportFromFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const result = await profileManager.importProfileFromFile(file);
      if (result.success) {
        addToast({
          title: 'Profile Imported',
          description: `Successfully imported "${result.profile.name}"`,
          type: 'success'
        });
        await loadData(); // Reload profiles
      } else {
        addToast({
          title: 'Import Failed',
          description: result.error,
          type: 'error'
        });
      }
    } catch (error) {
      addToast({
        title: 'Import Failed',
        description: 'An unexpected error occurred',
        type: 'error'
      });
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleImportFromText = async () => {
    if (!importText.trim()) {
      addToast({
        title: 'Import Failed',
        description: 'Please enter profile JSON',
        type: 'error'
      });
      return;
    }

    setIsImporting(true);
    try {
      const result = await profileManager.importProfile(importText, importName || undefined);
      if (result.success) {
        addToast({
          title: 'Profile Imported',
          description: `Successfully imported "${result.profile.name}"`,
          type: 'success'
        });
        setShowImportModal(false);
        setImportText('');
        setImportName('');
        await loadData(); // Reload profiles
      } else {
        addToast({
          title: 'Import Failed',
          description: result.error,
          type: 'error'
        });
      }
    } catch (error) {
      addToast({
        title: 'Import Failed',
        description: 'An unexpected error occurred',
        type: 'error'
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleExportProfile = async (profile: Profile) => {
    try {
      const result = await profileManager.exportProfile(profile.id);
      if (result.success) {
        // Create download link
        const blob = new Blob([result.data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = result.filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        addToast({
          title: 'Profile Exported',
          description: `Successfully exported "${profile.name}"`,
          type: 'success'
        });
      } else {
        addToast({
          title: 'Export Failed',
          description: result.error,
          type: 'error'
        });
      }
    } catch (error) {
      addToast({
        title: 'Export Failed',
        description: 'An unexpected error occurred',
        type: 'error'
      });
    }
  };

  const handleExportAllProfiles = async () => {
    try {
      const result = await profileManager.exportAllProfiles();
      if (result.success) {
        // Create download link
        const blob = new Blob([result.data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = result.filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        addToast({
          title: 'Profiles Exported',
          description: 'Successfully exported all profiles',
          type: 'success'
        });
      } else {
        addToast({
          title: 'Export Failed',
          description: result.error,
          type: 'error'
        });
      }
    } catch (error) {
      addToast({
        title: 'Export Failed',
        description: 'An unexpected error occurred',
        type: 'error'
      });
    }
  };

  const handleCopyPrompt = async () => {
    try {
      const result = await profileManager.copyLLMPromptToClipboard();
      if (result.success) {
        addToast({
          title: 'Prompt Copied',
          description: 'LLM prompt copied to clipboard',
          type: 'success'
        });
      } else {
        addToast({
          title: 'Copy Failed',
          description: result.error,
          type: 'error'
        });
      }
    } catch (error) {
      addToast({
        title: 'Copy Failed',
        description: 'An unexpected error occurred',
        type: 'error'
      });
    }
  };

  const handleSetActiveProfile = async (profile: Profile) => {
    try {
      await storage.setActiveProfile(profile.id);
      setActiveProfile(profile);
      addToast({
        title: 'Active Profile Updated',
        description: `"${profile.name}" is now the active profile`,
        type: 'success'
      });
    } catch (error) {
      addToast({
        title: 'Error',
        description: 'Failed to set active profile',
        type: 'error'
      });
    }
  };

  const handleDeleteProfile = async (profile: Profile) => {
    if (!confirm(`Are you sure you want to delete "${profile.name}"?`)) {
      return;
    }

    try {
      await storage.deleteProfile(profile.id);
      addToast({
        title: 'Profile Deleted',
        description: `"${profile.name}" has been deleted`,
        type: 'success'
      });
      
      // If this was the active profile, clear it
      if (activeProfile?.id === profile.id) {
        await storage.setActiveProfile(null);
        setActiveProfile(null);
      }
      
      await loadData(); // Reload profiles
    } catch (error) {
      addToast({
        title: 'Error',
        description: 'Failed to delete profile',
        type: 'error'
      });
    }
  };

  const handleCreateProfile = async () => {
    const name = prompt('Enter a name for the new profile:');
    if (!name?.trim()) return;

    try {
      const result = await profileManager.createProfile(name.trim());
      if (result.success) {
        addToast({
          title: 'Profile Created',
          description: `"${result.profile.name}" has been created`,
          type: 'success'
        });
        await loadData(); // Reload profiles
      } else {
        addToast({
          title: 'Error',
          description: result.error,
          type: 'error'
        });
      }
    } catch (error) {
      addToast({
        title: 'Error',
        description: 'Failed to create profile',
        type: 'error'
      });
    }
  };

  if (isLoading) {
    return (
      <div 
        className="w-full h-full flex items-center justify-center"
        style={{
          backgroundColor: isDarkMode ? '#111827' : '#f9fafb',
        }}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p 
            className="mt-3 text-sm font-medium"
            style={{ color: isDarkMode ? '#d1d5db' : '#6b7280' }}
          >
            Loading settings...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="w-full h-full overflow-y-auto"
      style={{
        backgroundColor: isDarkMode ? '#111827' : '#f9fafb',
      }}
    >
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        <header className="mb-8 text-center">
          <h1 
            className="text-xl sm:text-2xl font-bold mb-2"
            style={{ color: isDarkMode ? '#f9fafb' : '#111827' }}
          >
            Local-Fill Settings
          </h1>
          <p 
            className="text-sm max-w-2xl mx-auto px-4"
            style={{ color: isDarkMode ? '#d1d5db' : '#6b7280' }}
          >
            Manage your job application profiles and settings for automated form filling
          </p>
        </header>

        <div className="space-y-8">
          {/* Profiles Section */}
          <div 
            className="rounded-xl border shadow-sm"
            style={{
              backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
              borderColor: isDarkMode ? '#374151' : '#e5e7eb',
            }}
          >
            <div className="p-4 border-b" style={{ borderColor: isDarkMode ? '#374151' : '#e5e7eb' }}>
              <h2 
                className="text-lg font-semibold"
                style={{ color: isDarkMode ? '#f9fafb' : '#111827' }}
              >
                Profiles
              </h2>
            </div>
            <div className="p-4">
              {profiles.length === 0 ? (
                <div className="text-center py-6">
                  <p 
                    className="mb-4 text-sm"
                    style={{ color: isDarkMode ? '#9ca3af' : '#6b7280' }}
                  >
                    No profiles found
                  </p>
                  <div className="space-y-2">
                    <Button onClick={handleCreateProfile} size="sm" className="w-full">
                      Create Profile
                    </Button>
                    <Button onClick={handleImportProfile} variant="outline" size="sm" className="w-full">
                      Import Profile
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {profiles.map((profile) => (
                    <div
                      key={profile.id}
                      className={`p-3 border rounded-lg ${
                        activeProfile?.id === profile.id
                          ? 'border-blue-500'
                          : isDarkMode ? 'border-gray-600' : 'border-gray-200'
                      }`}
                      style={{
                        backgroundColor: activeProfile?.id === profile.id 
                          ? isDarkMode ? '#1e3a8a' : '#dbeafe'
                          : isDarkMode ? '#374151' : '#ffffff'
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 
                            className="font-medium text-sm truncate"
                            style={{ color: isDarkMode ? '#f9fafb' : '#111827' }}
                          >
                            {profile.name}
                          </h3>
                          <p 
                            className="text-xs truncate"
                            style={{ color: isDarkMode ? '#9ca3af' : '#6b7280' }}
                          >
                            ID: {profile.id}
                          </p>
                        </div>
                        <div className="flex space-x-2 ml-3">
                          <button
                            onClick={() => handleSetActiveProfile(profile)}
                            className={`text-xs px-3 py-1.5 rounded-md font-medium transition-colors ${
                              activeProfile?.id === profile.id 
                                ? 'bg-blue-600 text-white' 
                                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                            }`}
                            style={isDarkMode && activeProfile?.id !== profile.id ? {
                              backgroundColor: '#1e3a8a',
                              color: '#93c5fd'
                            } : {}}
                          >
                            {activeProfile?.id === profile.id ? 'Active' : 'Set Active'}
                          </button>
                          <button
                            onClick={() => handleExportProfile(profile)}
                            className="text-xs px-3 py-1.5 rounded-md font-medium transition-colors"
                            style={{
                              color: isDarkMode ? '#9ca3af' : '#6b7280',
                              backgroundColor: isDarkMode ? '#374151' : '#f3f4f6'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = isDarkMode ? '#4b5563' : '#e5e7eb';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = isDarkMode ? '#374151' : '#f3f4f6';
                            }}
                          >
                            Export
                          </button>
                          <button
                            onClick={() => handleDeleteProfile(profile)}
                            className="text-xs px-3 py-1.5 rounded-md font-medium transition-colors"
                            style={{
                              color: '#dc2626',
                              backgroundColor: '#fef2f2'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#fee2e2';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = '#fef2f2';
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="mt-8 pt-4 border-t" style={{ borderColor: isDarkMode ? '#374151' : '#e5e7eb' }}>
                <div className="flex flex-wrap gap-3 justify-center">
                  <Button onClick={handleCreateProfile} size="sm">
                    Create Profile
                  </Button>
                  <Button onClick={handleImportProfile} size="sm" variant="outline">
                    Import Profile
                  </Button>
                  <Button variant="secondary" onClick={handleCopyPrompt} size="sm">
                    Copy LLM Prompt
                  </Button>
                  {profiles.length > 0 && (
                    <Button variant="outline" onClick={handleExportAllProfiles} size="sm">
                      Export All
                    </Button>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json"
                    onChange={handleImportFromFile}
                    className="hidden"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Settings Section */}
          <div 
            className="rounded-xl border shadow-sm"
            style={{
              backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
              borderColor: isDarkMode ? '#374151' : '#e5e7eb',
            }}
          >
            <div className="p-4 border-b" style={{ borderColor: isDarkMode ? '#374151' : '#e5e7eb' }}>
              <h2 
                className="text-lg font-semibold"
                style={{ color: isDarkMode ? '#f9fafb' : '#111827' }}
              >
                Settings
              </h2>
            </div>
            <div className="p-4">
              <div className="space-y-4">
                <div>
                  <Label 
                    htmlFor="hotkey" 
                    className="text-sm font-medium block mb-2"
                    style={{ color: isDarkMode ? '#f9fafb' : '#111827' }}
                  >
                    Keyboard Shortcut
                  </Label>
                  <Input
                    id="hotkey"
                    type="text"
                    value={settings.hotkey}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSettings({ ...settings, hotkey: e.target.value })}
                    placeholder="e.g., Alt+A"
                    className="text-sm"
                  />
                </div>
                
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="aiAssist"
                    checked={settings.aiAssist}
                    onChange={(e) => setSettings({ ...settings, aiAssist: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <Label 
                    htmlFor="aiAssist" 
                    className="text-sm font-medium"
                    style={{ color: isDarkMode ? '#f9fafb' : '#111827' }}
                  >
                    Enable AI Assist (Chrome Built-in AI)
                  </Label>
                </div>
                
                <div>
                  <Label 
                    className="text-sm font-medium block mb-2"
                    style={{ color: isDarkMode ? '#f9fafb' : '#111827' }}
                  >
                    Allowed Domains
                  </Label>
                  <div className="space-y-2">
                    {settings.allowlist.map((domain, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Input
                          type="text"
                          value={domain}
                          readOnly
                          className="flex-1 text-sm"
                          style={{
                            backgroundColor: isDarkMode ? '#374151' : '#f9fafb',
                            borderColor: isDarkMode ? '#4b5563' : '#d1d5db'
                          }}
                        />
                        <Button variant="ghost" size="sm">
                          Remove
                        </Button>
                      </div>
                    ))}
                    <Button variant="ghost" size="sm">
                      Add Domain
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 pt-4 border-t" style={{ borderColor: isDarkMode ? '#374151' : '#e5e7eb' }}>
                <div className="flex justify-center">
                  <Button variant="secondary" size="sm">
                    Save Settings
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Import Modal */}
        <Modal
          isOpen={showImportModal}
          onClose={() => setShowImportModal(false)}
          title="Import Profile"
          size="md"
          isDarkMode={isDarkMode}
        >
          <div className="space-y-4">
            <div>
              <Label 
                htmlFor="import-name" 
                className="text-sm font-medium block mb-2"
                style={{ color: isDarkMode ? '#f9fafb' : '#111827' }}
              >
                Profile Name (Optional)
              </Label>
              <Input
                id="import-name"
                value={importName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setImportName(e.target.value)}
                placeholder="Enter a name for this profile"
                className="text-sm"
                isDarkMode={isDarkMode}
              />
            </div>
            
            <div>
              <Label 
                htmlFor="import-text" 
                className="text-sm font-medium block mb-2"
                style={{ color: isDarkMode ? '#f9fafb' : '#111827' }}
              >
                Profile JSON
              </Label>
              <textarea
                id="import-text"
                value={importText}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setImportText(e.target.value)}
                placeholder="Paste your profile JSON here..."
                className="w-full h-48 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-xs resize-none"
                style={{
                  backgroundColor: isDarkMode ? '#374151' : '#ffffff',
                  borderColor: isDarkMode ? '#4b5563' : '#d1d5db',
                  color: isDarkMode ? '#f9fafb' : '#111827'
                }}
              />
            </div>
            
            <div className="flex justify-end space-x-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setShowImportModal(false)}
                disabled={isImporting}
                size="sm"
              >
                Cancel
              </Button>
              <Button
                onClick={handleImportFromText}
                disabled={isImporting || !importText.trim()}
                size="sm"
              >
                {isImporting ? 'Importing...' : 'Import Profile'}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};
