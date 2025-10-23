# Tenner System - Structured Permutation Framework

## Overview

The **Tenner System** is a structured approach to generating permutations within the Anamalia Prompt Assembler. It provides a scalable framework for creating deterministic combinations of assets, where each "Tenner" represents a set of exactly 10 possible options.

## Core Concepts

### Tenner Definition
A **Tenner** is a collection of exactly 10 related assets that can be combined to create permutations. Each Tenner represents one dimension of variation in the character generation system.

### Tenner Chunks
- **One-Tenner**: 10^1 = 10 permutations
- **Two-Tenner**: 10^2 = 100 permutations  
- **Three-Tenner**: 10^3 = 1,000 permutations
- **Four-Tenner**: 10^4 = 10,000 permutations
- **Five-Tenner**: 10^5 = 100,000 permutations

## Tenner Categories

### 1. Character Tenners
**Ten Characters** - Each with unique species and personality:

1. **Ruby** - Rhinoceros (Friendly, welcoming)
2. **Maxine** - Mouse (Curious, energetic)
3. **Sammy** - Sloth (Calm, thoughtful)
4. **Bella** - Bear (Strong, protective)
5. **Felix** - Fox (Clever, mischievous)
6. **Luna** - Wolf (Mysterious, wise)
7. **Oscar** - Owl (Intelligent, observant)
8. **Penny** - Penguin (Cheerful, social)
9. **Rex** - Rabbit (Quick, agile)
10. **Zara** - Zebra (Elegant, graceful)

### 2. Headwear Tenners
**Ten Hat Types** - Each with distinct style and character:

1. **Cowboy Hat** - Wide-brimmed, weathered
2. **Sideways Baseball Cap** - Casual, sporty
3. **Knight's Helmet** - Medieval, protective
4. **Top Hat** - Formal, elegant
5. **Beanie** - Cozy, casual
6. **Sun Hat** - Wide-brimmed, protective
7. **Beret** - Artistic, sophisticated
8. **Hard Hat** - Industrial, safety-focused
9. **Crown** - Royal, majestic
10. **Pilot's Cap** - Aviator, adventurous

### 3. Garment Tenners
**Ten Clothing Types** - Each with unique style and function:

1. **Denim Jacket** - Casual, durable
2. **Lab Coat** - Scientific, professional
3. **Tuxedo** - Formal, elegant
4. **Hoodie** - Comfortable, casual
5. **Vest** - Practical, layered
6. **Cardigan** - Cozy, academic
7. **Blazer** - Professional, smart
8. **Overalls** - Workwear, functional
9. **Sweater** - Warm, comfortable
10. **Shirt** - Classic, versatile

### 4. Accessory Tenners
**Ten Accessory Types** - Each with distinct purpose and style:

1. **Glasses** - Intellectual, scholarly
2. **Watch** - Time-conscious, professional
3. **Scarf** - Stylish, protective
4. **Gloves** - Practical, refined
5. **Belt** - Functional, stylish
6. **Tie** - Professional, formal
7. **Bow Tie** - Distinguished, quirky
8. **Suspenders** - Vintage, practical
9. **Cufflinks** - Elegant, formal
10. **Pocket Square** - Sophisticated, dapper

### 5. Prop Tenners
**Ten Prop Types** - Each with unique function and character:

1. **Book** - Knowledge, learning
2. **Camera** - Creative, observant
3. **Tool** - Practical, skilled
4. **Instrument** - Musical, artistic
5. **Flower** - Natural, gentle
6. **Cup** - Social, comforting
7. **Bag** - Prepared, organized
8. **Flag** - Patriotic, proud
9. **Key** - Access, responsibility
10. **Coin** - Value, trade

## Tenner Chunk Examples

### Two-Tenner Chunk (100 permutations)
- **Character + Headwear**: 10 characters × 10 hats = 100 combinations
- **Character + Garment**: 10 characters × 10 clothing = 100 combinations
- **Headwear + Garment**: 10 hats × 10 clothing = 100 combinations

### Three-Tenner Chunk (1,000 permutations)
- **Character + Headwear + Garment**: 10 × 10 × 10 = 1,000 combinations
- **Character + Headwear + Accessory**: 10 × 10 × 10 = 1,000 combinations
- **Character + Garment + Prop**: 10 × 10 × 10 = 1,000 combinations

### Four-Tenner Chunk (10,000 permutations)
- **Character + Headwear + Garment + Accessory**: 10^4 = 10,000 combinations
- **Character + Headwear + Garment + Prop**: 10^4 = 10,000 combinations

### Five-Tenner Chunk (100,000 permutations)
- **Character + Headwear + Garment + Accessory + Prop**: 10^5 = 100,000 combinations

## Implementation Strategy

### 1. Tenner Asset Management
- Each Tenner category gets its own CSV file
- Assets are numbered 1-10 within each category
- Consistent naming convention: `{category}_{number}_{name}`

### 2. Permutation Generation
- CLI command: `pa tenner --chunks 3 --categories character,headwear,garment`
- Generates all possible combinations within specified chunks
- Outputs structured prompt bundles for each permutation

### 3. Deterministic Mapping
- Each permutation gets a unique ID based on its combination
- Seed generation based on permutation index
- Reproducible results for any given combination

### 4. Quality Control
- Validation that each Tenner has exactly 10 items
- Compatibility checking between categories
- Batch processing for large permutation sets

## Benefits

1. **Scalability**: Easy to add new Tenner categories
2. **Predictability**: Always know exactly how many permutations exist
3. **Organization**: Clear structure for asset management
4. **Efficiency**: Batch processing of related combinations
5. **Determinism**: Reproducible results for any permutation

## Future Extensions

- **Scene Tenners**: 10 different environments
- **Pose Tenners**: 10 different character poses
- **Lighting Tenners**: 10 different lighting setups
- **Mood Tenners**: 10 different emotional expressions

This system provides a solid foundation for generating thousands of unique, deterministic character combinations while maintaining the artistic consistency of the Anamalia universe.
