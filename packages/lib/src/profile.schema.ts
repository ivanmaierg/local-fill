import { z } from 'zod';

// Enhanced Profile JSON schema v1 with comprehensive Zod validation
export const ProfileSchema = z.object({
  version: z.literal('1'),
  basics: z.object({
    fullName: z.string().min(1, 'Full name is required').max(100, 'Full name too long'),
    firstName: z.string().min(1, 'First name is required').max(50, 'First name too long'),
    lastName: z.string().min(1, 'Last name is required').max(50, 'Last name too long'),
    email: z.string().email('Invalid email format').max(100, 'Email too long'),
    phone: z.string().min(1, 'Phone number is required').max(20, 'Phone number too long'),
    location: z.object({
      city: z.string().min(1, 'City is required').max(50, 'City name too long'),
      region: z.string().min(1, 'Region/State is required').max(50, 'Region name too long'),
      country: z.string().min(1, 'Country is required').max(50, 'Country name too long'),
    }),
    links: z.object({
      linkedin: z.string().url('Invalid LinkedIn URL').optional().or(z.literal('')),
      github: z.string().url('Invalid GitHub URL').optional().or(z.literal('')),
      website: z.string().url('Invalid website URL').optional().or(z.literal('')),
      portfolio: z.string().url('Invalid portfolio URL').optional().or(z.literal('')),
      twitter: z.string().url('Invalid Twitter URL').optional().or(z.literal('')),
    }),
  }),
  work: z.array(z.object({
    company: z.string().min(1, 'Company name is required').max(100, 'Company name too long'),
    title: z.string().min(1, 'Job title is required').max(100, 'Job title too long'),
    start: z.string().regex(/^\d{4}-\d{2}$/, 'Start date must be in YYYY-MM format'),
    end: z.string().regex(/^\d{4}-\d{2}$/, 'End date must be in YYYY-MM format').nullable(),
    location: z.string().min(1, 'Work location is required').max(100, 'Location too long'),
    summary: z.string().min(1, 'Work summary is required').max(500, 'Summary too long'),
    highlights: z.array(z.string().max(200, 'Highlight too long')).max(10, 'Too many highlights'),
  })).max(10, 'Too many work experiences'),
  education: z.array(z.object({
    school: z.string().min(1, 'School name is required').max(100, 'School name too long'),
    degree: z.string().min(1, 'Degree is required').max(100, 'Degree name too long'),
    start: z.string().regex(/^\d{4}-\d{2}$/, 'Start date must be in YYYY-MM format'),
    end: z.string().regex(/^\d{4}-\d{2}$/, 'End date must be in YYYY-MM format').nullable(),
  })).max(5, 'Too many education entries'),
  answers: z.object({
    workAuthorizationUS: z.string().min(1, 'Work authorization status is required').max(100, 'Answer too long'),
    relocation: z.string().min(1, 'Relocation preference is required').max(100, 'Answer too long'),
    remoteTimezone: z.string().min(1, 'Remote timezone is required').max(50, 'Timezone too long'),
    noticePeriodDays: z.number().int().min(0, 'Notice period cannot be negative').max(365, 'Notice period too long'),
  }),
  custom: z.record(z.string().max(50, 'Custom field name too long'), z.string().max(500, 'Custom field value too long')),
});

export type Profile = z.infer<typeof ProfileSchema>;

// Validation result type
export type ValidationResult = {
  success: true;
  data: Profile;
} | {
  success: false;
  error: string;
  errors?: z.ZodIssue[];
}

// Enhanced validation function
export const validateProfile = (data: unknown): ValidationResult => {
  try {
    const profile = ProfileSchema.parse(data);
    return { success: true, data: profile };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        error: `Validation failed: ${error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')}`,
        errors: error.errors
      };
    }
    return { success: false, error: 'Unknown validation error' };
  }
};

// Sanitize profile data
export const sanitizeProfile = (data: any): any => {
  if (typeof data !== 'object' || data === null) {
    return data;
  }

  const sanitized = { ...data };

  // Sanitize strings
  const sanitizeString = (str: any): string => {
    if (typeof str !== 'string') return '';
    return str.trim().replace(/[<>]/g, ''); // Remove potential HTML tags
  };

  // Sanitize basics
  if (sanitized.basics) {
    sanitized.basics = {
      ...sanitized.basics,
      fullName: sanitizeString(sanitized.basics.fullName),
      firstName: sanitizeString(sanitized.basics.firstName),
      lastName: sanitizeString(sanitized.basics.lastName),
      email: sanitizeString(sanitized.basics.email).toLowerCase(),
      phone: sanitizeString(sanitized.basics.phone),
      location: {
        city: sanitizeString(sanitized.basics.location?.city),
        region: sanitizeString(sanitized.basics.location?.region),
        country: sanitizeString(sanitized.basics.location?.country),
      },
      links: {
        linkedin: sanitizeString(sanitized.basics.links?.linkedin),
        github: sanitizeString(sanitized.basics.links?.github),
        website: sanitizeString(sanitized.basics.links?.website),
        portfolio: sanitizeString(sanitized.basics.links?.portfolio),
        twitter: sanitizeString(sanitized.basics.links?.twitter),
      }
    };
  }

  // Sanitize work experiences
  if (Array.isArray(sanitized.work)) {
    sanitized.work = sanitized.work.map((work: any) => ({
      ...work,
      company: sanitizeString(work.company),
      title: sanitizeString(work.title),
      location: sanitizeString(work.location),
      summary: sanitizeString(work.summary),
      highlights: Array.isArray(work.highlights) 
        ? work.highlights.map((h: any) => sanitizeString(h)).filter(Boolean)
        : []
    }));
  }

  // Sanitize education
  if (Array.isArray(sanitized.education)) {
    sanitized.education = sanitized.education.map((edu: any) => ({
      ...edu,
      school: sanitizeString(edu.school),
      degree: sanitizeString(edu.degree)
    }));
  }

  // Sanitize answers
  if (sanitized.answers) {
    sanitized.answers = {
      workAuthorizationUS: sanitizeString(sanitized.answers.workAuthorizationUS),
      relocation: sanitizeString(sanitized.answers.relocation),
      remoteTimezone: sanitizeString(sanitized.answers.remoteTimezone),
      noticePeriodDays: typeof sanitized.answers.noticePeriodDays === 'number' 
        ? Math.max(0, Math.min(365, sanitized.answers.noticePeriodDays))
        : 0
    };
  }

  // Sanitize custom fields
  if (sanitized.custom && typeof sanitized.custom === 'object') {
    const sanitizedCustom: Record<string, string> = {};
    for (const [key, value] of Object.entries(sanitized.custom)) {
      if (typeof key === 'string' && typeof value === 'string') {
        sanitizedCustom[sanitizeString(key)] = sanitizeString(value);
      }
    }
    sanitized.custom = sanitizedCustom;
  }

  return sanitized;
};

