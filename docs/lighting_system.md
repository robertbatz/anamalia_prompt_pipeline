# Lighting Bible — "Golden-Hour Directional Rig"

## Overview

The Anamalia Prompt Assembler uses a comprehensive lighting system that ensures visual continuity across all renders. Each lighting profile is codified into a sacred phrase that must be used consistently to maintain the illusion that all images belong together.

## Lighting Continuity Principles

### 1. Color Temperature Consistency
- **Warm Golden Hour**: 4800K (late-summer sunlight)
- **Soft Indoor**: 3200K (tungsten warmth)
- **Dramatic Studio**: 5600K (daylight balance)
- **Cool Moonlight**: 7500K (blue-tinted)

### 2. Directionality Standards
- **Primary Key Light**: Always from front-left at 45° (canonical)
- **Fill Light**: Soft, opposite side or 360° ambient
- **Rim Light**: Minimal, for definition only
- **Shadow Direction**: Consistent with key light position

### 3. Shadow Characteristics
- **Soft Shadows**: Diffused, no hard edges
- **Defined Shadows**: Sharp but not harsh
- **Minimal Shadows**: Very soft, low contrast
- **Dramatic Shadows**: High contrast, defined edges

### 4. Ambient Tone Control
- **Warm Highlights**: Slightly warm, golden
- **Neutral Shadows**: Natural, not too cool
- **Cool Highlights**: Blue-tinted for night scenes
- **Warm Throughout**: Consistent warm tone

## Codified Lighting Phrases

### Sacred Phrases (Never Alter Unless Intentional)

#### 1. Golden Hour Directional Rig
**Codified Scheme:**
```
"Warm, directional late-afternoon sunlight from front-left at 45°, 
soft fill light from right, subtle floor shadow, gently contrasted 
stop-motion studio lighting."
```

#### 2. Soft Indoor Ambient
**Codified Scheme:**
```
"Soft, even overhead lighting with 360° ambient fill, minimal shadows, 
warm tungsten tone, cozy stop-motion studio atmosphere."
```

#### 3. Dramatic Studio Shadows
**Codified Scheme:**
```
"Sharp, dramatic lighting from front-left at 30°, minimal back fill, 
defined shadows with high contrast, cinematic stop-motion studio lighting."
```

#### 4. Studio White Clean
**Codified Scheme:**
```
"Clean, even overhead lighting with 360° fill, soft even shadows, 
neutral color temperature, professional stop-motion studio lighting."
```

#### 5. Warm Sunset Glow
**Codified Scheme:**
```
"Warm sunset backlight from back-right at 60°, soft warm fill from front, 
elongated soft shadows, golden hour stop-motion studio lighting."
```

#### 6. Cool Moonlight
**Codified Scheme:**
```
"Cool moonlight from front-left at 15°, minimal cool fill, soft defined 
shadows, blue-tinted stop-motion studio lighting."
```

#### 7. Warm Candlelight
**Codified Scheme:**
```
"Warm candlelight from front-left at 45°, soft warm ambient from below, 
flickering soft shadows, intimate stop-motion studio lighting."
```

#### 8. Bright Daylight
**Codified Scheme:**
```
"Bright daylight from front-left at 30°, strong fill from right, 
moderate shadows, natural stop-motion studio lighting."
```

#### 9. Moody Overcast
**Codified Scheme:**
```
"Diffused overcast lighting from overhead, 360° soft fill, minimal contrast, 
natural stop-motion studio lighting."
```

#### 10. Warm Firelight
**Codified Scheme:**
```
"Warm firelight from front-left at 30°, soft warm ambient from below, 
dancing soft shadows, cozy stop-motion studio lighting."
```

## Lighting Profiles CSV Structure

The lighting system uses a CSV file (`lighting_profiles.csv`) to store all lighting options with their codified schemes. Here's the structure:

### CSV Columns:
- `id`: Unique identifier (e.g., "golden_hour_directional")
- `version`: Semantic version (e.g., "1.0.0")
- `descriptor`: Human-readable name (e.g., "Golden Hour Directional Rig")
- `temperature_K`: Color temperature in Kelvin
- `key_dir_deg`: Key light direction in degrees
- `fill_logic`: Fill light logic description
- `rim_logic`: Rim light logic description
- `codified_scheme`: The exact phrase to use in prompts
- `status`: Active/inactive status
- `updated_at`: Last update timestamp

