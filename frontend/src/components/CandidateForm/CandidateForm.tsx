import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  createCandidate,
  uploadCv,
  getApiErrorMessage,
  type CreateCandidatePayload,
} from '../../services/candidate.api';
import { EducationFieldArray } from './EducationFieldArray';
import { ExperienceFieldArray } from './ExperienceFieldArray';
import { CvUploadField } from './CvUploadField';
import type { CandidateFormValues } from './CandidateForm.types';
import styles from './CandidateForm.module.css';

const defaultValues: CandidateFormValues = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  address: '',
  education: [
    { institution: '', degree: '', startDate: '', endDate: '' },
  ],
  experience: [
    {
      company: '',
      role: '',
      startDate: '',
      endDate: '',
      description: '',
    },
  ],
};

function filterEducation(rows: CandidateFormValues['education']) {
  return rows.filter(
    (r) =>
      r.institution.trim() ||
      r.degree.trim() ||
      r.startDate.trim() ||
      r.endDate.trim(),
  );
}

function filterExperience(rows: CandidateFormValues['experience']) {
  return rows.filter(
    (r) =>
      r.company.trim() ||
      r.role.trim() ||
      r.startDate.trim() ||
      r.endDate.trim() ||
      r.description.trim(),
  );
}

export function CandidateForm() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [cvError, setCvError] = useState<string | undefined>();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<CandidateFormValues>({ defaultValues });

  const onSubmit = async (data: CandidateFormValues) => {
    setServerError(null);
    setCvError(undefined);
    setSuccess(false);

    if (cvFile) {
      const okMime =
        cvFile.type === 'application/pdf' ||
        cvFile.type ===
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      const okExt = /\.(pdf|docx)$/i.test(cvFile.name);
      if (!okMime && !okExt) {
        setCvError('Please upload a PDF or DOCX file.');
        return;
      }
    }

    const education = filterEducation(data.education);
    const experience = filterExperience(data.experience);

    for (let i = 0; i < education.length; i++) {
      const r = education[i];
      if (!r.institution.trim() || !r.degree.trim() || !r.startDate.trim()) {
        setServerError(
          `Education ${i + 1}: complete institution, degree, and start date, or remove empty rows.`,
        );
        return;
      }
    }

    for (let i = 0; i < experience.length; i++) {
      const r = experience[i];
      if (!r.company.trim() || !r.role.trim() || !r.startDate.trim()) {
        setServerError(
          `Experience ${i + 1}: complete company, role, and start date, or remove empty rows.`,
        );
        return;
      }
    }

    const payload: CreateCandidatePayload = {
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      email: data.email.trim().toLowerCase(),
      phone: data.phone.trim() || null,
      address: data.address.trim() || null,
      education: education.map((e) => ({
        institution: e.institution.trim(),
        degree: e.degree.trim(),
        startDate: e.startDate,
        endDate: e.endDate.trim() || null,
      })),
      experience: experience.map((x) => ({
        company: x.company.trim(),
        role: x.role.trim(),
        startDate: x.startDate,
        endDate: x.endDate.trim() || null,
        description: x.description.trim() || null,
      })),
    };

    setSubmitting(true);
    try {
      const created = await createCandidate(payload);
      if (cvFile && created.id) {
        await uploadCv(created.id, cvFile);
      }
      setSuccess(true);
      reset(defaultValues);
      setCvFile(null);
      const input = document.getElementById(
        'candidate-cv',
      ) as HTMLInputElement | null;
      if (input) input.value = '';
    } catch (e) {
      setServerError(
        getApiErrorMessage(e, 'Could not save the candidate. Please try again.'),
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      id="candidate-form"
      className={styles.form}
      onSubmit={handleSubmit(onSubmit)}
      noValidate
    >
      {success ? (
        <div
          className={`${styles.banner} ${styles.bannerSuccess}`}
          role="status"
        >
          <span>Candidate saved successfully.</span>
          <button
            type="button"
            className={styles.bannerDismiss}
            onClick={() => setSuccess(false)}
            aria-label="Dismiss confirmation"
          >
            ×
          </button>
        </div>
      ) : null}

      {serverError ? (
        <div className={`${styles.banner} ${styles.bannerError}`} role="alert">
          {serverError}
        </div>
      ) : null}

      <section className={styles.section} aria-labelledby="personal-heading">
        <h3 id="personal-heading">Personal information</h3>
        <div className={styles.grid}>
          <div>
            <label htmlFor="firstName">First name</label>
            <input
              id="firstName"
              {...register('firstName', { required: 'First name is required' })}
            />
            {errors.firstName ? (
              <span className={styles.fieldError}>
                {errors.firstName.message}
              </span>
            ) : null}
          </div>
          <div>
            <label htmlFor="lastName">Last name</label>
            <input
              id="lastName"
              {...register('lastName', { required: 'Last name is required' })}
            />
            {errors.lastName ? (
              <span className={styles.fieldError}>
                {errors.lastName.message}
              </span>
            ) : null}
          </div>
          <div className={styles.span2}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Enter a valid email address',
                },
              })}
            />
            {errors.email ? (
              <span className={styles.fieldError}>{errors.email.message}</span>
            ) : null}
          </div>
          <div>
            <label htmlFor="phone">Phone</label>
            <input id="phone" type="tel" {...register('phone')} />
          </div>
          <div className={styles.span2}>
            <label htmlFor="address">Address</label>
            <textarea id="address" rows={2} {...register('address')} />
          </div>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="edu-heading">
        <h3 id="edu-heading">Education</h3>
        <EducationFieldArray
          control={control}
          register={register}
          setValue={setValue}
          errors={errors}
        />
      </section>

      <section className={styles.section} aria-labelledby="exp-heading">
        <h3 id="exp-heading">Work experience</h3>
        <ExperienceFieldArray
          control={control}
          register={register}
          setValue={setValue}
          errors={errors}
        />
      </section>

      <section className={styles.section} aria-labelledby="cv-heading">
        <h3 id="cv-heading">Résumé / CV</h3>
        <CvUploadField
          fileName={cvFile?.name ?? null}
          error={cvError}
          onChange={(f) => {
            setCvFile(f);
            setCvError(undefined);
          }}
        />
      </section>

      <div className={styles.actions}>
        <button type="submit" className={styles.btnPrimary} disabled={submitting}>
          {submitting ? 'Saving…' : 'Save candidate'}
        </button>
      </div>
    </form>
  );
}
