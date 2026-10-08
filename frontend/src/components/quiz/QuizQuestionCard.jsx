import React from 'react';
import { LIKERT_SCALE } from '../../constants/workshopData';

export default function QuizQuestionCard({
  currentNum,
  total,
  currentQuestion,
  progressPct,
  selectedRating,
  onSelectRating,
  onPrev,
  onNext,
  submitting,
  currentIndex
}) {
  return (
    <div id="screen-quiz" className="mobile-card step-screen active">
      {/* Barre de progression avec dégradé bleu néon */}
      <div className="quiz-progress-bar-wrap">
        <div className="quiz-progress-track">
          <div
            className="quiz-progress-fill"
            id="quizProgressBar"
            style={{ width: `${progressPct}%` }}
          ></div>
        </div>
        <div className="quiz-progress-meta">
          <span id="quizStepText">Question {currentNum} sur {total}</span>
          <span id="quizPercentText">{progressPct}%</span>
        </div>
      </div>

      {/* Rappel de l'échelle d'évaluation officielle 1 à 5 */}
      <div className="likert-legend-bar">
        <span className="legend-scale-title">Échelle d'évaluation :</span>
        <div className="legend-scale-items">
          <span><strong>1</strong> = Pas du tout d'accord</span>
          <span><strong>3</strong> = Neutre / Parfois vrai</span>
          <span><strong>5</strong> = Tout à fait d'accord</span>
        </div>
      </div>

      <div className="card-body">
        <div className="quiz-question-box">
          <div className="question-header-row">
            <span className="question-tag" id="questionCategory">
              Affirmation {currentNum} / {total} ({currentQuestion.code})
            </span>
            <span className="question-subtext" id="questionSubtext">
              Évaluez de 1 à 5
            </span>
          </div>
          <h3 className="question-title" id="questionPrompt">
            « {currentQuestion.text} »
          </h3>
        </div>

        {/* Échelle Likert 1 à 5 interactive */}
        <div className="likert-options-container" id="quizOptionsContainer">
          {LIKERT_SCALE.map((opt) => {
            const isSelected = selectedRating === opt.val;
            return (
              <div
                key={opt.val}
                className={`likert-option-card ${isSelected ? 'selected' : ''}`}
                onClick={() => onSelectRating(opt.val)}
                style={{ cursor: 'pointer' }}
              >
                <div className="likert-badge">{opt.val}</div>
                <div className="likert-label-text">{opt.label}</div>
              </div>
            );
          })}
        </div>

        {/* Navigation Précédent / Suivant / Valider */}
        <div
          className="quiz-nav-row mt-4"
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem' }}
        >
          <button
            type="button"
            className="btn btn-outline"
            id="btnQuizPrev"
            onClick={onPrev}
            disabled={submitting}
          >
            {currentIndex === 0 ? '← Nom & Prénom' : '← Précédent'}
          </button>

          <button
            type="button"
            className={`btn ${currentNum === total ? 'btn-primary' : 'btn-secondary'} pulse-glow`}
            id="btnQuizNext"
            onClick={onNext}
            disabled={submitting}
          >
            {submitting
              ? 'Calcul psychologique en cours...'
              : currentNum === total
              ? 'Valider & Découvrir mon Profil Schtroumpf ➔'
              : 'Suivant →'}
          </button>
        </div>
      </div>
    </div>
  );
}
