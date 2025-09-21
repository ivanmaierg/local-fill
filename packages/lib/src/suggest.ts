// Suggestion engine for on-focus suggestions and snippet generation in Local-Fill
// Handles ranking, formatting, and snippet library management

import { FieldCandidate } from './dom.scan';
import { Profile } from './profile.schema';

export interface Suggestion {
  id: string;
  type: 'profile' | 'format' | 'snippet';
  label: string;
  value: string;
  confidence: number;
  description: string | undefined;
  metadata: Record<string, any> | undefined;
}

export interface SuggestionContext {
  field: FieldCandidate;
  profile: Profile;
  domain: string;
  recentValues?: string[];
}

export interface Snippet {
  id: string;
  name: string;
  category: string;
  template: string;
  variables: string[];
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SuggestionResult {
  suggestions: Suggestion[];
  total: number;
  hasMore: boolean;
  timing: {
    startTime: number;
    endTime: number;
    duration: number;
  };
}

export class SuggestionEngine {
  private snippetLibrary: Map<string, Snippet> = new Map();
  private recentValues: Map<string, string[]> = new Map();
  private maxSuggestions = 3;
  private maxRecentValues = 5;

  constructor() {
    this.loadDefaultSnippets();
  }

  /**
   * Generate suggestions for a focused field
   */
  async generateSuggestions(context: SuggestionContext): Promise<SuggestionResult> {
    const startTime = performance.now();
    
    const suggestions: Suggestion[] = [];
    
    // 1. Profile-based suggestions (highest priority)
    const profileSuggestions = this.generateProfileSuggestions(context);
    suggestions.push(...profileSuggestions);
    
    // 2. Format variations
    const formatSuggestions = this.generateFormatSuggestions(context);
    suggestions.push(...formatSuggestions);
    
    // 3. Snippet suggestions (for textarea fields)
    if (context.field.element instanceof HTMLTextAreaElement) {
      const snippetSuggestions = this.generateSnippetSuggestions(context);
      suggestions.push(...snippetSuggestions);
    }
    
    // 4. Recent values
    const recentSuggestions = this.generateRecentSuggestions(context);
    suggestions.push(...recentSuggestions);
    
    // Sort by confidence and limit results
    const sortedSuggestions = suggestions
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, this.maxSuggestions);
    
    const endTime = performance.now();
    
    return {
      suggestions: sortedSuggestions,
      total: suggestions.length,
      hasMore: suggestions.length > this.maxSuggestions,
      timing: {
        startTime,
        endTime,
        duration: endTime - startTime
      }
    };
  }

  /**
   * Generate profile-based suggestions
   */
  private generateProfileSuggestions(context: SuggestionContext): Suggestion[] {
    const { field, profile } = context;
    const suggestions: Suggestion[] = [];
    
    const guessedField = this.guessProfileField(field);
    if (!guessedField) return suggestions;
    
    const value = this.getProfileValue(profile, guessedField);
    if (value === undefined || value === null || String(value).trim() === '') {
      return suggestions;
    }
    
    const stringValue = String(value);
    
    // Primary suggestion
    suggestions.push({
      id: `profile-${guessedField}`,
      type: 'profile',
      label: this.getFieldDisplayName(guessedField),
      value: stringValue,
      confidence: 0.9,
      description: `From ${guessedField}`,
      metadata: undefined
    });
    
    return suggestions;
  }

