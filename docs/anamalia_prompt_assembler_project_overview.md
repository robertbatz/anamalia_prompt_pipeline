# 🦌 Anamalia Prompt Assembler

### Internal Content-Pipeline for Stop-Motion Character Still Generation

---

## 1. Project Summary

**Anamalia Prompt Assembler** is an internal toolchain for managing and generating thousands of high-fidelity 3D stop-motion–style stills. These stills represent a cast of anthropomorphic animal characters used across multiple Anamalia projects — both creative and cryptographic.

While Anamalia’s *commercial products* focus on password and identity technologies (e.g., deterministic visual mappings), the **Prompt Assembler** exists solely as a **production backend** to create consistent, reusable imagery. It functions as a lightweight, auditable, and reproducible **content pipeline** — bridging creative direction, language-driven generation, and strict data/version control.

---

## 2. Purpose

The project’s purpose is to:

1. **Generate visual assets** (characters, poses, scenes, wardrobe, props) in a modular, repeatable way.
2. **Assemble structured prompts** programmatically, ensuring fidelity to the Film Bible and controlled vocabulary.
3. **Track provenance** so every render can be recreated exactly from a versioned set of textual assets and model configurations.
4. **Maintain Systematic File Conventions to support deterministic mappings in our commercial product** between abstract data (e.g., password permutations or seeds) and finished imagery.
5. **Provide a foundation for creative consistency** — thousands of stills across scenes, all maintaining lighting, tone, and handcrafted realism.

---

## 3. Vision & Design Principles

- **Consistency First:** Camera, lighting, materials, and emotional tone are globally locked via the *Film Bible*.
- **Modularity:** Every component (character, pose, wardrobe, prop, scene, lighting) is independent and combinable.
- **Language-Driven Generation:** All prompts are built from distilled text descriptors rather than image references.
- **Determinism:** Identical inputs always yield identical outputs (same text → same image).
- **Auditability:** All prompt data, model parameters, and seeds are versioned for traceability.
- **Lean & Open:** Minimal dependencies, Git-based workflow, designed for small teams or single operators.

---

## 4. Technical Overview

The toolchain includes three main parts:

### **A. Data Layer (Google Sheets / CSVs)**

Operators define and curate assets in structured sheets:

- Characters
- Poses
- Wardrobe
- Props
- Scenes
- Lighting Profiles
- Model Profiles
- Controlled Vocabulary (Lexicon)

Each row becomes a composable prompt element. Sheets are exported as CSVs into `/data/`.

### **B. CLI Layer (Prompt Assembler Scripts)**

Small Python scripts under `/scripts/` handle:

- **Validation:** Ensuring schema and lexicon compliance.
- **Conversion:** Turning CSVs into structured JSON assets.
- **Assembly:** Building complete Prompt Bundles from assets + Film Bible + model settings.
- **Drift Checking:** Comparing outputs against golden references (CLIP or pHash).
- **Reporting:** Generating summaries of assets and bundles.

Example usage:

```bash
pa validate
pa assemble --characters all --poses welcome --scenes outdoor
```

### **C. Output Layer (Bundles, Renders, Viewer)**

Each build creates:

- **Prompt Bundles** — frozen JSON instructions containing all component versions, seeds, and concatenated prompts.
- **Renders** — final images (with metadata.json) generated via an external model adapter.
- **Web Viewer (static)** — lightweight gallery to browse, diff, and review outputs.

---

## 5. Relationship to Anamalia Ecosystem

This internal project serves the broader *Anamalia* universe in two ways:

| Function                        | Role in Ecosystem                                                                                                                                                                        |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Visual Canon**                | Defines how all anthropomorphic animal characters appear, ensuring continuity across Anamalia storytelling and brand assets.                                                             |
| **Deterministic Imagery Layer** | Acts as the visual generation engine that maps unique inputs (like passwords, seeds, or identity tokens) to canonical imagery used in Anamalia’s cryptographic and educational products. |

It is **not customer-facing software**, but a creative-engineering backend used to generate production imagery that later feeds into commercial pipelines.

---

## 6. Repository Structure

```
anamalia-prompt-assembler/
│
├── data/                 # CSVs exported from Google Sheets
├── schemas/              # JSON Schemas for validation
├── assets/               # Generated JSON assets
├── bundles/              # Final prompt bundles
├── renders/              # Images + metadata.json
├── scripts/              # CLI tools (validate, convert, assemble)
├── film_bible/           # Visual constants (header@semver.txt)
├── lexicon/              # Controlled vocabulary JSONs
├── webviewer/            # Read-only static viewer (optional)
├── Makefile              # Handy shortcuts (validate, assemble, all)
└── README.md             # This file
```

---

## 7. Toolchain Integration

### **Cursor + Codex Workflow**

- Use **Cursor** as the IDE for Python scripting, JSON schema editing, and prompt assembly logic.
- Connect **Codex** to visualize the repository structure, run builds, and maintain version control via GitHub.
- Each commit and PR triggers CI (via GitHub Actions) to validate schema compliance and re-assemble prompt bundles automatically.

---

## 8. Next Steps

1. Initialize the repo and commit template CSVs + assets.
2. Implement `pa.py` CLI script with `validate`, `convert`, and `assemble` commands.
3. Add JSON Schemas and a CI workflow.
4. Generate one full prompt bundle and render it as a proof of concept.
5. Deploy the read-only web viewer for browsing renders.
6. Iterate toward automated batch generation and golden-reference drift testing.

---

## 9. Long-Term Direction

- Expand from static 2D stills to stop-motion animation frames.
- Introduce deterministic seed assignment from the Anamalia core product.
- Enable distributed rendering and metadata signing (ed25519).
- Grow lexicon, asset libraries, and scene complexity gradually without breaking consistency.

