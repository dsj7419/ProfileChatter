/**
 * languageColors.js
 * Single Responsibility: Providing consistent colors for programming languages
 * These colors are based on GitHub's language color scheme
 */

// Common language colors mapping
export const languageColors = {
    // Core Languages
    'JavaScript': '#F7DF1E',
    'TypeScript': '#3178C6',
    'Python': '#3572A5',
    'Java': '#B07219',
    'C#': '#178600',
    'C++': '#F34B7D',
    'C': '#555555',
    'Go': '#00ADD8',
    'Rust': '#DEA584',
    'Dart': '#00B4AB',
    'Swift': '#F05138',
    'Kotlin': '#A97BFF',
    'PHP': '#4F5D95',
    'Ruby': '#701516',
    'Perl': '#0298C3',
    'Scala': '#DC322F',
    'Haskell': '#5E5086',
    'Elixir': '#6E4A7E',
    'Lua': '#000080',
    'R': '#198CE7',
    'Julia': '#9558B2',
    'Objective-C': '#438EFF',
    'Assembly': '#6E4C13',
    'Shell': '#89E051',
    'PowerShell': '#012456',
    'Bash': '#4EAA25',
    'Zig': '#EC915C',
    'Nim': '#FFE953',
    'Crystal': '#000100',
  
    // Web & Markup
    'HTML': '#E34C26',
    'CSS': '#563D7C',
    'Sass': '#CF649A',
    'Less': '#1D365D',
    'SCSS': '#C6538C',
    'Vue': '#41B883',
    'React': '#61DAFB',
    'Svelte': '#FF3E00',
    'Angular': '#DD0031',
    'Astro': '#FF5D01',
    'Markdown': '#083FA1',
    'XML': '#0060AC',
    'YAML': '#CB171E',
    'JSON': '#292929',
  
    // Data & Query
    'SQL': '#E38C00',
    'GraphQL': '#E10098',
    'NoSQL': '#A6E22E',
    'MongoDB': '#13AA52',
    'Redis': '#D82C20',
    'Firebase': '#FFCA28',
  
    // DevOps & Infra
    'Dockerfile': '#384D54',
    'Makefile': '#427819',
    'Terraform': '#623CE4',
    'Ansible': '#000000',
    'Kubernetes': '#326CE5',
    'Nix': '#7EBAE4',
  
    // Functional & Academic
    'OCaml': '#3BE133',
    'F#': '#B845FC',
    'Erlang': '#B83998',
    'Prolog': '#74283C',
    'Scheme': '#1E4AEC',
    'Common Lisp': '#3FB68B',
    'Clojure': '#5881D8',
    'Elm': '#60B5CC',
  
    // Scripting & Automation
    'Groovy': '#4298B8',
    'VBScript': '#15D4F0',
    'MATLAB': '#E16737',
    'Racket': '#9F1D20',
    'AutoHotkey': '#6594B9',
    'AutoIt': '#1C3552',
    'Tcl': '#E4CC98',
  
    // Misc & Emerging
    'Haxe': '#DF7900',
    'Vala': '#A56DE2',
    'COBOL': '#9CBF00',
    'Fortran': '#4D41B1',
    'Ada': '#02F88C',
    'Pascal': '#E3F171',
    'Smalltalk': '#596706',
    'Verilog': '#B2B7F8',
    'VHDL': '#ADB2CB',
  
    // Config & Meta
    'TOML': '#9C4221',
    'INI': '#D1D1D1',
    'CSV': '#FFD43B',
    'Other': '#CCCCCC'
  };
  
  /**
   * Gets a consistent color for a programming language
   * @param {string} language - Programming language name
   * @returns {string} - Hex color code
   */
  export function getLanguageColor(language) {
    return languageColors[language] || '#607D8B'; // Default to a neutral blue-gray
  }