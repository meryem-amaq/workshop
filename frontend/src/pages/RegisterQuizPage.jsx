import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkshop } from '../context/WorkshopContext';
import { OFFICIAL_15_QUESTIONS } from '../constants/workshopData';
import { IdentifyForm, QuizQuestionCard } from '../components/quiz';

export default function RegisterQuizPage() {
  const { setCurrentUser, refreshWorkshopData, showToast } = useWorkshop();
  const navigate = useNavigate();

  // State: 'identify' | 'quiz' with localStorage recovery
  const [step, setStep] = useState(() => {
    try {
      const saved = localStorage.getItem('smurf_quiz_draft');
      return saved ? JSON.parse(saved).step || 'identify' : 'identify';
    } catch {
      return 'identify';
    }
  });
  const [firstName, setFirstName] = useState(() => {
    try {
      const saved = localStorage.getItem('smurf_quiz_draft');
      return saved ? JSON.parse(saved).firstName || '' : '';
    } catch {
      return '';
    }
  });
  const [lastName, setLastName] = useState(() => {
    try {
      const saved = localStorage.getItem('smurf_quiz_draft');
      return saved ? JSON.parse(saved).lastName || '' : '';
    } catch {
      return '';
    }
  });
  const [currentIndex, setCurrentIndex] = useState(() => {
    try {
      const saved = localStorage.getItem('smurf_quiz_draft');
      return saved ? JSON.parse(saved).currentIndex || 0 : 0;
    } catch {
      return 0;
    }
  });
  const [ratings, setRatings] = useState(() => {
    try {
      const saved = localStorage.getItem('smurf_quiz_draft');
      return saved && Array.isArray(JSON.parse(saved).ratings)
        ? JSON.parse(saved).ratings
        : new Array(OFFICIAL_15_QUESTIONS.length).fill(null);
    } catch {
      return new Array(OFFICIAL_15_QUESTIONS.length).fill(null);
    }
  });
  const [submitting, setSubmitting] = useState(false);

  // Persistance automatique de la progression
  React.useEffect(() => {
    try {
      if (step === 'quiz') {
        localStorage.setItem(
          'smurf_quiz_draft',
          JSON.stringify({ step, firstName, lastName, currentIndex, ratings })
        );
      }
    } catch {}
  }, [step, firstName, lastName, currentIndex, ratings]);

  // Étape 1 : Valider l'identification et passer au questionnaire
  const handleStartQuiz = (e) => {
    if (e && e.preventDefault) e.preventDefault();

    let fName = firstName.trim();
    let lName = lastName.trim();

    if (!fName && !lName) {
      showToast('Veuillez saisir au moins votre prénom pour démarrer.', 'error');
      return;
    }

    if (!lName) {
      const parts = fName.split(' ');
      if (parts.length > 1) {
        fName = parts[0];
        lName = parts.slice(1).join(' ');
      } else {
        lName = 'Schtroumpf';
      }
    }

    setFirstName(fName);
    setLastName(lName);
    setStep('quiz');
    setCurrentIndex(0);
  };

  const handleSelectRating = (val) => {
    const updated = [...ratings];
    updated[currentIndex] = val;
    setRatings(updated);
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else {
      setStep('identify');
    }
  };

  const handleNext = () => {
    // Si aucune note n'est sélectionnée pour cette question, attribuer 3 (Neutre) par défaut pour ne jamais bloquer
    if (ratings[currentIndex] === null) {
      const updated = [...ratings];
      updated[currentIndex] = 3;
      setRatings(updated);
    }

    if (currentIndex < OFFICIAL_15_QUESTIONS.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      handleSubmitQuiz();
    }
  };

  // Étape 2 : Soumission du quiz (Calcul du profil officiel sur 75 points)
  const handleSubmitQuiz = async () => {
    setSubmitting(true);
    try {
      // S'assurer que toutes les 15 notes sont renseignées (remplacer les null éventuels par 3)
      const currentRatingVal = ratings[currentIndex] !== null ? ratings[currentIndex] : 3;
      const finalRatings = ratings.map((r, idx) =>
        idx === currentIndex ? currentRatingVal : r === null ? 3 : r
      );

      const fName = firstName.trim() || 'Participant';
      const lName = lastName.trim() || 'Schtroumpf';

      const payload = {
        first_name: fName,
        last_name: lName,
        ratings: finalRatings
      };

      const res = await fetch('/api/participants/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur lors de l\'enregistrement');

      localStorage.removeItem('smurf_quiz_draft');
      setCurrentUser(data.participant);
      showToast('🎉 Profil Schtroumpf calculé avec succès !', 'success');
      await refreshWorkshopData();
      navigate('/waiting');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const total = OFFICIAL_15_QUESTIONS.length;
  const currentNum = currentIndex + 1;
  const currentQuestion = OFFICIAL_15_QUESTIONS[currentIndex];
  const progressPct = Math.round((currentNum / total) * 100);
  const selectedRating = ratings[currentIndex];

  return (
    <div className="view-panel active">
      <div className="participant-screen-container">
        {step === 'identify' ? (
          <IdentifyForm
            firstName={firstName}
            setFirstName={setFirstName}
            lastName={lastName}
            setLastName={setLastName}
            onSubmit={handleStartQuiz}
            onBack={() => navigate('/')}
          />
        ) : (
          <QuizQuestionCard
            currentNum={currentNum}
            total={total}
            currentQuestion={currentQuestion}
            progressPct={progressPct}
            selectedRating={selectedRating}
            onSelectRating={handleSelectRating}
            onPrev={handlePrev}
            onNext={currentNum === total ? handleSubmitQuiz : handleNext}
            submitting={submitting}
            currentIndex={currentIndex}
          />
        )}
      </div>
    </div>
  );
}
