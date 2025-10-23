# Anamalia Character Stills Project Overview

## 1. Purpose & Vision
Create thousands of high-fidelity 3D stop-motion animation stills representing a cast of 10 anthropomorphic animal characters across 32 distinct scenes. These stills are not frames of a film, but variations that map isomorphically to different password-derived outputs. Each image must maintain exact stylistic, textural, and lighting continuity.

## 2. Core Design Principles
- **Consistency First:** Every visual decision—from camera to felt texture—must follow a single, unified aesthetic standard.
- **Modularity:** Characters, poses, wardrobe items, props, and scenes are independent modules, later combined into composited stills.
- **Language-Driven World:** Final prompt construction relies on modularized text descriptors (not images) for composability and reproducibility.
- **Determinism:** Every final still can be regenerated exactly from its structured textual spec.
- **Stop-Motion Realism:** Each still should look handcrafted, photographed under consistent golden-hour lighting conditions.

## 3. The Film Bible
### 3.1 Global Visual Constants
- **Camera System:** 35mm lens, eye-level, tripod height 1m, angled 5° downward.
- **Lighting:** Warm late-afternoon sunlight (approx. 4800K) from front-left at 45°, soft fill from right, subtle rim light, diffused floor shadows.
- **Material DNA:** Felted wool body, visible fibers, hyper-realistic eyes/nose, human-style expressive gestures.
- **Backdrop Geometry:** Matte off-white floor and wall meeting at 90°, subtle contact shadows.
- **Color & Tone:** Soft contrast, warm palette, slight golden undertone. Ektachrome film look.

### 3.2 Emotional Tone
- Warm, handcrafted, optimistic world.
- Expressions humanlike but not exaggerated.
- Atmosphere evokes nostalgia, gentle humor, and familiarity.

## 4. Project Structure (Conceptual)
### 4.1 Modular Elements
| Module | Function | Example |
|--------|-----------|----------|
| Character | Defines species, base form, and felt texture | Ruby Rhino, Maxine Mouse |
| Pose | Defines body stance, hand gesture, and emotional posture | arms open, seated, reaching |
| Wardrobe | Optional accessories or clothing items | straw hat, satchel, camera bag |
| Prop | Scene-linked or held items | teacup, book, flower |
| Scene | Stage environment | cobblestone piazza, artist studio |
| Lighting Profile | Defines light mood variants | golden-hour, overcast, candlelight |
| Camera Framing | Shot type | full-body, medium, close-up |

### 4.2 The Prompt Stack
Each still = **Film Bible Header** + **Character Descriptor** + **Pose Descriptor** + **Wardrobe/Props** + **Scene Descriptor** + **Lighting Descriptor** + **Camera Framing**.

## 5. Controlled Vocabulary
A shared lexicon of approved terms ensures stylistic consistency. Each descriptor (character, wardrobe, scene, etc.) must be built using this lexicon.

| Category | Example Terms |
|-----------|----------------|
| Material | felted, woolen, fibrous, matte, handcrafted |
| Light | warm, directional, diffused, golden-hour |
| Color | ochre, cream, soft pink, muted blue |
| Composition | miniature, tabletop, cinematic depth |
| Tone | nostalgic, cheerful, gentle, inviting |

## 6. Workflow (Conceptual)
1. **Phase A — Character Creation**: Freeform exploration → lock down design → generate canonical 6-angle character sheet.
2. **Phase B — Pose Library**: Generate reusable poses using neutral puppet → lock perspective and proportions.
3. **Phase C — Wardrobe & Props**: Design each item individually → reverse-describe to text → add to asset library.
4. **Phase D — Scene Design**: Build modular, character-agnostic stage environments.
5. **Phase E — Prompt Assembly**: Combine Film Bible header + selected components into structured prompt text.
6. **Phase F — Quality Validation**: Check lighting direction, texture fidelity, and tone consistency.
7. **Phase G — Archival Versioning**: Store all text descriptors, prompts, and renders with metadata and hashes.

## 7. Continuity Anchors
| Element | Locked Constant |
|----------|-----------------|
| Camera | 35mm, 1m height, 5° tilt |
| Lighting | front-left 45°, 4800K warm light |
| Material | felted wool miniature aesthetic |
| Backdrop | off-white wall/floor 90° junction |
| Tone | golden, nostalgic, handcrafted warmth |

## 8. Next Steps
- Draft Controlled Vocabulary list for prompt distillation.
- Define metadata schema for Character, Pose, Wardrobe, Scene, Lighting.
- Establish naming/versioning conventions for assets.
- Create example prompt bundle (one complete still).
- Prepare for Part II: software pipeline (versioned asset management, prompt assembler, render validator).

