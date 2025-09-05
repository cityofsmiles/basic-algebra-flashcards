import React, { useState, useRef, useEffect } from "react";
import { evaluate, parse } from "mathjs";
import "./flashcards.css";

// Generate a random algebra expression
function generateExpression() {
  const coeff1 = Math.floor(Math.random() * 5) + 1;
  const coeff2 = Math.floor(Math.random() * 9) - 4;
  const constant = Math.floor(Math.random() * 10) - 5;

  let inner = coeff2 > 0 ? `x + ${coeff2}` : coeff2 < 0 ? `x - ${Math.abs(coeff2)}` : "x";
  let expr = coeff1 === 1 ? `(${inner})` : `${coeff1}*(${inner})`;
  if (constant !== 0) expr += ` + ${constant < 0 ? `(${constant})` : constant}`;

  const a = coeff1;
  const b = coeff1 * coeff2 + constant;
  let correctDisplay = a === 1 ? "x" : a === -1 ? "-x" : `${a}x`;
  if (b > 0) correctDisplay += ` + ${b}`;
  else if (b < 0) correctDisplay += ` - ${Math.abs(b)}`;

  return { expr: expr || "x", correctEvalExpr: `${a}*x + ${b}`, correctDisplay };
}

export default function Flashcards() {
  const [flashcards, setFlashcards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [slideDir, setSlideDir] = useState("");

  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const startPractice = () => {
    const newSet = Array.from({ length: 10 }, () => generateExpression());
    setFlashcards(newSet);
    setCurrentIndex(0);
    setFlipped(false);
    setAnswers({});
    setShowResults(false);
    setSlideDir("");
  };

  const handleAnswer = (value) => {
    setAnswers({ ...answers, [currentIndex]: value });
  };

  const checkEquivalence = (userInput, correctExpr) => {
    try {
      const cleaned = userInput.toLowerCase().replace(/\s+/g, "");
      const x = Math.floor(Math.random() * 10) + 1;
      const userVal = evaluate(parse(cleaned).toString(), { x });
      const correctVal = evaluate(correctExpr, { x });
      return Math.abs(userVal - correctVal) < 1e-6;
    } catch {
      return false;
    }
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.changedTouches[0].screenX;
  };

  const handleTouchEnd = (e) => {
    touchEndX.current = e.changedTouches[0].screenX;
    const deltaX = touchEndX.current - touchStartX.current;
    const swipeThreshold = 50;
    if (deltaX > swipeThreshold) prevCard();
    else if (deltaX < -swipeThreshold) nextCard();
  };

  const prevCard = () => {
    if (!flashcards.length) return;
    setSlideDir("right");
    setCurrentIndex((prev) => (prev === 0 ? flashcards.length - 1 : prev - 1));
    setFlipped(false);
  };

  const nextCard = () => {
    if (!flashcards.length) return;
    setSlideDir("left");
    setCurrentIndex((prev) => (prev === flashcards.length - 1 ? 0 : prev + 1));
    setFlipped(false);
  };

  useEffect(() => {
    if (slideDir) {
      const timer = setTimeout(() => setSlideDir(""), 300);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, slideDir]);

  const currentCard = flashcards[currentIndex];

  // --- Initial screen ---
  if (!flashcards.length) {
    return (
      <div className="flashcards-container">
        <h1>Algebra Flashcards</h1>
        <div>
          <button className="btn-primary" onClick={startPractice}>
            Start Practice
          </button>
        </div>
      </div>
    );
  }

  // --- Results screen ---
  if (showResults) {
    return (
      <div className="flashcards-container">
        <h2>Answer Key</h2>
        <div className="answer-key">
          {flashcards.map((card, i) => {
            const correct = checkEquivalence(answers[i] || "", card.correctEvalExpr);
            return (
              <div key={i} className="mb-2">
                <p>
                  <strong>Q{i + 1}:</strong> {card.expr}<br />
                  Your Answer: {answers[i] || "(none)"} {correct ? "✓" : "✗"}<br />
                  Correct Answer: {card.correctDisplay}
                </p>
              </div>
            );
          })}
        </div>
        <p>Score: {flashcards.filter((card, i) => checkEquivalence(answers[i] || "", card.correctEvalExpr)).length}/{flashcards.length}</p>

        <div className="button-group">
          <button className="btn-primary" onClick={startPractice}>Try Another Set</button>
          <button className="btn-submit" onClick={() => setShowResults(false)}>Back to Cards</button>
        </div>
      </div>
    );
  }

  // --- Flashcard screen ---
  return (
    <div className="flashcards-container">
      <h1>Question {currentIndex + 1} / {flashcards.length}</h1>

      <div
        className={`flashcard ${flipped ? "flip" : ""} ${slideDir}`}
        onClick={() => setFlipped(!flipped)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="flashcard-inner">
          <div className="flashcard-front">{currentCard.expr}</div>
          <div className="flashcard-back">{currentCard.correctDisplay}</div>
        </div>
      </div>

      <div>
        <input
          type="text"
          className="input-answer"
          placeholder="Your answer"
          value={answers[currentIndex] || ""}
          onChange={(e) => handleAnswer(e.target.value)}
        />
      </div>

      <div className="button-group">
        <button className="btn-primary" onClick={prevCard}>Previous</button>
        <button className="btn-primary" onClick={nextCard}>Next</button>
        <button className="btn-submit" onClick={() => setShowResults(true)}>Submit</button>
      </div>
    </div>
  );
}