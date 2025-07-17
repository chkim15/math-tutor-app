# PDF to JSON Math Problems Pipeline

A comprehensive tool for extracting math problems from PDF files and converting them to properly formatted JSON with clean mathematical notation and consistent formatting.

## Features

- 📄 **PDF Text Extraction**: Uses `pdfplumber` for accurate text extraction
- 🧠 **Intelligent Parsing**: Automatically detects problem boundaries and multiple choice options
- 🧹 **Enhanced Mathematical Notation Cleanup**: Comprehensive fixes for corrupted symbols and LaTeX formatting
- 🔧 **Advanced Choice Formatting**: Ensures each choice option appears on separate lines with proper spacing
- 🏷️ **Auto-Categorization**: Classifies problems by mathematical category
- 📊 **Difficulty Assessment**: Assigns difficulty levels based on content and position
- 🔗 **Merging Support**: Combines with existing problem sets
- ✅ **Post-Processing Validation**: Applies final cleanup and validation steps
- ⚙️ **Configurable**: Easily customizable via configuration file

## Installation

### Prerequisites

```bash
# Install required Python package
pip install pdfplumber

# Or using pipx (recommended)
pipx install pdfplumber
```

### Files

- `pdf_to_json_pipeline.py` - Main pipeline script
- `pipeline_config.py` - Configuration settings
- `README_Pipeline.md` - This documentation

## Usage

### Basic Usage

```bash
# Extract all problems from a PDF
python3 pdf_to_json_pipeline.py input.pdf output.json

# Extract problems starting from problem 18
python3 pdf_to_json_pipeline.py input.pdf output.json --start-problem 18

# Merge with existing JSON file
python3 pdf_to_json_pipeline.py input.pdf output.json --existing current.json

# Create a sample file with first 10 problems
python3 pdf_to_json_pipeline.py input.pdf output.json --sample 10
```

### Command Line Options

| Option | Description | Example |
|--------|-------------|---------|
| `pdf_file` | Input PDF file path | `problems.pdf` |
| `json_file` | Output JSON file path | `output.json` |
| `--start-problem N` | Problem number to start from | `--start-problem 18` |
| `--existing FILE` | Existing JSON to merge with | `--existing current.json` |
| `--sample N` | Create sample with N problems | `--sample 5` |

## Output Format

The pipeline generates JSON files with the following structure:

```json
[
  {
    "id": 1,
    "category": "Calculus",
    "difficulty": "Hard",
    "problem": "Let $C$ denote an arbitrary constant. Then $\\int e^{e^x} dx =$\n\nChoices:\n(A) $e^{e^x - 1} + C$\n(B) $e^{e^x} + C$\n(C) $e^{e^x + 1} + C$\n(D) $xe^{e^x} + C$\n(E) $\\frac{e^{e^x + 1}}{e^x + 1} + C$"
  }
]
```

### Field Descriptions

- **id**: Unique problem identifier (integer)
- **category**: Mathematical category (see categories below)
- **difficulty**: Problem difficulty (Easy, Medium, Hard)
- **problem**: Complete problem text with LaTeX formatting
- **image** (optional): Path to associated diagram/image
- **imageAlt** (optional): Alt text for accessibility

## Categories

The pipeline automatically categorizes problems into:

- **Abstract Algebra** - Groups, rings, fields, homomorphisms
- **Calculus** - Derivatives, integrals, limits, continuity  
- **Complex Analysis** - Complex functions, residues, contours
- **Differential Equations** - ODEs, PDEs, boundary value problems
- **Discrete Mathematics** - Combinatorics, graph theory
- **Functions** - Domain, range, composition, inverse
- **Geometry** - Triangles, circles, areas, volumes
- **Linear Algebra** - Matrices, vectors, eigenvalues
- **Number Theory** - Primes, modular arithmetic, GCD
- **Probability** - Random variables, distributions
- **Real Analysis** - Sequences, series, convergence
- **Statistics** - Hypothesis testing, regression
- **Topology** - Metric spaces, continuity, compactness
- **Mathematics** - General/uncategorized problems

## Difficulty Levels

Problems are assigned difficulty based on:

1. **Position**: Later problems tend to be harder
2. **Content Complexity**: Keywords indicating advanced concepts
3. **Mathematical Sophistication**: Proof requirements, abstract concepts

## Mathematical Notation

The pipeline handles common PDF extraction issues:

### Symbol Mapping Examples

| PDF Symbol | LaTeX Output | Rendered |
|------------|--------------|----------|
| `Ú` | `\\int` | ∫ |
| `Â` | `\\sum` | ∑ |
| `π` | `\\pi` | π |
| `≥` | `\\geq` | ≥ |
| `˜` | `\\mathbb{R}` | ℝ |
| `Œ` | `\\in` | ∈ |

### Enhanced Formatting Fixes

The pipeline now includes comprehensive formatting improvements:

#### Choice Formatting
- **Separate Lines**: Each choice (A), (B), (C), etc. appears on its own line
- **Proper Spacing**: Consistent spacing between choices and problem text
- **Line Break Normalization**: Proper `\n\nChoices:\n` formatting
- **Duplicate Label Removal**: Eliminates duplicate "Choices:" labels

#### Mathematical Notation Enhancement
- **Integral Fixes**: `\int \$1` → `\int_0^1`, `sin p` → `\sin \pi`
- **Symbol Mapping**: 50+ enhanced symbol replacements including Greek letters, operators, and functions
- **LaTeX Cleanup**: Fixes double backslashes and malformed expressions
- **Spacing Corrections**: Proper spacing around mathematical expressions

#### PDF Artifact Removal
- **Metadata Cleanup**: Removes page numbers, copyright notices, headers
- **Unicode Artifacts**: Cleans corrupted characters from PDF extraction
- **CID Code Removal**: Eliminates PDF-specific character encoding artifacts

#### Post-Processing Validation
- **Final Cleanup**: Additional validation step after initial processing
- **Consistency Checks**: Ensures uniform formatting across all problems
- **Error Detection**: Identifies and reports potential formatting issues

### Enhanced Symbol Coverage

The pipeline now handles 60+ symbol mappings including:

```
Enhanced Integral Symbols:
\int \$1 → \int_0^1
\int \$ → \int_

Enhanced Greek Letters:
sin p → \sin \pi
cos p → \cos \pi
p) → \pi)

Enhanced Operators:
£ → \leq
³ → \geq
¢ → \neq

PDF Artifacts:
cid:11 → (removed)
cid:32 → =
cid:149 → \geq
```