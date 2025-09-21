// Rules engine for field mapping and rule resolution in Local-Fill
// Handles domain-specific rules, user overrides, and field matching

import { FieldCandidate } from './dom.scan';
import { Profile } from './profile.schema';

export interface FieldRule {
  id: string;
  domain: string;
  field: string; // Profile field path (e.g., 'basics.email')
  selector: string; // CSS selector
  confidence: number; // 0-1 confidence score
  isUserOverride: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface FieldMapping {
  id: string;
  field: string;
  selector: string;
  label: string | undefined;
  placeholder: string | undefined;
  value: string;
  confidence: number;
  isMapped: boolean;
  isConflict: boolean | undefined;
  originalValue: string | undefined;
  ruleId: string | undefined;
}

export interface MappingResult {
  mappings: FieldMapping[];
  unmappedCandidates: FieldCandidate[];
  conflicts: FieldMapping[];
  stats: {
    total: number;
    mapped: number;
    unmapped: number;
    conflicts: number;
    avgConfidence: number;
  };
}

export interface RuleMatch {
  rule: FieldRule;
  candidate: FieldCandidate;
  confidence: number;
  score: number;
}

export class RulesEngine {
  private rules: Map<string, FieldRule[]> = new Map();
  private seedRules: Map<string, FieldRule[]> = new Map();

  constructor() {
    this.loadSeedRules();
  }

  /**
   * Map field candidates to profile fields using rules and heuristics
   */
  async mapFields(
    candidates: FieldCandidate[],
    profile: Profile,
    domain: string
  ): Promise<MappingResult> {
    const mappings: FieldMapping[] = [];
    const unmappedCandidates: FieldCandidate[] = [];
    
    // Get rules for this domain
    const domainRules = this.getRulesForDomain(domain);
    
    // Create a map of used candidates
    const usedCandidates = new Set<string>();
    
    // First pass: apply exact rule matches
    for (const rule of domainRules) {
      const match = this.findBestCandidateForRule(rule, candidates, usedCandidates);
      if (match) {
        const mapping = this.createMapping(match, rule, profile);
        if (mapping) {
          mappings.push(mapping);
          usedCandidates.add(match.candidate.id);
        }
      }
    }
    
    // Second pass: apply heuristic matching for unmapped candidates
    const remainingCandidates = candidates.filter(c => !usedCandidates.has(c.id));
    for (const candidate of remainingCandidates) {
      const heuristicMatch = this.findHeuristicMatch(candidate, profile, domainRules);
      if (heuristicMatch) {
        const mapping = this.createMapping(
          { rule: heuristicMatch.rule, candidate, confidence: heuristicMatch.confidence, score: heuristicMatch.confidence },
          heuristicMatch.rule,
          profile
        );
        if (mapping) {
          mappings.push(mapping);
          usedCandidates.add(candidate.id);
        }
      } else {
        unmappedCandidates.push(candidate);
      }
    }
    
    // Check for conflicts (fields that already have values)
    const conflictMappings = mappings.filter(mapping => {
      const candidate = candidates.find(c => c.id === mapping.id);
      return candidate && candidate.value && candidate.value.trim() !== '';
    });
    
    conflictMappings.forEach(mapping => {
      mapping.isConflict = true;
      const candidate = candidates.find(c => c.id === mapping.id);
      if (candidate) {
        mapping.originalValue = candidate.value;
      }
    });
    
    // Calculate statistics
    const stats = this.calculateStats(mappings, unmappedCandidates, conflictMappings);
    
    return {
      mappings,
      unmappedCandidates,
      conflicts: conflictMappings,
      stats
    };
  }

