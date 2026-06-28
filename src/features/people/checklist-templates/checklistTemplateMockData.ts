import type { ChecklistTemplate } from './checklistTemplateTypes';

const documentTemplate = (id: string, name: string, documents: string[]): ChecklistTemplate => ({
  id,
  name,
  type: 'onboarding',
  description: 'Required onboarding documents assigned to the Reporting Manager.',
  status: 'active',
  appliesTo: 'company',
  departmentIds: [],
  positionIds: [],
  items: documents.map((document, index) => ({
    id: `${id}-${index + 1}`,
    title: document,
    description: `Collect and verify ${document}.`,
    assigneeType: 'Reporting Manager',
    assigneePositionId: '',
    assigneeEmployeeId: '',
    dueOffsetValue: 3,
    dueOffsetUnit: 'days',
    required: true,
    requiredDocument: document,
    sortOrder: index
  })),
  createdAt: '2026-03-01T10:00:00Z',
  updatedAt: '2026-06-28T10:00:00Z'
});

export const SEED_CHECKLIST_TEMPLATES: ChecklistTemplate[] = [
  documentTemplate('ct-onboarding-hr', 'HR Onboarding Checklist', [
    'NIC', 'Resume', 'Educational Certificates', 'Experience Certificate',
    'Passport Size Photo', 'Signed Offer Letter', 'Signed NDA'
  ]),
  documentTemplate('ct-onboarding-manager', 'Manager Onboarding Checklist', [
    'NIC', 'Resume', 'Educational Certificates', 'Experience Certificate',
    'Previous Employment Letter', 'Police Clearance Report', 'Passport Size Photo',
    'Signed Offer Letter', 'Signed NDA'
  ]),
  documentTemplate('ct-onboarding-employee', 'Employee Onboarding Checklist', [
    'NIC', 'Resume', 'Educational Certificates', 'Passport Size Photo',
    'Signed Offer Letter', 'Signed NDA'
  ]),
  documentTemplate('ct-onboarding-intern', 'Intern Onboarding Checklist', [
    'NIC', 'Resume', 'University Recommendation Letter', 'Internship Request Letter',
    'Passport Size Photo'
  ])
,
  {
    ...documentTemplate('ct-offboarding-standard', 'Employee Offboarding Checklist', [
      'Resignation Letter', 'Knowledge Transfer', 'Equipment Return', 'Access Revocation',
      'Final Payroll Clearance', 'Exit Interview'
    ]),
    type: 'offboarding',
    description: 'Required clearance tasks for departing employees.'
  }
];