// Enhanced profile validation and sanitization utilities

import { Profile, validateAndSanitizeProfile, ValidationResult } from './profile.schema';

export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

export interface SanitizationResult {
  success: boolean;
  data?: Profile;
  errors?: ValidationError[];
  warnings?: string[];
}

export class ProfileValidator {
  // Validate profile with detailed error reporting
  validateProfile(data: unknown): ValidationResult {
    return validateAndSanitizeProfile(data);
  }

  // Validate profile with custom rules
  validateProfileWithCustomRules(data: unknown): SanitizationResult {
    const validation = this.validateProfile(data);
    
    if (!validation.success) {
      return {
        success: false,
        errors: this.formatValidationErrors(validation.errors || [])
      };
    }

    const customValidation = this.validateCustomRules(validation.data);
    if (!customValidation.success) {
      return {
        success: false,
        errors: customValidation.errors || []
      };
    }

    return {
      success: true,
      data: validation.data,
      warnings: customValidation.warnings || []
    };
  }

  // Format Zod errors into user-friendly format
  private formatValidationErrors(zodErrors: any[]): ValidationError[] {
    return zodErrors.map(error => ({
      field: error.path.join('.'),
      message: error.message,
      value: error.input
    }));
  }

  // Custom validation rules beyond schema
  private validateCustomRules(profile: Profile): { success: boolean; errors?: ValidationError[]; warnings?: string[] } {
    const errors: ValidationError[] = [];
    const warnings: string[] = [];

    // Check for placeholder values
    const placeholderChecks = [
      { field: 'basics.fullName', value: profile.basics.fullName, placeholder: '<FULL_NAME>' },
      { field: 'basics.email', value: profile.basics.email, placeholder: '<EMAIL>' },
      { field: 'basics.phone', value: profile.basics.phone, placeholder: '<PHONE>' },
    ];

    placeholderChecks.forEach(({ field, value, placeholder }) => {
      if (value.includes(placeholder)) {
        warnings.push(`${field} contains placeholder value: ${placeholder}`);
      }
    });

    // Check for realistic data
    if (profile.basics.email && !profile.basics.email.includes('@')) {
      errors.push({
        field: 'basics.email',
        message: 'Email must contain @ symbol',
        value: profile.basics.email
      });
    }

    // Check work experience dates
    profile.work.forEach((work, index) => {
      if (work.start && work.end) {
        const startDate = new Date(work.start + '-01');
        const endDate = new Date(work.end + '-01');
        
        if (startDate > endDate) {
          errors.push({
            field: `work[${index}].dates`,
            message: 'Start date must be before end date',
            value: { start: work.start, end: work.end }
          });
        }
      }
    });

    // Check education dates
    profile.education.forEach((edu, index) => {
      if (edu.start && edu.end) {
        const startDate = new Date(edu.start + '-01');
        const endDate = new Date(edu.end + '-01');
        
        if (startDate > endDate) {
          errors.push({
            field: `education[${index}].dates`,
            message: 'Start date must be before end date',
            value: { start: edu.start, end: edu.end }
          });
        }
      }
    });

    // Check for empty required sections
    if (profile.work.length === 0) {
      warnings.push('No work experience provided');
    }

    if (profile.education.length === 0) {
      warnings.push('No education provided');
    }

    // Check for realistic notice period
    if (profile.answers.noticePeriodDays > 90) {
      warnings.push('Notice period is unusually long (>90 days)');
    }

    return {
      success: errors.length === 0,
      ...(errors.length > 0 && { errors }),
      ...(warnings.length > 0 && { warnings })
    };
  }

  // Sanitize profile data
  sanitizeProfile(data: any): any {
    // Remove HTML tags and trim whitespace
    const sanitizeString = (str: any): string => {
      if (typeof str !== 'string') return '';
      return str
        .trim()
        .replace(/<[^>]*>/g, '') // Remove HTML tags
        .replace(/[<>]/g, '') // Remove remaining angle brackets
        .replace(/\s+/g, ' '); // Normalize whitespace
    };

    // Sanitize nested object
    const sanitizeObject = (obj: any): any => {
      if (typeof obj !== 'object' || obj === null) {
        return typeof obj === 'string' ? sanitizeString(obj) : obj;
      }

      if (Array.isArray(obj)) {
        return obj.map(sanitizeObject);
      }

      const sanitized: any = {};
      for (const [key, value] of Object.entries(obj)) {
        sanitized[sanitizeString(key)] = sanitizeObject(value);
      }
      return sanitized;
    };

    return sanitizeObject(data);
  }

  // Validate profile completeness
  validateCompleteness(profile: Profile): { score: number; missing: string[]; suggestions: string[] } {
    const missing: string[] = [];
    const suggestions: string[] = [];

    // Check basics
    if (!profile.basics.fullName) missing.push('Full name');
    if (!profile.basics.email) missing.push('Email');
    if (!profile.basics.phone) missing.push('Phone');
    if (!profile.basics.location.city) missing.push('City');
    if (!profile.basics.location.region) missing.push('Region/State');
    if (!profile.basics.location.country) missing.push('Country');

    // Check links
    if (!profile.basics.links.linkedin) suggestions.push('Add LinkedIn profile');
    if (!profile.basics.links.github) suggestions.push('Add GitHub profile');

    // Check work experience
    if (profile.work.length === 0) {
      missing.push('Work experience');
    } else {
      profile.work.forEach((work, index) => {
        if (!work.summary) suggestions.push(`Add summary for work experience ${index + 1}`);
        if (work.highlights.length === 0) suggestions.push(`Add highlights for work experience ${index + 1}`);
      });
    }

    // Check education
    if (profile.education.length === 0) {
      missing.push('Education');
    }

    // Check answers
    if (!profile.answers.workAuthorizationUS) missing.push('Work authorization status');
    if (!profile.answers.relocation) missing.push('Relocation preference');
    if (!profile.answers.remoteTimezone) missing.push('Remote timezone');

    // Calculate completeness score
    const totalFields = 15; // Total important fields
    const completedFields = totalFields - missing.length;
    const score = Math.round((completedFields / totalFields) * 100);

    return { score, missing, suggestions };
  }

  // Get validation summary
  getValidationSummary(profile: Profile): {
    isValid: boolean;
    completeness: { score: number; missing: string[]; suggestions: string[] };
    errors: ValidationError[];
    warnings: string[];
  } {
    const validation = this.validateProfileWithCustomRules(profile);
    const completeness = this.validateCompleteness(profile);

    return {
      isValid: validation.success,
      completeness,
      errors: validation.errors || [],
      warnings: validation.warnings || []
    };
  }
}

// Export singleton instance
export const profileValidator = new ProfileValidator();
