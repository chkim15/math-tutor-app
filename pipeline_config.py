#!/usr/bin/env python3
"""
Configuration file for the PDF to JSON Math Problems Pipeline
============================================================

This file contains configurable settings for customizing the extraction
and formatting behavior of the pipeline.
"""

# Mathematical symbol mappings for PDF artifacts
SYMBOL_REPLACEMENTS = {
    # Integral and summation symbols
    'Ú': '\\int',
    'Â': '\\sum',
    '∏': '\\prod',
    
    # Enhanced integral fixes from recent work
    '\\int \\$1': '\\int_0^1',
    '\\int \\$': '\\int_',
    
    # Greek letters - most specific first
    'π': '\\pi',
    'α': '\\alpha',
    'β': '\\beta',
    'γ': '\\gamma',
    'δ': '\\delta',
    'ε': '\\varepsilon',
    'θ': '\\theta',
    'λ': '\\lambda',
    'μ': '\\mu',
    'σ': '\\sigma',
    'φ': '\\phi',
    'ω': '\\omega',
    
    # Enhanced Greek letter fixes - specific patterns first
    'sin p': '\\sin \\pi',
    'cos p': '\\cos \\pi',
    'tan p': '\\tan \\pi',
    'si p': '\\sin \\pi',
    'co p': '\\cos \\pi',
    ' p ': ' \\pi ',
    ' p$': ' \\pi',
    '$p': '\\pi',
    'p$': '\\pi',
    'p)': '\\pi)',
    '(p': '(\\pi',
    
    # Trigonometric and logarithmic functions
    'lo ': '\\log ',
    'ln ': '\\ln ',
    
    # Comparison operators
    '≥': '\\geq',
    '≤': '\\leq',
    '≠': '\\neq',
    '≈': '\\approx',
    '≡': '\\equiv',
    '∼': '\\sim',
    
    # Enhanced comparison operators
    ' £ ': ' \\leq ',
    ' ³ ': ' \\geq ',
    ' ¢ ': ' \\neq ',
    '£': '\\leq',
    '³': '\\geq',
    '¢': '\\neq',
    
    # Set theory symbols
    '∈': '\\in',
    '∉': '\\notin',
    '⊂': '\\subset',
    '⊆': '\\subseteq',
    '∪': '\\cup',
    '∩': '\\cap',
    '∅': '\\emptyset',
    
    # Special sets
    '˜': '\\mathbb{R}',  # Real numbers
    'È': '\\cup',
    'Ç': '\\cap',
    'Ã': '\\subset',
    'Œ': '\\in',
    
    # Common corrupted expressions - removed conflicting \p mapping
    'Æ\\mathbb{R}': '\\to \\mathbb{R}',
    'ı': 'i',
    
    # Other mathematical symbols
    '•': '\\infty',
    '¤': '\\times',
    'æ': '\\sqrt',
    '±': '\\pm',
    '∓': '\\mp',
    '∇': '\\nabla',
    '∂': '\\partial',
    
    # Arrows
    '→': '\\rightarrow',
    '←': '\\leftarrow',
    '↔': '\\leftrightarrow',
    '⇒': '\\Rightarrow',
    '⇐': '\\Leftarrow',
    '⇔': '\\Leftrightarrow',
    
    # LaTeX function prefixes
    'frac{': '\\frac{',
    'sqrt{': '\\sqrt{',
    'sum_{': '\\sum_{',
    'prod_{': '\\prod_{',
    'lim_{': '\\lim_{',
    
    # PDF extraction artifacts (cid codes)
    'cid:11': '',
    'cid:12': '',
    'cid:32': ' = ',
    'cid:94': '',
    'cid:96': '',
    'cid:135': '',
    'cid:149': '\\geq',
    'cid:144': '',
    'cid:199': '',
    'cid:14': '+',
}

# Category classification keywords
CATEGORY_KEYWORDS = {
    "Complex Analysis": [
        'complex', 'analytic', 'residue', 'contour', 'holomorphic', 
        'meromorphic', 'cauchy', 'laurent', 'pole', 'singularity'
    ],
    "Real Analysis": [
        'sequence', 'series', 'convergence', 'uniform', 'pointwise',
        'monotone', 'bounded', 'supremum', 'infimum', 'riemann'
    ],
    "Abstract Algebra": [
        'group', 'ring', 'field', 'permutation', 'conjugacy', 'homomorphism',
        'isomorphism', 'subgroup', 'coset', 'quotient', 'galois'
    ],
    "Linear Algebra": [
        'matrix', 'vector', 'linear', 'eigenvalue', 'determinant', 'span',
        'basis', 'dimension', 'null space', 'rank', 'orthogonal'
    ],
    "Number Theory": [
        'prime', 'modulo', 'integer', 'gcd', 'congruent', 'divisible',
        'fibonacci', 'fermat', 'euclidean', 'diophantine'
    ],
    "Topology": [
        'topology', 'metric', 'space', 'open', 'closed', 'compact',
        'connected', 'homeomorphism', 'continuous', 'hausdorff'
    ],
    "Graph Theory": [
        'graph', 'vertex', 'edge', 'tree', 'cycle', 'path',
        'connected', 'planar', 'chromatic', 'spanning'
    ],
    "Probability": [
        'probability', 'random', 'sample', 'distribution', 'expected',
        'variance', 'normal', 'binomial', 'poisson', 'bayes'
    ],
    "Statistics": [
        'sample', 'population', 'hypothesis', 'test', 'confidence',
        'correlation', 'regression', 'anova', 'chi-square'
    ],
    "Calculus": [
        'integral', 'derivative', 'limit', 'continuity', 'differential',
        'partial', 'gradient', 'divergence', 'curl', 'laplacian'
    ],
    "Differential Equations": [
        'differential equation', 'ode', 'pde', 'laplace', 'fourier',
        'initial value', 'boundary value', 'separable'
    ],
    "Geometry": [
        'triangle', 'circle', 'angle', 'area', 'volume', 'radius',
        'polygon', 'sphere', 'cylinder', 'cone', 'ellipse'
    ],
    "Functions": [
        'function', 'domain', 'range', 'composition', 'inverse',
        'bijective', 'injective', 'surjective', 'mapping'
    ],
    "Discrete Mathematics": [
        'combinatorics', 'permutation', 'combination', 'recursive',
        'recurrence', 'generating function', 'inclusion-exclusion'
    ]
}

