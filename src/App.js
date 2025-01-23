import React, { useState, useEffect } from "react";
import "./App.css";
import data from "./questions.json";
import correct from "./sounds/correct.mp3";
import wrong from "./sounds/wrong.mp3";

function App() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [selectOption, setSelectOption] = useState(null);
  const [showScore, setShowScore] = useState(false);
  const [timer, setTimer] = useState(20);
  const [isTruthSelected, setIsTruthSelected] = useState(null);
  const [truthOrDareMessage, setTruthOrDareMessage] = useState("");
  const [showTruthOrDareChoice, setShowTruthOrDareChoice] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let interval;
    if (timer > 0 && !showScore && !showTruthOrDareChoice) {
      interval = setInterval(() => {
        setTimer((prevTime) => prevTime - 1);
      }, 1000);
    } else if (timer === 0) {
      if (currentQuestion < data.length - 1) {
        setCurrentQuestion((prevquestion) => prevquestion + 1);
        setTimer(20);
        setSelectOption(null);
      } else {
        setShowScore(true);
      }
    }

    return () => clearInterval(interval);
  }, [timer, showScore, currentQuestion, showTruthOrDareChoice]);

  const restartQuiz = () => {
    setSelectOption(null);
    setScore(0);
    setShowScore(false);
    setTimer(20);
    setCurrentQuestion(0);
    setShowTruthOrDareChoice(false);
    setTruthOrDareMessage("");
  };

  const handleClick = (option) => {
    setSelectOption(option);

    if (option === data[currentQuestion].correctOption) {
      setScore((prev) => prev + 1);
      const audio = new Audio(correct);
      audio.play();
    } else {
      const audio = new Audio(wrong);
      audio.play();
      handleWrongAnswer();
    }
  };

  const handleWrongAnswer = () => {
    setShowTruthOrDareChoice(true);
  };

  const handleTruthOrDareChoice = async (choice) => {
    setIsTruthSelected(choice);
    setShowTruthOrDareChoice(false);

    try {
      setIsLoading(true);
      // Fetching API data
      const response = await fetch(`https://api.truthordarebot.xyz/v1/${choice}`);
      const data = await response.json();

      if (data && data.question) {
        setTruthOrDareMessage(data.question); // Show the question (truth or dare)

        // Use SpeechSynthesis API to read the question aloud
        const utterance = new SpeechSynthesisUtterance(data.question);
        window.speechSynthesis.speak(utterance); // Speak the text
      } else {
        setTruthOrDareMessage("Sorry, no question available right now.");
      }
    } catch (error) {
      console.log("API Error:", error);
      setTruthOrDareMessage("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="quiz-app">
      {showScore ? (
        <div className="score-section">
          Score: {score}/{data.length}
          <button onClick={restartQuiz}>Restart</button>
        </div>
      ) : showTruthOrDareChoice ? (
        <div className="truth-or-dare">
          <h3>Choose your option</h3>
          <button onClick={() => handleTruthOrDareChoice("truth")}>Truth</button>
          <button onClick={() => handleTruthOrDareChoice("dare")}>Dare</button>
        </div>
      ) : (
        <div className="question-section">
          <h2>QUESTION {currentQuestion + 1}</h2>
          <p>{data[currentQuestion].question}</p>
          <div className="options">
            {data[currentQuestion].options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleClick(option)}
                style={{
                  backgroundColor:
                    selectOption === option
                      ? option === data[currentQuestion].correctOption
                        ? "green"
                        : "red"
                      : "",
                }}
                disabled={!!selectOption}
              >
                {option}
              </button>
            ))}
          </div>
          <div className="timer">
            Time Left: <span>{timer}</span>
          </div>
        </div>
      )}

      {/* Truth or Dare Message */}
      {truthOrDareMessage && (
        <div className="truth-or-dare-message">
          <h3>{isTruthSelected === "truth" ? "Truth" : "Dare"}</h3>
          <p>{truthOrDareMessage}</p>
        </div>
      )}

      {/* Loading Indicator */}
      {isLoading && <div className="loading-message">Fetching your question...</div>}
    </div>
  );
}

export default App;
