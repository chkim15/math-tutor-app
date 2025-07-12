// This service handles LLM API calls for generating math solutions
// Using Perplexity AI API for real solution generation

const PERPLEXITY_API_KEY = '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';
const PERPLEXITY_API_URL = 'https://api.perplexity.ai/chat/completions';

export const generateSolution = async (problem) => {
  try {
    // Use real Perplexity API call only
    return await callPerplexityAPI(problem, 'solution');
  } catch (error) {
    console.error('Error generating solution:', error);
    throw new Error(`Failed to generate solution: ${error.message}`);
  }
};

export const generateHint = async (problem) => {
  try {
    // Use real Perplexity API call for hints
    return await callPerplexityAPI(problem, 'hint');
  } catch (error) {
    console.error('Error generating hint:', error);
    throw new Error(`Failed to generate hint: ${error.message}`);
  }
};

// Real Perplexity API call
const callPerplexityAPI = async (problem, type) => {
  const systemPrompt = type === 'hint' 
    ? 'You are a helpful math tutor. Provide a brief, encouraging hint to help students solve the problem without giving away the complete solution. Focus on the first step or key concept they should consider. Keep it to 1-2 sentences maximum.'
    : `You are an expert math tutor. Provide clear, comprehensive step-by-step solutions to math problems. 

IMPORTANT FORMATTING RULES:
- Use "**Solution:**" as a main heading
- Break down the solution into numbered steps like "Step 1:", "Step 2:", etc.
- Use "**Answer:**" or "**Final Answer:**" for the conclusion
- For ALL mathematical expressions, wrap them in simple dollar signs: $expression$
- Do NOT use \\( \\) or \\[ \\] delimiters - only use $...$
- Use standard LaTeX: $\\pi$, $\\int$, $x^2$, $\\frac{a}{b}$, $\\sqrt{x}$, $\\leq$, $\\geq$
- Write mathematical expressions simply and clearly
- If there are multiple choice options, clearly identify which option is correct

Examples of CORRECT formatting:
- Pi: $\\pi$ 
- Integrals: $\\int_0^1 f(x) dx$
- Fractions: $\\frac{\\pi}{2}$, $\\frac{1}{4}$
- Functions: $y = \\frac{1}{2}\\sin^2(x^2)$
- Exponents: $x^2$, $[f(y)]^2$
- Bounds: $0 \\leq x \\leq \\sqrt{\\pi}$
- Volume: $V = \\pi \\int_a^b [f(y)]^2 dy$

Make sure ALL mathematical content uses ONLY $...$ delimiters, no other LaTeX delimiters.`;

  const userPrompt = type === 'hint'
    ? `Please provide a helpful hint for this math problem (don't solve it completely): ${problem}`
    : `Please solve this calculus problem step by step with clear explanations. Use ONLY $...$ for math formatting, no \\( \\) delimiters: ${problem}`;

  const response = await fetch(PERPLEXITY_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${PERPLEXITY_API_KEY}`
    },
    body: JSON.stringify({
      model: 'sonar',
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: userPrompt
        }
      ],
      max_tokens: type === 'hint' ? 200 : 1000,
      temperature: 0.3
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`API Error: ${response.status} - ${errorData.message || 'Unknown error'}`);
  }

  const data = await response.json();
  
  if (!data.choices || !data.choices[0] || !data.choices[0].message) {
    throw new Error('Invalid response format from API');
  }

  return data.choices[0].message.content;
}; 