  /**
   * Generate format variation suggestions
   */
  private generateFormatSuggestions(context: SuggestionContext): Suggestion[] {
    const { field, profile } = context;
    const suggestions: Suggestion[] = [];
    
    const guessedField = this.guessProfileField(field);
    if (!guessedField) return suggestions;
    
    const value = this.getProfileValue(profile, guessedField);
    if (value === undefined || value === null) return suggestions;
    
    const stringValue = String(value);
    
    // Email format variations
    if (field.type === 'email' && guessedField.includes('email')) {
      const parts = stringValue.split('@');
      if (parts.length === 2 && parts[0]) {
        suggestions.push({
          id: 'format-email-local',
          type: 'format',
          label: 'Local part only',
          value: parts[0],
          confidence: 0.6,
          description: 'Email without domain',
          metadata: undefined
        });
      }
    }
    
    // Phone format variations
    if (field.type === 'tel' && guessedField.includes('phone')) {
      const phoneFormats = this.generatePhoneFormats(stringValue);
      phoneFormats.forEach((format, index) => {
        suggestions.push({
          id: `format-phone-${index}`,
          type: 'format',
          label: format.label,
          value: format.value,
          confidence: 0.7,
          description: format.description,
          metadata: undefined
        });
      });
    }
    
    // Name format variations
    if (guessedField.includes('name')) {
      const nameFormats = this.generateNameFormats(stringValue, profile);
      nameFormats.forEach((format, index) => {
        suggestions.push({
          id: `format-name-${index}`,
          type: 'format',
          label: format.label,
          value: format.value,
          confidence: 0.8,
          description: format.description,
          metadata: undefined
        });
      });
    }
    
    return suggestions;
  }

  /**
   * Generate snippet suggestions for textarea fields
   */
  private generateSnippetSuggestions(context: SuggestionContext): Suggestion[] {
    const { field, profile, domain } = context;
    const suggestions: Suggestion[] = [];
    
    // Get relevant snippets based on field context
    const relevantSnippets = this.getRelevantSnippets(field, domain);
    
    for (const snippet of relevantSnippets) {
      const renderedSnippet = this.renderSnippet(snippet, profile);
      if (renderedSnippet) {
        suggestions.push({
          id: `snippet-${snippet.id}`,
          type: 'snippet',
          label: snippet.name,
          value: renderedSnippet,
          confidence: 0.7,
          description: snippet.description ?? undefined,
          metadata: { snippetId: snippet.id, category: snippet.category }
        });
      }
    }
    
    return suggestions;
  }

  /**
   * Generate suggestions from recent values
   */
  private generateRecentSuggestions(context: SuggestionContext): Suggestion[] {
    const { field } = context;
    const suggestions: Suggestion[] = [];
    
    const fieldKey = this.getFieldKey(field);
    const recent = this.recentValues.get(fieldKey) || [];
    
    recent.forEach((value, index) => {
      if (value && value.trim() !== '') {
        suggestions.push({
          id: `recent-${index}`,
          type: 'profile',
          label: `Recent: ${value.substring(0, 20)}${value.length > 20 ? '...' : ''}`,
          value: value,
          confidence: 0.5 - (index * 0.1),
          description: 'Recently used value',
          metadata: undefined
        });
      }
    });
    
    return suggestions;
  }

  /**
   * Record a used value for future suggestions
   */
  recordUsedValue(field: FieldCandidate, value: string): void {
    if (!value || value.trim() === '') return;
    
    const fieldKey = this.getFieldKey(field);
    const recent = this.recentValues.get(fieldKey) || [];
    
    // Remove if already exists
    const filtered = recent.filter(v => v !== value);
    
    // Add to beginning
    filtered.unshift(value);
    
    // Limit to max recent values
    const limited = filtered.slice(0, this.maxRecentValues);
    
    this.recentValues.set(fieldKey, limited);
  }

  /**
   * Add a custom snippet
   */
  addSnippet(snippet: Omit<Snippet, 'id' | 'createdAt' | 'updatedAt'>): Snippet {
    const id = this.generateSnippetId();
    const now = new Date();
    
    const newSnippet: Snippet = {
      ...snippet,
      id,
      createdAt: now,
      updatedAt: now
    };
    
    this.snippetLibrary.set(id, newSnippet);
    return newSnippet;
  }

  /**
   * Get all snippets
   */
  getSnippets(): Snippet[] {
    return Array.from(this.snippetLibrary.values());
  }

  /**
   * Get snippets by category
   */
  getSnippetsByCategory(category: string): Snippet[] {
    return Array.from(this.snippetLibrary.values())
      .filter(snippet => snippet.category === category);
  }

  /**
   * Delete a snippet
   */
  deleteSnippet(id: string): boolean {
    return this.snippetLibrary.delete(id);
  }

