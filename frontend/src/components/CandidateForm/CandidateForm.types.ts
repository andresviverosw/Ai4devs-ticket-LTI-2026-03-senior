export type CandidateFormValues = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  education: Array<{
    institution: string;
    degree: string;
    startDate: string;
    endDate: string;
  }>;
  experience: Array<{
    company: string;
    role: string;
    startDate: string;
    endDate: string;
    description: string;
  }>;
};
