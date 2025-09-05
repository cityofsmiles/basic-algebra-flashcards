import React, { useState } from "react";
import { evaluate, parse } from "mathjs";
import "./flashcards.css";

// Generate a random algebra expression with proper binomial and clean formatting
function generateExpression() {
  // Coefficient ≥ 2
  const coeff1 = Math.floor(Math.random() * 5) + 2; // 2–6

  // Inner term: b ≠ 0 to ensure proper binomial
  let coeff2;
  do {
    coeff2 = Math.floor(Math.random() * 9) - 4; // -4 … +4
  } while (coeff2 === 0); // retry if 0

  // Constant term can be anything
  const constant = Math.floor(Math.random() * 10) - 5; // -5 … +4

  // Inner expression: always a proper binomial
  const inner = coeff2 > 0 ? `x + ${coeff2}` : `x - ${Math.abs(coeff2)}`;

  // Expression for flashcard: no '*' needed
  let expr = `${coeff1}(${inner})`;
  if (constant !== 0) {
    expr += constant > 0 ? ` + ${constant}` : ` - ${Math.abs(constant)}`;
  }

  // Simplified expression for evaluation
  const a = coeff1;
  const b = coeff1 * coeff2 + constant;

  // Pretty display for answer key
  let correctDisplay = `${a}x`;
  if (b > 0) correctDisplay += ` + ${b}`;
  else if (b < 0) correctDisplay += ` - ${Math.abs(b)}`;

  return {
    expr,
    correctEvalExpr: `${a}*x + ${b}`, // use * here for mathjs evaluation
    correctDisplay,
  };
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

  // --- Answer key screen ---
  if (showResults) {
    const score = flashcards.filter((card, i) =>
      checkEquivalence(answers[i] || "", card.correctEvalExpr)
    ).length;

    return (
      <div className="answer-key-screen">
        {/* Score first */}
        <p className="score">Score: {score}/{flashcards.length}</p>
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
      <div className="flashcard">{currentCard.expr}</div>
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