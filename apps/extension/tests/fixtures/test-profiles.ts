import { TestProfile } from '../utils/extension';

export const TEST_PROFILES: Record<string, TestProfile> = {
  basic: {
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1-555-0123',
    linkedin: 'https://linkedin.com/in/johndoe',
    github: 'https://github.com/johndoe',
    website: 'https://johndoe.dev',
    location: 'San Francisco, CA',
    experience: '4-5',
    workAuthorization: 'authorized',
    relocation: 'yes',
    remote: 'hybrid',
    salary: '$90,000 - $110,000',
    startDate: '2024-02-01',
    coverLetter: 'I am excited to apply for this position and contribute to your team.',
    references: 'Available upon request'
  },
  
  senior: {
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    phone: '+1-555-0456',
    linkedin: 'https://linkedin.com/in/janesmith',
    github: 'https://github.com/janesmith',
    website: 'https://janesmith.dev',
    location: 'New York, NY',
    experience: '6-10',
    workAuthorization: 'authorized',
    relocation: 'no',
    remote: 'full_remote',
    salary: '$120,000 - $150,000',
    startDate: '2024-03-01',
    coverLetter: 'With over 8 years of experience in software development, I am excited to bring my expertise to your team.',
    references: 'Dr. Sarah Johnson - CTO at TechCorp, John Wilson - Senior Engineer at StartupXYZ'
  },
  
  entry: {
    name: 'Alex Johnson',
    email: 'alex.johnson@example.com',
    phone: '+1-555-0789',
    linkedin: 'https://linkedin.com/in/alexjohnson',
    github: 'https://github.com/alexjohnson',
    website: '',
    location: 'Austin, TX',
    experience: '0-1',
    workAuthorization: 'sponsor_required',
    relocation: 'maybe',
    remote: 'office',
    salary: '$60,000 - $80,000',
    startDate: '2024-01-15',
    coverLetter: 'As a recent graduate, I am eager to start my career in software development and learn from experienced professionals.',
    references: 'Professor Mike Davis - University of Texas, Sarah Brown - Internship Supervisor at LocalTech'
  }
};

export const FIELD_MAPPINGS = {
  // Common field patterns across different ATS platforms
  name: ['name', 'applicant.name', 'full_name', 'first_name', 'last_name'],
  email: ['email', 'applicant.email', 'email_address', 'contact_email'],
  phone: ['phone', 'applicant.phone', 'phone_number', 'contact_phone'],
  linkedin: ['linkedin', 'applicant.linkedin', 'linkedin_profile', 'linkedin_url'],
  github: ['github', 'applicant.github', 'github_profile', 'github_url'],
  website: ['website', 'applicant.website', 'personal_website', 'portfolio_url'],
  location: ['location', 'applicant.location', 'city', 'address', 'residence'],
  experience: ['experience', 'applicant.experience', 'years_experience', 'experience_level'],
  workAuthorization: ['work_authorization', 'applicant.work_authorization', 'visa_status', 'authorization'],
  relocation: ['relocation', 'applicant.relocation', 'willing_relocate', 'relocate'],
  remote: ['remote', 'applicant.remote', 'remote_work', 'work_preference'],
  salary: ['salary', 'applicant.salary_expectation', 'salary_expectation', 'expected_salary'],
  startDate: ['start_date', 'applicant.start_date', 'available_date', 'start_availability'],
  coverLetter: ['cover_letter', 'applicant.cover_letter', 'cover_letter_text', 'message'],
  references: ['references', 'applicant.references', 'professional_references', 'referees']
};
