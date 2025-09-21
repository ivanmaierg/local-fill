import React, { useState, useEffect, useRef } from 'react';
import { Button, Card, CardContent, CardHeader, Input, Select, Label, useToast, Modal } from 'ui';
import { profileManager, ProfileImportResult, storage } from 'lib';

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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addToast } = useToast();

  useEffect(() => {
    loadData();
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
      <div className="w-full h-full bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-gray-50 overflow-y-auto">
      <div className="max-w-full mx-auto p-4">
        <header className="mb-4">
          <h1 className="text-lg font-bold text-gray-900">Local-Fill Settings</h1>
          <p className="mt-1 text-sm text-gray-600">Manage your job application profiles and settings</p>
        </header>

        <div className="space-y-4">
          {/* Profiles Section */}
          <Card>
            <CardHeader className="pb-3">
              <h2 className="text-base font-semibold text-gray-900">Profiles</h2>
            </CardHeader>
            <CardContent className="pt-0">
            
              {profiles.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-gray-500 mb-3 text-sm">No profiles found</p>
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
                <div className="space-y-2">
                  {profiles.map((profile) => (
                    <div
                      key={profile.id}
                      className={`p-2 border rounded ${
                        activeProfile?.id === profile.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 text-sm truncate">{profile.name}</h3>
                          <p className="text-xs text-gray-500 truncate">ID: {profile.id}</p>
                        </div>
                        <div className="flex space-x-1 ml-2">
                          <button
                            onClick={() => handleSetActiveProfile(profile)}
                            className={`text-xs px-2 py-1 rounded ${
                              activeProfile?.id === profile.id 
                                ? 'bg-blue-100 text-blue-800' 
                                : 'text-blue-600 hover:text-blue-800 hover:bg-blue-50'
                            }`}
                          >
                            {activeProfile?.id === profile.id ? 'Active' : 'Set'}
                          </button>
                          <button
                            onClick={() => handleExportProfile(profile)}
                            className="text-xs text-gray-600 hover:text-gray-800 px-2 py-1 rounded hover:bg-gray-50"
                          >
                            Export
                          </button>
                          <button
                            onClick={() => handleDeleteProfile(profile)}
                            className="text-xs text-red-600 hover:text-red-800 px-2 py-1 rounded hover:bg-red-50"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="mt-3 flex flex-wrap gap-2">
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
            </CardContent>
          </Card>

          {/* Settings Section */}
          <Card>
            <CardHeader className="pb-3">
              <h2 className="text-base font-semibold text-gray-900">Settings</h2>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                <div>
                  <Label htmlFor="hotkey" className="text-sm">Keyboard Shortcut</Label>
                  <Input
                    id="hotkey"
                    type="text"
                    value={settings.hotkey}
                    onChange={(e) => setSettings({ ...settings, hotkey: e.target.value })}
                    placeholder="e.g., Alt+A"
                    className="text-sm"
                  />
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="aiAssist"
                    checked={settings.aiAssist}
                    onChange={(e) => setSettings({ ...settings, aiAssist: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <Label htmlFor="aiAssist" className="ml-2 text-sm">
                    Enable AI Assist (Chrome Built-in AI)
                  </Label>
                </div>
                
                <div>
                  <Label className="text-sm">Allowed Domains</Label>
                  <div className="space-y-2">
                    {settings.allowlist.map((domain, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Input
                          type="text"
                          value={domain}
                          readOnly
                          className="flex-1 bg-gray-50 text-sm"
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
              
              <div className="mt-4">
                <Button variant="secondary" size="sm">
                  Save Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Import Modal */}
        <Modal
          isOpen={showImportModal}
          onClose={() => setShowImportModal(false)}
          title="Import Profile"
          size="md"
        >
          <div className="space-y-3">
            <div>
              <Label htmlFor="import-name" className="text-sm">Profile Name (Optional)</Label>
              <Input
                id="import-name"
                value={importName}
                onChange={(e) => setImportName(e.target.value)}
                placeholder="Enter a name for this profile"
                className="text-sm"
              />
            </div>
            
            <div>
              <Label htmlFor="import-text" className="text-sm">Profile JSON</Label>
              <textarea
                id="import-text"
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder="Paste your profile JSON here..."
                className="w-full h-48 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-xs"
              />
            </div>
            
            <div className="flex justify-end space-x-2">
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
