import React from 'react';

type Props = {
  onClick: () => void;
};

export function AddCandidateButton({ onClick }: Props) {
  return (
    <button
      type="button"
      className="cta-add-candidate"
      onClick={onClick}
    >
      Add Candidate
    </button>
  );
}