  private guessProfileField(field: FieldCandidate): string | null {
    const label = (field.label || '').toLowerCase();
    const placeholder = (field.placeholder || '').toLowerCase();
    const name = (field.name || '').toLowerCase();
    const type = field.type || '';
    
    // Email field detection
    if (type === 'email' || 
        label.includes('email') || 
        placeholder.includes('email') ||
        name.includes('email')) {
      return 'basics.email';
    }
    
    // Phone field detection
    if (type === 'tel' || 
        label.includes('phone') || 
        label.includes('telephone') ||
        placeholder.includes('phone') ||
        name.includes('phone')) {
      return 'basics.phone';
    }
    
    // Name field detection
    if (label.includes('first name') || 
        label.includes('firstname') ||
        name.includes('first') ||
        name.includes('fname')) {
      return 'basics.firstName';
    }
    
    if (label.includes('last name') || 
        label.includes('lastname') ||
        name.includes('last') ||
        name.includes('lname') ||
        name.includes('surname')) {
      return 'basics.lastName';
    }
    
    if (label.includes('full name') || 
        label.includes('name') ||
        name.includes('name') ||
        placeholder.includes('name')) {
      return 'basics.fullName';
    }
    
    // LinkedIn field detection
    if (label.includes('linkedin') || 
        placeholder.includes('linkedin') ||
        name.includes('linkedin')) {
      return 'basics.links.linkedin';
    }
    
    // GitHub field detection
    if (label.includes('github') || 
        placeholder.includes('github') ||
        name.includes('github')) {
      return 'basics.links.github';
    }
    
    // Website field detection
    if (label.includes('website') || 
        label.includes('portfolio') ||
        placeholder.includes('website') ||
        name.includes('website')) {
      return 'basics.links.website';
    }
    
    // Location field detection
    if (label.includes('city') || 
        placeholder.includes('city') ||
        name.includes('city')) {
      return 'basics.location.city';
    }
    
    if (label.includes('state') || 
        label.includes('region') ||
        placeholder.includes('state') ||
        name.includes('state')) {
      return 'basics.location.region';
    }
    
    if (label.includes('country') || 
        placeholder.includes('country') ||
        name.includes('country')) {
      return 'basics.location.country';
    }
    
    return null;
  }

  private getProfileValue(profile: Profile, fieldPath: string): any {
    const parts = fieldPath.split('.');
    let value: any = profile;
    
    for (const part of parts) {
      if (value && typeof value === 'object' && part in value) {
        value = value[part];
      } else {
        return undefined;
      }
    }
    
    return value;
  }

  private getFieldDisplayName(fieldPath: string): string {
    const parts = fieldPath.split('.');
    const lastPart = parts[parts.length - 1] ?? '';
    
    // Convert camelCase to readable format
    return lastPart.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
  }

  private generatePhoneFormats(phone: string): Array<{ label: string; value: string; description: string }> {
    const digits = phone.replace(/\D/g, '');
    const formats: Array<{ label: string; value: string; description: string }> = [];
    
    if (digits.length === 10) {
      formats.push({
        label: 'US Format',
        value: `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`,
        description: 'Standard US phone format'
      });
      formats.push({
        label: 'International',
        value: `+1 ${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`,
        description: 'International format'
      });
    } else if (digits.length === 11 && digits[0] === '1') {
      formats.push({
        label: 'Without Country Code',
        value: digits.slice(1),
        description: 'US number without +1'
      });
    }
    
    return formats;
  }

  private generateNameFormats(fullName: string, _profile: Profile): Array<{ label: string; value: string; description: string }> {
    const formats: Array<{ label: string; value: string; description: string }> = [];
    
    const parts = fullName.split(' ');
    if (parts.length >= 2) {
      const first = parts[0];
      const lastParts = parts.slice(1);
      const last = lastParts.join(' ');
      
      if (first && last) {
        formats.push({
          label: 'First Last',
          value: `${first} ${last}`,
          description: 'Standard format'
        });
        
        formats.push({
          label: 'Last, First',
          value: `${last}, ${first}`,
          description: 'Last name first'
        });
        
        if (first.length > 0) {
          formats.push({
            label: 'First Initial',
            value: `${first[0]}. ${last}`,
            description: 'With first initial'
          });
        }
      }
    }
    
    return formats;
  }

