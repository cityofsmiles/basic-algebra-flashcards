import React, { useState } from "react";
import * as math from "mathjs";

function generateExpression() {
  const coeff1 = Math.floor(Math.random() * 5) + 1; // 1–5
  const coeff2 = Math.floor(Math.random() * 5) + 1; // 1–5
  const constant = Math.floor(Math.random() * 10) - 5; // -5..4

  const constStr = constant < 0 ? `(${constant})` : `${constant}`;
  const expr = `${coeff1}(x + ${coeff2}) + ${constStr}`;

  console.log("Generating expression:", expr);

  try {
    const expanded = math.expand(expr);
    const simplified = math
      .simplify(expanded)
      .toString({ parenthesis: "auto" });

    console.log("Expanded:", expanded.toString());
    console.log("Simplified:", simplified);

    return { expr, simplified };
  } catch (err) {
    console.error("❌ Error in generateExpression:", err);
    return { expr, simplified: "ERROR" };
  }
}

function generateSet() {
  console.log("Generating a set of flashcards...");
  const cards = [];
  for (let i = 0; i < 10; i++) {
    cards.push(generateExpression());
  }
  console.log("Generated set:", cards);
  return cards;
}

function isEquivalent(input, correct) {
  try {
    const expandedInput = math.simplify(math.expand(input));
    const expandedCorrect = math.simplify(math.expand(correct));
    const equal = expandedInput.equals(expandedCorrect);

    console.log(
      `Checking equivalence: input="${input}" correct="${correct}" → ${equal}`
    );

    return equal;
  } catch (err) {
    console.error("❌ Error in isEquivalent:", err);
    return false;
  }
}

export default function App() {
  const [cards, setCards] = useState([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [showKey, setShowKey] = useState(false);

  const startPractice = () => {
    console.log("▶️ Start Practice clicked");
    const newSet = generateSet();
    setCards(newSet);
    setCurrent(0);
    setAnswers([]);
    setShowKey(false);
  };

  const handleAnswer = (e) => {
    const newAnswers = [...answers];
    newAnswers[current] = e.target.value;
    console.log(`Answer entered for card ${current + 1}:`, e.target.value);
    setAnswers(newAnswers);
  };

  const nextCard = () => {
    if (current < cards.length - 1) {
      console.log(`➡️ Moving to card ${current + 2}`);
      setCurrent(current + 1);
    } else {
      console.log("✅ All cards answered, showing key");
      setShowKey(true);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Algebra Flashcards (Debug Mode)
      </h1>

      {!cards.length && (
        <button
          onClick={startPractice}
          className="px-6 py-3 bg-blue-600 text-white rounded-2xl shadow hover:bg-blue-700"
        >
          Start Practice
        </button>
      )}

      {cards.length > 0 && !showKey && (
        <div className="w-full max-w-md bg-white p-6 rounded-2xl shadow">
          <p className="text-lg font-medium mb-4">
            Card {current + 1} of {cards.length}
          </p>
          <p className="text-xl font-semibold mb-4">
            Simplify: <code>{cards[current].expr}</code>
          </p>
          <input
            type="text"
            value={answers[current] || ""}
            onChange={handleAnswer}
            placeholder="Enter simplified expression"
            className="w-full border p-2 rounded mb-4"
          />
          <button
            onClick={nextCard}
            className="px-4 py-2 bg-green-600 text-white rounded-2xl shadow hover:bg-green-700"
          >
            {current === cards.length - 1 ? "Finish" : "Next"}
          </button>
        </div>
      )}

      {showKey && (
        <div className="w-full max-w-2xl bg-white p-6 rounded-2xl shadow">
          <h2 className="text-2xl font-bold mb-4">Answer Key</h2>
          {cards.map((card, i) => {
            const correct = isEquivalent(answers[i], card.simplified);
            return (
              <div key={i} className="mb-3">
                <p>
                  <strong>Q{i + 1}:</strong> {card.expr}
                </p>
                <p>
                  Your Answer: {answers[i] || "(none)"}{" "}
                  {correct ? (
                    <span className="text-green-600 font-bold">✓</span>
                  ) : (
                    <span className="text-red-600 font-bold">✗</span>
                  )}
                </p>
                <p>Correct Answer: {card.simplified}</p>
              </div>
            );
          })}
          <p className="mt-4 font-bold">
            Score:{" "}
            {
              cards.filter((c, i) => isEquivalent(answers[i], c.simplified))
                .length
            }
            /{cards.length}
          </p>
          <button
            onClick={startPractice}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-2xl shadow hover:bg-blue-700"
          >
            Try Another Set
          </button>
        </div>
      )}
    </div>
  );
}