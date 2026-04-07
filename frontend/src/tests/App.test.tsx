import React from 'react';
import { render, screen } from '@testing-library/react';
import App from '../App';

test('renders recruiter dashboard and Add Candidate CTA', () => {
  render(<App />);
  expect(screen.getByRole('heading', { name: /recruiter dashboard/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /add candidate/i })).toBeInTheDocument();
});
