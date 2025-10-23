# 🧰 Development Guide — Anamalia Prompt Assembler

This guide provides developers and operators with the technical setup, workflow, and CI/CD practices for building and maintaining the **Anamalia Prompt Assembler** internal toolchain.

---

## 1. Environment Setup

### **Prerequisites**
- **Python 3.11+**  
- **pip** and **virtualenv**
- **Git** and **GitHub account**
- **Cursor IDE** connected to your GitHub repository
- (Optional) **Google Cloud SDK** for automating Sheet exports

### **Setup Steps**
```bash
# 1. Clone the repo
 git clone https://github.com/<your-org>/anamalia-prompt-assembler.git
 cd anamalia-prompt-assembler

# 2. Create a virtual environment
 python -m venv venv
 source venv/bin/activate  # macOS/Linux
 venv\Scripts\activate     # Windows

# 3. Install dependencies
 pip install -r requirements.txt

# 4. Validate the setup
 python scripts/pa.py --help
```

---

## 2. Folder Overview

| Folder | Purpose |
|---------|----------|
| `/data` | CSV exports from Google Sheets (source of truth for content) |
| `/assets` | JSON-converted versions of CSVs (validated) |
| `/bundles` | Assembled prompt instructions for rendering |
| `/renders` | Generated images + metadata |
| `/schemas` | JSON Schemas for validating CSV/JSON structure |
| `/scripts` | Core CLI tools (e.g., `pa.py`) |
| `/film_bible` | Global style constants, lighting, and camera rules |
| `/lexicon` | Controlled vocabulary JSONs |
| `/webviewer` | Static site for browsing renders |

---

## 3. Development Workflow

### Step 1: Update or Add Assets
- Edit assets in Google Sheets (Characters, Poses, Scenes, etc.)
- Export each sheet as a CSV to the `/data/` folder

### Step 2: Validate Assets
```bash
pa validate
```
This ensures:
- All required columns exist
- Terms conform to the controlled vocabulary
- JSON schemas match expected data types

### Step 3: Convert to JSON
```bash
pa convert
```
Converts each CSV into JSON-formatted assets under `/assets/`.

### Step 4: Assemble Prompt Bundles
```bash
pa assemble --characters all --poses welcome --scenes outdoor
```
Combines Film Bible + descriptors into ready-to-render prompt bundles.

### Step 5: Render (optional)
```bash
pa render --bundles bundles/*.json --out renders/
```
Sends assembled prompts to the renderer adapter and saves resulting images and metadata.

### Step 6: Review Renders
Use the read-only **Web Viewer** to browse results, compare drift, and approve outputs.

---

## 4. CI/CD (GitHub Actions)
Each PR triggers a validation pipeline that ensures:
- CSV → JSON conversion passes schema checks
- Prompt Bundles assemble without warnings
- Lexicon and Film Bible versions are locked

Example CI workflow (`.github/workflows/ci.yml`):
```yaml
name: CI
on: [push, pull_request]
jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.11'
      - run: pip install -r requirements.txt
      - run: python scripts/pa.py validate
      - run: python scripts/pa.py convert
      - run: python scripts/pa.py assemble
```

---

## 5. Versioning Conventions
| Asset | Version Format | Trigger for Bump |
|--------|----------------|------------------|
| Characters, Poses, Wardrobe, etc. | `semver` (`1.0.1`) | Visual or descriptor change |
| Film Bible | `@1.x.x` | Any lighting or camera rule change |
| Lexicon | `@YYYY-MM-DD` | Vocabulary updates |
| Prompt Bundle | `@auto` | Generated; derived from component versions |

---

## 6. Recommended Practices
- Keep Film Bible text **immutable per version** — never edit old versions.
- Use the same warm, consistent adjectives in all descriptors.
- Maintain 1:1 CSV ↔ JSON mappings.
- Enforce deterministic seeds (e.g., via HMAC) for reproducible renders.
- Commit golden reference renders for drift checking.
- Document every change in `/CHANGELOG.md`.

---

## 7. Local Development with Cursor
- Use Cursor’s integrated terminal to run `pa.py` commands directly.
- Let Codex index `/schemas/` and `/scripts/` to assist with autocompletion.
- Add `.cursorignore` to exclude heavy render folders.

---

## 8. Future Additions
- Automated Google Sheets sync.
- CLI subcommand for diff-based drift visualization.
- CLI subcommand for batch bundle generation (`pa batch --matrix characters,poses,scenes`).
- Renderer adapter integration with Stable Diffusion / DALL·E / internal model.

---

## 9. Quick Reference
```bash
pa validate              # Validate data integrity
pa convert               # Convert CSV → JSON assets
pa assemble              # Assemble full prompt bundles
pa render                # Render from bundles
pa drift-check           # Compare new renders vs golden anchors
```

---

**Maintainer:** Internal R&D — Anamalia Studio  
**Repository:** `github.com/anamalia-labs/anamalia-prompt-assembler`  
**License:** MIT (internal use only)

