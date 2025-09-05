// src/App.jsx
import React, { useState } from "react";
import * as math from "mathjs";

/* ---------- Helpers ---------- */

// Normalize user input so mathjs can evaluate things like "2x+3" -> "2*x+3"
function normalizeInput(s) {
  if (!s || typeof s !== "string") return "";
  // remove surrounding spaces, keep interior spacing minimal
  let t = s.trim();
  // insert * between digit and letter or digit and '('  -> 2x -> 2*x , 2(x+1) -> 2*(x+1)
  t = t.replace(/(\d)\s*(?=\(?[a-zA-Z\(])/g, "$1*");
  // also insert * between closing parenthesis and variable/number: )( -> )*( and )x -> )*x
  t = t.replace(/\)\s*(?=[a-zA-Z0-9\(])/g, ")*");
  return t;
}

// Format simplified mathjs string into nicer algebra (remove " * " for number*var, remove extraneous parens)
function formatAnswer(raw) {
  if (!raw || raw === "ERROR") return raw;
  let s = raw;

  // Normalize whitespace
  s = s.replace(/\s+/g, " ");

  // Replace number * variable -> 4 * x  -> 4x
  s = s.replace(/\b1\s*\*\s*([a-zA-Z])/g, "$1"); // 1*x -> x
  s = s.replace(/\b(\d+)\s*\*\s*([a-zA-Z])/g, "$1$2");

  // Replace number * (var + ...) -> 4 * (x + 5) -> keep as-is for clarity or expand below
  // But if expression is already expanded like "4 * x + 15" the previous rule handled it.

  // Remove parentheses around plain numbers: (5) -> 5
  s = s.replace(/\((-?\d+(\.\d+)?)\)/g, "$1");

  // Tidy common spacing for + and -
  s = s.replace(/\s*\+\s*/g, " + ");
  s = s.replace(/\s*-\s*/g, " - ");

  // Remove leading "+ "
  s = s.replace(/^\+\s*/, "");

  s = s.trim();
  return s;
}

// Try to produce an expanded + simplified mathjs Node; fallback to simplify-only if expand fails
function simplifyAndPreferExpand(expr) {
  // expr should already include explicit multiplication like "3*(x+2)+(-1)"
  try {
    if (typeof math.expand === "function") {
      // expand first, then simplify (preferred)
      const expanded = math.expand(expr); // may throw
      const simplified = math.simplify(expanded);
      return simplified; // mathjs node/object
    } else {
      // fallback: just simplify
      return math.simplify(expr);
    }
  } catch (err) {
    // fallback to just simplify the raw expression (safe)
    try {
      return math.simplify(expr);
    } catch (err2) {
      // final fallback: throw up to caller
      throw err2;
    }
  }
}

// Numeric equivalence check: evaluate at several x values and compare numerical results
function numericallyEquivalent(userExpr, correctExpr) {
  const samples = [0, 1, -1, 2.5, -3]; // simple variety of test points
  try {
    const u = normalizeInput(userExpr);
    const c = normalizeInput(correctExpr);
    // if user left input blank, immediately false
    if (!u) return false;

    for (const v of samples) {
      const a = math.evaluate(u, { x: v });
      const b = math.evaluate(c, { x: v });
      // handle non-number (e.g. undefined)
      if (typeof a !== "number" || typeof b !== "number") return false;
      if (Math.abs(a - b) > 1e-6) return false;
    }
    return true;
  } catch (err) {
    // parse/eval failed for user input — treat as wrong but do not crash
    console.warn("Numeric equivalence check failed:", err);
    return false;
  }
}

/* ---------- Generator & App ---------- */

function generateExpression() {
  const coeff1 = Math.floor(Math.random() * 5) + 1; // 1..5
  const coeff2 = Math.floor(Math.random() * 5) + 1; // 1..5
  const constant = Math.floor(Math.random() * 10) - 5; // -5..4

  // show negative constants in parentheses for the question
  const constStr = constant < 0 ? `(${constant})` : `${constant}`;

  // explicit multiplication so mathjs can parse reliably
  const expr = `${coeff1}*(x + ${coeff2}) + ${constStr}`;

  // try to produce a canonical (expanded-ish) simplified answer, and a display version
  try {
    const simplifiedNode = simplifyAndPreferExpand(expr);
    const simplifiedRaw = simplifiedNode.toString({ parenthesis: "auto" }); // canonical string
    const simplifiedPretty = formatAnswer(simplifiedRaw);
    return {
      expr, // question form, e.g. "3*(x + 4) + (-1)"
      correctEvalExpr: simplifiedRaw, // used for numeric checking / evaluation
      correctDisplay: simplifiedPretty, // pretty string shown in answer key
    };
  } catch (err) {
    console.error("Error simplifying expression:", expr, err);
    return {
      expr,
      correctEvalExpr: "0",
      correctDisplay: "ERROR",
    };
  }
}

export default function App() {
  const [cards, setCards] = useState([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [showKey, setShowKey] = useState(false);

  function startPractice() {
    const set = Array.from({ length: 10 }, () => generateExpression());
    setCards(set);
    setCurrent(0);
    setAnswers([]);
    setShowKey(false);
    console.log("New set generated:", set);
  }

  function handleAnswerChange(e) {
    const copy = [...answers];
    copy[current] = e.target.value;
    setAnswers(copy);
  }

  function nextOrFinish() {
    if (current < cards.length - 1) {
      setCurrent((c) => c + 1);
    } else {
      setShowKey(true);
    }
  }

  return (
    <div style={{ padding: 20, fontFamily: "system-ui, sans-serif" }}>
      <h1>Algebra Flashcards</h1>

      {!cards.length && (
        <button onClick={startPractice}>Start Practice</button>
      )}

      {cards.length > 0 && !showKey && (
        <div style={{ marginTop: 20 }}>
          <div>
            <strong>
              Card {current + 1} of {cards.length}
            </strong>
          </div>
          <div style={{ margin: "12px 0", fontSize: 18 }}>
            Simplify: <code>{cards[current].expr}</code>
          </div>
          <input
            value={answers[current] || ""}
            onChange={handleAnswerChange}
            placeholder="Enter simplified expression (e.g. 4x + 15)"
            style={{ width: "100%", padding: 8, fontSize: 16 }}
          />
          <div style={{ marginTop: 12 }}>
            <button onClick={nextOrFinish}>
              {current === cards.length - 1 ? "Finish" : "Next"}
            </button>
          </div>
        </div>
      )}

      {showKey && (
        <div style={{ marginTop: 20 }}>
          <h2>Answer Key</h2>
          {cards.map((card, i) => {
            const userAns = answers[i] || "";
            const correctPretty = card.correctDisplay;
            const correctForEval = card.correctEvalExpr || card.expr;
            const isCorrect = numericallyEquivalent(userAns, correctForEval);
            return (
              <div key={i} style={{ marginBottom: 12 }}>
                <div>
                  <strong>Q{i + 1}:</strong> {card.expr}
                </div>
                <div>
                  Your Answer: {userAns || "(none)"}{" "}
                  {isCorrect ? (
                    <span style={{ color: "green", fontWeight: "bold" }}>✓</span>
                  ) : (
                    <span style={{ color: "red", fontWeight: "bold" }}>✗</span>
                  )}
                </div>
                <div>Correct Answer: {correctPretty}</div>
              </div>
            );
          })}

          <div style={{ marginTop: 12, fontWeight: "bold" }}>
            Score:{" "}
            {
              cards.filter((c, i) =>
                numericallyEquivalent(answers[i] || "", c.correctEvalExpr || c.expr)
              ).length
            }
            /{cards.length}
          </div>

          <div style={{ marginTop: 12 }}>
            <button
              onClick={() => {
                startPractice();
              }}
            >
              Try Another Set
            </button>
          </div>
        </div>
      )}
    </div>
  );
}