### Complete CSV Template:
```csv
id,version,descriptor,temperature_K,key_dir_deg,fill_logic,rim_logic,codified_scheme,status,updated_at
golden_hour_directional,1.0.0,Golden Hour Directional Rig,4800,45,soft_fill_right,subtle_rim,"Warm, directional late-afternoon sunlight from front-left at 45°, soft fill light from right, subtle floor shadow, gently contrasted stop-motion studio lighting.",active,2025-01-27
soft_indoor_ambient,1.0.0,Soft Indoor Ambient,3200,90,360_ambient,minimal,"Soft, even overhead lighting with 360° ambient fill, minimal shadows, warm tungsten tone, cozy stop-motion studio atmosphere.",active,2025-01-27
dramatic_studio_shadows,1.0.0,Dramatic Studio Shadows,5600,30,minimal_back_fill,defined,"Sharp, dramatic lighting from front-left at 30°, minimal back fill, defined shadows with high contrast, cinematic stop-motion studio lighting.",active,2025-01-27
studio_white_clean,1.0.0,Studio White Clean,5500,90,360_fill,minimal,"Clean, even overhead lighting with 360° fill, soft even shadows, neutral color temperature, professional stop-motion studio lighting.",active,2025-01-27
warm_sunset_glow,1.0.0,Warm Sunset Glow,4500,60,soft_warm_fill,elongated,"Warm sunset backlight from back-right at 60°, soft warm fill from front, elongated soft shadows, golden hour stop-motion studio lighting.",active,2025-01-27
cool_moonlight,1.0.0,Cool Moonlight,7500,15,minimal_cool_fill,soft_defined,"Cool moonlight from front-left at 15°, minimal cool fill, soft defined shadows, blue-tinted stop-motion studio lighting.",active,2025-01-27
warm_candlelight,1.0.0,Warm Candlelight,2800,45,soft_warm_ambient_below,flickering,"Warm candlelight from front-left at 45°, soft warm ambient from below, flickering soft shadows, intimate stop-motion studio lighting.",active,2025-01-27
bright_daylight,1.0.0,Bright Daylight,6500,30,strong_fill_right,moderate,"Bright daylight from front-left at 30°, strong fill from right, moderate shadows, natural stop-motion studio lighting.",active,2025-01-27
moody_overcast,1.0.0,Moody Overcast,6000,90,360_soft_fill,minimal,"Diffused overcast lighting from overhead, 360° soft fill, minimal contrast, natural stop-motion studio lighting.",active,2025-01-27
warm_firelight,1.0.0,Warm Firelight,3000,30,soft_warm_ambient_below,dancing,"Warm firelight from front-left at 30°, soft warm ambient from below, dancing soft shadows, cozy stop-motion studio lighting.",active,2025-01-27
```

## Implementation Rules

### 1. Consistency Requirements
- **Never alter** codified phrases unless intentionally changing lighting
- **Always include** the complete phrase in every prompt
- **Maintain** the same lighting vocabulary across all renders
- **Preserve** the "stop-motion studio lighting" suffix

### 2. Narrative Lighting Changes
When intentionally changing lighting for narrative effect:
- Document the change in version notes
- Update the codified phrase
- Ensure all future renders use the new phrase
- Maintain consistency within the new lighting scheme

### 3. Quality Control
- **Color Temperature**: Must match specified Kelvin values
- **Direction**: Key light position must be consistent
- **Shadows**: Characteristics must match description
- **Ambient Tone**: Overall warmth/coolness must be consistent

## Technical Specifications

### Lighting Rig Components
1. **Key Light**: Primary directional light source
2. **Fill Light**: Soft, diffused secondary light
3. **Rim Light**: Minimal edge definition (optional)
4. **Ambient**: Overall room tone
5. **Floor Shadow**: Consistent ground shadow

### Measurement Standards
- **Color Temperature**: Measured in Kelvin (K)
- **Direction**: Measured in degrees from front-center
- **Intensity**: Relative to key light (100%)
- **Shadow Softness**: Qualitative description
- **Contrast Ratio**: Key to fill light ratio

## Benefits

1. **Visual Continuity**: All renders appear in the same "world"
2. **Professional Quality**: Consistent, cinematic lighting
3. **Narrative Coherence**: Lighting supports story mood
4. **Scalable System**: Easy to add new lighting profiles
5. **Quality Control**: Measurable lighting standards

## Usage in Prompts

Every generated prompt must include the complete codified lighting phrase:

```
"A rhino named Ruby in a welcoming pose at a miniature cobblestone piazza 
with warm, directional late-afternoon sunlight from front-left at 45°, 
soft fill light from right, subtle floor shadow, gently contrasted 
stop-motion studio lighting, 3D stop-motion style, high quality, detailed."
```

This ensures that every render maintains the same lighting continuity, creating a cohesive visual universe for the Anamalia characters.
