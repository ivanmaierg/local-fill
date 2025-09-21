// Profile management service for Local-Fill
// Handles import/export, validation, and storage operations

import { Profile, validateAndSanitizeProfile, createEmptyProfile, llmPromptTemplate } from './profile.schema';
import { StorageProfile, storage } from './storage';
import { profileValidator } from './profile.validator';

export type ProfileImportResult = {
  success: true;
  profile: StorageProfile;
} | {
  success: false;
  error: string;
  details?: any;
}

export type ProfileExportResult = {
  success: true;
  data: string;
  filename: string;
} | {
  success: false;
  error: string;
}

export class ProfileManager {
  // Import profile from JSON string
  async importProfile(jsonString: string, name?: string): Promise<ProfileImportResult> {
    try {
      // Parse JSON
      let data: unknown;
      try {
        data = JSON.parse(jsonString);
      } catch (error) {
        return {
          success: false,
          error: 'Invalid JSON format'
        };
      }

      // Validate and sanitize
      const validation = validateAndSanitizeProfile(data);
      if (!validation.success) {
        return {
          success: false,
          error: validation.error,
          details: validation.errors
        };
      }

      // Create storage profile
      const profileId = this.generateProfileId();
      const profileName = name || this.generateProfileName(validation.data);
      const now = new Date().toISOString();

      const storageProfile: StorageProfile = {
        id: profileId,
        name: profileName,
        data: validation.data,
        createdAt: now,
        updatedAt: now
      };

      // Save to storage
      await storage.saveProfile(storageProfile);

      return {
        success: true,
        profile: storageProfile
      };

    } catch (error) {
      return {
        success: false,
        error: 'Failed to import profile',
        details: error
      };
    }
  }

  // Import profile from file
  async importProfileFromFile(file: File): Promise<ProfileImportResult> {
    try {
      const text = await file.text();
      const name = file.name.replace(/\.json$/i, '');
      return this.importProfile(text, name);
    } catch (error) {
        return {
          success: false,
          error: 'Failed to read file'
        };
    }
  }

  // Export profile to JSON string
  async exportProfile(profileId: string): Promise<ProfileExportResult> {
    try {
      const profile = await storage.getProfile(profileId);
      if (!profile) {
        return {
          success: false,
          error: 'Profile not found'
        };
      }

      const jsonString = JSON.stringify(profile.data, null, 2);
      const filename = `${profile.name.replace(/[^a-zA-Z0-9]/g, '_')}.json`;

      return {
        success: true,
        data: jsonString,
        filename
      };

    } catch (error) {
      return {
        success: false,
        error: 'Failed to export profile',
        details: error
      };
    }
  }

  // Export all profiles
  async exportAllProfiles(): Promise<ProfileExportResult> {
    try {
      const profiles = await storage.getAllProfiles();
      const settings = await storage.getSettings();
      
      const exportData = {
        version: '1.0',
        exportedAt: new Date().toISOString(),
        profiles: profiles.map(p => ({
          id: p.id,
          name: p.name,
          data: p.data,
          createdAt: p.createdAt,
          updatedAt: p.updatedAt
        })),
        settings
      };

      const jsonString = JSON.stringify(exportData, null, 2);
      const filename = `local-fill-profiles-${new Date().toISOString().split('T')[0]}.json`;

      return {
        success: true,
        data: jsonString,
        filename
      };

    } catch (error) {
      return {
        success: false,
        error: 'Failed to export profiles',
        details: error
      };
    }
  }

  // Create new profile
  async createProfile(name: string): Promise<ProfileImportResult> {
    try {
      const emptyProfile = createEmptyProfile();
      const profileId = this.generateProfileId();
      const now = new Date().toISOString();

      const storageProfile: StorageProfile = {
        id: profileId,
        name,
        data: emptyProfile,
        createdAt: now,
        updatedAt: now
      };

      await storage.saveProfile(storageProfile);

      return {
        success: true,
        profile: storageProfile
      };

    } catch (error) {
      return {
        success: false,
        error: 'Failed to create profile',
        details: error
      };
    }
  }

  // Update profile
  async updateProfile(profileId: string, profileData: Profile): Promise<ProfileImportResult> {
    try {
      // Validate and sanitize
      const validation = validateAndSanitizeProfile(profileData);
      if (!validation.success) {
        return {
          success: false,
          error: validation.error,
          details: validation.errors
        };
      }

      // Get existing profile
      const existingProfile = await storage.getProfile(profileId);
      if (!existingProfile) {
        return {
          success: false,
          error: 'Profile not found'
        };
      }

      // Update profile
      const updatedProfile: StorageProfile = {
        ...existingProfile,
        data: validation.data,
        updatedAt: new Date().toISOString()
      };

      await storage.saveProfile(updatedProfile);

      return {
        success: true,
        profile: updatedProfile
      };

    } catch (error) {
      return {
        success: false,
        error: 'Failed to update profile',
        details: error
      };
    }
  }

  // Delete profile
  async deleteProfile(profileId: string): Promise<{ success: boolean; error?: string }> {
    try {
      await storage.deleteProfile(profileId);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to delete profile'
      };
    }
  }

  // Get LLM prompt template
  getLLMPromptTemplate(): string {
    return llmPromptTemplate;
  }

  // Copy LLM prompt to clipboard
  async copyLLMPromptToClipboard(): Promise<{ success: boolean; error?: string }> {
    try {
      if (!navigator.clipboard) {
        return {
          success: false,
          error: 'Clipboard API not available'
        };
      }

      await navigator.clipboard.writeText(this.getLLMPromptTemplate());
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to copy to clipboard'
      };
    }
  }

  // Generate unique profile ID
  private generateProfileId(): string {
    return `profile_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Generate profile name from profile data
  private generateProfileName(profile: Profile): string {
    if (profile.basics.fullName) {
      return `${profile.basics.fullName} Profile`;
    }
    if (profile.basics.firstName && profile.basics.lastName) {
      return `${profile.basics.firstName} ${profile.basics.lastName} Profile`;
    }
    if (profile.basics.email) {
      return `${profile.basics.email} Profile`;
    }
    return `Profile ${Date.now()}`;
  }

  // Validate profile without saving
  validateProfile(jsonString: string): { success: boolean; error?: string; profile?: Profile } {
    try {
      const data = JSON.parse(jsonString);
      const validation = validateAndSanitizeProfile(data);
      
      if (validation.success) {
        return {
          success: true,
          profile: validation.data
        };
      } else {
        return {
          success: false,
          error: validation.error
        };
      }
    } catch (error) {
      return {
        success: false,
        error: 'Invalid JSON format'
      };
    }
  }

  // Get detailed validation summary for a profile
  getValidationSummary(profile: Profile) {
    return profileValidator.getValidationSummary(profile);
  }

  // Validate profile with enhanced rules
  validateProfileWithRules(jsonString: string) {
    try {
      const data = JSON.parse(jsonString);
      return profileValidator.validateProfileWithCustomRules(data);
    } catch (error) {
      return {
        success: false,
        errors: [{
          field: 'json',
          message: 'Invalid JSON format',
          value: jsonString
        }]
      };
    }
  }
}

// Export singleton instance
export const profileManager = new ProfileManager();
