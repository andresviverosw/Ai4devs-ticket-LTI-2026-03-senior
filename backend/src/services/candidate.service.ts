import { Prisma } from '@prisma/client';
import { prisma } from '../db';
import type { CandidateCreateInput } from '../validation/candidate.schemas';

function parseDateOnly(s: string): Date {
  return new Date(`${s}T12:00:00.000Z`);
}

export function mapCandidateToResponse(
  row: Prisma.CandidateGetPayload<{
    include: { education: true; experience: true };
  }>,
) {
  return {
    id: row.id,
    firstName: row.firstName,
    lastName: row.lastName,
    email: row.email,
    phone: row.phone,
    address: row.address,
    cvUploaded: Boolean(row.cvFilePath),
    education: row.education.map((e) => ({
      id: e.id,
      institution: e.institution,
      degree: e.degree,
      startDate: e.startDate.toISOString().slice(0, 10),
      endDate: e.endDate ? e.endDate.toISOString().slice(0, 10) : null,
    })),
    experience: row.experience.map((x) => ({
      id: x.id,
      company: x.company,
      role: x.role,
      startDate: x.startDate.toISOString().slice(0, 10),
      endDate: x.endDate ? x.endDate.toISOString().slice(0, 10) : null,
      description: x.description,
    })),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function createCandidateWithRelations(input: CandidateCreateInput) {
  const email = input.email.trim().toLowerCase();

  const created = await prisma.candidate.create({
    data: {
      firstName: input.firstName.trim(),
      lastName: input.lastName.trim(),
      email,
      phone: input.phone?.trim() || null,
      address: input.address?.trim() || null,
      education: {
        create: input.education.map((e) => ({
          institution: e.institution.trim(),
          degree: e.degree.trim(),
          startDate: parseDateOnly(e.startDate),
          endDate: e.endDate ? parseDateOnly(e.endDate) : null,
        })),
      },
      experience: {
        create: input.experience.map((x) => ({
          company: x.company.trim(),
          role: x.role.trim(),
          startDate: parseDateOnly(x.startDate),
          endDate: x.endDate ? parseDateOnly(x.endDate) : null,
          description: x.description?.trim() || null,
        })),
      },
    },
    include: { education: true, experience: true },
  });

  return mapCandidateToResponse(created);
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function findCandidateById(id: string) {
  if (!UUID_RE.test(id)) return null;
  return prisma.candidate.findUnique({ where: { id } });
}

export async function setCandidateCvPath(id: string, relativePath: string) {
  return prisma.candidate.update({
    where: { id },
    data: { cvFilePath: relativePath },
  });
}

export async function autocompleteInstitutions(q: string): Promise<string[]> {
  const rows = await prisma.candidateEducation.findMany({
    where: {
      institution: { contains: q, mode: 'insensitive' },
    },
    select: { institution: true },
    distinct: ['institution'],
    take: 20,
    orderBy: { institution: 'asc' },
  });
  return rows.map((r) => r.institution);
}

export async function autocompleteCompanies(q: string): Promise<string[]> {
  const rows = await prisma.candidateExperience.findMany({
    where: {
      company: { contains: q, mode: 'insensitive' },
    },
    select: { company: true },
    distinct: ['company'],
    take: 20,
    orderBy: { company: 'asc' },
  });
  return rows.map((r) => r.company);
}
