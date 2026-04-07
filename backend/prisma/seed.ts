import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/** Seeds ≥5 institutions and ≥5 companies for autocomplete (Ticket 1). */
async function main() {
  await prisma.candidate.deleteMany({
    where: { email: 'jane.sample@example.com' },
  });

  await prisma.candidate.create({
    data: {
      firstName: 'Jane',
      lastName: 'Sample',
      email: 'jane.sample@example.com',
      phone: '+1 555-0100',
      address: '100 Market St, San Francisco, CA',
      education: {
        create: [
          {
            institution: 'Stanford University',
            degree: 'BS Computer Science',
            startDate: new Date('2016-09-01'),
            endDate: new Date('2020-06-15'),
          },
          {
            institution: 'MIT',
            degree: 'MS Artificial Intelligence',
            startDate: new Date('2020-09-01'),
            endDate: new Date('2022-05-20'),
          },
          {
            institution: 'Universidad Nacional',
            degree: 'Licenciatura en Sistemas',
            startDate: new Date('2012-03-01'),
            endDate: new Date('2017-12-01'),
          },
          {
            institution: 'University of Oxford',
            degree: 'MSc Software Engineering',
            startDate: new Date('2018-09-01'),
            endDate: new Date('2019-09-01'),
          },
          {
            institution: 'ETH Zurich',
            degree: 'PhD Computer Science',
            startDate: new Date('2019-10-01'),
            endDate: new Date('2023-08-31'),
          },
        ],
      },
      experience: {
        create: [
          {
            company: 'Acme Corp',
            role: 'Software Engineer',
            startDate: new Date('2022-07-01'),
            endDate: null,
            description: 'Full-stack development for internal tools.',
          },
          {
            company: 'TechStart Inc',
            role: 'Junior Developer',
            startDate: new Date('2020-06-01'),
            endDate: new Date('2022-06-30'),
            description: 'React and Node.js APIs.',
          },
          {
            company: 'Global Solutions Ltd',
            role: 'Intern',
            startDate: new Date('2019-01-01'),
            endDate: new Date('2019-08-31'),
            description: 'QA and automation scripts.',
          },
          {
            company: 'CloudNine SaaS',
            role: 'Backend Engineer',
            startDate: new Date('2023-01-15'),
            endDate: null,
            description: 'APIs and PostgreSQL.',
          },
          {
            company: 'DataWorks Analytics',
            role: 'Data Engineer',
            startDate: new Date('2021-03-01'),
            endDate: new Date('2022-12-15'),
            description: 'ETL pipelines.',
          },
        ],
      },
    },
  });
}

main()
  .then(() => {
    console.log('Seed completed.');
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
