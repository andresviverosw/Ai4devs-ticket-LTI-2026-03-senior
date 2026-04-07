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

function InstitutionAutocomplete({
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
  const name = `education.${index}.institution` as const;
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
        const list = await fetchAutocomplete('education', q);
        setSuggestions(list);
      } catch {
        setSuggestions([]);
      }
    }, 250);
    return () => window.clearTimeout(t);
  }, [value]);

  return (
    <div className={styles.fieldWrap}>
      <label htmlFor={`edu-inst-${index}`}>Institution</label>
      <input
        id={`edu-inst-${index}`}
        autoComplete="off"
        {...register(name, { required: 'Institution is required' })}
      />
      {suggestions.length > 0 ? (
        <ul className={styles.autocompleteList} role="listbox">
          {suggestions.map((s) => (
            <li key={s}>
              <button
                type="button"
                className={styles.autocompleteItem}
                onClick={() => {
                  setValue(`education.${index}.institution`, s, {
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

export function EducationFieldArray({
  control,
  register,
  setValue,
  errors,
}: Props) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'education',
  });

  return (
    <>
      {fields.map((field, index) => (
        <div key={field.id} className={styles.repeatBlock}>
          <div className={styles.repeatHead}>
            <span className={styles.repeatTitle}>Education {index + 1}</span>
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
              <InstitutionAutocomplete
                index={index}
                control={control}
                register={register}
                setValue={setValue}
              />
              {errors.education?.[index]?.institution ? (
                <span className={styles.fieldError}>
                  {errors.education[index]?.institution?.message as string}
                </span>
              ) : null}
            </div>
            <div>
              <label htmlFor={`edu-deg-${index}`}>Degree</label>
              <input
                id={`edu-deg-${index}`}
                {...register(`education.${index}.degree` as const, {
                  required: 'Degree is required',
                })}
              />
              {errors.education?.[index]?.degree ? (
                <span className={styles.fieldError}>
                  {errors.education[index]?.degree?.message as string}
                </span>
              ) : null}
            </div>
            <div>
              <label htmlFor={`edu-start-${index}`}>Start date</label>
              <input
                id={`edu-start-${index}`}
                type="date"
                {...register(`education.${index}.startDate` as const, {
                  required: 'Start date is required',
                })}
              />
              {errors.education?.[index]?.startDate ? (
                <span className={styles.fieldError}>
                  {errors.education[index]?.startDate?.message as string}
                </span>
              ) : null}
            </div>
            <div>
              <label htmlFor={`edu-end-${index}`}>End date</label>
              <input
                id={`edu-end-${index}`}
                type="date"
                {...register(`education.${index}.endDate` as const)}
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
            institution: '',
            degree: '',
            startDate: '',
            endDate: '',
          })
        }
      >
        + Add education
      </button>
    </>
  );
}
