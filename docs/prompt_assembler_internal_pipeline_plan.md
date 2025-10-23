# Prompt Assembler (Internal) — Lean Content Pipeline

**Mode selected:** CLI + Google Sheets/CSVs + Simple Read‑Only Web Viewer

---

## 1) Objectives

- **Consistency by configuration**: all camera/lighting/style rules come from the Film Bible (referenced by version).
- **Deterministic builds**: any image is reproducible from a single Prompt Bundle (JSON) + seed + model profile.
- **Operator‑friendly**: use Sheets for asset curation; run CLI for assembling prompts and batches.
- **Auditable**: every render stores provenance (inputs, hashes, model settings, seed).

---

## 2) High‑Level Architecture

- **Source Data**: Google Sheets (or exported CSVs in Git) for Characters, Poses, Wardrobe, Props, Scenes, Lighting, ModelProfiles, Lexicon.
- **Prompt Assembler CLI**: reads Sheets/CSVs → validates → emits Prompt Bundles (JSON) → submits to renderer queue (optional).
- **Renderer Adapter**: thin script/API client to your chosen model runner; returns images + metadata.
- **Artifact Store**: images + metadata saved content‑addressed (sha256) under `/renders/`.
- **Read‑Only Web Viewer**: static site (React/Vite) that reads `/renders/**/metadata.json` to browse, diff, and approve.

---

## 3) Data Model (Files/Sheets)

Each record must include `id`, `version`, `descriptor`, `status`, `updated_at`.

### Characters

- Columns: `id`, `version`, `species`, `anthro_ratio`, `descriptor`, `angles[front,3qL,profileL,back,profileR,3qR]`, `constraints`, `notes`.

### Poses

- Columns: `id`, `version`, `descriptor`, `gesture_tags`, `rotation_deg`, `wardrobe_zones_allowed`, `exclusions`, `notes`.

### Wardrobe

- Columns: `id`, `version`, `category`, `zones`, `descriptor`, `exclusions`, `notes`.

### Props

- Columns: `id`, `version`, `category`, `held_or_grounded`, `descriptor`, `notes`.

### Scenes

- Columns: `id`, `version`, `descriptor`, `camera_framing`, `backdrop_geom`, `allowed_lighting_profiles`, `notes`.

### Lighting Profiles

- Columns: `id`, `version`, `descriptor`, `temperature_K`, `key_dir_deg`, `fill_logic`, `rim_logic`.

### Model Profiles

- Columns: `id`, `version`, `model_name`, `sampler`, `steps`, `cfg`, `resolution`, `notes`.

### Lexicon (Controlled Vocabulary)

- Columns: `category`, `term`, `allowed`, `synonyms`, `notes`.

---

## 4) Prompt Bundle (frozen instruction)

```json
{
  "id": "bundle_2a71",
  "spec": {
    "film_bible": "film_bible@1.2.0",
    "character": "ruby_rhino@1.0.3",
    "pose": "arms_open_welcome@1.1",
    "wardrobe": ["sunhat@1.0"],
    "props": [],
    "scene": "piazza_v2",
    "lighting": "golden_hour_v1",
    "camera_override": null
  },
  "assembled_prompt_text": "[Film Bible header text] … [descriptors concatenated and linted]",
  "model_profile": "t2i_model_x@0.9",
  "seed": "HMAC-SHA256(namespace, build_context)",
  "vocabulary_version": "lexicon@2025-10-21",
  "inputs_checksum": "sha256:…",
  "created_at": "2025-10-23"
}
```

---

## 5) CLI Commands (examples)

- `pa pull-sheets` → export Google Sheets to `/data/*.csv`.
- `pa validate` → schema + lexicon lint + compatibility checks.
- `pa assemble --specs specs/*.json --out bundles/` → build Prompt Bundles from curated Specs or from filters.
- `pa compose --characters all --poses welcome,seated --scenes all --wardrobe none` → generate Spec stubs.
- `pa render --bundles bundles/*.json --out renders/` → post to renderer; poll results; write `metadata.json`.
- `pa drift-check --target renders/new --against .golden` → CLIP/pHash drift; fail thresholds.
- `pa export-md --bundle bundles/bundle_2a71.json` → markdown summary for review.

Each command returns a non‑zero exit code on failure; logs to `/logs/` with timestamps.

---

## 6) Validation & Quality Gates

- **Continuity lint**: header tokens present (35mm, 1m, 5° tilt, key=front-left 45°).
- **Lexicon enforcement**: descriptors must use approved terms; unknown adjectives rejected unless whitelisted.
- **Compatibility rules**: pose ↔ wardrobe zones; scene ↔ lighting profile; project rule “no clothes unless allowed.”
- **Token budget**: prompt length under configured limit.
- **Drift thresholds**: CLIP similarity to character anchors ≥ X; pHash Hamming distance ≤ Y.

---

## 7) Read‑Only Web Viewer (static)

- Built with React/Vite; serves from `/renders/`.
- Features: gallery, filters (character/scene/pose), side‑by‑side diff, metadata panel, JSON viewer, approval toggle stored in a small JSON next to the render.
- No server required; can be hosted from a static bucket.

---

## 8) Repo Layout

```
anamalia-pipeline/
  data/                  # CSVs exported from Sheets
  film_bible/            # header@semver.txt
  lexicon/
  assets/{characters,poses,wardrobe,props,scenes,lighting,models}/
  specs/
  bundles/
  renders/<sha256>/image.png
  renders/<sha256>/metadata.json
  .golden/               # anchor reference images
  scripts/               # CLI implementation
  webviewer/             # static viewer app
  logs/
```

---

## 9) Naming & Versioning

- IDs are kebab or snake case; versions use semver (`sunhat@1.0.2`).
- Any change affecting visuals bumps the asset version.
- Prompt Bundles reference explicit versions; renders record full provenance.

---

## 10) Security & Reproducibility

- No passwords in logs; seeds derived via HMAC with environment secret.
- Content‑addressed storage for images and JSON.
- Sign Prompt Bundles with ed25519 (optional) to verify provenance.

---

## 11) Roadmap (lean)

- **v0.1**: CSV/Sheets → CLI assemble → local render adapter → viewer reads metadata.
- **v0.2**: Distillation helper (image→descriptor); drift checks; approvals in viewer.
- **v1.0**: Batch composer UI; per‑bundle diffs; re‑render on profile updates; export packs for import into the main project.

---

## 12) Acceptance Checklist for Go‑Live

-

