import React, { useEffect, useState } from 'react';
import {
  Control,
  FieldErrors,
  UseFormRegister,
  UseFormSetValue,
  useFieldArray,
  useWatch,
} from 'react-hook-form';
import { fetchAutocomplete } from '../../services/candidate.api';
import type { CandidateFormValues } from './CandidateForm.types';
import styles from './CandidateForm.module.css';

type Props = {
  control: Control<CandidateFormValues>;
  register: UseFormRegister<CandidateFormValues>;
  setValue: UseFormSetValue<CandidateFormValues>;
  errors: FieldErrors<CandidateFormValues>;
};

function CompanyAutocomplete({
  index,
  control,
  register,
  setValue,
}: {
  index: number;
  control: Control<CandidateFormValues>;
  register: UseFormRegister<CandidateFormValues>;
  setValue: UseFormSetValue<CandidateFormValues>;
}) {
  const name = `experience.${index}.company` as const;
  const value = useWatch({ control, name }) ?? '';
  const [suggestions, setSuggestions] = useState<string[]>([]);

  useEffect(() => {
    const q = String(value).trim();
    if (q.length < 1) {
      setSuggestions([]);
      return;
    }
    const t = window.setTimeout(async () => {
      try {
        const list = await fetchAutocomplete('company', q);
        setSuggestions(list);
      } catch {
        setSuggestions([]);
      }
    }, 250);
    return () => window.clearTimeout(t);
  }, [value]);

  return (
    <div className={styles.fieldWrap}>
      <label htmlFor={`exp-co-${index}`}>Company</label>
      <input
        id={`exp-co-${index}`}
        autoComplete="off"
        {...register(name, { required: 'Company is required' })}
      />
      {suggestions.length > 0 ? (
        <ul className={styles.autocompleteList} role="listbox">
          {suggestions.map((s) => (
            <li key={s}>
              <button
                type="button"
                className={styles.autocompleteItem}
                onClick={() => {
                  setValue(`experience.${index}.company`, s, {
                    shouldValidate: true,
                    shouldDirty: true,
                  });
                }}
              >
                {s}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export function ExperienceFieldArray({
  control,
  register,
  setValue,
  errors,
}: Props) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'experience',
  });

  return (
    <>
      {fields.map((field, index) => (
        <div key={field.id} className={styles.repeatBlock}>
          <div className={styles.repeatHead}>
            <span className={styles.repeatTitle}>Experience {index + 1}</span>
            {fields.length > 1 ? (
              <button
                type="button"
                className={styles.btnGhost}
                onClick={() => remove(index)}
              >
                Remove
              </button>
            ) : null}
          </div>
          <div className={styles.grid}>
            <div className={styles.span2}>
              <CompanyAutocomplete
                index={index}
                control={control}
                register={register}
                setValue={setValue}
              />
              {errors.experience?.[index]?.company ? (
                <span className={styles.fieldError}>
                  {errors.experience[index]?.company?.message as string}
                </span>
              ) : null}
            </div>
            <div>
              <label htmlFor={`exp-role-${index}`}>Role</label>
              <input
                id={`exp-role-${index}`}
                {...register(`experience.${index}.role` as const, {
                  required: 'Role is required',
                })}
              />
              {errors.experience?.[index]?.role ? (
                <span className={styles.fieldError}>
                  {errors.experience[index]?.role?.message as string}
                </span>
              ) : null}
            </div>
            <div>
              <label htmlFor={`exp-start-${index}`}>Start date</label>
              <input
                id={`exp-start-${index}`}
                type="date"
                {...register(`experience.${index}.startDate` as const, {
                  required: 'Start date is required',
                })}
              />
              {errors.experience?.[index]?.startDate ? (
                <span className={styles.fieldError}>
                  {errors.experience[index]?.startDate?.message as string}
                </span>
              ) : null}
            </div>
            <div>
              <label htmlFor={`exp-end-${index}`}>End date</label>
              <input
                id={`exp-end-${index}`}
                type="date"
                {...register(`experience.${index}.endDate` as const)}
              />
            </div>
            <div className={styles.span2}>
              <label htmlFor={`exp-desc-${index}`}>Description</label>
              <textarea
                id={`exp-desc-${index}`}
                rows={2}
                {...register(`experience.${index}.description` as const)}
              />
            </div>
          </div>
        </div>
      ))}
      <button
        type="button"
        className={styles.btnSecondary}
        onClick={() =>
          append({
            company: '',
            role: '',
            startDate: '',
            endDate: '',
            description: '',
          })
        }
      >
        + Add experience
      </button>
    </>
  );
}
