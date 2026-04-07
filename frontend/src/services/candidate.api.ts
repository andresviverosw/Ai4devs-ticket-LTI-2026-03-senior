import axios, { isAxiosError } from 'axios';

const baseURL = process.env.REACT_APP_API_URL ?? 'http://localhost:4000';

export const api = axios.create({
  baseURL,
  withCredentials: true,
});

export type CreateCandidatePayload = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  address: string | null;
  education: Array<{
    institution: string;
    degree: string;
    startDate: string;
    endDate: string | null;
  }>;
  experience: Array<{
    company: string;
    role: string;
    startDate: string;
    endDate: string | null;
    description: string | null;
  }>;
};

export type CreatedCandidate = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
};

export async function createCandidate(
  data: CreateCandidatePayload,
): Promise<CreatedCandidate> {
  const { data: res } = await api.post<CreatedCandidate>('/api/candidates', data);
  return res;
}

export async function uploadCv(candidateId: string, file: File): Promise<void> {
  const body = new FormData();
  body.append('file', file);
  await api.post(`/api/candidates/${candidateId}/upload-cv`, body);
}

export async function fetchAutocomplete(
  field: 'education' | 'company',
  q: string,
): Promise<string[]> {
  const { data } = await api.get<{ suggestions: string[] }>(
    '/api/candidates/autocomplete',
    {
      params: {
        field: field === 'education' ? 'education' : 'company',
        q,
      },
    },
  );
  return data.suggestions ?? [];
}

export function getApiErrorMessage(err: unknown, fallback: string): string {
  if (isAxiosError(err)) {
    const data = err.response?.data as { message?: string } | undefined;
    if (data?.message && typeof data.message === 'string') {
      return data.message;
    }
  }
  return fallback;
}
