# Green-Screen System Documentation

## Overview

The Anamalia Prompt Assembler's Green-Screen System enables pixel-perfect background insertion for stop-motion character renders. This system maintains all Film Bible constants while replacing the backdrop with chroma-key green, allowing for seamless compositing workflows.

## Features

### 1. Virtual Green-Screen Scene
- **Scene ID**: `greenscreen_v1`
- **Chroma Key Color**: #00FF00 (Standard Broadcast Green)
- **Maintains**: All Film Bible constants (camera, lighting, material DNA)
- **Preserves**: Contact shadows on green floor for realistic compositing

### 2. Dual Output Generation
When green-screen scene is selected, the system generates two outputs per render:
- **Green-screen Plate**: Full render with chroma-key green background
- **Alpha Mask**: Clean transparency mask with character + props + shadows

### 3. Tape Markings System
Three implementation levels:
- **Visual Tape Marks**: Baked into renders (T-marks, spike tape, reference marks)
- **Metadata Grid Overlay**: Toggleable alignment grid in web viewer
- **Toggle Parameter**: Per-render control for tape markings inclusion

### 4. Compositing Preview Tool
- Upload background images or provide URLs
- Real-time chroma-key compositing preview
- Canvas-based compositor for testing backgrounds

## Usage

### Generating Green-Screen Renders

1. **Select Green-Screen Scene**:
   - In Assemble Mode, choose "Green Screen v1" from Scene dropdown
   - Tape markings section will appear automatically

2. **Configure Tape Markings** (Optional):
   - Check "Include Tape Markings" for alignment reference
   - Uncheck for clean green-screen plates

3. **Generate Bundles**:
   - System will create dual outputs automatically
   - Green-screen plate: `bundle_xxx_greenscreen.png`
   - Alpha mask: `bundle_xxx_alpha.png`

### Using in Web Viewer

1. **Filter Green-Screen Renders**:
   - Use scene filter to show only green-screen renders
   - Green-screen cards display with special badges

2. **Grid Overlay**:
   - Click "📐 Grid Overlay" button to show alignment grid
   - Grid shows 10cm × 10cm stage grid from Virtual Stage System
   - Character origin marker at (0, 0, 0.1)

3. **Preview Composites**:
   - Click "🎬 Preview Composite" on green-screen renders
   - Upload background image or provide URL
   - See real-time compositing preview

4. **Download Options**:
   - **📥 Green-Screen**: Download green-screen plate
   - **🔳 Alpha**: Download alpha mask
   - **📦 Both (ZIP)**: Download both files + metadata

## Technical Specifications

### Prompt Engineering

**Green-Screen Prompt Template**:
```
"Captured on a miniature stop-motion stage with chroma-key green backdrop. 
Floor: vibrant green (#00FF00) matte surface. Wall: vibrant green (#00FF00) 
matte surface. 90-degree junction visible. Character maintains felted wool 
texture with natural contact shadows falling on green floor. Lighting: warm 
golden-hour (4800K) from front-left at 45° creates realistic shadow definition 
on green surface. Camera: 35mm lens, 1m height, 5° downward tilt, standard framing."
```

**Alpha Output Prompt**:
```
"Generate character with full transparency mask. Clean alpha channel cutout. 
Character on transparent background with edge detail preserved. Include contact 
shadows with proper alpha blending."
```

**Tape Markings Addition**:
```
"White T-mark tape at center stage position. Yellow spike tape strips marking 
character positions. Subtle reference marks at stage corners. Tape markings 
appear as physical elements on green floor."
```

### Metadata Schema

Green-screen renders include extended metadata:

```json
{
  "scene": "greenscreen_v1",
  "output_mode": "greenscreen_dual",
  "tape_markings": true,
  "outputs": {
    "greenscreen": "bundle_xxx_greenscreen.png",
    "alpha": "bundle_xxx_alpha.png"
  },
  "chroma_key": {
    "color": "#00FF00",
    "tolerance": "standard"
  },
  "spatial_metadata": {
    "character_origin": [0, 0, 0.1],
    "camera_position": [0, 0, 1.0],
    "stage_grid": "10cm"
  }
}
```

### File Naming Convention

- **Green-screen plate**: `bundle_xxx_greenscreen.png`
- **Alpha mask**: `bundle_xxx_alpha.png`
- **Metadata**: `bundle_xxx.json`

## Downstream Workflow

### Using with Image Generation Models

1. **Upload Green-Screen File**:
   - Use green-screen plate as input image
   - Provide prompt: "Insert this character into [scene description]"

2. **Upload Alpha Mask**:
   - Use alpha mask for precise compositing
   - Combine with background scene in external tools

3. **Spatial Alignment**:
   - Use grid overlay for positioning reference
   - Character origin at (0, 0, 0.1) for consistent placement

### External Compositing Tools

- **Photoshop**: Use green-screen plate with chroma key
- **After Effects**: Import both green-screen and alpha for layered compositing
- **DaVinci Resolve**: Professional color grading with green-screen keying
- **Blender**: 3D compositing with alpha channel support

## Best Practices

### For Green-Screen Renders
1. **Lighting Consistency**: Maintain Film Bible lighting for realistic shadows
2. **Tape Markings**: Use for alignment, remove for final composites
3. **Chroma Key Quality**: Ensure even green lighting for clean keying
4. **Shadow Preservation**: Keep contact shadows for realistic compositing

### For Background Compositing
1. **Matching Lighting**: Ensure background lighting matches character lighting
2. **Perspective Alignment**: Use grid overlay for proper positioning
3. **Color Grading**: Match color temperature between character and background
4. **Edge Refinement**: Use alpha mask for clean character edges

## Troubleshooting

### Common Issues

**Green Screen Not Keying Cleanly**:
- Check for even lighting on green backdrop
- Ensure no green spill on character
- Adjust chroma key tolerance in compositing software

**Shadows Too Dark/Light**:
- Verify Film Bible lighting consistency
- Check background lighting direction
- Adjust shadow opacity in compositing

**Character Positioning**:
- Use grid overlay for alignment reference
- Check character origin coordinates
- Verify camera position metadata

### Performance Tips

- **File Sizes**: Green-screen renders may be larger due to dual outputs
- **Preview Loading**: Large background images may take time to load
- **Grid Overlay**: Disable when not needed for better performance

## Integration with Virtual Stage System

The green-screen system integrates seamlessly with the Virtual Stage System:

- **Grid System**: 10cm × 10cm grid for precise positioning
- **Character Origin**: (0, 0, 0.1) - 10cm above stage floor
- **Camera Position**: (0, 0, 1.0) - 1m above stage center
- **Stage Dimensions**: 2m × 2m × 1.5m (L × W × H)

This ensures consistent spatial relationships between green-screen renders and background scenes.

## Future Enhancements

- **Advanced Chroma Key**: AI-powered green-screen removal
- **3D Compositing**: Integration with 3D scene generation
- **Batch Processing**: Automated background insertion workflows
- **Real-time Preview**: Live compositing during generation
