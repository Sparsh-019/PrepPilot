import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function QuizAttempt() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [review, setReview] = useState(null);
  const [startedAt] = useState(Date.now());

  useEffect(() => {
    api
      .get(`/quizzes/${id}`)
      .then(({ data }) => {
        setQuiz(data.quiz);
        setAnswers(new Array(data.quiz.questions.length).fill(-1));
      })
      .catch(() => setError('Could not load this quiz.'))
      .finally(() => setLoading(false));
  }, [id]);

  const selectAnswer = (qIdx, optionIdx) => {
    const next = [...answers];
    next[qIdx] = optionIdx;
    setAnswers(next);
  };

  const handleSubmit = useCallback(async () => {
    setSubmitting(true);
    setError('');
    try {
      const timeTakenSeconds = Math.round((Date.now() - startedAt) / 1000);
      const { data } = await api.post(`/quizzes/${id}/submit`, { answers, timeTakenSeconds });
      setResult(data.result);
      setReview(data.review);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not submit your answers.');
    } finally {
      setSubmitting(false);
    }
  }, [id, answers, startedAt]);

  if (loading) return <p className="text-slate-500">Loading quiz...</p>;
  if (error && !quiz) return <p className="text-red-600">{error}</p>;
  if (!quiz) return null;

  if (result && review) {
    return (
      <div className="space-y-6">
        <div className="card text-center">
          <h1 className="text-2xl font-bold">Quiz Complete!</h1>
          <p className="text-4xl font-bold text-brand-600 mt-4">{result.score}%</p>
          <p className="text-slate-500 mt-1">{result.correctCount} / {result.totalQuestions} correct</p>
          <button onClick={() => navigate('/quizzes')} className="btn-primary mt-6">Back to Quizzes</button>
        </div>

        <div className="card">
          <h2 className="font-semibold text-slate-800 mb-4">Answer Review</h2>
          <div className="space-y-4">
            {review.map((r, idx) => (
              <div key={idx} className={`border rounded-lg p-4 ${r.isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                <p className="font-medium text-slate-800">{idx + 1}. {r.question}</p>
                <p className="text-sm mt-1">
                  Your answer:{' '}
                  <span className={r.isCorrect ? 'text-green-700' : 'text-red-700'}>
                    {r.yourAnswer >= 0 ? r.options[r.yourAnswer] : 'Not answered'}
                  </span>
                </p>
                {!r.isCorrect && (
                  <p className="text-sm text-slate-600">Correct answer: {r.options[r.correctIndex]}</p>
                )}
                {r.explanation && <p className="text-xs text-slate-500 mt-2">{r.explanation}</p>}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{quiz.title}</h1>
        <p className="text-slate-500">{quiz.category} · {quiz.difficulty} · ~{quiz.durationMinutes} minutes</p>
      </div>

      {error && <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</div>}

      <div className="space-y-4">
        {quiz.questions.map((q, qIdx) => (
          <div key={q._id} className="card">
            <p className="font-medium text-slate-800 mb-3">{qIdx + 1}. {q.question}</p>
            <div className="space-y-2">
              {q.options.map((opt, optIdx) => (
                <label
                  key={optIdx}
                  className={`flex items-center gap-3 border rounded-lg px-3 py-2 cursor-pointer text-sm ${
                    answers[qIdx] === optIdx ? 'border-brand-500 bg-brand-50' : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name={`q-${qIdx}`}
                    checked={answers[qIdx] === optIdx}
                    onChange={() => selectAnswer(qIdx, optIdx)}
                  />
                  {opt}
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={handleSubmit}
        disabled={submitting || answers.includes(-1)}
        className="btn-primary w-full"
      >
        {submitting ? 'Submitting...' : answers.includes(-1) ? 'Answer all questions to submit' : 'Submit Quiz'}
      </button>
    </div>
  );
}
