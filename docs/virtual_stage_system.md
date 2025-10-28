# Virtual Stop-Motion Stage Rig

## Overview

The Anamalia Prompt Assembler uses a canonical "Virtual Stop-Motion Stage Rig" to ensure consistent camera positioning and framing across all renders. This creates isomorphic perspectives that maintain visual coherence.

## Stage Coordinate System

### Base Stage Configuration
- **Stage Dimensions**: 2m × 2m × 1.5m (L × W × H)
- **Grid System**: 10cm × 10cm grid for precise positioning
- **Center Point**: (0, 0, 0) - stage center at floor level
- **Character Origin**: (0, 0, 0.1) - 10cm above stage floor

### Canonical Camera Rig
```
Base Configuration:
- Lens: 35mm (medium lens, cinematic depth of field)
- Height: 1.0m (eye-level for anthropomorphic characters)
- Angle: 0° (horizontal)
- Position: (0, 0, 1.0) - center, 1m above stage
- Orientation: Front-facing
```

## Camera Positioning Vocabulary

### Heights
- **Eye-level**: 1.0m (canonical)
- **3/4 human height**: 0.75m
- **Low angle**: 0.5m (dramatic)
- **High angle**: 1.5m (overhead)

### Orientations
- **Front-facing**: 0° rotation
- **3/4-left**: -45° rotation
- **3/4-right**: +45° rotation
- **Profile-left**: -90° rotation
- **Profile-right**: +90° rotation
- **Back-3/4**: ±135° rotation
- **Back-facing**: ±180° rotation

### Shot Types
- **Close-up**: Character fills 60-80% of frame
- **Medium shot**: Character fills 30-60% of frame
- **Wide shot**: Character fills 10-30% of frame
- **Establishing shot**: Full scene context

## Implementation in Prompts

### Standard Stage Description
```
"Captured on a miniature stop-motion stage using a fixed camera at 35mm lens, 
tripod height 1 meter, angled 0° downward, positioned at stage center."
```

### Scene-Specific Modifications
```
"Camera remains fixed; scene viewed from front-left, character rotated 15° clockwise."
"Camera positioned at 3/4-left orientation, maintaining 1m height."
"Low angle shot from 0.5m height for dramatic effect."
```

## Consistency Rules

1. **Fixed Stage**: All renders use the same 2m × 2m stage
2. **Grid Positioning**: Characters positioned on 10cm grid
3. **Camera Lock**: Same lens, height, and angle unless specified
4. **Orientation Changes**: Only camera rotation, not position
5. **Shadow Consistency**: Soft floor shadows from fixed overhead lighting

## Green-Screen Integration

The Virtual Stage System supports green-screen rendering for pixel-perfect compositing:

- **Green-Screen Scene**: `greenscreen_v1` replaces backdrop with chroma-key green (#00FF00)
- **Maintains Constants**: All camera, lighting, and material specifications preserved
- **Dual Output**: Generates both green-screen plate and alpha mask
- **Spatial Metadata**: Includes character origin and camera position for alignment
- **Grid Overlay**: Toggleable 10cm grid for compositing reference

See [Green-Screen System Documentation](greenscreen_system.md) for complete details.

## Benefits

- **Visual Coherence**: All characters appear in same "world"
- **Scalable System**: Easy to add new camera positions
- **Professional Quality**: Consistent framing and composition
- **Flexible**: Can modify individual elements while maintaining base system
- **Compositing Ready**: Green-screen support for background insertion
