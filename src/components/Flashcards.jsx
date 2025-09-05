import React, { useState, useRef, useEffect } from "react";
import { evaluate, parse } from "mathjs";
import "./flashcards.css"; // includes flip & slide animation

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

  return { expr, correctEvalExpr: `${a}*x + ${b}`, correctDisplay };
}

export default function Flashcards() {
  const [flashcards, setFlashcards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [slideDir, setSlideDir] = useState(""); // "left" or "right"

  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  // Generate a new set of flashcards
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
    if (flashcards.length === 0) return;
    setSlideDir("right");
    setCurrentIndex((prev) => (prev === 0 ? flashcards.length - 1 : prev - 1));
    setFlipped(false);
  };

  const nextCard = () => {
    if (flashcards.length === 0) return;
    setSlideDir("left");
    setCurrentIndex((prev) => (prev === flashcards.length - 1 ? 0 : prev + 1));
    setFlipped(false);
  };

  if (!flashcards.length) {
    return (
      <div className="p-4 w-full max-w-md mx-auto flex flex-col items-center">
        <h1 className="text-2xl font-bold mb-4">Algebra Flashcards</h1>
        <button onClick={startPractice} className="btn-primary w-full max-w-xs">
          Start Practice
        </button>
      </div>
    );
  }

  if (showResults) {
    return (
      <div className="p-4 w-full max-w-md mx-auto">
        <h2 className="text-xl font-bold mb-2">Answer Key</h2>
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
        <p className="mt-4 font-bold">
          Score: {flashcards.filter((card, i) => checkEquivalence(answers[i] || "", card.correctEvalExpr)).length}/{flashcards.length}
        </p>
        <button onClick={startPractice} className="btn-primary mt-4 w-full max-w-xs">
          Try Another Set
        </button>
      </div>
    );
  }

  const currentCard = flashcards[currentIndex];

  return (
    <div className="flashcard-container p-4 w-full max-w-md mx-auto flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-4">Question {currentIndex + 1} / {flashcards.length}</h1>

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

      <input
        type="text"
        placeholder="Your answer"
        value={answers[currentIndex] || ""}
        onChange={(e) => handleAnswer(e.target.value)}
        className="input-answer"
      />

      <div className="flex w-full justify-between mt-4">
        <button onClick={prevCard} className="btn-primary w-1/2 mr-2">Previous</button>
        <button onClick={nextCard} className="btn-primary w-1/2 ml-2">Next</button>
      </div>

      <button onClick={() => setShowResults(true)} className="btn-submit mt-4 w-full">
        Submit
      </button>
    </div>
  );
}