// Create a new profile with default values
export const createEmptyProfile = (): Profile => {
  return {
    version: '1',
    basics: {
      fullName: '',
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      location: {
        city: '',
        region: '',
        country: '',
      },
      links: {
        linkedin: '',
        github: '',
        website: '',
        portfolio: '',
        twitter: '',
      },
    },
    work: [],
    education: [],
    answers: {
      workAuthorizationUS: '',
      relocation: '',
      remoteTimezone: '',
      noticePeriodDays: 0,
    },
    custom: {},
  };
};

// Validate and sanitize profile
export const validateAndSanitizeProfile = (data: unknown): ValidationResult => {
  const sanitized = sanitizeProfile(data);
  return validateProfile(sanitized);
};

// Sample profile for testing (with placeholders)
export const sampleProfile: Profile = {
  version: '1',
  basics: {
    fullName: '<FULL_NAME>',
    firstName: '<FIRST_NAME>',
    lastName: '<LAST_NAME>',
    email: '<EMAIL>',
    phone: '<PHONE>',
    location: {
      city: '<CITY>',
      region: '<REGION>',
      country: '<COUNTRY>',
    },
    links: {
      linkedin: '<LINKEDIN_URL>',
      github: '<GITHUB_URL>',
      website: '<WEBSITE_URL>',
      portfolio: '<PORTFOLIO_URL>',
      twitter: '<TWITTER_URL>',
    },
  },
  work: [
    {
      company: '<COMPANY>',
      title: '<TITLE>',
      start: '2020-01',
      end: null,
      location: '<CITY_COUNTRY>',
      summary: '<ONE_LINE>',
      highlights: ['<METRIC_1>', '<METRIC_2>'],
    },
  ],
  education: [
    {
      school: '<SCHOOL>',
      degree: '<DEGREE>',
      start: '2016-09',
      end: '2020-05',
    },
  ],
  answers: {
    workAuthorizationUS: '<YES_NO_OR_TEXT>',
    relocation: '<YES_NO_OR_TEXT>',
    remoteTimezone: '<TZ>',
    noticePeriodDays: 15,
  },
  custom: {
    visa: '<VISA_STATUS>',
    salaryUSD: '<OPEN_OR_RANGE>',
  },
};

// LLM Prompt template for generating profiles
export const llmPromptTemplate = `You are generating a local-only JSON profile for a job application autofill extension. This profile will be stored locally on the user's device and never sent to any servers.

Please generate a complete profile JSON following this exact schema:

\`\`\`json
{
  "version": "1",
  "basics": {
    "fullName": "John Doe",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "phone": "+1-555-0123",
    "location": {
      "city": "San Francisco",
      "region": "CA",
      "country": "USA"
    },
    "links": {
      "linkedin": "https://linkedin.com/in/johndoe",
      "github": "https://github.com/johndoe",
      "website": "https://johndoe.com",
      "portfolio": "https://portfolio.johndoe.com",
      "twitter": "https://twitter.com/johndoe"
    }
  },
  "work": [
    {
      "company": "Tech Company Inc",
      "title": "Senior Software Engineer",
      "start": "2020-01",
      "end": null,
      "location": "San Francisco, CA",
      "summary": "Led development of scalable web applications",
      "highlights": [
        "Increased system performance by 40%",
        "Mentored 3 junior developers"
      ]
    }
  ],
  "education": [
    {
      "school": "University of California",
      "degree": "Bachelor of Science in Computer Science",
      "start": "2016-09",
      "end": "2020-05"
    }
  ],
  "answers": {
    "workAuthorizationUS": "Yes",
    "relocation": "Yes",
    "remoteTimezone": "PST",
    "noticePeriodDays": 14
  },
  "custom": {
    "visa": "Authorized to work",
    "salaryUSD": "Open"
  }
}
\`\`\`

Important guidelines:
- Use real information, not placeholders
- Ensure all required fields are filled
- Dates must be in YYYY-MM format
- URLs must be valid and complete
- Keep summaries and highlights concise but informative
- Custom fields are optional but can include additional relevant information

Generate the profile now:`;
