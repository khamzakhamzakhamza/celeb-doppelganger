import './ResultsModal.scss';
import type { ReactNode } from 'react';

type ResultsModalProps = {
  openModal: boolean;
  onClose: () => void;
  goAgain?: () => void;
  children?: ReactNode;
};

export function ResultsModal({ openModal, onClose, goAgain, children }: ResultsModalProps) {
  if (!openModal) return null;

  return (
    <div className="results-modal" role="dialog" aria-modal="true">
      <div className="results-modal__panel">
        <button
          type="button"
          className="results-modal__close"
          onClick={onClose}
          aria-label="Close results modal"
        >
          x
        </button>
        <div className="results-modal__content">
          {children ?? <p>Results will go here.</p>}
        </div>
        {goAgain && (
          <button
            type="button"
            className="results-modal__go-again"
            onClick={goAgain}
          >
            Go again
          </button>
        )}
      </div>
    </div>
  );
}
