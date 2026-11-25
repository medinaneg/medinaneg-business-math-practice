import { useCallback, useEffect, useMemo, useState } from "react";
import { loadDailyQuiz, readQuizParams } from "./lib/dailyQuiz.js";
import "./App.css";

const STORAGE_KEY = "business-math-student-name";

function loadName() {
  try {
    return localStorage.getItem(STORAGE_KEY) || "";
  } catch {
    return "";
  }
}

function saveName(name) {
  try {
    if (name.trim()) localStorage.setItem(STORAGE_KEY, name.trim());
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* local-only; ignore */
  }
}

function emptyAnswers(questionList) {
  return Object.fromEntries(questionList.map((q) => [q.id, ""]));
}

export default function App() {
  const [boot, setBoot] = useState({ status: "loading" });
  const [questions, setQuestions] = useState([]);
  const [quizMeta, setQuizMeta] = useState({
    title: "Business Math Daily Practice",
    subtitle: "",
    dayDate: "",
    levelsLine: "",
    usedFallback: false,
  });

  const [phase, setPhase] = useState("welcome");
  const [studentName, setStudentName] = useState(loadName);
  const [answers, setAnswers] = useState({});
  const [expandedSolutions, setExpandedSolutions] = useState({});

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { studentId, date } = readQuizParams();
      if (!studentId || !date) {
        if (!cancelled) {
          setBoot({ status: "missing_link" });
        }
        return;
      }
      const result = await loadDailyQuiz(studentId, date);
      if (cancelled) return;
      if (!result.ok) {
        setBoot({ status: "error", message: result.message });
        return;
      }
      setQuestions(result.quizQuestions);
      setAnswers(emptyAnswers(result.quizQuestions));
      if (result.displayName) {
        setStudentName(result.displayName);
        saveName(result.displayName);
      }
      setQuizMeta({
        title: `Day ${result.date}`,
        subtitle: result.subtitle,
        dayDate: result.date,
        levelsLine: result.levels ? formatLevels(result.levels) : "",
        usedFallback: result.usedFallback,
        studentId: result.studentId,
      });
      setBoot({ status: "ready" });
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const answeredCount = useMemo(
    () => questions.filter((q) => answers[q.id]).length,
    [answers, questions]
  );

  const score = useMemo(
    () => questions.filter((q) => answers[q.id] === q.correct).length,
    [answers, questions]
  );

  const allAnswered =
    questions.length > 0 && answeredCount === questions.length;

  const startQuiz = useCallback(() => {
    saveName(studentName);
    setPhase("quiz");
  }, [studentName]);

  const submitQuiz = useCallback(() => {
    if (!allAnswered) return;
    setPhase("results");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [allAnswered]);

  const retake = useCallback(() => {
    setAnswers(emptyAnswers(questions));
    setExpandedSolutions({});
    setPhase("quiz");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [questions]);

  const toggleSolution = (id) => {
    setExpandedSolutions((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  if (boot.status === "loading") {
    return (
      <div className="app">
        <main className="main">
          <section className="card welcome-card">
            <p>Loading your quiz…</p>
          </section>
        </main>
      </div>
    );
  }

  if (boot.status === "missing_link") {
    return (
      <div className="app">
        <header className="site-header">
          <p className="eyebrow">Business Math · Daily Practice</p>
          <h1>Open your link from Slack</h1>
          <p className="subtitle">
            Each student gets a personal quiz link with <code>student_id</code> and{" "}
            <code>date</code> in the URL. Ask your teacher or check{" "}
            <strong>#business-math-practice</strong> for today&apos;s message.
          </p>
        </header>
      </div>
    );
  }

  if (boot.status === "error") {
    return (
      <div className="app">
        <header className="site-header">
          <h1>We couldn&apos;t load your quiz</h1>
          <p className="subtitle">{boot.message}</p>
        </header>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="site-header">
        <p className="eyebrow">Business Math · Daily Practice</p>
        <h1>{quizMeta.title}</h1>
        <p className="subtitle">{quizMeta.subtitle}</p>
        {quizMeta.levelsLine && (
          <p className="level-mix" role="note">
            {quizMeta.levelsLine}
          </p>
        )}
        {quizMeta.usedFallback && (
          <p className="planned-note" role="note">
            Daily assignment file was not found — showing the static Day 1 sample.
          </p>
        )}
      </header>

      <main className="main">
        {phase === "welcome" && (
          <section className="card welcome-card" aria-labelledby="welcome-heading">
            <h2 id="welcome-heading">Ready for today&apos;s set?</h2>
            <p>
              Answer all <strong>{questions.length} multiple-choice questions</strong>{" "}
              about commissions, best buy, profit, and installment buying — all in
              Philippine peso (₱) contexts.
            </p>
            <label className="name-field" htmlFor="student-name">
              Your name
            </label>
            <input
              id="student-name"
              type="text"
              autoComplete="nickname"
              placeholder="e.g. Sofia"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              maxLength={40}
            />
            <button type="button" className="btn btn-primary" onClick={startQuiz}>
              Start quiz
            </button>
          </section>
        )}

        {phase === "quiz" && (
          <section className="quiz" aria-labelledby="quiz-heading">
            <ProgressBar
              studentName={studentName}
              answeredCount={answeredCount}
              total={questions.length}
            />
            <h2 id="quiz-heading" className="visually-hidden">
              Quiz questions
            </h2>
            <ol className="question-list">
              {questions.map((q, index) => (
                <li key={q.id} className="card question-card">
                  <div className="question-meta">
                    <span className="q-num">Question {index + 1}</span>
                    <span className="topic">{q.topic}</span>
                  </div>
                  <p className="question-text">{q.prompt}</p>
                  <fieldset>
                    <legend className="visually-hidden">
                      Choose an answer for question {index + 1}
                    </legend>
                    <ul className="choices">
                      {q.choices.map((c) => (
                        <li key={c.key}>
                          <label
                            className={
                              answers[q.id] === c.key ? "choice selected" : "choice"
                            }
                          >
                            <input
                              type="radio"
                              name={`q-${q.id}`}
                              value={c.key}
                              checked={answers[q.id] === c.key}
                              onChange={() =>
                                setAnswers((prev) => ({
                                  ...prev,
                                  [q.id]: c.key,
                                }))
                              }
                            />
                            <span className="choice-key">{c.key}.</span>
                            <span className="choice-text">{c.text}</span>
                          </label>
                        </li>
                      ))}
                    </ul>
                  </fieldset>
                </li>
              ))}
            </ol>
            <ProgressBar
              studentName={studentName}
              answeredCount={answeredCount}
              total={questions.length}
              sticky
              showSubmit
              allAnswered={allAnswered}
              onSubmit={submitQuiz}
            />
          </section>
        )}

        {phase === "results" && (
          <section className="results" aria-labelledby="results-heading">
            <div className="card score-card">
              <h2 id="results-heading">
                {studentName ? `${studentName}, ` : ""}here are your results
              </h2>
              <p className="score-display" aria-live="polite">
                <span className="score-fraction">
                  {score} / {questions.length}
                </span>
                <span className="score-label">correct</span>
              </p>
              <p className="score-percent">
                {Math.round((score / questions.length) * 100)}%
              </p>
              <div className="score-actions">
                <button type="button" className="btn btn-secondary" onClick={retake}>
                  Try again
                </button>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setPhase("welcome")}
                >
                  Change name
                </button>
              </div>
            </div>

            <h3 className="solutions-heading">Step-by-step solutions</h3>
            <ol className="solution-list">
              {questions.map((q, index) => {
                const userAnswer = answers[q.id];
                const isCorrect = userAnswer === q.correct;
                const open = expandedSolutions[q.id] !== false;
                return (
                  <li
                    key={q.id}
                    className={
                      isCorrect
                        ? "card solution-card correct"
                        : "card solution-card incorrect"
                    }
                  >
                    <button
                      type="button"
                      className="solution-toggle"
                      onClick={() => toggleSolution(q.id)}
                      aria-expanded={open}
                    >
                      <span>
                        Q{index + 1}: You chose <strong>{userAnswer || "—"}</strong>
                        {isCorrect ? " ✓" : ` (correct: ${q.correct})`}
                      </span>
                      <span className="chevron" aria-hidden>
                        {open ? "▾" : "▸"}
                      </span>
                    </button>
                    {open && q.solution && (
                      <div className="solution-body">
                        <p className="correct-ans">
                          Correct answer:{" "}
                          <strong>{q.solution.answerLabel}</strong>
                        </p>
                        <p>{q.solution.summary}</p>
                        <ul className="steps">
                          {q.solution.steps.map((step, i) => (
                            <li key={i}>{step}</li>
                          ))}
                        </ul>
                        {q.solution.wrongAnswers?.length > 0 && (
                          <>
                            <p className="why-wrong">Why wrong answers are tempting</p>
                            <ul className="wrong-hints">
                              {q.solution.wrongAnswers.map((w, i) => (
                                <li key={i}>{w}</li>
                              ))}
                            </ul>
                          </>
                        )}
                      </div>
                    )}
                  </li>
                );
              })}
            </ol>
          </section>
        )}
      </main>

      <footer className="site-footer">
        <p>
          {quizMeta.dayDate ? `Set for ${quizMeta.dayDate}` : "Daily practice"} ·
          Currency: Philippine peso (₱)
        </p>
      </footer>
    </div>
  );
}

function formatLevels(levels) {
  return `C&W L${levels.commission} · Best buy L${levels.bestBuy} · Profit L${levels.profit} · Installment L${levels.installment}`;
}

function ProgressBar({
  studentName,
  answeredCount,
  total,
  sticky,
  showSubmit,
  allAnswered,
  onSubmit,
}) {
  const pct = total ? (answeredCount / total) * 100 : 0;
  return (
    <div className={sticky ? "progress-bar sticky" : "progress-bar"}>
      <div className="progress-text">
        {studentName && <span className="hello">Hi, {studentName} · </span>}
        {answeredCount} of {total} answered
      </div>
      <div className="progress-track" aria-hidden>
        <div className="progress-fill" style={{ width: `${pct}%` }} />
      </div>
      {showSubmit && (
        <button
          type="button"
          className="btn btn-primary submit-btn"
          disabled={!allAnswered}
          onClick={onSubmit}
        >
          Submit quiz
        </button>
      )}
    </div>
  );
}