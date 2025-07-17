#!/usr/bin/env python3
"""
Production Pipeline: PDF to JSON Math Problems Converter
========================================================

A comprehensive tool for extracting math problems from PDF files and converting them
to properly formatted JSON with clean mathematical notation and consistent formatting.

Usage:
    python3 pdf_to_json_pipeline.py input.pdf output.json [--start-problem N] [--existing existing.json]

Features:
- Extracts text from PDF files using pdfplumber
- Intelligently parses problem boundaries and multiple choice options
- Cleans up mathematical notation and PDF artifacts
- Categorizes problems automatically based on content
- Assigns difficulty levels
- Merges with existing problem sets
- Applies comprehensive formatting fixes

Author: AI Assistant
Date: 2024
"""

import re
import json
import argparse
import sys
from pathlib import Path

# Import configuration
try:
    from pipeline_config import (
        SYMBOL_REPLACEMENTS, CATEGORY_KEYWORDS, COMPLEXITY_INDICATORS,
        PDF_ARTIFACT_PATTERNS, UNICODE_ARTIFACTS, EXPORT_SETTINGS,
        get_difficulty_for_problem_number, validate_problem
    )
except ImportError:
    print("Warning: pipeline_config.py not found. Using default settings.")
    # Fallback default settings
    SYMBOL_REPLACEMENTS = {'Ú': '\\int', 'π': '\\pi', '≥': '\\geq', '≤': '\\leq'}
    CATEGORY_KEYWORDS = {"Calculus": ['integral', 'derivative']}
    COMPLEXITY_INDICATORS = {"Hard": ['theorem'], "Medium": ['integral'], "Easy": ['find']}
    PDF_ARTIFACT_PATTERNS = [r'GRE.*?Page.*?\d+']
    UNICODE_ARTIFACTS = []
    EXPORT_SETTINGS = {'indent': 2, 'ensure_ascii': False}
    
    def get_difficulty_for_problem_number(n):
        return "Medium"
    
    def validate_problem(p):
        return []

# Check for required dependencies
try:
    import pdfplumber
except ImportError:
    print("Error: pdfplumber is required. Install with: pip install pdfplumber")
    sys.exit(1)

