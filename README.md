# 🦌 Anamalia Prompt Assembler

**Internal Content-Pipeline for Stop-Motion Character Still Generation**

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Status](https://img.shields.io/badge/status-development-orange.svg)]()

## Overview

The **Anamalia Prompt Assembler** is an internal toolchain for managing and generating thousands of high-fidelity 3D stop-motion–style stills. These stills represent a cast of anthropomorphic animal characters used across multiple Anamalia projects — both creative and cryptographic.

## 🎯 Purpose

- **Generate visual assets** (characters, poses, scenes, wardrobe, props) in a modular, repeatable way
- **Assemble structured prompts** programmatically, ensuring fidelity to the Film Bible and controlled vocabulary
- **Track provenance** so every render can be recreated exactly from a versioned set of textual assets
- **Maintain systematic file conventions** to support deterministic mappings between abstract data and finished imagery
- **Provide creative consistency** across thousands of stills with unified lighting, tone, and handcrafted realism

## 🏗️ Architecture

### Data Flow
```
Google Sheets → CSVs → Validation → JSON Assets → Prompt Assembly → Rendering → Web Viewer
```

### Key Components
- **Data Layer**: Google Sheets/CSVs for asset curation
- **CLI Layer**: Python scripts for validation, conversion, and assembly
- **Output Layer**: Prompt bundles, renders, and web viewer

## 📁 Repository Structure

```
anamalia-prompt-assembler/
├── data/                     # CSVs exported from Google Sheets
├── assets/                   # Generated JSON assets
│   ├── characters/
│   ├── poses/
│   ├── wardrobe/
│   ├── props/
│   ├── scenes/
│   ├── lighting/
│   └── models/
├── bundles/                  # Final prompt bundles
├── renders/                  # Images + metadata.json
├── specs/                    # Specification files
├── film_bible/               # Visual constants
├── lexicon/                  # Controlled vocabulary
├── schemas/                  # JSON Schemas for validation
├── scripts/                  # CLI tools
├── webviewer/                # Static web viewer
├── docs/                     # Documentation
├── logs/                     # Log files
└── .golden/                  # Reference images
```

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js (for web viewer)
- Access to Google Sheets (for asset management)

### Installation
```bash
# Clone the repository
git clone https://github.com/robertbatz/anamalia_prompt_pipeline.git
cd anamalia_prompt_pipeline

# Install Python dependencies
pip install -r requirements.txt

# Install Node.js dependencies (for web viewer)
npm install
```

### Basic Usage
```bash
# Validate data integrity
pa validate

# Assemble prompts from assets
pa assemble --characters all --poses welcome --scenes outdoor

# Render prompt bundles
pa render --bundles bundles/*.json --out renders/

# View results
pa serve  # Starts web viewer
```

## 📖 Documentation

- [Project Overview](docs/anamalia_prompt_assembler_project_overview.md)
- [Film Bible](docs/anamalia_film_bible.md)
- [Pipeline Plan](docs/prompt_assembler_internal_pipeline_plan.md)

## 🎨 Visual Standards

### Film Bible Constants
- **Camera**: 35mm lens, eye-level, 1m height, 5° downward tilt
- **Lighting**: Warm late-afternoon sunlight (4800K) from front-left at 45°
- **Materials**: Felted wool with visible fibers, hyper-realistic details
- **Tone**: Handcrafted, nostalgic, warm, optimistic
- **Backdrop**: Matte off-white floor/wall meeting at 90°

## 🔧 CLI Commands

| Command | Description |
|---------|-------------|
| `pa validate` | Validate schema and lexicon compliance |
| `pa assemble` | Build prompt bundles from assets |
| `pa render` | Submit bundles to renderer |
| `pa drift-check` | Compare outputs against golden references |
| `pa export-md` | Generate markdown summaries |

## 📊 Data Model

The system manages these asset types:
- **Characters**: Species, anthropomorphic ratio, descriptors, angles
- **Poses**: Gesture tags, rotation, wardrobe compatibility
- **Wardrobe**: Categories, zones, descriptors, exclusions
- **Props**: Held vs. grounded items, scene compatibility
- **Scenes**: Camera framing, backdrop geometry, lighting profiles
- **Lighting**: Temperature, direction, fill/rim logic
- **Model Profiles**: Rendering parameters

## 🔒 Security & Reproducibility

- Content-addressed storage for all assets
- Deterministic seed generation via HMAC
- Full provenance tracking for every render
- Version-controlled asset management

## 🛠️ Development

### Adding New Assets
1. Update Google Sheets with new asset data
2. Export to CSV format
3. Run `pa validate` to check compliance
4. Use `pa assemble` to generate new bundles

### Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and validation
5. Submit a pull request

## 📈 Roadmap

- **v0.1**: Core CLI implementation and basic validation
- **v0.2**: Web viewer and drift checking
- **v1.0**: Batch processing and advanced features

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Support

For questions or support, please open an issue in the GitHub repository.

---

**Note**: This is an internal tool for the Anamalia ecosystem. It's designed for generating consistent, deterministic visual assets for cryptographic and creative applications.