  private getRelevantSnippets(field: FieldCandidate, _domain: string): Snippet[] {
    const snippets = Array.from(this.snippetLibrary.values());
    
    // Filter by category based on field context
    const label = (field.label || '').toLowerCase();
    const placeholder = (field.placeholder || '').toLowerCase();
    
    let relevantCategories: string[] = [];
    
    if (label.includes('cover') || label.includes('letter') || placeholder.includes('cover')) {
      relevantCategories = ['cover-letter', 'introduction'];
    } else if (label.includes('why') || label.includes('motivation') || placeholder.includes('why')) {
      relevantCategories = ['motivation', 'why-company'];
    } else if (label.includes('experience') || label.includes('background')) {
      relevantCategories = ['experience', 'background'];
    } else if (label.includes('availability') || label.includes('notice')) {
      relevantCategories = ['availability', 'timing'];
    } else {
      relevantCategories = ['general', 'introduction'];
    }
    
    return snippets.filter(snippet => 
      relevantCategories.includes(snippet.category)
    ).slice(0, 3); // Limit to 3 snippets
  }

  private renderSnippet(snippet: Snippet, profile: Profile): string | null {
    try {
      let rendered = snippet.template;
      
      // Replace variables with profile values
      for (const variable of snippet.variables) {
        const value = this.getProfileValue(profile, variable);
        if (value !== undefined && value !== null) {
          const placeholder = `{{${variable}}}`;
          rendered = rendered.replace(new RegExp(placeholder, 'g'), String(value));
        }
      }
      
      return rendered;
    } catch (error) {
      console.warn('Failed to render snippet:', error);
      return null;
    }
  }

  private getFieldKey(field: FieldCandidate): string {
    return `${field.type || 'text'}-${field.name || field.id}`;
  }

  private generateSnippetId(): string {
    return `snippet-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private loadDefaultSnippets(): void {
    const defaultSnippets: Array<Omit<Snippet, 'id' | 'createdAt' | 'updatedAt'>> = [
      {
        name: 'Cover Letter Opening',
        category: 'cover-letter',
        template: 'Dear Hiring Manager,\n\nI am writing to express my strong interest in the {{basics.jobTitle}} position at {{basics.companyName}}. With my background in {{basics.primarySkill}} and passion for {{basics.industry}}, I believe I would be a valuable addition to your team.',
        variables: ['basics.jobTitle', 'basics.companyName', 'basics.primarySkill', 'basics.industry'],
        description: 'Professional cover letter opening'
      },
      {
        name: 'Availability Statement',
        category: 'availability',
        template: 'I am available to start {{basics.availability}} and can provide {{basics.noticePeriod}} notice to my current employer.',
        variables: ['basics.availability', 'basics.noticePeriod'],
        description: 'Standard availability statement'
      },
      {
        name: 'Why This Company',
        category: 'why-company',
        template: 'I am particularly drawn to {{basics.companyName}} because of {{basics.companyReason}}. Your focus on {{basics.companyValue}} aligns perfectly with my professional values and career goals.',
        variables: ['basics.companyName', 'basics.companyReason', 'basics.companyValue'],
        description: 'Why you want to work at this company'
      },
      {
        name: 'Work Authorization',
        category: 'general',
        template: 'I am authorized to work in the United States and do not require sponsorship for employment.',
        variables: [],
        description: 'Standard work authorization statement'
      },
      {
        name: 'Remote Work Preference',
        category: 'general',
        template: 'I am open to {{basics.workPreference}} arrangements and can adapt to your team\'s collaboration style.',
        variables: ['basics.workPreference'],
        description: 'Remote work preference statement'
      }
    ];
    
    defaultSnippets.forEach(snippet => this.addSnippet(snippet));
  }
}

// Export singleton instance
export const suggestionEngine = new SuggestionEngine();