class PDFMathProblemExtractor:
    """Main class for extracting and formatting math problems from PDFs"""
    
    def __init__(self):
        self.problems = []
        
    def extract_text_from_pdf(self, pdf_path):
        """Extract text from PDF file"""
        try:
            with pdfplumber.open(pdf_path) as pdf:
                print(f"Processing PDF with {len(pdf.pages)} pages...")
                
                all_text = ''
                for i, page in enumerate(pdf.pages):
                    page_text = page.extract_text()
                    if page_text:
                        all_text += page_text + '\n\n'
                        print(f"Extracted text from page {i+1}")
                
                return all_text
        except Exception as e:
            print(f"Error reading PDF: {e}")
            return None
    
    def parse_problems_from_text(self, text, start_problem=1):
        """Extract individual problems from the PDF text"""
        problems = []
        
        # Split text into lines for easier processing
        lines = text.split('\n')
        
        # Find all problem numbers and their line positions
        problem_positions = []
        for i, line in enumerate(lines):
            match = re.match(r'^\s*(\d+)\.\s*', line)
            if match:
                problem_num = int(match.group(1))
                if problem_num >= start_problem:
                    problem_positions.append((problem_num, i))
        
        print(f"Found {len(problem_positions)} problems starting from problem {start_problem}")
        
        # Extract each problem
        for i, (problem_num, start_line) in enumerate(problem_positions):
            # Determine where this problem ends (next problem starts)
            if i + 1 < len(problem_positions):
                end_line = problem_positions[i + 1][1]
            else:
                end_line = len(lines)
            
            # Extract problem text
            problem_lines = lines[start_line:end_line]
            problem_text = '\n'.join(problem_lines)
            
            # Clean and parse the problem
            parsed_problem = self.parse_single_problem(problem_num, problem_text)
            if parsed_problem:
                # Validate the problem
                validation_errors = validate_problem(parsed_problem)
                if validation_errors:
                    print(f"Warning: Problem {problem_num} has validation issues: {validation_errors}")
                
                problems.append(parsed_problem)
                print(f"Parsed problem {problem_num}")
        
        return problems
    
    def parse_single_problem(self, problem_num, text):
        """Parse a single problem from its text"""
        
        # Clean up the text
        text = re.sub(r'\s+', ' ', text).strip()
        
        # Remove the problem number from the beginning
        text = re.sub(r'^\s*\d+\.\s*', '', text)
        
        # Determine category based on content analysis
        category = self.determine_category(text)
        
        # Determine difficulty based on problem number and content
        difficulty = self.determine_difficulty(problem_num, text)
        
        # Look for multiple choice options
        choices_match = re.findall(r'\([A-E]\)[^(]*?(?=\([A-E]\)|$)', text)
        
        # If we found choices, format them properly
        if choices_match:
            # Split problem text from choices
            first_choice_pos = text.find('(A)')
            if first_choice_pos > 0:
                problem_text = text[:first_choice_pos].strip()
                choices_text = text[first_choice_pos:].strip()
                
                # Format choices
                formatted_choices = []
                for choice in ['A', 'B', 'C', 'D', 'E']:
                    pattern = rf'\({choice}\)([^(]*?)(?=\([A-E]\)|$)'
                    match = re.search(pattern, choices_text)
                    if match:
                        choice_text = match.group(1).strip()
                        if choice_text:  # Only add non-empty choices
                            formatted_choices.append(f"({choice}) {choice_text}")
                
                if formatted_choices:
                    problem_text += "\n\nChoices:\n" + "\n".join(formatted_choices)
            else:
                problem_text = text
        else:
            problem_text = text
        
        # Apply comprehensive formatting fixes
        problem_text = self.apply_formatting_fixes(problem_text)
        
        return {
            "id": problem_num,
            "category": category,
            "difficulty": difficulty,
            "problem": problem_text
        }
    
    def determine_category(self, text):
        """Determine the category of a problem based on its content"""
        text_lower = text.lower()
        
        # Use configured category keywords
        for category, keywords in CATEGORY_KEYWORDS.items():
            if any(word in text_lower for word in keywords):
                return category
        
        return "Mathematics"  # Default category
    
    def determine_difficulty(self, problem_num, text):
        """Determine difficulty based on problem number and complexity indicators"""
        # Get base difficulty from problem number
        base_difficulty = get_difficulty_for_problem_number(problem_num)
        
        # Adjust based on content complexity using configured indicators
        text_lower = text.lower()
        for difficulty, indicators in COMPLEXITY_INDICATORS.items():
            if any(indicator in text_lower for indicator in indicators):
                return difficulty
        
        return base_difficulty
    
    def apply_formatting_fixes(self, problem_text):
        """Apply comprehensive formatting fixes to problem text"""
        
        # Remove PDF artifacts using configured patterns
        text = problem_text
        for pattern in PDF_ARTIFACT_PATTERNS:
            text = re.sub(pattern, '', text, flags=re.MULTILINE | re.IGNORECASE)
        
        # Remove Unicode artifacts
        for artifact in UNICODE_ARTIFACTS:
            text = text.replace(artifact, '')
        
        # Enhanced mathematical notation fixes
        text = self.fix_mathematical_notation(text)
        
        # Fix mathematical symbols using configured replacements
        for symbol, replacement in SYMBOL_REPLACEMENTS.items():
            text = text.replace(symbol, replacement)
        
        # Enhanced choice formatting
        text = self.fix_choice_formatting(text)
        
        # Fix spacing around mathematical expressions
        text = self.fix_mathematical_spacing(text)
        
        # Wrap mathematical expressions in dollar signs for KaTeX
        text = self.wrap_math_expressions(text)
        
        # Final cleanup
        text = re.sub(r'\s+', ' ', text)  # Multiple spaces to single space
        text = re.sub(r'\n\s*\n\s*\n+', '\n\n', text)  # Multiple newlines to double
        
        return text.strip()
    
    def wrap_math_expressions(self, text):
        """Wrap mathematical expressions in dollar signs for proper KaTeX rendering"""
        
        # If already has dollar signs, clean up malformed ones first
        if '$' in text:
            # Fix malformed expressions like $\\sqrt{$\\pi$}$
            text = re.sub(r'\$\\sqrt\{\$\\pi\$\}\$', r'$\\sqrt{\\pi}$', text)
            text = re.sub(r'\$\\frac\{\$\\sqrt\{\$\\pi\$\}\$\}\{([^}]+)\}\$', r'$\\frac{\\sqrt{\\pi}}{\\1}$', text)
            text = re.sub(r'\$\\int_\$\{([^}]*)\}\^\{\$\\in\$fty\}', r'$\\int_0^{\\infty}$', text)
            text = re.sub(r'\$\\int_\$\{-\$\\in\$fty\}\^\{\$\\in\$fty\}', r'$\\int_{-\\infty}^{\\infty}$', text)
            text = re.sub(r'\$\\frac\{\$\\pi\$\}\{([^}]+)\}\$', r'$\\frac{\\pi}{\\1}$', text)
            text = re.sub(r'2\$\\sqrt\{\$\\pi\$\}\$', r'$2\\sqrt{\\pi}$', text)
            text = re.sub(r'4\$\\sqrt\{\$\\pi\$\}\$', r'$4\\sqrt{\\pi}$', text)
            text = re.sub(r'\$\\cos\$\^3', r'$\\cos^3$', text)
            text = re.sub(r'\$\\sin\$\^3', r'$\\sin^3$', text)
            
            # Fix nested dollar signs
            text = re.sub(r'\$([^$]*)\$([^$]*)\$([^$]*)\$', r'$\1\2\3$', text)
            text = re.sub(r'\$\$+', '$', text)
            
            return text
        
        # If no dollar signs, proceed with wrapping complete expressions
        
        # Pattern for complete mathematical expressions
        math_patterns = [
            # Complete fractions
            r'\\frac\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}',
            # Complete square roots  
            r'\\sqrt\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}',
            # Integrals with bounds
            r'\\int_[^\\s]*\^[^\\s]*\s*[^\\s]*\s*dx',
            r'\\int_[^\\s]*\s*[^\\s]*\s*dx',
            r'\\int\s*[^\\s]*\s*dx',
            # Complete trig expressions
            r'\\(?:sin|cos|tan)(?:\^[0-9]+)?\s*[a-zA-Z]*',
            # Greek letters
            r'\\(?:pi|alpha|beta|gamma|delta|theta|lambda|mu|sigma|phi|omega)',
            # Operators
            r'\\(?:leq|geq|neq|approx|equiv|in|subset|cup|cap|infty)',
            # Number sets
            r'\\mathbb\{[RQNCZH]\}',
        ]
        
        # Find all mathematical expressions
        for pattern in math_patterns:
            matches = list(re.finditer(pattern, text))
            for match in reversed(matches):
                start, end = match.span()
                expression = match.group()
                
                # Check if already wrapped
                if (start > 0 and text[start-1] == '$') or (end < len(text) and text[end] == '$'):
                    continue
                
                # Wrap the complete expression
                text = text[:start] + f'${expression}$' + text[end:]
        
        # Handle some specific cases for complete expressions
        text = re.sub(r'\\frac\{\\sqrt\{\\pi\}\}\{2\}', r'$\\frac{\\sqrt{\\pi}}{2}$', text)
        text = re.sub(r'\\frac\{\\sqrt\{\\pi\}\}\{4\}', r'$\\frac{\\sqrt{\\pi}}{4}$', text)
        text = re.sub(r'2\\sqrt\{\\pi\}', r'$2\\sqrt{\\pi}$', text)
        text = re.sub(r'4\\sqrt\{\\pi\}', r'$4\\sqrt{\\pi}$', text)
        text = re.sub(r'\\sqrt\{\\pi\}', r'$\\sqrt{\\pi}$', text)
        
        return text
    
    def fix_mathematical_notation(self, text):
        """Fix corrupted mathematical notation and LaTeX expressions"""
        
        # Enhanced symbol fixes from our recent work
        enhanced_fixes = {
            # Integral and math symbols
            '\\int \\$1': '\\int_0^1',
            '\\int \\$': '\\int_',
            'sin p': '\\sin \\pi',
            'cos p': '\\cos \\pi',
            'tan p': '\\tan \\pi',
            'si p': '\\sin \\pi',
            'co p': '\\cos \\pi',
            'lo ': '\\log ',
            'ln ': '\\ln ',
            
            # Greek letters and special symbols
            ' p ': ' \\pi ',
            ' p$': ' \\pi',
            '$p': '\\pi',
            'p$': '\\pi',
            'p)': '\\pi)',
            '(p': '(\\pi',
            
            # Fractions and expressions
            'frac{': '\\frac{',
            'sqrt{': '\\sqrt{',
            'sum_{': '\\sum_{',
            'prod_{': '\\prod_{',
            'lim_{': '\\lim_{',
            
            # Comparison operators
            ' £ ': ' \\leq ',
            ' ³ ': ' \\geq ',
            ' ¢ ': ' \\neq ',
            '£': '\\leq',
            '³': '\\geq',
            '¢': '\\neq',
            
            # Common corrupted expressions
            'Æ\\mathbb{R}': '\\to \\mathbb{R}',
            'ı': 'i',
            '\\p': ' \\neq 0',
            
            # Specific fixes for problem content
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
        
        # Apply enhanced fixes
        for old, new in enhanced_fixes.items():
            text = text.replace(old, new)
        
        # Fix specific mathematical expressions with regex
        text = re.sub(r'\\int\s*\\infty', r'\\int_0^{\\infty}', text)
        text = re.sub(r'\\int\s*(\d+)', r'\\int_0^{\1}', text)
        text = re.sub(r'(\d+)\s*£\s*(\w+)\s*£\s*(\d+)', r'\1 \\leq \2 \\leq \3', text)
        text = re.sub(r'£\s*(\w+)\s*£', r'\\leq \1 \\leq', text)
        
        # Fix double backslashes in LaTeX
        text = re.sub(r'\\\\(frac|sum|int|lim|log|ln|sqrt)', r'\\\1', text)
        
        return text
    
    def fix_choice_formatting(self, problem_text):
        """Enhanced choice formatting to ensure proper line breaks"""
        
        # Remove duplicate "Choices:" labels first
        text = re.sub(r'Choices:\s*Choices:\s*', 'Choices:\n', problem_text)
        
        # If there's already a "Choices:" section, fix its formatting
        if 'Choices:' in text:
            parts = text.split('Choices:', 1)
            if len(parts) == 2:
                problem_part = parts[0].strip()
                choices_part = parts[1].strip()
                
                # Format choices properly - ensure each choice is on a new line
                choices_part = re.sub(r'\s*\(([A-E])\)\s*', r'\n(\1) ', choices_part)
                choices_part = re.sub(r'\s*([A-E])\)\s*', r'\n(\1) ', choices_part)
                
                # Clean up multiple newlines
                choices_part = re.sub(r'\n\s*\n', '\n', choices_part)
                choices_part = choices_part.strip()
                
                return f"{problem_part}\n\nChoices:\n{choices_part}"
        
        # If choices are mixed in without "Choices:" label, try to extract them
        choice_pattern = r'(\([A-E]\)[^(]*?)(?=\([A-E]\)|$)'
        choices = re.findall(choice_pattern, text)
        
        if len(choices) >= 2:  # At least 2 choices found
            # Find where choices start
            first_choice_match = re.search(r'\([A-E]\)', text)
            if first_choice_match:
                choice_start = first_choice_match.start()
                problem_part = text[:choice_start].strip()
                
                # Format choices
                formatted_choices = []
                for choice in choices:
                    choice = choice.strip()
                    if choice:
                        # Extract letter and text
                        match = re.match(r'\(([A-E])\)\s*(.*)', choice)
                        if match:
                            letter, text_part = match.groups()
                            formatted_choices.append(f"({letter}) {text_part.strip()}")
                
                if formatted_choices:
                    choices_text = '\n'.join(formatted_choices)
                    return f"{problem_part}\n\nChoices:\n{choices_text}"
        
        return text
    
    def fix_mathematical_spacing(self, text):
        """Fix spacing around mathematical expressions"""
        
        # Fix spacing around $ signs
        spacing_fixes = [
            (r'Let\$', 'Let $'),
            (r'\$denote', '$ denote'),
            (r'\$and\$', '$ and $'),
            (r'\$be', '$ be'),
            (r'\$satisfies', '$ satisfies'),
            (r'\$for\$', '$ for $'),
            (r'\$is', '$ is'),
            (r'\$are', '$ are'),
            (r'then\$', 'then $'),
            (r'will\$', 'will $'),
            (r'on\$', 'on $'),
            (r'to\$', 'to $'),
        ]
        
        for pattern, replacement in spacing_fixes:
            text = re.sub(pattern, replacement, text)
        
        # Fix spacing around math
        text = re.sub(r'\$\s+', '$', text)
        text = re.sub(r'\s+\$', '$', text)
        
        return text
    
    def merge_with_existing(self, new_problems, existing_file=None):
        """Merge new problems with existing problem set"""
        if existing_file and Path(existing_file).exists():
            try:
                with open(existing_file, 'r') as f:
                    existing_problems = json.load(f)
                
                print(f"Loaded {len(existing_problems)} existing problems")
                
                # Combine and sort by ID
                all_problems = existing_problems + new_problems
                all_problems.sort(key=lambda x: x['id'])
                
                return all_problems
            except Exception as e:
                print(f"Error loading existing file: {e}")
                return new_problems
        else:
            return new_problems
    
    def save_to_json(self, problems, output_file):
        """Save problems to JSON file with proper formatting"""
        try:
            with open(output_file, 'w') as f:
                json.dump(problems, f, **EXPORT_SETTINGS)
            
            print(f"Successfully saved {len(problems)} problems to {output_file}")
            return True
        except Exception as e:
            print(f"Error saving to JSON: {e}")
            return False
    
    def process_pdf(self, pdf_path, output_path, start_problem=1, existing_file=None):
        """Main processing pipeline"""
        print(f"Starting PDF to JSON pipeline...")
        print(f"Input PDF: {pdf_path}")
        print(f"Output JSON: {output_path}")
        print(f"Starting from problem: {start_problem}")
        
        # Step 1: Extract text from PDF
        text = self.extract_text_from_pdf(pdf_path)
        if not text:
            return False
        
        # Step 2: Parse problems from text
        new_problems = self.parse_problems_from_text(text, start_problem)
        if not new_problems:
            print("No problems found in PDF")
            return False
        
        # Step 3: Apply post-processing validation and cleanup
        new_problems = self.post_process_validation(new_problems)
        
        # Step 4: Merge with existing problems if specified
        all_problems = self.merge_with_existing(new_problems, existing_file)
        
        # Step 5: Save to JSON
        success = self.save_to_json(all_problems, output_path)
        
        if success:
            print(f"\n✅ Pipeline completed successfully!")
            print(f"📊 Total problems: {len(all_problems)}")
            print(f"🆕 New problems added: {len(new_problems)}")
            
            # Show category breakdown
            categories = {}
            for problem in all_problems:
                category = problem.get('category', 'Unknown')
                categories[category] = categories.get(category, 0) + 1
            
            print(f"📚 Categories: {dict(sorted(categories.items()))}")
            
            # Show formatting improvements applied
            print(f"🔧 Enhanced formatting features applied:")
            print(f"   - Mathematical notation cleanup")
            print(f"   - Choice formatting with proper line breaks")
            print(f"   - PDF artifact removal")
            print(f"   - Post-processing validation")
        
        return success

    def post_process_validation(self, problems):
        """Apply post-processing validation and final cleanup"""
        
        print("Applying post-processing validation and cleanup...")
        
        validation_fixes = 0
        for problem in problems:
            original_text = problem.get('problem', '')
            if not original_text:
                continue
            
            # Apply final validation fixes
            fixed_text = self.apply_final_validation_fixes(original_text)
            
            if fixed_text != original_text:
                problem['problem'] = fixed_text
                validation_fixes += 1
                print(f"Applied validation fixes to problem {problem['id']}")
        
        print(f"Post-processing completed: {validation_fixes} problems refined")
        return problems
    
    def apply_final_validation_fixes(self, text):
        """Apply final validation and cleanup fixes"""
        
        # Remove any remaining duplicate "Choices:" labels
        text = re.sub(r'Choices:\s*Choices:\s*', 'Choices:\n', text)
        
        # Ensure proper spacing before mathematical expressions
        spacing_patterns = [
            (r'then\$', 'then $'),
            (r'will\$', 'will $'),
            (r'on\$', 'on $'),
            (r'to\$', 'to $'),
            (r'Let\$', 'Let $'),
            (r'\$denote', '$ denote'),
            (r'\$and\$', '$ and $'),
        ]
        
        for pattern, replacement in spacing_patterns:
            text = re.sub(pattern, replacement, text)
        
        # Ensure choices are properly formatted with line breaks
        if 'Choices:' in text:
            parts = text.split('Choices:', 1)
            if len(parts) == 2:
                problem_part = parts[0].strip()
                choices_part = parts[1].strip()
                
                # Ensure each choice is on a separate line
                choices_part = re.sub(r'\s*\(([A-E])\)\s*', r'\n(\1) ', choices_part)
                choices_part = choices_part.strip()
                
                text = f"{problem_part}\n\nChoices:\n{choices_part}"
        
        # Final whitespace cleanup
        text = re.sub(r'\s+', ' ', text)
        text = re.sub(r'\n\s*\n\s*\n+', '\n\n', text)
        
        return text.strip()


def main():
    """Command line interface for the PDF to JSON pipeline"""
    parser = argparse.ArgumentParser(
        description="Convert PDF math problems to structured JSON format",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python3 pdf_to_json_pipeline.py problems.pdf output.json
  python3 pdf_to_json_pipeline.py problems.pdf output.json --start-problem 18
  python3 pdf_to_json_pipeline.py problems.pdf output.json --existing current.json
        """
    )
    
    parser.add_argument('pdf_file', help='Input PDF file path')
    parser.add_argument('json_file', help='Output JSON file path')
    parser.add_argument('--start-problem', type=int, default=1, 
                       help='Problem number to start extracting from (default: 1)')
    parser.add_argument('--existing', help='Existing JSON file to merge with')
    parser.add_argument('--sample', type=int, help='Create a sample file with N problems')
    
    args = parser.parse_args()
    
    # Validate inputs
    if not Path(args.pdf_file).exists():
        print(f"Error: PDF file '{args.pdf_file}' does not exist")
        return 1
    
    # Create extractor and run pipeline
    extractor = PDFMathProblemExtractor()
    success = extractor.process_pdf(
        args.pdf_file, 
        args.json_file, 
        args.start_problem, 
        args.existing
    )
    
    # Create sample file if requested
    if success and args.sample:
        try:
            with open(args.json_file, 'r') as f:
                all_problems = json.load(f)
            
            sample_problems = all_problems[:args.sample]
            sample_file = args.json_file.replace('.json', '_sample.json')
            
            with open(sample_file, 'w') as f:
                json.dump(sample_problems, f, indent=2, ensure_ascii=False)
            
            print(f"📄 Sample file created: {sample_file} ({len(sample_problems)} problems)")
        except Exception as e:
            print(f"Warning: Could not create sample file: {e}")
    
    return 0 if success else 1


if __name__ == "__main__":
    exit(main()) 