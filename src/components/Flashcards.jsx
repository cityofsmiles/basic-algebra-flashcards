import React, { useState } from "react";
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
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);

  const startPractice = () => {
    const newSet = Array.from({ length: 10 }, () => generateExpression());
    setFlashcards(newSet);
    setCurrentIndex(0);
    setAnswers({});
    setShowResults(false);
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

  const prevCard = () => {
    setCurrentIndex((prev) => (prev === 0 ? flashcards.length - 1 : prev - 1));
  };

  const nextCard = () => {
    setCurrentIndex((prev) => (prev === flashcards.length - 1 ? 0 : prev + 1));
  };

  // --- Initial screen ---
  if (!flashcards.length) {
    return (
      <div className="flashcards-container">
        <h1>Algebra Flashcards</h1>
        <button className="btn-primary" onClick={startPractice}>
          Start Practice
        </button>
      </div>
    );
  }

  // --- Results screen ---
  if (showResults) {
    return (
      <div className="answer-key-screen">
        <h2>Answer Key</h2>
        <div className="answer-key">
          {flashcards.map((card, i) => {
            const correct = checkEquivalence(answers[i] || "", card.correctEvalExpr);
            return (
              <div key={i}>
                <p>
                  <strong>Q{i + 1}:</strong> {card.expr}<br />
                  Your Answer: {answers[i] || "(none)"} {correct ? "✓" : "✗"}<br />
                  Correct Answer: {card.correctDisplay}
                </p>
              </div>
            );
          })}
        </div>
        <p>
          Score: {flashcards.filter((card, i) => checkEquivalence(answers[i] || "", card.correctEvalExpr)).length}/{flashcards.length}
        </p>
        <div className="button-group">
          <button className="btn-primary" onClick={startPractice}>Try Another Set</button>
          <button className="btn-submit" onClick={() => setShowResults(false)}>Back to Cards</button>
        </div>
      </div>
    );
  }

  // --- Flashcard screen ---
  const currentCard = flashcards[currentIndex];
  return (
    <div className="flashcards-container">
      <h1>Question {currentIndex + 1} / {flashcards.length}</h1>
      <div className="flashcard">
        <div className="flashcard-front">{currentCard.expr}</div>
      </div>
      <input
        type="text"
        className="input-answer"
        placeholder="Your answer"
        value={answers[currentIndex] || ""}
        onChange={(e) => handleAnswer(e.target.value)}
      />
      <div className="button-group">
        <button className="btn-primary" onClick={prevCard}>Previous</button>
        <button className="btn-primary" onClick={nextCard}>Next</button>
        <button className="btn-submit" onClick={() => setShowResults(true)}>Submit</button>
      </div>
    </div>
  );
}