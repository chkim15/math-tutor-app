import React, { useState, useEffect } from 'react';
import { generateSolution, generateHint } from '../services/llmService';
import mathProblems from '../data/mathProblems.json';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';
import './MathProblem.css';

const MathProblem = () => {
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [solution, setSolution] = useState('');
  const [hint, setHint] = useState('');
  const [loading, setLoading] = useState(false);
  const [hintLoading, setHintLoading] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [error, setError] = useState('');
  const [hintError, setHintError] = useState('');
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [showAnswerFeedback, setShowAnswerFeedback] = useState(false);
  const [answerSubmitted, setAnswerSubmitted] = useState(false);

  // Get unique categories and difficulties from the problems
  const uniqueCategories = [...new Set(mathProblems.map(problem => problem.category))].sort();
  const categories = ['All', ...uniqueCategories];
  
  const uniqueDifficulties = [...new Set(mathProblems.map(problem => problem.difficulty))].sort();
  const difficulties = ['All', ...uniqueDifficulties];
  
  // Filter problems based on selected category and difficulty
  const filteredProblems = mathProblems.filter(problem => {
    const categoryMatch = selectedCategory === 'All' || problem.category === selectedCategory;
    const difficultyMatch = selectedDifficulty === 'All' || problem.difficulty === selectedDifficulty;
    return categoryMatch && difficultyMatch;
  });

  const currentProblem = filteredProblems[currentProblemIndex];

  // Reset to first problem when filters change
  useEffect(() => {
    setCurrentProblemIndex(0);
    setSolution('');
    setHint('');
    setShowSolution(false);
    setShowHint(false);
    setError('');
    setHintError('');
    setSelectedAnswer('');
    setShowAnswerFeedback(false);
    setAnswerSubmitted(false);
  }, [selectedCategory, selectedDifficulty]);

  // Reset answer state when problem changes
  useEffect(() => {
    setSelectedAnswer('');
    setShowAnswerFeedback(false);
    setAnswerSubmitted(false);
    setSolution('');
    setHint('');
    setShowSolution(false);
    setShowHint(false);
    setError('');
    setHintError('');
  }, [currentProblemIndex]);

  const handleAnswerSelect = (choice) => {
    if (!answerSubmitted) {
      setSelectedAnswer(choice);
    }
  };

  const handleAnswerSubmit = () => {
    if (selectedAnswer && !answerSubmitted) {
      setAnswerSubmitted(true);
      setShowAnswerFeedback(true);
    }
  };

  // Function to render text with LaTeX math
  const renderMathText = (text) => {
    if (!text) return null;
    
    let processedText = text;
    
    // Step 0: Fix spacing issues and format answer choices
    // Fix specific LaTeX command issues that eat spaces
    processedText = processedText.replace(/Then\\int/g, 'Then $\\int$');
    processedText = processedText.replace(/constant\.Then/g, 'constant. Then');
    processedText = processedText.replace(/([a-zA-Z])\\int/g, '$1 $\\int$');
    
    // Fix missing spaces around dollar signs - but only when not already properly spaced
    // Removed the problematic lines that were adding extra dollar signs
    
    // More comprehensive word boundary fixes
    processedText = processedText.replace(/([a-z])([A-Z])/g, '$1 $2');
    processedText = processedText.replace(/([a-z])(\d)/g, '$1 $2');
    processedText = processedText.replace(/(\d)([a-z])/g, '$1 $2');
    
    // Fix answer choice formatting - ensure proper line breaks and spacing
    processedText = processedText.replace(/\(([A-E])\)\s*/g, '\n\n($1) ');
    
    // Clean up multiple spaces but preserve intentional line breaks
    processedText = processedText.replace(/[ \t]+/g, ' ');
    processedText = processedText.replace(/\n\s+/g, '\n');
    processedText = processedText.trim();
    
    // Step 1: Handle \( ... \) LaTeX display math delimiters (mainly from LLM responses)
    processedText = processedText.replace(/\\\(/g, '$').replace(/\\\)/g, '$');
    
    // Step 2: Handle \[ ... \] LaTeX display math delimiters  
    processedText = processedText.replace(/\\\[/g, '$').replace(/\\\]/g, '$');
    
    // Step 3: Convert double dollar signs to single dollar signs
    processedText = processedText.replace(/\$\$/g, '$');
    
    // Step 4: Clean up malformed LaTeX commands that appear outside of dollar signs
    // But only if they're actually outside dollar signs - check for this more carefully
    // Split by $ first, then only process the non-math parts
    const dollarParts = processedText.split('$');
    for (let i = 0; i < dollarParts.length; i += 2) { // Even indices are non-math text
      if (dollarParts[i]) {
        dollarParts[i] = dollarParts[i].replace(/\\([a-zA-Z]+)\s*\{([^}]*)\}/g, (match, command, content) => {
          return `$\\${command}{${content}}$`;
        });
      }
    }
    processedText = dollarParts.join('$');
    
    // Step 5: Split by $ and handle inline math
    const parts = [];
    let currentPart = '';
    let inMath = false;
    
    for (let i = 0; i < processedText.length; i++) {
      const char = processedText[i];
      if (char === '$') {
        if (inMath) {
          // End of math mode
          currentPart += '$';
          parts.push(currentPart);
          currentPart = '';
          inMath = false;
        } else {
          // Start of math mode
          if (currentPart) {
            parts.push(currentPart);
          }
          currentPart = '$';
          inMath = true;
        }
      } else {
        currentPart += char;
      }
    }
    
    if (currentPart) {
      parts.push(currentPart);
    }
    
    return parts.map((part, index) => {
      if (part.startsWith('$') && part.endsWith('$') && part.length > 2) {
        // Remove the $ delimiters and render as math
        const mathContent = part.slice(1, -1).trim();
        if (mathContent) {
          try {
            return <InlineMath key={index} math={mathContent} />;
          } catch (error) {
            console.error('KaTeX rendering error:', error, 'Content:', mathContent);
            // Return the original text instead of red error text
            return <span key={index}>{mathContent}</span>;
          }
        }
        return null;
      } else {
        // Regular text, preserve line breaks and add proper spacing
        return part.split('\n').map((line, lineIndex) => (
          <React.Fragment key={`${index}-${lineIndex}`}>
            {lineIndex > 0 && <br />}
            {line}
          </React.Fragment>
        ));
      }
    }).filter(Boolean);
  };

  const handleShowSolution = async () => {
    if (showSolution) {
      // Toggle off solution
      setShowSolution(false);
      setSolution('');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const generatedSolution = await generateSolution(currentProblem.problem);
      setSolution(generatedSolution);
      setShowSolution(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleShowHint = async () => {
    if (showHint) {
      // Toggle off hint
      setShowHint(false);
      setHint('');
      return;
    }

    setHintLoading(true);
    setHintError('');
    
    try {
      const generatedHint = await generateHint(currentProblem.problem);
      setHint(generatedHint);
      setShowHint(true);
    } catch (err) {
      setHintError(err.message);
    } finally {
      setHintLoading(false);
    }
  };

  const handleCategoryChange = (event) => {
    setSelectedCategory(event.target.value);
  };

  const handleDifficultyChange = (event) => {
    setSelectedDifficulty(event.target.value);
  };

  const handleNextProblem = () => {
    const nextIndex = (currentProblemIndex + 1) % filteredProblems.length;
    setCurrentProblemIndex(nextIndex);
  };

  const handlePreviousProblem = () => {
    const prevIndex = currentProblemIndex === 0 ? filteredProblems.length - 1 : currentProblemIndex - 1;
    setCurrentProblemIndex(prevIndex);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return '#10b981';
      case 'Medium': return '#f59e0b';
      case 'Hard': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const formatSolution = (solutionText) => {
    if (!solutionText) return null;

    // Split by line breaks and process each line
    const lines = solutionText.split('\n').filter(line => line.trim() !== '');
    
    return lines.map((line, lineIndex) => {
      const trimmedLine = line.trim();
      
      // Skip empty lines
      if (!trimmedLine) return null;
      
      // Skip redundant "Solution:" headers since we already have one in the container
      if (trimmedLine.match(/^(##\s*)?Solution:\s*$/i)) {
        return null; // Skip this line entirely
      }
      
      // Handle ### headers first (more specific)
      if (trimmedLine.startsWith('###')) {
        const headerText = trimmedLine.replace(/^###\s*/, '');
        return <div key={lineIndex} className="solution-subheading"><strong>{renderMathText(headerText)}</strong></div>;
      }
      
      // Handle ## headers (but skip Solution: as we handle it above)
      if (trimmedLine.startsWith('##')) {
        const headerText = trimmedLine.replace(/^##\s*/, '');
        return <div key={lineIndex} className="solution-heading"><strong>{renderMathText(headerText)}</strong></div>;
      }
      
      // Handle **text** bold formatting
      if (trimmedLine.startsWith('**') && trimmedLine.endsWith('**') && trimmedLine.length > 4) {
        const headerText = trimmedLine.slice(2, -2);
        return <div key={lineIndex} className="solution-heading"><strong>{renderMathText(headerText)}</strong></div>;
      }
      
      // Handle *text* italic formatting (single asterisk)
      if (trimmedLine.startsWith('*') && trimmedLine.endsWith('*') && !trimmedLine.startsWith('**') && trimmedLine.length > 2) {
        const emphasisText = trimmedLine.slice(1, -1);
        return <div key={lineIndex} className="solution-emphasis"><em>{renderMathText(emphasisText)}</em></div>;
      }
      
      // Handle step headers and important sections - make this more specific
      if (trimmedLine.match(/^(Step \d+:|Answer:|Final Answer:|Therefore,|Thus,|Hence,)/i)) {
        return <div key={lineIndex} className="solution-step-header"><strong>{renderMathText(trimmedLine)}</strong></div>;
      }
      
      // Handle list items
      if (trimmedLine.startsWith('- ') || trimmedLine.match(/^\d+\.\s/)) {
        const listText = trimmedLine.replace(/^[-\d.]\s*/, '');
        return <div key={lineIndex} className="solution-list-item">{renderMathText(listText)}</div>;
      }
      
      // Handle multiple choice options
      if (trimmedLine.match(/^[A-E]\)|^\([A-E]\)/)) {
        return <div key={lineIndex} className="solution-choice">{renderMathText(trimmedLine)}</div>;
      }
      
      // All other text - render as regular text with NO containers
      return <div key={lineIndex} className="solution-text">{renderMathText(trimmedLine)}</div>;
    }).filter(Boolean);
  };

  return (
    <div className="math-problem-container">
      <div className="header">
      </div>

      {/* Filter Dropdowns */}
      <div className="filter-container">
        <div className="filter-group">
          <label htmlFor="category-filter" className="filter-label">
            Category:
          </label>
          <select 
            id="category-filter"
            value={selectedCategory} 
            onChange={handleCategoryChange}
            className="category-dropdown"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category}
                {category !== 'All' && ` (${mathProblems.filter(p => p.category === category).length})`}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="difficulty-filter" className="filter-label">
              Difficulty:
          </label>
          <select 
            id="difficulty-filter"
            value={selectedDifficulty} 
            onChange={handleDifficultyChange}
            className="category-dropdown"
          >
            {difficulties.map(difficulty => (
              <option key={difficulty} value={difficulty}>
                {difficulty}
                {difficulty !== 'All' && ` (${mathProblems.filter(p => p.difficulty === difficulty).length})`}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="problem-card">
        <div className="problem-header">
          <div className="problem-info">
            <span className="category-tag">{currentProblem.category}</span>
            <span 
              className="difficulty-tag"
              style={{ backgroundColor: getDifficultyColor(currentProblem.difficulty) }}
            >
              {currentProblem.difficulty}
            </span>
          </div>
          <div className="problem-counter">
            Problem {currentProblemIndex + 1} of {filteredProblems.length}
            {selectedCategory !== 'All' && (
              <span className="filter-info"> • {selectedCategory}</span>
            )}
            {selectedDifficulty !== 'All' && (
              <span className="filter-info"> • {selectedDifficulty}</span>
            )}
          </div>
        </div>

        <div className="problem-content">
          <h2>Problem:</h2>
          <div className="problem-text">
            {renderMathText(currentProblem.problem)}
          </div>
          
          {currentProblem.image && (
            <div className="problem-image">
              <img 
                src={currentProblem.image} 
                alt={currentProblem.imageAlt || "Problem diagram"}
                className="problem-diagram"
              />
            </div>
          )}
        </div>

        {/* Answer Choice Interface */}
        {currentProblem.choices && (
          <div className="answer-section">
            <h3>Select your answer:</h3>
            <div className="answer-choices">
              {currentProblem.choices.map((choice) => (
                <button
                  key={choice}
                  className={`answer-choice ${selectedAnswer === choice ? 'selected' : ''} ${
                    answerSubmitted 
                      ? choice === currentProblem.correctAnswer 
                        ? 'correct' 
                        : selectedAnswer === choice 
                          ? 'incorrect' 
                          : 'disabled'
                      : ''
                  }`}
                  onClick={() => handleAnswerSelect(choice)}
                  disabled={answerSubmitted}
                >
                  {choice}
                </button>
              ))}
            </div>
            
            {selectedAnswer && !answerSubmitted && (
              <button className="submit-answer-btn" onClick={handleAnswerSubmit}>
                Submit Answer
              </button>
            )}

            {showAnswerFeedback && (
              <div className={`answer-feedback ${selectedAnswer === currentProblem.correctAnswer ? 'correct' : 'incorrect'}`}>
                {selectedAnswer === currentProblem.correctAnswer ? (
                  <div className="feedback-correct">
                    <span className="feedback-icon">✅</span>
                    <span className="feedback-text">Correct! Well done!</span>
                  </div>
                ) : (
                  <div className="feedback-incorrect">
                    <span className="feedback-icon">❌</span>
                    <span className="feedback-text">
                      Incorrect. The correct answer is <strong>{currentProblem.correctAnswer}</strong>.
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <div className="action-buttons">
          <button 
            className="solution-btn"
            onClick={handleShowSolution}
            disabled={loading}
          >
            {loading ? 'Generating...' : showSolution ? 'Hide Solution' : 'Show Solution'}
          </button>
          
          <button 
            className="hint-btn"
            onClick={handleShowHint}
            disabled={hintLoading}
          >
            {hintLoading ? 'Thinking...' : showHint ? 'Hide Hint' : '💡 Hint'}
          </button>
        </div>

        {error && (
          <div className="error-message">
            <p>⚠️ {error}</p>
          </div>
        )}

        {hintError && (
          <div className="error-message">
            <p>⚠️ {hintError}</p>
          </div>
        )}

        {hintLoading && (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>AI is generating a hint...</p>
          </div>
        )}

        {showHint && hint && (
          <div className="hint-container">
            <h3>💡 Hint:</h3>
            <div className="hint-content">
              <p>{renderMathText(hint)}</p>
            </div>
          </div>
        )}

        {loading && (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>AI is generating the solution...</p>
          </div>
        )}

        {showSolution && solution && (
          <div className="solution-container">
            <h3>💡 Solution:</h3>
            <div className="solution-content">
              {formatSolution(solution)}
            </div>
          </div>
        )}

        <div className="navigation-buttons">
          <button 
            className="nav-btn prev-btn"
            onClick={handlePreviousProblem}
          >
            ← Previous
          </button>
          
          <button 
            className="nav-btn next-btn"
            onClick={handleNextProblem}
          >
            Next →
          </button>
        </div>
      </div>

      <div className="footer">
        <p>Built with React & AI • Math Tutor Platform</p>
      </div>
    </div>
  );
};

export default MathProblem; 