  /**
   * Add a user override rule
   */
  addUserRule(domain: string, field: string, selector: string, confidence: number = 1.0): FieldRule {
    const rule: FieldRule = {
      id: this.generateRuleId(),
      domain,
      field,
      selector,
      confidence,
      isUserOverride: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.addRule(rule);
    return rule;
  }

  /**
   * Remove a user rule
   */
  removeUserRule(ruleId: string, domain: string): boolean {
    const rules = this.rules.get(domain) || [];
    const index = rules.findIndex(rule => rule.id === ruleId && rule.isUserOverride);
    
    if (index !== -1) {
      rules.splice(index, 1);
      this.rules.set(domain, rules);
      return true;
    }
    
    return false;
  }

  /**
   * Get all rules for a domain
   */
  getRulesForDomain(domain: string): FieldRule[] {
    const userRules = this.rules.get(domain) || [];
    const seedRules = this.seedRules.get(domain) || [];
    
    // Combine user rules (higher priority) with seed rules
    return [...userRules, ...seedRules];
  }

  /**
   * Get all user rules
   */
  getUserRules(): FieldRule[] {
    const allRules: FieldRule[] = [];
    for (const rules of this.rules.values()) {
      allRules.push(...rules.filter(rule => rule.isUserOverride));
    }
    return allRules;
  }

  private findBestCandidateForRule(
    rule: FieldRule,
    candidates: FieldCandidate[],
    usedCandidates: Set<string>
  ): RuleMatch | null {
    let bestMatch: RuleMatch | null = null;
    
    for (const candidate of candidates) {
      if (usedCandidates.has(candidate.id)) continue;
      
      const confidence = this.calculateSelectorConfidence(rule.selector, candidate);
      if (confidence > 0) {
        const score = confidence * rule.confidence;
        
        if (!bestMatch || score > bestMatch.score) {
          bestMatch = {
            rule,
            candidate,
            confidence,
            score
          };
        }
      }
    }
    
    return bestMatch;
  }

  private findHeuristicMatch(
    candidate: FieldCandidate,
    _profile: Profile,
    existingRules: FieldRule[]
  ): { rule: FieldRule; confidence: number } | null {
    // Skip if there's already a rule for this field
    const existingRule = existingRules.find(rule => rule.field === this.guessFieldFromCandidate(candidate));
    if (existingRule) return null;
    
    const guessedField = this.guessFieldFromCandidate(candidate);
    const confidence = this.calculateFieldConfidence(candidate, guessedField);
    
    if (confidence > 0.3) { // Minimum confidence threshold
      const rule: FieldRule = {
        id: this.generateRuleId(),
        domain: window.location.hostname,
        field: guessedField,
        selector: candidate.selector,
        confidence,
        isUserOverride: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      return { rule, confidence };
    }
    
    return null;
  }

  private guessFieldFromCandidate(candidate: FieldCandidate): string {
    const label = (candidate.label || '').toLowerCase();
    const placeholder = (candidate.placeholder || '').toLowerCase();
    const name = (candidate.name || '').toLowerCase();
    const type = candidate.type || '';
    
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
    
    // Work authorization detection
    if (label.includes('work authorization') || 
        label.includes('eligible to work') ||
        name.includes('work_auth')) {
      return 'answers.workAuthorizationUS';
    }
    
    // Relocation detection
    if (label.includes('relocation') || 
        label.includes('willing to relocate') ||
        name.includes('relocation')) {
      return 'answers.relocation';
    }
    
    // Notice period detection
    if (label.includes('notice') || 
        label.includes('available') ||
        name.includes('notice')) {
      return 'answers.noticePeriodDays';
    }
    
    return '';
  }

  private calculateFieldConfidence(candidate: FieldCandidate, field: string): number {
    if (!field) return 0;
    
    const label = (candidate.label || '').toLowerCase();
    const placeholder = (candidate.placeholder || '').toLowerCase();
    const name = (candidate.name || '').toLowerCase();
    const type = candidate.type || '';
    
    // Extract field name from path (e.g., 'basics.email' -> 'email')
    const fieldName = field.split('.').pop() || '';
    
    // Exact matches get highest confidence
    if (label.includes(fieldName) || placeholder.includes(fieldName) || name.includes(fieldName)) {
      return 0.9;
    }
    
    // Type-based confidence
    if (field.includes('email') && type === 'email') return 0.8;
    if (field.includes('phone') && type === 'tel') return 0.8;
    
    // Partial matches get lower confidence
    if (label.includes(fieldName.substring(0, 4)) || 
        placeholder.includes(fieldName.substring(0, 4))) {
      return 0.6;
    }
    
    return 0.3;
  }

  private calculateSelectorConfidence(selector: string, candidate: FieldCandidate): number {
    try {
      // Test if the selector matches the candidate element
      const matches = document.querySelectorAll(selector);
      const isMatch = Array.from(matches).includes(candidate.element);
      
      if (isMatch) {
        // Calculate confidence based on selector specificity
        const specificity = this.calculateSelectorSpecificity(selector);
        return Math.min(0.9, 0.5 + (specificity * 0.4));
      }
      
      return 0;
    } catch {
      return 0;
    }
  }

  private calculateSelectorSpecificity(selector: string): number {
    // Simple specificity calculation
    let score = 0;
    
    // ID selectors
    const idMatches = selector.match(/#[a-zA-Z][\w-]*/g);
    score += (idMatches?.length || 0) * 100;
    
    // Class selectors
    const classMatches = selector.match(/\.[a-zA-Z][\w-]*/g);
    score += (classMatches?.length || 0) * 10;
    
    // Attribute selectors
    const attrMatches = selector.match(/\[[^\]]+\]/g);
    score += (attrMatches?.length || 0) * 10;
    
    // Element selectors
    const elementMatches = selector.match(/^[a-zA-Z][\w-]*/g);
    score += (elementMatches?.length || 0) * 1;
    
    return Math.min(1, score / 200); // Normalize to 0-1
  }

  private createMapping(
    match: RuleMatch,
    rule: FieldRule,
    profile: Profile
  ): FieldMapping | null {
    const value = this.getProfileValue(profile, rule.field);
    if (value === undefined) return null;
    
    return {
      id: match.candidate.id,
      field: rule.field,
      selector: match.candidate.selector,
      label: match.candidate.label,
      placeholder: match.candidate.placeholder,
      value: String(value),
      confidence: match.confidence * rule.confidence,
      isMapped: true,
      isConflict: undefined,
      originalValue: undefined,
      ruleId: rule.id
    };
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

  private calculateStats(
    mappings: FieldMapping[],
    unmappedCandidates: FieldCandidate[],
    conflicts: FieldMapping[]
  ) {
    const total = mappings.length + unmappedCandidates.length;
    const mapped = mappings.length;
    const unmapped = unmappedCandidates.length;
    const conflictsCount = conflicts.length;
    
    const avgConfidence = mappings.length > 0 
      ? mappings.reduce((sum, m) => sum + m.confidence, 0) / mappings.length 
      : 0;
    
    return {
      total,
      mapped,
      unmapped,
      conflicts: conflictsCount,
      avgConfidence
    };
  }

  private addRule(rule: FieldRule): void {
    const domain = rule.domain;
    if (!this.rules.has(domain)) {
      this.rules.set(domain, []);
    }
    
    const rules = this.rules.get(domain)!;
    rules.push(rule);
    this.rules.set(domain, rules);
  }

  private generateRuleId(): string {
    return `rule-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private loadSeedRules(): void {
    // Load seed rules for common ATS platforms
    this.loadGreenhouseRules();
    this.loadLeverRules();
    this.loadWorkdayRules();
    this.loadAshbyRules();
  }

  private loadGreenhouseRules(): void {
    const rules: FieldRule[] = [
      {
        id: 'greenhouse-name',
        domain: 'boards.greenhouse.io',
        field: 'basics.fullName',
        selector: 'input[name="applicant[name]"]',
        confidence: 1.0,
        isUserOverride: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'greenhouse-email',
        domain: 'boards.greenhouse.io',
        field: 'basics.email',
        selector: 'input[type="email"]',
        confidence: 1.0,
        isUserOverride: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'greenhouse-phone',
        domain: 'boards.greenhouse.io',
        field: 'basics.phone',
        selector: 'input[type="tel"], input[name*="phone"]',
        confidence: 0.9,
        isUserOverride: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'greenhouse-linkedin',
        domain: 'boards.greenhouse.io',
        field: 'basics.links.linkedin',
        selector: 'input[name*="linkedin"]',
        confidence: 0.9,
        isUserOverride: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    this.seedRules.set('boards.greenhouse.io', rules);
  }

  private loadLeverRules(): void {
    const rules: FieldRule[] = [
      {
        id: 'lever-name',
        domain: 'jobs.lever.co',
        field: 'basics.fullName',
        selector: 'input[name="name"]',
        confidence: 1.0,
        isUserOverride: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'lever-email',
        domain: 'jobs.lever.co',
        field: 'basics.email',
        selector: 'input[name="email"]',
        confidence: 1.0,
        isUserOverride: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'lever-phone',
        domain: 'jobs.lever.co',
        field: 'basics.phone',
        selector: 'input[name="phone"]',
        confidence: 0.9,
        isUserOverride: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    this.seedRules.set('jobs.lever.co', rules);
  }

  private loadWorkdayRules(): void {
    const rules: FieldRule[] = [
      {
        id: 'workday-email',
        domain: '*.myworkdayjobs.com',
        field: 'basics.email',
        selector: 'input[data-automation-id="email"]',
        confidence: 0.9,
        isUserOverride: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    this.seedRules.set('*.myworkdayjobs.com', rules);
  }

  private loadAshbyRules(): void {
    const rules: FieldRule[] = [
      {
        id: 'ashby-email',
        domain: '*.ashbyhq.com',
        field: 'basics.email',
        selector: 'input[type="email"]',
        confidence: 0.9,
        isUserOverride: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    this.seedRules.set('*.ashbyhq.com', rules);
  }
}

// Export singleton instance
export const rulesEngine = new RulesEngine();
