import React, { useState } from "react";
import { evaluate, parse } from "mathjs";

function generateExpression() {
  const coeff1 = Math.floor(Math.random() * 5) + 1; // 1–5
  const coeff2 = Math.floor(Math.random() * 9) - 4; // -4 … +4
  const constant = Math.floor(Math.random() * 10) - 5; // -5 … +4

  // Inner expression: (x + b), (x - b), or just (x) if b=0
  let inner = "";
  if (coeff2 > 0) {
    inner = `x + ${coeff2}`;
  } else if (coeff2 < 0) {
    inner = `x - ${Math.abs(coeff2)}`;
  } else {
    inner = "x";
  }

  // Question expression (avoid 1* and +0)
  let expr = coeff1 === 1 ? `(${inner})` : `${coeff1}*(${inner})`;

  if (constant !== 0) {
    expr += ` + ${constant < 0 ? `(${constant})` : constant}`;
  }

  // Simplify ax + b
  const a = coeff1;
  const b = coeff1 * coeff2 + constant;

  // Pretty display of correct answer
  let correctDisplay = "";
  if (a === 1) {
    correctDisplay = "x";
  } else if (a === -1) {
    correctDisplay = "-x";
  } else {
    correctDisplay = `${a}x`;
  }

  if (b > 0) {
    correctDisplay += ` + ${b}`;
  } else if (b < 0) {
    correctDisplay += ` - ${Math.abs(b)}`;
  }

  return {
    expr, // what the flashcard shows
    correctEvalExpr: `${a}*x + ${b}`, // for symbolic equivalence check
    correctDisplay, // nicely formatted answer
  };
}

export default function App() {
  const [flashcards, setFlashcards] = useState([]);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);

  const startPractice = () => {
    const newSet = Array.from({ length: 10 }, () => generateExpression());
    setFlashcards(newSet);
    setAnswers({});
    setShowResults(false);
  };

  const handleAnswer = (index, value) => {
    setAnswers({ ...answers, [index]: value });
  };

  const checkEquivalence = (userInput, correctExpr) => {
    try {
      // Normalize input: lowercase, trim spaces
      const cleaned = userInput.toLowerCase().replace(/\s+/g, "");

      const x = Math.floor(Math.random() * 10) + 1;
      const userVal = evaluate(parse(cleaned).toString(), { x });
      const correctVal = evaluate(correctExpr, { x });

      return Math.abs(userVal - correctVal) < 1e-6;
    } catch {
      return false;
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Algebra Flashcards</h1>
      {!flashcards.length ? (
        <button
          onClick={startPractice}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Start Practice
        </button>
      ) : !showResults ? (
        <div>
          {flashcards.map((card, i) => (
            <div key={i} className="mb-4 p-4 border rounded">
              <p className="font-semibold">Q{i + 1}: {card.expr}</p>
              <input
                type="text"
                placeholder="Your answer"
                value={answers[i] || ""}
                onChange={(e) => handleAnswer(i, e.target.value)}
                className="border p-2 w-full mt-2"
              />
            </div>
          ))}
          <button
            onClick={() => setShowResults(true)}
            className="bg-green-500 text-white px-4 py-2 rounded"
          >
            Submit
          </button>
        </div>
      ) : (
        <div>
          <h2 className="text-xl font-bold mb-2">Answer Key</h2>
          {flashcards.map((card, i) => {
            const correct = checkEquivalence(
              answers[i] || "",
              card.correctEvalExpr
            );
            return (
              <div key={i} className="mb-2">
                <p>
                  <strong>Q{i + 1}:</strong> {card.expr}
                  <br />
                  Your Answer: {answers[i] || "(none)"}{" "}
                  {correct ? "✓" : "✗"}
                  <br />
                  Correct Answer: {card.correctDisplay}
                </p>
              </div>
            );
          })}
          <p className="mt-4 font-bold">
            Score:{" "}
            {
              flashcards.filter((card, i) =>
                checkEquivalence(answers[i] || "", card.correctEvalExpr)
              ).length
            }
            /{flashcards.length}
          </p>
          <button
            onClick={startPractice}
            className="bg-blue-500 text-white px-4 py-2 rounded mt-4"
          >
            Try Another Set
          </button>
        </div>
      )}
    </div>
  );
}