# Changelog

All notable changes to the Anamalia Prompt Assembler project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Centralized logging infrastructure with file output to `/logs/`
- `pa convert` command for CSV to JSON asset conversion with schema validation
- Enhanced `pa assemble` command with `--specs` parameter for spec file support
- Enhanced `pa assemble` command with `--matrix` parameter for cartesian product generation
- `pa compose` command for generating spec stub files based on filters
- GitHub Actions CI workflow for automated validation pipeline
- Support for individual Tenner prompt generation
- Semantic skeleton templates for Tenner chunks
- 20 different chunk types with unique narrative templates
- Complete coverage of all 32 Tenners (chunked and individual)

### Changed
- Enhanced logging across all CLI commands
- Improved error handling and validation
- Better asset filtering and combination logic

### Fixed
- Corrected CHUNK3 definition from T1+T6 to T6+T7
- Fixed semantic template mapping for all chunks
- Resolved template replacement logic for placeholders
- Fixed function parameter mismatches in bundle creation

## [1.0.0] - 2025-10-23

### Added
- Initial project structure and documentation
- Core CLI commands: `validate`, `assemble`, `render`, `drift-check`, `export-md`, `serve`
- JSON schemas for all asset types (characters, poses, wardrobe, props, scenes, lighting, models)
- Film Bible system with global visual constants
- Controlled vocabulary (lexicon) system
- Basic web viewer for browsing renders
- Tenner system with 32 Tenners, each with 10 permutations
- Tenner chunking system with logical groupings
- Semantic skeleton templates for narrative coherence
- Individual Tenner support for unchunked Tenners
- Complete test suite for CLI functionality
- Asset conversion from CSV to JSON format
- Prompt bundle generation with deterministic seeds
- Metadata tracking and provenance
- Version control for all components

### Technical Details
- Python 3.11+ support
- Click-based CLI interface
- JSON Schema validation
- Pandas for data manipulation
- Flask for web viewer
- Comprehensive error handling
- Modular architecture for extensibility

## [0.1.0] - 2025-10-22

### Added
- Initial project setup
- Basic file structure
- Core concept documentation
- Development guide
- Project overview and technical specifications

---

**Maintainer:** Internal R&D — Anamalia Studio  
**Repository:** `github.com/anamalia-labs/anamalia-prompt-assembler`  
**License:** MIT (internal use only)
