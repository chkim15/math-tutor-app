import React, { useState, useEffect } from 'react';
import { generateSolution, generateHint } from '../services/llmService';
import mathProblems from '../data/mathProblems.json';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';
import './MathProblem.css';

const MathProblem = () => {
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0);
  const [solution, setSolution] = useState('');
  const [hint, setHint] = useState('');
  const [loading, setLoading] = useState(false);
  const [hintLoading, setHintLoading] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [error, setError] = useState('');
  const [hintError, setHintError] = useState('');

  const currentProblem = mathProblems[currentProblemIndex];

  // Function to render text with LaTeX math
  const renderMathText = (text) => {
    if (!text) return null;
    
    let processedText = text;
    
    // Step 1: Handle \( ... \) LaTeX display math delimiters (mainly from LLM responses)
    processedText = processedText.replace(/\\\(/g, '$').replace(/\\\)/g, '$');
    
    // Step 2: Handle \[ ... \] LaTeX display math delimiters  
    processedText = processedText.replace(/\\\[/g, '$').replace(/\\\]/g, '$');
    
    // Step 3: Convert double dollar signs to single dollar signs
    processedText = processedText.replace(/\$\$/g, '$');
    
    // Step 4: Clean up malformed LaTeX commands that appear outside of dollar signs
    processedText = processedText.replace(/\\int\s+(\d+)\^{([^}]+)}\s+dx/g, '$\\int $1^{$2} dx$');
    processedText = processedText.replace(/\\int\s+(\d+)\^{([^}]+)}\s*\\cdot\s*\\frac{([^}]+)}{([^}]+)}/g, '$\\int $1^{$2} \\cdot \\frac{$3}{$4}$');
    
    // Step 5: Handle common math expressions that aren't wrapped
    if (!processedText.includes('$')) {
      // This is likely LLM-generated content that needs LaTeX conversion
      processedText = processedText
        // Handle basic LaTeX commands that aren't wrapped
        .replace(/\\(pi|alpha|beta|gamma|delta|epsilon|theta|lambda|mu|sigma|phi|omega)/g, '$\\$1$')
        .replace(/\\(int|sum|prod|lim|sqrt|frac|sin|cos|tan|log|ln|exp)/g, '$\\$1$')
        .replace(/\\(leq|geq|neq|pm|infty|partial|times|cdot)/g, '$\\$1$')
        
        // Handle fractions that aren't wrapped
        .replace(/\\frac\{([^{}]+)\}\{([^{}]+)\}/g, '$\\frac{$1}{$2}$')
        
        // Handle square roots that aren't wrapped
        .replace(/\\sqrt\{([^{}]+)\}/g, '$\\sqrt{$1}$')
        
        // Handle simple exponents like x^2, x^{2}
        .replace(/([a-zA-Z])\^(\{?[0-9a-zA-Z]+\}?)/g, '$$1^{$2}$')
        
        // Handle expressions with exponents in brackets/parentheses
        .replace(/\[([^\]]+)\]\^(\{?[0-9a-zA-Z]+\}?)/g, '$[$1]^{$2}$')
        .replace(/\(([^)]+)\)\^(\{?[0-9a-zA-Z]+\}?)/g, '$($1)^{$2}$')
        
        // Clean up braces in exponents
        .replace(/\^\{([0-9a-zA-Z]+)\}/g, '^{$1}')
        
        // Clean up multiple consecutive dollar signs
        .replace(/\$+/g, '$')
        
        // Fix empty math expressions
        .replace(/\$\s*\$/g, ' ');
    }

    // Step 6: Split by $ delimiters and render
    const parts = processedText.split(/(\$[^$]*\$)/);
    
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
        // Regular text, preserve line breaks
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

  const handleNextProblem = () => {
    const nextIndex = (currentProblemIndex + 1) % mathProblems.length;
    setCurrentProblemIndex(nextIndex);
    setSolution('');
    setHint('');
    setShowSolution(false);
    setShowHint(false);
    setError('');
    setHintError('');
  };

  const handlePreviousProblem = () => {
    const prevIndex = currentProblemIndex === 0 ? mathProblems.length - 1 : currentProblemIndex - 1;
    setCurrentProblemIndex(prevIndex);
    setSolution('');
    setHint('');
    setShowSolution(false);
    setShowHint(false);
    setError('');
    setHintError('');
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
        <h1>Math Problems</h1>
        <p>Practice math problems with AI-powered solutions</p>
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
            Problem {currentProblemIndex + 1} of {mathProblems.length}
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