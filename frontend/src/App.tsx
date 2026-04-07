import React, { useRef } from 'react';
import { AddCandidateButton } from './components/AddCandidateButton';
import { CandidateForm } from './components/CandidateForm/CandidateForm';
import './App.css';

function App() {
  const formAnchorRef = useRef<HTMLDivElement>(null);

  const scrollToForm = () => {
    formAnchorRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="dashboard-header-inner">
          <div>
            <p className="dashboard-eyebrow">LTI Talent Tracking</p>
            <h1 className="dashboard-title">Recruiter dashboard</h1>
            <p className="dashboard-subtitle">
              Review pipelines and add new candidates to your ATS.
            </p>
          </div>
          <AddCandidateButton onClick={scrollToForm} />
        </div>
      </header>

      <main className="dashboard-main">
        <div ref={formAnchorRef} className="form-anchor" />
        <section className="form-section-wrap" aria-labelledby="new-candidate-heading">
          <h2 id="new-candidate-heading" className="form-section-title">
            New candidate
          </h2>
          <CandidateForm />
        </section>
      </main>
    </div>
  );
}

export default App;