# Difficulty assessment based on complexity indicators
COMPLEXITY_INDICATORS = {
    "Hard": [
        'theorem', 'proof', 'if and only if', 'necessary and sufficient',
        'topology', 'abstract', 'homomorphism', 'isomorphism',
        'measure theory', 'lebesgue', 'functional analysis'
    ],
    "Medium": [
        'derivative', 'integral', 'matrix', 'vector', 'convergence',
        'continuous', 'differentiable', 'optimization', 'eigenvalue'
    ],
    "Easy": [
        'compute', 'calculate', 'find', 'what is', 'evaluate',
        'solve', 'determine', 'basic', 'simple'
    ]
}

# Problem number ranges for difficulty assignment
DIFFICULTY_BY_RANGE = {
    (1, 20): "Easy",
    (21, 45): "Medium", 
    (46, 100): "Hard"
}

# PDF cleaning patterns
PDF_ARTIFACT_PATTERNS = [
    r'GRE.*?Practice.*?Book.*?Page.*?\d+',
    r'\d+\s*Page.*?$',
    r'Practice Book',
    r'Mathematics Test',
    r'Educational Testing Service',
    r'Copyright.*?\d{4}',
    r'\$\d+_\$\d+',  # Remove $1_$2, $1_$22, etc.
    
    # Enhanced patterns from recent work
    r'Unauthorized copying or reuse of.*?$',
    r'any part of this page is illegal.*?$',
    r'GO ON TO THE NEXT PAGE.*?$',
    r'GRE.*?Page.*?\d+',
    
    # Remove duplicate choice patterns
    r'Choices:\s*Choices:',
]

# Unicode artifacts to remove (common PDF extraction issues)
UNICODE_ARTIFACTS = [
    'Ê', 'Á', 'ˆ', 'Ô', 'Õ', 'Ö', '×', 'Ø', 'Ù', 'Ú', 'Û', 'Ü', 'Ý', 'Þ',
    'ß', 'à', 'á', 'â', 'ã', 'ä', 'å', 'æ', 'ç', 'è', 'é', 'ê', 'ë', 'ì',
    'í', 'î', 'ï', 'ð', 'ñ', 'ò', 'ó', 'ô', 'õ', 'ö', '÷', 'ø', 'ù', 'ú',
    'û', 'ü', 'ý', 'þ', 'ÿ'
]

# Choice formatting patterns
CHOICE_PATTERNS = {
    'standard': r'\([A-E]\)',  # (A), (B), (C), etc.
    'numbered': r'\([1-5]\)',  # (1), (2), (3), etc.
    'lettered': r'[A-E]\.',    # A., B., C., etc.
    'roman': r'\([ivx]+\)',    # (i), (ii), (iii), etc.
}

# Export settings
EXPORT_SETTINGS = {
    'indent': 2,
    'ensure_ascii': False,
    'sort_keys': False
}

# Validation rules
VALIDATION_RULES = {
    'min_problem_length': 10,      # Minimum characters in a problem
    'max_problem_length': 5000,    # Maximum characters in a problem
    'required_fields': ['id', 'category', 'difficulty', 'problem'],
    'valid_difficulties': ['Easy', 'Medium', 'Hard'],
    'min_choices': 2,              # Minimum number of choices for multiple choice
    'max_choices': 8               # Maximum number of choices
}

# Logging configuration
LOGGING_CONFIG = {
    'level': 'INFO',
    'format': '%(asctime)s - %(levelname)s - %(message)s',
    'show_progress': True
}

def get_difficulty_for_problem_number(problem_num):
    """Get difficulty based on problem number"""
    for (start, end), difficulty in DIFFICULTY_BY_RANGE.items():
        if start <= problem_num <= end:
            return difficulty
    return "Medium"  # Default

def validate_problem(problem):
    """Validate a problem against the rules"""
    errors = []
    
    # Check required fields
    for field in VALIDATION_RULES['required_fields']:
        if field not in problem:
            errors.append(f"Missing required field: {field}")
    
    # Check problem length
    if 'problem' in problem:
        length = len(problem['problem'])
        if length < VALIDATION_RULES['min_problem_length']:
            errors.append(f"Problem too short: {length} chars")
        elif length > VALIDATION_RULES['max_problem_length']:
            errors.append(f"Problem too long: {length} chars")
    
    # Check difficulty
    if 'difficulty' in problem:
        if problem['difficulty'] not in VALIDATION_RULES['valid_difficulties']:
            errors.append(f"Invalid difficulty: {problem['difficulty']}")
    
    return errors 