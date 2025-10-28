#!/usr/bin/env python3
"""
Anamalia Prompt Assembler CLI

This is the main CLI tool for the Anamalia Prompt Assembler pipeline.
It provides commands for validation, assembly, rendering, and management.
"""

import click
import json
import os
import sys
import csv
import hashlib
import jsonschema
from pathlib import Path
from typing import Dict, List, Any, Optional
from datetime import datetime
import pandas as pd

# Import logging infrastructure
from logger import (
    setup_logger, get_logger, log_command_start, log_command_end,
    log_validation_error, log_conversion_progress, log_bundle_creation,
    log_rendering_progress, log_drift_check
)

# Add the project root to the Python path
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

# Utility functions
def load_schema(schema_name: str) -> Dict[str, Any]:
    """Load a JSON schema from the schemas directory."""
    schema_path = project_root / 'schemas' / f'{schema_name}.json'
    if not schema_path.exists():
        raise FileNotFoundError(f"Schema {schema_name} not found at {schema_path}")
    
    with open(schema_path, 'r') as f:
        return json.load(f)

def load_csv_data(csv_path: Path) -> List[Dict[str, Any]]:
    """Load CSV data and convert to list of dictionaries."""
    if not csv_path.exists():
        return []
    
    data = []
    with open(csv_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            # Convert semicolon-separated values to lists
            for key, value in row.items():
                if ';' in str(value):
                    row[key] = [v.strip() for v in str(value).split(';') if v.strip()]
                # Convert numeric fields
                elif key in ['anthro_ratio', 'rotation_deg', 'temperature_K', 'key_dir_deg', 'steps', 'cfg']:
                    try:
                        row[key] = float(value) if '.' in str(value) else int(value)
                    except (ValueError, TypeError):
                        pass  # Keep as string if conversion fails
            data.append(row)
    
    return data

def validate_against_schema(data: Dict[str, Any], schema: Dict[str, Any]) -> List[str]:
    """Validate data against a JSON schema and return list of errors."""
    errors = []
    try:
        jsonschema.validate(data, schema)
    except jsonschema.ValidationError as e:
        errors.append(f"Validation error: {e.message}")
    except jsonschema.SchemaError as e:
        errors.append(f"Schema error: {e.message}")
    return errors

def load_lexicon() -> Dict[str, Any]:
    """Load the controlled vocabulary lexicon."""
    lexicon_path = project_root / 'lexicon' / 'lexicon@v1.json'
    if not lexicon_path.exists():
        return {}
    
    with open(lexicon_path, 'r') as f:
        return json.load(f)

def check_lexicon_compliance(text: str, lexicon: Dict[str, Any]) -> List[str]:
    """Check if text complies with the controlled vocabulary."""
    errors = []
    if not lexicon or 'categories' not in lexicon:
        return errors
    
    # Simple word-based checking (could be enhanced with NLP)
    words = text.lower().split()
    for word in words:
        word_clean = word.strip('.,!?;:')
        found_in_lexicon = False
        
        for category, terms in lexicon['categories'].items():
            for term, data in terms.items():
                if word_clean == term.lower() or word_clean in [syn.lower() for syn in data.get('synonyms', [])]:
                    found_in_lexicon = True
                    break
            if found_in_lexicon:
                break
        
        if not found_in_lexicon and len(word_clean) > 3:  # Skip short words
            errors.append(f"Word '{word_clean}' not found in lexicon")
    
    return errors

def generate_checksum(data: str) -> str:
    """Generate SHA256 checksum for data."""
    return hashlib.sha256(data.encode('utf-8')).hexdigest()

@click.group()
@click.version_option(version="0.1.0")
def cli():
    """Anamalia Prompt Assembler - Internal content pipeline for stop-motion character still generation."""
    pass

@cli.command()
@click.option('--data-dir', default='data', help='Directory containing CSV data files')
@click.option('--schema-dir', default='schemas', help='Directory containing JSON schemas')
@click.option('--verbose', '-v', is_flag=True, help='Verbose output')
def validate(data_dir, schema_dir, verbose):
    """Validate all data files against schemas and lexicon."""
    logger = get_logger()
    log_command_start("validate", {"data_dir": data_dir, "schema_dir": schema_dir, "verbose": verbose})
    
    click.echo("🔍 Validating data integrity...")
    logger.info("Starting data validation process")
    
    data_path = project_root / data_dir
    schema_path = project_root / schema_dir
    
    if not data_path.exists():
        click.echo(f"❌ Data directory {data_path} does not exist")
        return
    
    # Load lexicon for compliance checking
    lexicon = load_lexicon()
    if verbose:
        click.echo(f"📚 Loaded lexicon with {len(lexicon.get('categories', {}))} categories")
    
    # Define CSV files and their corresponding schemas
    csv_schemas = {
        'characters.csv': 'character',
        'poses.csv': 'pose',
        'wardrobe.csv': 'wardrobe',
        'props.csv': 'props',
        'scenes.csv': 'scene',
        'lighting_profiles.csv': 'lighting',
        'model_profiles.csv': 'model'
    }
    
    total_errors = 0
    total_items = 0
    
    for csv_file, schema_name in csv_schemas.items():
        csv_path = data_path / csv_file
        if not csv_path.exists():
            if verbose:
                click.echo(f"⚠️  Skipping {csv_file} (not found)")
            continue
        
        click.echo(f"📄 Validating {csv_file}...")
        
        # Load schema
        try:
            schema = load_schema(schema_name)
        except FileNotFoundError as e:
            click.echo(f"❌ Schema {schema_name} not found: {e}")
            total_errors += 1
            continue
        
        # Load and validate CSV data
        csv_data = load_csv_data(csv_path)
        if not csv_data:
            click.echo(f"⚠️  No data found in {csv_file}")
            continue
        
        file_errors = 0
        for i, item in enumerate(csv_data):
            total_items += 1
            
            # Validate against schema
            schema_errors = validate_against_schema(item, schema)
            if schema_errors:
                file_errors += len(schema_errors)
                if verbose:
                    click.echo(f"  ❌ Row {i+1}: {', '.join(schema_errors)}")
            
            # Check lexicon compliance for descriptor fields
            descriptor_fields = ['descriptor', 'notes']
            for field in descriptor_fields:
                if field in item and item[field]:
                    lexicon_errors = check_lexicon_compliance(str(item[field]), lexicon)
                    if lexicon_errors:
                        file_errors += len(lexicon_errors)
                        if verbose:
                            click.echo(f"  📝 Row {i+1} {field}: {', '.join(lexicon_errors)}")
        
        total_errors += file_errors
        if file_errors == 0:
            click.echo(f"  ✅ {csv_file} validation passed")
        else:
            click.echo(f"  ❌ {csv_file} had {file_errors} errors")
    
    # Summary
    if total_errors == 0:
        click.echo(f"✅ Validation complete - {total_items} items validated successfully")
        log_command_end("validate", success=True, message=f"{total_items} items validated successfully")
    else:
        click.echo(f"❌ Validation failed - {total_errors} errors found in {total_items} items")
        log_command_end("validate", success=False, message=f"{total_errors} errors found in {total_items} items")
        sys.exit(1)

@cli.command()
@click.option('--data-dir', default='data', help='Directory containing CSV data files')
@click.option('--assets-dir', default='assets', help='Directory to output JSON assets')
@click.option('--schema-dir', default='schemas', help='Directory containing JSON schemas')
@click.option('--verbose', '-v', is_flag=True, help='Verbose output')
def convert(data_dir, assets_dir, schema_dir, verbose):
    """Convert CSV files to validated JSON assets."""
    logger = get_logger()
    log_command_start("convert", {"data_dir": data_dir, "assets_dir": assets_dir, "schema_dir": schema_dir, "verbose": verbose})
    
    click.echo("🔄 Converting CSV files to JSON assets...")
    logger.info("Starting CSV to JSON conversion process")
    
    data_path = project_root / data_dir
    assets_path = project_root / assets_dir
    schema_path = project_root / schema_dir
    
    if not data_path.exists():
        click.echo(f"❌ Data directory {data_path} does not exist")
        log_command_end("convert", success=False, message="Data directory does not exist")
        sys.exit(1)
    
    # Create assets directory structure
    assets_path.mkdir(exist_ok=True)
    
    # Define CSV files and their corresponding schemas and asset types
    csv_config = {
        'characters.csv': {'schema': 'character', 'asset_type': 'characters'},
        'poses.csv': {'schema': 'pose', 'asset_type': 'poses'},
        'orientations.csv': {'schema': 'orientation', 'asset_type': 'orientations'},
        'wardrobe.csv': {'schema': 'wardrobe', 'asset_type': 'wardrobe'},
        'props.csv': {'schema': 'props', 'asset_type': 'props'},
        'scenes.csv': {'schema': 'scene', 'asset_type': 'scenes'},
        'lighting_profiles.csv': {'schema': 'lighting', 'asset_type': 'lighting'},
        'model_profiles.csv': {'schema': 'model', 'asset_type': 'models'}
    }
    
    total_converted = 0
    total_errors = 0
    
    for csv_file, config in csv_config.items():
        csv_path = data_path / csv_file
        if not csv_path.exists():
            if verbose:
                click.echo(f"⚠️  Skipping {csv_file} - file not found")
            continue
        
        click.echo(f"📄 Processing {csv_file}...")
        logger.info(f"Converting {csv_file} to {config['asset_type']} assets")
        
        # Load schema
        schema_file = schema_path / f"{config['schema']}.json"
        if not schema_file.exists():
            click.echo(f"❌ Schema file {schema_file} not found")
            log_validation_error(config['asset_type'], csv_file, f"Schema file not found: {schema_file}")
            total_errors += 1
            continue
        
        with open(schema_file, 'r') as f:
            schema = json.load(f)
        
        # Load CSV data
        csv_data = load_csv_data(csv_path)
        if not csv_data:
            click.echo(f"⚠️  No data found in {csv_file}")
            continue
        
        # Create asset type directory
        asset_type_dir = assets_path / config['asset_type']
        asset_type_dir.mkdir(exist_ok=True)
        
        file_converted = 0
        file_errors = 0
        
        for i, item in enumerate(csv_data):
            try:
                # Validate against schema
                validation_errors = validate_against_schema(item, schema)
                if validation_errors:
                    for error in validation_errors:
                        log_validation_error(config['asset_type'], item.get('id', f'row_{i+1}'), error)
                    file_errors += len(validation_errors)
                    continue
                
                # Create JSON asset file
                asset_id = item.get('id', f'item_{i}')
                version = item.get('version', '1.0.0')
                asset_filename = f"{asset_id}@{version}.json"
                asset_path = asset_type_dir / asset_filename
                
                # Write JSON asset
                with open(asset_path, 'w') as f:
                    json.dump(item, f, indent=2)
                
                file_converted += 1
                log_bundle_creation(asset_id, str(asset_path))
                
                if verbose:
                    click.echo(f"  ✅ Created {asset_filename}")
                
            except Exception as e:
                error_msg = f"Error processing item {i+1}: {str(e)}"
                log_validation_error(config['asset_type'], f'row_{i+1}', error_msg)
                file_errors += 1
                if verbose:
                    click.echo(f"  ❌ {error_msg}")
        
        total_converted += file_converted
        total_errors += file_errors
        
        log_conversion_progress(config['asset_type'], len(csv_data), file_converted)
        
        if file_errors == 0:
            click.echo(f"  ✅ {csv_file} converted successfully ({file_converted} assets)")
        else:
            click.echo(f"  ❌ {csv_file} had {file_errors} errors, {file_converted} assets converted")
    
    # Summary
    if total_errors == 0:
        click.echo(f"✅ Conversion complete - {total_converted} assets created successfully")
        log_command_end("convert", success=True, message=f"{total_converted} assets created successfully")
    else:
        click.echo(f"⚠️  Conversion completed with {total_errors} errors - {total_converted} assets created")
        log_command_end("convert", success=True, message=f"{total_converted} assets created with {total_errors} errors")

def create_bundle_from_spec(spec: Dict[str, Any], data_path: Path, project_root: Path) -> Dict[str, Any]:
    """
    Create a prompt bundle from a spec dictionary.
    
    Args:
        spec: Specification dictionary with asset IDs (may be nested under 'spec' key)
        data_path: Path to data directory
        project_root: Project root path
    
    Returns:
        Complete prompt bundle dictionary
    """
    # Handle nested spec structure
    if 'spec' in spec:
        spec_data = spec['spec']
    else:
        spec_data = spec
    
    # Load asset data
    characters_data = load_csv_data(data_path / 'characters.csv')
    poses_data = load_csv_data(data_path / 'poses.csv')
    orientations_data = load_csv_data(data_path / 'orientations.csv')
    scenes_data = load_csv_data(data_path / 'scenes.csv')
    wardrobe_data = load_csv_data(data_path / 'wardrobe.csv')
    lighting_data = load_csv_data(data_path / 'lighting_profiles.csv')
    model_data = load_csv_data(data_path / 'model_profiles.csv')
    
    # Find specific assets by ID
    character = next((item for item in characters_data if item.get('id') == spec_data.get('character')), None)
    pose = next((item for item in poses_data if item.get('id') == spec_data.get('pose')), None)
    orientation = next((item for item in orientations_data if item.get('id') == spec_data.get('orientation')), None)
    scene = next((item for item in scenes_data if item.get('id') == spec_data.get('scene')), None)
    lighting = next((item for item in lighting_data if item.get('id') == spec_data.get('lighting')), None)
    model = next((item for item in model_data if item.get('id') == spec_data.get('model')), None)
    
    # Handle missing assets
    if not character:
        raise ValueError(f"Character '{spec_data.get('character')}' not found")
    if not pose:
        raise ValueError(f"Pose '{spec_data.get('pose')}' not found")
    if not orientation:
        raise ValueError(f"Orientation '{spec_data.get('orientation')}' not found")
    if not scene:
        raise ValueError(f"Scene '{spec_data.get('scene')}' not found")
    if not lighting:
        raise ValueError(f"Lighting '{spec_data.get('lighting')}' not found")
    if not model:
        raise ValueError(f"Model '{spec_data.get('model')}' not found")
    
    # Find wardrobe items
    wardrobe_items = []
    if spec_data.get('wardrobe'):
        for wardrobe_id in spec_data['wardrobe']:
            wardrobe_item = next((item for item in wardrobe_data if item.get('id') == wardrobe_id), None)
            if wardrobe_item:
                wardrobe_items.append(wardrobe_item)
    
    # Load film bible
    film_bible_path = project_root / 'film_bible' / 'header@1.0.0.txt'
    film_bible_text = ""
    if film_bible_path.exists():
        with open(film_bible_path, 'r') as f:
            film_bible_text = f.read().strip()
    
    # Create bundle using existing function
    return create_prompt_bundle(
        character, pose, orientation, scene, wardrobe_items, lighting, model, film_bible_text
    )

@cli.command()
@click.option('--characters', default='all', help='Character filter (all, or comma-separated list)')
@click.option('--poses', default='all', help='Pose filter (all, or comma-separated list)')
@click.option('--scenes', default='all', help='Scene filter (all, or comma-separated list)')
@click.option('--wardrobe', default='none', help='Wardrobe filter (none, all, or comma-separated list)')
@click.option('--specs', default=None, help='Directory containing spec files to assemble')
@click.option('--matrix', default=None, help='Matrix generation (e.g., characters,poses,scenes)')
@click.option('--output-dir', default='bundles', help='Output directory for prompt bundles')
@click.option('--verbose', '-v', is_flag=True, help='Verbose output')
def assemble(characters, poses, scenes, wardrobe, specs, matrix, output_dir, verbose):
    """Assemble prompt bundles from assets."""
    logger = get_logger()
    log_command_start("assemble", {
        "characters": characters, "poses": poses, "scenes": scenes, 
        "wardrobe": wardrobe, "specs": specs, "matrix": matrix, 
        "output_dir": output_dir, "verbose": verbose
    })
    
    click.echo("🔧 Assembling prompt bundles...")
    logger.info("Starting prompt bundle assembly")
    
    data_path = project_root / 'data'
    output_path = project_root / output_dir
    output_path.mkdir(exist_ok=True)
    
    # Handle spec file mode
    if specs:
        specs_path = project_root / specs
        if not specs_path.exists():
            click.echo(f"❌ Specs directory {specs_path} does not exist")
            log_command_end("assemble", success=False, message="Specs directory does not exist")
            sys.exit(1)
        
        click.echo(f"📁 Loading spec files from {specs_path}")
        logger.info(f"Loading spec files from {specs_path}")
        
        # Load all spec files
        spec_files = list(specs_path.glob("*.json"))
        if not spec_files:
            click.echo(f"❌ No spec files found in {specs_path}")
            log_command_end("assemble", success=False, message="No spec files found")
            sys.exit(1)
        
        bundles_created = 0
        for spec_file in spec_files:
            try:
                with open(spec_file, 'r') as f:
                    spec = json.load(f)
                
                # Create bundle from spec
                bundle = create_bundle_from_spec(spec, data_path, project_root)
                
                # Save bundle
                bundle_filename = f"{bundle['id']}.json"
                bundle_path = output_path / bundle_filename
                
                with open(bundle_path, 'w') as f:
                    json.dump(bundle, f, indent=2)
                
                bundles_created += 1
                log_bundle_creation(bundle['id'], str(bundle_path))
                
                if verbose:
                    click.echo(f"  ✅ Created {bundle_filename}")
                
            except Exception as e:
                error_msg = f"Error processing spec {spec_file.name}: {str(e)}"
                logger.error(error_msg)
                click.echo(f"  ❌ {error_msg}")
        
        click.echo(f"✅ Assembly complete - {bundles_created} bundles created from {len(spec_files)} specs")
        log_command_end("assemble", success=True, message=f"{bundles_created} bundles created from {len(spec_files)} specs")
        return
    
    # Handle matrix generation mode
    if matrix:
        matrix_components = [comp.strip() for comp in matrix.split(',')]
        click.echo(f"🔄 Matrix generation: {', '.join(matrix_components)}")
        logger.info(f"Matrix generation for components: {matrix_components}")
        
        # Load asset data for matrix components
        asset_data = {}
        for component in matrix_components:
            if component == 'characters':
                asset_data['characters'] = load_csv_data(data_path / 'characters.csv')
            elif component == 'poses':
                asset_data['poses'] = load_csv_data(data_path / 'poses.csv')
            elif component == 'scenes':
                asset_data['scenes'] = load_csv_data(data_path / 'scenes.csv')
            elif component == 'wardrobe':
                asset_data['wardrobe'] = load_csv_data(data_path / 'wardrobe.csv')
            elif component == 'lighting':
                asset_data['lighting'] = load_csv_data(data_path / 'lighting_profiles.csv')
            elif component == 'models':
                asset_data['models'] = load_csv_data(data_path / 'model_profiles.csv')
        
        # Generate all combinations
        import itertools
        combinations = list(itertools.product(*[asset_data[comp] for comp in matrix_components]))
        
        click.echo(f"📊 Generating {len(combinations)} combinations...")
        logger.info(f"Generating {len(combinations)} matrix combinations")
        
        bundles_created = 0
        for i, combination in enumerate(combinations):
            try:
                # Create spec from combination
                spec = {}
                for j, component in enumerate(matrix_components):
                    item = combination[j]
                    if component == 'characters':
                        spec['character'] = item['id']
                    elif component == 'poses':
                        spec['pose'] = item['id']
                    elif component == 'scenes':
                        spec['scene'] = item['id']
                    elif component == 'wardrobe':
                        spec['wardrobe'] = [item['id']]
                    elif component == 'lighting':
                        spec['lighting'] = item['id']
                    elif component == 'models':
                        spec['model'] = item['id']
                
                # Create bundle
                bundle = create_bundle_from_spec(spec, data_path, project_root)
                
                # Save bundle
                bundle_filename = f"matrix_{i:04d}_{bundle['id']}.json"
                bundle_path = output_path / bundle_filename
                
                with open(bundle_path, 'w') as f:
                    json.dump(bundle, f, indent=2)
                
                bundles_created += 1
                log_bundle_creation(bundle['id'], str(bundle_path))
                
                if verbose and i % 100 == 0:
                    click.echo(f"  📦 Created {bundles_created} bundles...")
                
            except Exception as e:
                error_msg = f"Error processing combination {i}: {str(e)}"
                logger.error(error_msg)
                if verbose:
                    click.echo(f"  ❌ {error_msg}")
        
        click.echo(f"✅ Matrix assembly complete - {bundles_created} bundles created")
        log_command_end("assemble", success=True, message=f"{bundles_created} bundles created from matrix generation")
        return
    
    # Continue with original assemble logic for backward compatibility
    # Load all asset data
    characters_data = load_csv_data(data_path / 'characters.csv')
    poses_data = load_csv_data(data_path / 'poses.csv')
    scenes_data = load_csv_data(data_path / 'scenes.csv')
    wardrobe_data = load_csv_data(data_path / 'wardrobe.csv')
    lighting_data = load_csv_data(data_path / 'lighting_profiles.csv')
    model_data = load_csv_data(data_path / 'model_profiles.csv')
    
    # Load film bible
    film_bible_path = project_root / 'film_bible' / 'header@1.0.0.txt'
    film_bible_text = ""
    if film_bible_path.exists():
        with open(film_bible_path, 'r') as f:
            film_bible_text = f.read().strip()
    
    # Apply filters
    character_filter = characters.split(',') if characters != 'all' else None
    pose_filter = poses.split(',') if poses != 'all' else None
    scene_filter = scenes.split(',') if scenes != 'all' else None
    wardrobe_filter = wardrobe.split(',') if wardrobe not in ['none', 'all'] else None
    
    # Filter data
    if character_filter:
        characters_data = [c for c in characters_data if c.get('id') in character_filter]
    if pose_filter:
        poses_data = [p for p in poses_data if p.get('id') in pose_filter]
    if scene_filter:
        scenes_data = [s for s in scenes_data if s.get('id') in scene_filter]
    if wardrobe_filter:
        wardrobe_data = [w for w in wardrobe_data if w.get('id') in wardrobe_filter]
    
    if verbose:
        click.echo(f"📊 Loaded {len(characters_data)} characters, {len(poses_data)} poses, {len(scenes_data)} scenes")
        if wardrobe != 'none':
            click.echo(f"📊 Loaded {len(wardrobe_data)} wardrobe items")
    
    # Generate bundles
    bundle_count = 0
    for character in characters_data:
        for pose in poses_data:
            for scene in scenes_data:
                # Check pose-wardrobe compatibility
                if wardrobe != 'none' and wardrobe_data:
                    compatible_wardrobe = []
                    for w in wardrobe_data:
                        if w.get('zones') and pose.get('wardrobe_zones_allowed'):
                            if any(zone in pose.get('wardrobe_zones_allowed', []) for zone in w.get('zones', [])):
                                compatible_wardrobe.append(w)
                else:
                    compatible_wardrobe = []
                
                # Create bundle for each wardrobe combination (including no wardrobe)
                wardrobe_combinations = [compatible_wardrobe] if compatible_wardrobe else [[]]
                if wardrobe == 'none':
                    wardrobe_combinations = [[]]
                
                for wardrobe_combo in wardrobe_combinations:
                    bundle = create_prompt_bundle(
                        character, pose, scene, wardrobe_combo, 
                        lighting_data[0] if lighting_data else None,
                        model_data[0] if model_data else None,
                        film_bible_text
                    )
                    
                    # Save bundle
                    bundle_filename = f"bundle_{bundle['id']}.json"
                    bundle_path = output_path / bundle_filename
                    
                    with open(bundle_path, 'w') as f:
                        json.dump(bundle, f, indent=2)
                    
                    bundle_count += 1
                    if verbose:
                        click.echo(f"  📦 Created {bundle_filename}")
    
    click.echo(f"✅ Assembly complete - {bundle_count} bundles created")

def create_prompt_bundle(character: Dict, pose: Dict, orientation: Dict, scene: Dict, wardrobe: List[Dict], 
                        lighting: Optional[Dict], model: Optional[Dict], film_bible: str) -> Dict[str, Any]:
    """Create a prompt bundle from asset components."""
    
    # Generate unique bundle ID
    components = [character.get('id', ''), pose.get('id', ''), orientation.get('id', ''), scene.get('id', '')]
    if wardrobe:
        components.extend([w.get('id', '') for w in wardrobe])
    bundle_id = f"{'_'.join(components)}_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
    
    # Assemble prompt text
    prompt_parts = []
    
    # Film Bible header
    if film_bible:
        prompt_parts.append(film_bible)
    
    # Character descriptor
    if character.get('descriptor'):
        char_desc = character['descriptor']
        if isinstance(char_desc, list):
            char_desc = ' '.join(char_desc)
        prompt_parts.append(char_desc)
    
    # Pose descriptor
    if pose.get('descriptor'):
        pose_desc = pose['descriptor']
        if isinstance(pose_desc, list):
            pose_desc = ' '.join(pose_desc)
        prompt_parts.append(pose_desc)
    
    # Orientation descriptor
    if orientation.get('descriptor'):
        orient_desc = orientation['descriptor']
        if isinstance(orient_desc, list):
            orient_desc = ' '.join(orient_desc)
        prompt_parts.append(orient_desc)
    
    # Wardrobe descriptors
    for w in wardrobe:
        if w.get('descriptor'):
            w_desc = w['descriptor']
            if isinstance(w_desc, list):
                w_desc = ' '.join(w_desc)
            prompt_parts.append(w_desc)
    
    # Scene descriptor
    if scene.get('descriptor'):
        scene_desc = scene['descriptor']
        if isinstance(scene_desc, list):
            scene_desc = ' '.join(scene_desc)
        prompt_parts.append(scene_desc)
    
    # Lighting descriptor
    if lighting and lighting.get('descriptor'):
        light_desc = lighting['descriptor']
        if isinstance(light_desc, list):
            light_desc = ' '.join(light_desc)
        prompt_parts.append(light_desc)
    
    # Camera and framing
    camera_parts = []
    if scene.get('camera_framing'):
        camera_parts.append(scene['camera_framing'])
    camera_parts.extend(["35mm lens", "eye-level", "1m height", "5° downward tilt"])
    
    if camera_parts:
        prompt_parts.append(f"Photographed with {', '.join(camera_parts)}")
    
    # Final assembly - ensure all parts are strings
    assembled_prompt = ". ".join([str(part) for part in prompt_parts if part]) + "."
    
    # Create spec first
    spec = {
        "film_bible": "film_bible@1.0.0",
        "character": f"{character.get('id', 'unknown')}@{character.get('version', '1.0.0')}",
        "pose": f"{pose.get('id', 'unknown')}@{pose.get('version', '1.0.0')}",
        "orientation": f"{orientation.get('id', 'unknown')}@{orientation.get('version', '1.0.0')}",
        "wardrobe": [f"{w.get('id', 'unknown')}@{w.get('version', '1.0.0')}" for w in wardrobe],
        "props": [],
        "scene": f"{scene.get('id', 'unknown')}@{scene.get('version', '1.0.0')}",
        "lighting": f"{lighting.get('id', 'default')}@{lighting.get('version', '1.0.0')}" if lighting else "default@1.0.0",
        "camera_override": None
    }
    
    # Create bundle
    bundle = {
        "id": bundle_id,
        "version": "1.0.0",
        "created_at": datetime.now().isoformat(),
        "spec": spec,
        "assembled_prompt_text": assembled_prompt,
        "model_profile": f"{model.get('id', 't2i_model_x@0.9')}" if model else "t2i_model_x@0.9",
        "seed": generate_checksum(assembled_prompt)[:32],  # Use first 32 chars as seed
        "vocabulary_version": "lexicon@v1",
        "inputs_checksum": generate_checksum(json.dumps(spec, sort_keys=True)),
        "metadata": {
            "description": f"Bundle for {character.get('id', 'character')} in {pose.get('id', 'pose')} pose, {orientation.get('id', 'orientation')} orientation",
            "tags": [character.get('id', ''), pose.get('id', ''), orientation.get('id', ''), scene.get('id', '')],
            "status": "pending",
            "approved": False,
            "notes": "Generated by Anamalia Prompt Assembler"
        }
    }
    
    return bundle

@cli.command()
@click.option('--characters', default='all', help='Character filter (all, none, or comma-separated list)')
@click.option('--poses', default='all', help='Pose filter (all, none, or comma-separated list)')
@click.option('--orientations', default='all', help='Orientation filter (all, none, or comma-separated list)')
@click.option('--scenes', default='all', help='Scene filter (all, none, or comma-separated list)')
@click.option('--wardrobe', default='none', help='Wardrobe filter (none, all, or comma-separated list)')
@click.option('--lighting', default='all', help='Lighting filter (all, none, or comma-separated list)')
@click.option('--models', default='all', help='Model filter (all, none, or comma-separated list)')
@click.option('--output-dir', default='specs', help='Output directory for spec files')
@click.option('--verbose', '-v', is_flag=True, help='Verbose output')
def compose(characters, poses, orientations, scenes, wardrobe, lighting, models, output_dir, verbose):
    """Generate spec stub files based on filters."""
    logger = get_logger()
    log_command_start("compose", {
        "characters": characters, "poses": poses, "orientations": orientations, "scenes": scenes,
        "wardrobe": wardrobe, "lighting": lighting, "models": models,
        "output_dir": output_dir, "verbose": verbose
    })
    
    click.echo("📝 Composing spec files...")
    logger.info("Starting spec composition")
    
    data_path = project_root / 'data'
    output_path = project_root / output_dir
    output_path.mkdir(exist_ok=True)
    
    # Load asset data
    characters_data = load_csv_data(data_path / 'characters.csv')
    poses_data = load_csv_data(data_path / 'poses.csv')
    orientations_data = load_csv_data(data_path / 'orientations.csv')
    scenes_data = load_csv_data(data_path / 'scenes.csv')
    wardrobe_data = load_csv_data(data_path / 'wardrobe.csv')
    lighting_data = load_csv_data(data_path / 'lighting_profiles.csv')
    model_data = load_csv_data(data_path / 'model_profiles.csv')
    
    # Filter assets based on parameters
    def filter_assets(data, filter_param, asset_type):
        if filter_param == 'all':
            return data
        elif filter_param == 'none':
            return []
        else:
            # Parse comma-separated list
            filter_ids = [id.strip() for id in filter_param.split(',')]
            return [item for item in data if item.get('id') in filter_ids]
    
    filtered_characters = filter_assets(characters_data, characters, 'characters')
    filtered_poses = filter_assets(poses_data, poses, 'poses')
    filtered_orientations = filter_assets(orientations_data, orientations, 'orientations')
    filtered_scenes = filter_assets(scenes_data, scenes, 'scenes')
    filtered_wardrobe = filter_assets(wardrobe_data, wardrobe, 'wardrobe')
    filtered_lighting = filter_assets(lighting_data, lighting, 'lighting')
    filtered_models = filter_assets(model_data, models, 'models')
    
    if verbose:
        click.echo(f"  📊 Filtered assets:")
        click.echo(f"    Characters: {len(filtered_characters)}")
        click.echo(f"    Poses: {len(filtered_poses)}")
        click.echo(f"    Orientations: {len(filtered_orientations)}")
        click.echo(f"    Scenes: {len(filtered_scenes)}")
        click.echo(f"    Wardrobe: {len(filtered_wardrobe)}")
        click.echo(f"    Lighting: {len(filtered_lighting)}")
        click.echo(f"    Models: {len(filtered_models)}")
    
    # Generate all combinations
    import itertools
    
    # Create combinations based on available assets
    combinations = []
    for character in filtered_characters:
        for pose in filtered_poses:
            for orientation in filtered_orientations:
                for scene in filtered_scenes:
                    for lighting_item in filtered_lighting:
                        for model in filtered_models:
                            # Create spec for this combination
                            spec = {
                                "character": character['id'],
                                "pose": pose['id'],
                                "orientation": orientation['id'],
                                "scene": scene['id'],
                                "lighting": lighting_item['id'],
                                "model": model['id'],
                                "wardrobe": [w['id'] for w in filtered_wardrobe] if filtered_wardrobe else [],
                                "props": [],  # Default empty props
                                "camera_override": None
                            }
                            combinations.append(spec)
    
    click.echo(f"📊 Generating {len(combinations)} spec combinations...")
    logger.info(f"Generating {len(combinations)} spec combinations")
    
    specs_created = 0
    for i, spec in enumerate(combinations):
        try:
            # Create spec filename
            spec_filename = f"spec_{i:04d}_{spec['character']}_{spec['pose']}_{spec['orientation']}_{spec['scene']}.json"
            spec_path = output_path / spec_filename
            
            # Add metadata to spec
            spec_with_metadata = {
                "id": f"spec_{i:04d}",
                "version": "1.0.0",
                "created_at": datetime.now().isoformat(),
                "spec": spec,
                "metadata": {
                    "description": f"Spec for {spec['character']} in {spec['pose']} pose at {spec['scene']}",
                    "tags": [spec['character'], spec['pose'], spec['scene']],
                    "status": "pending"
                }
            }
            
            # Write spec file
            with open(spec_path, 'w') as f:
                json.dump(spec_with_metadata, f, indent=2)
            
            specs_created += 1
            log_bundle_creation(f"spec_{i:04d}", str(spec_path))
            
            if verbose and i % 100 == 0:
                click.echo(f"  📝 Created {specs_created} specs...")
            
        except Exception as e:
            error_msg = f"Error creating spec {i}: {str(e)}"
            logger.error(error_msg)
            if verbose:
                click.echo(f"  ❌ {error_msg}")
    
    click.echo(f"✅ Composition complete - {specs_created} spec files created")
    log_command_end("compose", success=True, message=f"{specs_created} spec files created")

@cli.command()
@click.option('--bundles', default='bundles/*.json', help='Bundle files to render')
@click.option('--output-dir', default='renders', help='Output directory for renders')
@click.option('--model-profile', default='t2i_model_x@0.9', help='Model profile to use')
@click.option('--verbose', '-v', is_flag=True, help='Verbose output')
def render(bundles, output_dir, model_profile, verbose):
    """Render prompt bundles to images."""
    click.echo("🎨 Rendering prompt bundles...")
    
    # TODO: Implement rendering logic
    # - Load prompt bundles
    # - Submit to renderer
    # - Save images and metadata
    
    click.echo("✅ Rendering complete")

@cli.command()
@click.option('--target', default='renders/new', help='Target directory to check')
@click.option('--against', default='.golden', help='Golden reference directory')
@click.option('--threshold', default=0.95, help='Similarity threshold')
@click.option('--verbose', '-v', is_flag=True, help='Verbose output')
def drift_check(target, against, threshold, verbose):
    """Check for visual drift against golden references."""
    click.echo("🔍 Checking for visual drift...")
    
    # TODO: Implement drift checking
    # - Compare images using CLIP or pHash
    # - Report differences above threshold
    
    click.echo("✅ Drift check complete")

@cli.command()
@click.option('--bundle', required=True, help='Bundle file to export')
@click.option('--output', help='Output file (default: stdout)')
def export_md(bundle, output):
    """Export bundle as markdown summary."""
    click.echo("📄 Exporting markdown summary...")
    
    # TODO: Implement markdown export
    # - Load bundle
    # - Generate markdown summary
    # - Output to file or stdout
    
    click.echo("✅ Export complete")

@cli.command()
@click.option('--chunks', default=2, help='Number of Tenner chunks (1-5)')
@click.option('--categories', default='character,headwear', help='Comma-separated list of Tenner categories')
@click.option('--output-dir', default='bundles', help='Output directory for prompt bundles')
@click.option('--verbose', '-v', is_flag=True, help='Verbose output')
def tenner(chunks, categories, output_dir, verbose):
    """Generate Tenner permutations - structured combinations of exactly 10 items per category."""
    click.echo(f"🎯 Generating Tenner permutations...")
    
    data_path = project_root / 'data'
    output_path = project_root / output_dir
    output_path.mkdir(exist_ok=True)
    
    # Parse categories
    category_list = [cat.strip() for cat in categories.split(',')]
    
    if len(category_list) != chunks:
        click.echo(f"❌ Number of categories ({len(category_list)}) must match chunks ({chunks})")
        return
    
    # Load Tenner data
    tenner_data = {}
    category_file_map = {
        'character': 'tenner_characters.csv',
        'headwear': 'tenner_headwear.csv',
        'garments': 'tenner_garments.csv',
        'accessories': 'tenner_accessories.csv',
        'props': 'tenner_props.csv'
    }
    
    for category in category_list:
        csv_file = category_file_map.get(category, f'tenner_{category}s.csv')
        csv_path = data_path / csv_file
        
        if not csv_path.exists():
            click.echo(f"❌ Tenner file not found: {csv_file}")
            return
        
        data = load_csv_data(csv_path)
        if len(data) != 10:
            click.echo(f"❌ Tenner {category} must have exactly 10 items, found {len(data)}")
            return
        
        tenner_data[category] = data
        if verbose:
            click.echo(f"📊 Loaded {len(data)} {category} items")
    
    # Load supporting data
    poses_data = load_csv_data(data_path / 'poses.csv')
    scenes_data = load_csv_data(data_path / 'scenes.csv')
    lighting_data = load_csv_data(data_path / 'lighting_profiles.csv')
    model_data = load_csv_data(data_path / 'model_profiles.csv')
    
    # Load film bible
    film_bible_path = project_root / 'film_bible' / 'header@1.0.0.txt'
    film_bible_text = ""
    if film_bible_path.exists():
        with open(film_bible_path, 'r') as f:
            film_bible_text = f.read().strip()
    
    # Generate permutations
    total_permutations = 10 ** chunks
    bundle_count = 0
    
    click.echo(f"🔄 Generating {total_permutations} permutations...")
    
    # Generate all combinations
    for i in range(total_permutations):
        # Convert index to base-10 digits for each category
        indices = []
        temp_i = i
        for _ in range(chunks):
            indices.append(temp_i % 10)
            temp_i //= 10
        
        # Get items for this permutation
        permutation_items = {}
        for j, category in enumerate(category_list):
            item_index = indices[j]
            permutation_items[category] = tenner_data[category][item_index]
        
        # Create bundle
        bundle = create_tenner_bundle(
            permutation_items, poses_data[0] if poses_data else None,
            scenes_data[0] if scenes_data else None,
            lighting_data[0] if lighting_data else None,
            model_data[0] if model_data else None,
            film_bible_text, i
        )
        
        # Save bundle
        bundle_filename = f"tenner_{chunks}chunk_{i:05d}.json"
        bundle_path = output_path / bundle_filename
        
        with open(bundle_path, 'w') as f:
            json.dump(bundle, f, indent=2)
        
        bundle_count += 1
        if verbose and bundle_count % 100 == 0:
            click.echo(f"  📦 Created {bundle_count} bundles...")
    
    click.echo(f"✅ Tenner generation complete - {bundle_count} bundles created")

def create_tenner_bundle(permutation_items: Dict[str, Dict], pose: Optional[Dict], 
                        scene: Optional[Dict], lighting: Optional[Dict], 
                        model: Optional[Dict], film_bible: str, index: int) -> Dict[str, Any]:
    """Create a Tenner bundle from permutation items."""
    
    # Generate bundle ID
    bundle_id = f"tenner_{index:05d}"
    
    # Assemble prompt text
    prompt_parts = []
    
    # Film Bible header
    if film_bible:
        prompt_parts.append(film_bible)
    
    # Add character descriptor
    if 'character' in permutation_items:
        char_desc = permutation_items['character']['descriptor']
        if isinstance(char_desc, list):
            char_desc = ' '.join(char_desc)
        prompt_parts.append(char_desc)
    
    # Add pose descriptor
    if pose and pose.get('descriptor'):
        pose_desc = pose['descriptor']
        if isinstance(pose_desc, list):
            pose_desc = ' '.join(pose_desc)
        prompt_parts.append(pose_desc)
    
    # Add wardrobe items
    for category in ['headwear', 'garments', 'accessories']:
        if category in permutation_items:
            item_desc = permutation_items[category]['descriptor']
            if isinstance(item_desc, list):
                item_desc = ' '.join(item_desc)
            prompt_parts.append(item_desc)
    
    # Add props
    if 'props' in permutation_items:
        prop_desc = permutation_items['props']['descriptor']
        if isinstance(prop_desc, list):
            prop_desc = ' '.join(prop_desc)
        prompt_parts.append(prop_desc)
    
    # Add scene descriptor
    if scene and scene.get('descriptor'):
        scene_desc = scene['descriptor']
        if isinstance(scene_desc, list):
            scene_desc = ' '.join(scene_desc)
        prompt_parts.append(scene_desc)
    
    # Add lighting descriptor
    if lighting and lighting.get('descriptor'):
        light_desc = lighting['descriptor']
        if isinstance(light_desc, list):
            light_desc = ' '.join(light_desc)
        prompt_parts.append(light_desc)
    
    # Camera and framing
    camera_parts = ["35mm lens", "eye-level", "1m height", "5° downward tilt"]
    if scene and scene.get('camera_framing'):
        camera_parts.insert(0, scene['camera_framing'])
    
    prompt_parts.append(f"Photographed with {', '.join(camera_parts)}")
    
    # Final assembly
    assembled_prompt = ". ".join([str(part) for part in prompt_parts if part]) + "."
    
    # Create spec
    spec = {
        "film_bible": "film_bible@1.0.0",
        "character": f"{permutation_items.get('character', {}).get('id', 'unknown')}@1.0.0",
        "pose": f"{pose.get('id', 'default')}@{pose.get('version', '1.0.0')}" if pose else "default@1.0.0",
        "wardrobe": [f"{permutation_items[cat].get('id', 'unknown')}@1.0.0" 
                    for cat in ['headwear', 'garments', 'accessories'] if cat in permutation_items],
        "props": [f"{permutation_items['props'].get('id', 'unknown')}@1.0.0"] if 'props' in permutation_items else [],
        "scene": f"{scene.get('id', 'default')}@{scene.get('version', '1.0.0')}" if scene else "default@1.0.0",
        "lighting": f"{lighting.get('id', 'default')}@{lighting.get('version', '1.0.0')}" if lighting else "default@1.0.0",
        "camera_override": None
    }
    
    # Create bundle
    bundle = {
        "id": bundle_id,
        "version": "1.0.0",
        "created_at": datetime.now().isoformat(),
        "spec": spec,
        "assembled_prompt_text": assembled_prompt,
        "model_profile": f"{model.get('id', 't2i_model_x@0.9')}" if model else "t2i_model_x@0.9",
        "seed": generate_checksum(assembled_prompt)[:32],
        "vocabulary_version": "lexicon@v1",
        "inputs_checksum": generate_checksum(json.dumps(spec, sort_keys=True)),
        "tenner_metadata": {
            "chunk_count": len(permutation_items),
            "permutation_index": index,
            "categories": list(permutation_items.keys()),
            "items": {cat: item.get('id', 'unknown') for cat, item in permutation_items.items()}
        },
        "metadata": {
            "description": f"Tenner bundle {index} with {len(permutation_items)} categories",
            "tags": [item.get('id', 'unknown') for item in permutation_items.values()],
            "status": "pending",
            "approved": False,
            "notes": "Generated by Anamalia Tenner System"
        }
    }
    
    return bundle

@cli.command()
@click.option('--permutation', default=0, help='Specific permutation index (0-9 for complete permutations)')
@click.option('--output-dir', default='bundles', help='Output directory for prompt bundles')
@click.option('--verbose', '-v', is_flag=True, help='Verbose output')
def tenner32(permutation, output_dir, verbose):
    """Generate a single 32-Tenner permutation - all 32 Tenners from one complete option."""
    click.echo(f"🎯 Generating 32-Tenner permutation {permutation}...")
    
    data_path = project_root / 'data' / 'tenner_32'
    output_path = project_root / output_dir
    output_path.mkdir(exist_ok=True)
    
    # Load the original JSON data
    json_path = project_root / 'Improved_Tenner_List_v3.json'
    if not json_path.exists():
        click.echo(f"❌ JSON file not found: {json_path}")
        return
    
    with open(json_path, 'r') as f:
        json_data = json.load(f)
    
    # Find the specified permutation
    if permutation >= len(json_data):
        click.echo(f"❌ Permutation {permutation} not found. Available: 0-{len(json_data)-1}")
        return
    
    option_data = json_data[permutation]
    
    # Check if this permutation is complete (all 32 Tenners present)
    complete_tenners = 0
    for i in range(1, 33):
        if option_data.get(f"TENNER {i} (T{i})") is not None:
            complete_tenners += 1
    
    if complete_tenners < 32:
        click.echo(f"⚠️  Warning: Permutation {permutation} has only {complete_tenners}/32 Tenners")
    
    # Load supporting data
    poses_data = load_csv_data(project_root / 'data' / 'poses.csv')
    scenes_data = load_csv_data(project_root / 'data' / 'scenes.csv')
    lighting_data = load_csv_data(project_root / 'data' / 'lighting_profiles.csv')
    model_data = load_csv_data(project_root / 'data' / 'model_profiles.csv')
    
    # Load film bible
    film_bible_path = project_root / 'film_bible' / 'header@1.0.0.txt'
    film_bible_text = ""
    if film_bible_path.exists():
        with open(film_bible_path, 'r') as f:
            film_bible_text = f.read().strip()
    
    # Create the 32-Tenner bundle
    bundle = create_tenner32_bundle(
        option_data, poses_data[0] if poses_data else None,
        scenes_data[0] if scenes_data else None,
        lighting_data[0] if lighting_data else None,
        model_data[0] if model_data else None,
        film_bible_text, permutation
    )
    
    # Save bundle
    bundle_filename = f"tenner32_permutation_{permutation:02d}.json"
    bundle_path = output_path / bundle_filename
    
    with open(bundle_path, 'w') as f:
        json.dump(bundle, f, indent=2)
    
    click.echo(f"✅ 32-Tenner permutation {permutation} created: {bundle_filename}")
    if verbose:
        click.echo(f"📊 Contains {complete_tenners}/32 complete Tenners")

def create_tenner32_bundle(option_data: Dict, pose: Optional[Dict], 
                          scene: Optional[Dict], lighting: Optional[Dict], 
                          model: Optional[Dict], film_bible: str, permutation: int) -> Dict[str, Any]:
    """Create a 32-Tenner bundle from a single permutation."""
    
    # Generate bundle ID
    bundle_id = f"tenner32_permutation_{permutation:02d}"
    
    # Assemble prompt text from all 32 Tenners
    prompt_parts = []
    
    # Film Bible header
    if film_bible:
        prompt_parts.append(film_bible)
    
    # Add all 32 Tenners
    tenner_descriptors = []
    for i in range(1, 33):
        tenner_key = f"TENNER {i} (T{i})"
        tenner_value = option_data.get(tenner_key)
        if tenner_value:
            tenner_descriptors.append(tenner_value)
    
    # Add pose descriptor
    if pose and pose.get('descriptor'):
        pose_desc = pose['descriptor']
        if isinstance(pose_desc, list):
            pose_desc = ' '.join(pose_desc)
        prompt_parts.append(pose_desc)
    
    # Add all Tenner descriptors
    prompt_parts.extend(tenner_descriptors)
    
    # Add scene descriptor
    if scene and scene.get('descriptor'):
        scene_desc = scene['descriptor']
        if isinstance(scene_desc, list):
            scene_desc = ' '.join(scene_desc)
        prompt_parts.append(scene_desc)
    
    # Add lighting descriptor
    if lighting and lighting.get('descriptor'):
        light_desc = lighting['descriptor']
        if isinstance(light_desc, list):
            light_desc = ' '.join(light_desc)
        prompt_parts.append(light_desc)
    
    # Camera and framing
    camera_parts = ["35mm lens", "eye-level", "1m height", "5° downward tilt"]
    if scene and scene.get('camera_framing'):
        camera_parts.insert(0, scene['camera_framing'])
    
    prompt_parts.append(f"Photographed with {', '.join(camera_parts)}")
    
    # Final assembly
    assembled_prompt = ". ".join([str(part) for part in prompt_parts if part]) + "."
    
    # Create spec with all 32 Tenners
    spec = {
        "film_bible": "film_bible@1.0.0",
        "character": f"tenner32_permutation_{permutation:02d}@1.0.0",
        "pose": f"{pose.get('id', 'default')}@{pose.get('version', '1.0.0')}" if pose else "default@1.0.0",
        "wardrobe": [],
        "props": [],
        "scene": f"{scene.get('id', 'default')}@{scene.get('version', '1.0.0')}" if scene else "default@1.0.0",
        "lighting": f"{lighting.get('id', 'default')}@{lighting.get('version', '1.0.0')}" if lighting else "default@1.0.0",
        "camera_override": None
    }
    
    # Create bundle
    bundle = {
        "id": bundle_id,
        "version": "1.0.0",
        "created_at": datetime.now().isoformat(),
        "spec": spec,
        "assembled_prompt_text": assembled_prompt,
        "model_profile": f"{model.get('id', 't2i_model_x@0.9')}" if model else "t2i_model_x@0.9",
        "seed": generate_checksum(assembled_prompt)[:32],
        "vocabulary_version": "lexicon@v1",
        "inputs_checksum": generate_checksum(json.dumps(spec, sort_keys=True)),
        "tenner32_metadata": {
            "permutation_index": permutation,
            "complete_tenners": len([v for v in option_data.values() if v is not None and v != ""]),
            "tenner_descriptors": tenner_descriptors,
            "total_tenners": 32
        },
        "metadata": {
            "description": f"32-Tenner permutation {permutation} with {len(tenner_descriptors)} Tenners",
            "tags": [f"tenner32", f"permutation_{permutation:02d}"] + [f"tenner_{i:02d}" for i in range(1, 33)],
            "status": "pending",
            "approved": False,
            "notes": "Generated by Anamalia 32-Tenner System"
        }
    }
    
    return bundle

@cli.command()
@click.option('--bundle-id', help='Specific bundle ID to render')
@click.option('--bundle-file', help='Path to specific bundle JSON file')
@click.option('--bundles-dir', default='bundles', help='Directory containing bundles to render')
@click.option('--output-dir', default='renders', help='Output directory for rendered images')
@click.option('--model', default='stabilityai/stable-diffusion-xl-base-1.0', help='Diffusion model to use')
@click.option('--width', default=1024, help='Image width')
@click.option('--height', default=1024, help='Image height')
@click.option('--steps', default=20, help='Number of diffusion steps')
@click.option('--guidance-scale', default=7.5, help='Guidance scale (CFG)')
@click.option('--batch-size', default=1, help='Number of images to generate per bundle')
@click.option('--verbose', '-v', is_flag=True, help='Verbose output')
def render(bundle_id, bundle_file, bundles_dir, output_dir, model, width, height, steps, guidance_scale, batch_size, verbose):
    """Render images from prompt bundles using diffusion models."""
    click.echo("🎨 Starting image rendering...")
    
    output_path = project_root / output_dir
    output_path.mkdir(exist_ok=True)
    
    bundles_path = project_root / bundles_dir
    
    # Determine which bundles to render
    bundles_to_render = []
    
    if bundle_file:
        # Single bundle file
        bundle_path = Path(bundle_file)
        if not bundle_path.exists():
            click.echo(f"❌ Bundle file not found: {bundle_path}")
            return
        bundles_to_render.append(bundle_path)
    elif bundle_id:
        # Specific bundle ID
        bundle_path = bundles_path / f"{bundle_id}.json"
        if not bundle_path.exists():
            click.echo(f"❌ Bundle not found: {bundle_path}")
            return
        bundles_to_render.append(bundle_path)
    else:
        # All bundles in directory
        bundle_files = list(bundles_path.glob("*.json"))
        if not bundle_files:
            click.echo(f"❌ No bundles found in {bundles_path}")
            return
        bundles_to_render = bundle_files
    
    click.echo(f"📦 Found {len(bundles_to_render)} bundles to render")
    
    # Check if diffusers is available
    try:
        import diffusers
        from diffusers import StableDiffusionXLPipeline
        import torch
        device = "cuda" if torch.cuda.is_available() else "cpu"
        click.echo(f"🔧 Using device: {device}")
    except ImportError:
        click.echo("❌ diffusers library not found. Install with: pip install diffusers torch")
        return
    
    # Load the diffusion pipeline
    click.echo(f"🔄 Loading model: {model}")
    try:
        pipe = StableDiffusionXLPipeline.from_pretrained(
            model, 
            torch_dtype=torch.float16 if device == "cuda" else torch.float32,
            use_safetensors=True
        )
        pipe = pipe.to(device)
        if verbose:
            click.echo(f"✅ Model loaded successfully")
    except Exception as e:
        click.echo(f"❌ Error loading model: {e}")
        return
    
    # Render each bundle
    total_renders = 0
    for bundle_path in bundles_to_render:
        try:
            # Load bundle
            with open(bundle_path, 'r') as f:
                bundle = json.load(f)
            
            bundle_id = bundle.get('id', 'unknown')
            prompt = bundle.get('assembled_prompt_text', '')
            seed = int(bundle.get('seed', '0')[:8], 16) if bundle.get('seed') else None
            
            if verbose:
                click.echo(f"🎯 Rendering bundle: {bundle_id}")
                click.echo(f"📝 Prompt length: {len(prompt)} characters")
            
            # Generate images for this bundle
            for batch_idx in range(batch_size):
                try:
                    # Set seed for reproducibility
                    if seed is not None:
                        torch.manual_seed(seed + batch_idx)
                    
                    # Generate image
                    with torch.no_grad():
                        result = pipe(
                            prompt=prompt,
                            width=width,
                            height=height,
                            num_inference_steps=steps,
                            guidance_scale=guidance_scale,
                            num_images_per_prompt=1
                        )
                    
                    # Save image
                    image = result.images[0]
                    render_filename = f"{bundle_id}_render_{batch_idx:02d}.png"
                    render_path = output_path / render_filename
                    
                    image.save(render_path)
                    
                    # Create render metadata
                    render_metadata = {
                        "bundle_id": bundle_id,
                        "render_id": f"{bundle_id}_render_{batch_idx:02d}",
                        "created_at": datetime.now().isoformat(),
                        "prompt": prompt,
                        "model": model,
                        "parameters": {
                            "width": width,
                            "height": height,
                            "steps": steps,
                            "guidance_scale": guidance_scale,
                            "seed": seed + batch_idx if seed else None
                        },
                        "bundle_metadata": bundle.get('metadata', {}),
                        "file_path": str(render_path.relative_to(project_root))
                    }
                    
                    # Save metadata
                    metadata_filename = f"{bundle_id}_render_{batch_idx:02d}_metadata.json"
                    metadata_path = output_path / metadata_filename
                    with open(metadata_path, 'w') as f:
                        json.dump(render_metadata, f, indent=2)
                    
                    total_renders += 1
                    if verbose:
                        click.echo(f"✅ Generated: {render_filename}")
                
                except Exception as e:
                    click.echo(f"❌ Error rendering {bundle_id} batch {batch_idx}: {e}")
                    continue
        
        except Exception as e:
            click.echo(f"❌ Error processing bundle {bundle_path}: {e}")
            continue
    
    click.echo(f"🎉 Rendering complete!")
    click.echo(f"📊 Total renders created: {total_renders}")
    click.echo(f"📁 Output directory: {output_path}")

@cli.command()
@click.option('--chunks', default='1,2,3', help='Comma-separated list of chunk IDs to use (e.g., 1,2,3)')
@click.option('--output-dir', default='bundles', help='Output directory for prompt bundles')
@click.option('--verbose', '-v', is_flag=True, help='Verbose output')
def tenner_chunks(chunks, output_dir, verbose):
    """Generate prompt bundles using logical Tenner chunks."""
    click.echo("🎯 Generating Tenner chunk combinations...")
    
    # Parse chunk IDs
    try:
        chunk_ids = [int(x.strip()) for x in chunks.split(',')]
    except ValueError:
        click.echo("❌ Invalid chunk IDs. Use comma-separated numbers like '1,2,3'")
        return
    
    output_path = project_root / output_dir
    output_path.mkdir(exist_ok=True)
    
    # Load chunking structure
    chunks_file = project_root / 'data' / 'tenner_chunks' / 'Improved_Tenner_List_v3_TENNER_CHUNKS.json'
    if not chunks_file.exists():
        click.echo(f"❌ Chunking file not found: {chunks_file}")
        return
    
    with open(chunks_file, 'r') as f:
        chunks_data = json.load(f)
    
    # Load original Tenner data
    tenner_file = project_root / 'Improved_Tenner_List_v3.json'
    if not tenner_file.exists():
        click.echo(f"❌ Tenner data file not found: {tenner_file}")
        return
    
    with open(tenner_file, 'r') as f:
        tenner_data = json.load(f)
    
    # Load supporting data
    poses_data = load_csv_data(project_root / 'data' / 'poses.csv')
    scenes_data = load_csv_data(project_root / 'data' / 'scenes.csv')
    lighting_data = load_csv_data(project_root / 'data' / 'lighting_profiles.csv')
    model_data = load_csv_data(project_root / 'data' / 'model_profiles.csv')
    
    # Load film bible
    film_bible_path = project_root / 'film_bible' / 'header@1.0.0.txt'
    film_bible_text = ""
    if film_bible_path.exists():
        with open(film_bible_path, 'r') as f:
            film_bible_text = f.read().strip()
    
    # Find the specified chunks
    selected_chunks = []
    for chunk_id in chunk_ids:
        chunk_found = False
        for chunk in chunks_data:
            if chunk.get('CHUNK ID') == f'CHUNK{chunk_id}':
                selected_chunks.append(chunk)
                chunk_found = True
                break
        if not chunk_found:
            click.echo(f"⚠️  Warning: CHUNK{chunk_id} not found")
    
    if not selected_chunks:
        click.echo("❌ No valid chunks found")
        return
    
    click.echo(f"📦 Found {len(selected_chunks)} chunks to process")
    
    # Generate combinations for each chunk
    total_bundles = 0
    for chunk in selected_chunks:
        chunk_id = chunk.get('CHUNK ID', 'UNKNOWN')
        click.echo(f"🎯 Processing {chunk_id}...")
        
        # Extract Tenner components for this chunk
        components = []
        for key, value in chunk.items():
            if (key.startswith('tenner_component') or key.startswith('tenner_componenet')) and value:
                components.append(value)
        
        if verbose:
            click.echo(f"   Components: {', '.join(components)}")
        
        # Generate all combinations for this chunk
        chunk_bundles = generate_chunk_combinations(
            chunk_id, components, tenner_data, poses_data, scenes_data, 
            lighting_data, model_data, film_bible_text, verbose
        )
        
        # Save bundles
        for bundle in chunk_bundles:
            bundle_filename = f"{chunk_id.lower()}_{bundle['id']}.json"
            bundle_path = output_path / bundle_filename
            
            with open(bundle_path, 'w') as f:
                json.dump(bundle, f, indent=2)
            
            total_bundles += 1
            if verbose:
                click.echo(f"   ✅ Created: {bundle_filename}")
    
    click.echo(f"🎉 Chunk generation complete!")
    click.echo(f"📊 Total bundles created: {total_bundles}")
    click.echo(f"📁 Output directory: {output_path}")

def generate_chunk_combinations(chunk_id, components, tenner_data, poses_data, scenes_data, 
                               lighting_data, model_data, film_bible_text, verbose):
    """Generate all combinations for a specific chunk."""
    bundles = []
    
    # Load individual Tenner data for each component
    tenner_values = {}
    for component in components:
        tenner_num = component[1:]  # Extract number from T1, T11, etc.
        tenner_file = project_root / 'data' / 'tenner_32' / f'tenner_{tenner_num.zfill(2)}.csv'
        if tenner_file.exists():
            tenner_data = load_csv_data(tenner_file)
            # Only use first 10 entries from each Tenner
            tenner_values[component] = [item.get('descriptor', '') for item in tenner_data[:10] if item.get('descriptor')]
        else:
            click.echo(f"⚠️  Warning: {tenner_file} not found for {component}")
            tenner_values[component] = []
    
    # Generate all combinations
    import itertools
    all_combinations = list(itertools.product(*[tenner_values[comp] for comp in components]))
    
    for perm_idx, combination in enumerate(all_combinations):
        chunk_values = list(combination)
        
        if not chunk_values or any(not val for val in chunk_values):
            continue
        
        # Create bundle for this combination
        bundle = create_chunk_bundle(
            chunk_id, components, chunk_values, perm_idx, poses_data, scenes_data,
            lighting_data, model_data, film_bible_text
        )
        bundles.append(bundle)
    
    return bundles

def load_skeleton_templates():
    """Load semantic skeleton templates for chunks."""
    skeleton_file = project_root / 'data' / 'Improved_Tenner_List_v3_CHUNK_SKELETON.json'
    if not skeleton_file.exists():
        return {}
    
    with open(skeleton_file, 'r') as f:
        skeleton_data = json.load(f)
    
    # Convert to a more usable format
    templates = {}
    for item in skeleton_data:
        skeleton_id = item.get('SKELETON_1', '')
        for key, value in item.items():
            if key.startswith('SKELETON_1'):
                continue  # Skip the skeleton ID
            # The actual semantic template is in the value, not the key
            template = value
            # Map skeleton IDs to chunk IDs
            if skeleton_id == 'SKELETON_1':
                templates['CHUNK1'] = template
            elif 'SKELETON _2' in skeleton_id:
                templates['CHUNK2'] = template
            elif 'SKELETON_3' in skeleton_id:
                templates['CHUNK3'] = template
            elif 'SKELETON _4' in skeleton_id:
                templates['CHUNK4'] = template
            elif 'SKELETON_5' in skeleton_id:
                templates['CHUNK5'] = template
            elif 'SKELETON _6' in skeleton_id:
                templates['CHUNK6'] = template
            elif 'SKELETON_7' in skeleton_id:
                templates['CHUNK7'] = template
            elif 'SKELETON _8' in skeleton_id:
                templates['CHUNK8'] = template
            elif 'SKELETON_9' in skeleton_id:
                templates['CHUNK9'] = template
            elif 'SKELETON _10' in skeleton_id:
                templates['CHUNK10'] = template
            elif 'SKELETON_11' in skeleton_id:
                templates['CHUNK11'] = template
            elif 'SKELETON_12' in skeleton_id:
                templates['CHUNK12'] = template
            elif 'SKELETON _13' in skeleton_id:
                templates['CHUNK13'] = template
            elif 'SKELETON _14' in skeleton_id:
                templates['CHUNK14'] = template
            elif 'SKELETON _15' in skeleton_id:
                templates['CHUNK15'] = template
            elif 'SKELETON _16' in skeleton_id:
                templates['CHUNK16'] = template
            elif 'SKELETON _17' in skeleton_id:
                templates['CHUNK17'] = template
            elif 'SKELETON_18' in skeleton_id:
                templates['CHUNK18'] = template
            elif 'SKELETON_19' in skeleton_id:
                templates['CHUNK19'] = template
            elif 'SKELETON_20' in skeleton_id:
                templates['CHUNK20'] = template
    
    return templates

def create_chunk_bundle(chunk_id, components, chunk_values, perm_idx, poses_data, scenes_data,
                       lighting_data, model_data, film_bible_text):
    """Create a single chunk bundle."""
    
    # Generate bundle ID
    bundle_id = f"chunk_{chunk_id.lower()}_perm_{perm_idx:03d}"
    
    # Assemble prompt text
    prompt_parts = []
    
    # Film Bible header
    if film_bible_text:
        prompt_parts.append(film_bible_text)
    
    # Add pose descriptor
    if poses_data and poses_data[0].get('descriptor'):
        pose_desc = poses_data[0]['descriptor']
        if isinstance(pose_desc, list):
            pose_desc = ' '.join(pose_desc)
        prompt_parts.append(pose_desc)
    
    # Use semantic skeleton template if available
    skeleton_templates = load_skeleton_templates()
    if chunk_id in skeleton_templates:
        template = skeleton_templates[chunk_id]
        # Replace placeholders with actual values
        semantic_prompt = template
        for i, component in enumerate(components):
            placeholder = f"<{component}>"
            if i < len(chunk_values):
                value = chunk_values[i]
                if isinstance(value, list):
                    value = ' '.join(str(item) for item in value)
                semantic_prompt = semantic_prompt.replace(placeholder, str(value))
        prompt_parts.append(semantic_prompt)
    else:
        # Fallback to simple concatenation
        prompt_parts.extend(chunk_values)
    
    # Add scene descriptor
    if scenes_data and scenes_data[0].get('descriptor'):
        scene_desc = scenes_data[0]['descriptor']
        if isinstance(scene_desc, list):
            scene_desc = ' '.join(scene_desc)
        prompt_parts.append(scene_desc)
    
    # Add lighting descriptor
    if lighting_data and lighting_data[0].get('descriptor'):
        light_desc = lighting_data[0]['descriptor']
        if isinstance(light_desc, list):
            light_desc = ' '.join(light_desc)
        prompt_parts.append(light_desc)
    
    # Camera and framing
    camera_parts = ["35mm lens", "eye-level", "1m height", "5° downward tilt"]
    if scenes_data and scenes_data[0].get('camera_framing'):
        camera_parts.insert(0, scenes_data[0]['camera_framing'])
    
    prompt_parts.append(f"Photographed with {', '.join(camera_parts)}")
    
    # Final assembly
    assembled_prompt = ". ".join([str(part) for part in prompt_parts if part]) + "."
    
    # Create spec
    spec = {
        "film_bible": "film_bible@1.0.0",
        "character": f"{chunk_id.lower()}_perm_{perm_idx:03d}@1.0.0",
        "pose": f"{poses_data[0].get('id', 'default')}@{poses_data[0].get('version', '1.0.0')}" if poses_data else "default@1.0.0",
        "wardrobe": [],
        "props": [],
        "scene": f"{scenes_data[0].get('id', 'default')}@{scenes_data[0].get('version', '1.0.0')}" if scenes_data else "default@1.0.0",
        "lighting": f"{lighting_data[0].get('id', 'default')}@{lighting_data[0].get('version', '1.0.0')}" if lighting_data else "default@1.0.0",
        "camera_override": None
    }
    
    # Create bundle
    bundle = {
        "id": bundle_id,
        "version": "1.0.0",
        "created_at": datetime.now().isoformat(),
        "spec": spec,
        "assembled_prompt_text": assembled_prompt,
        "model_profile": f"{model_data[0].get('id', 't2i_model_x@0.9')}" if model_data else "t2i_model_x@0.9",
        "seed": generate_checksum(assembled_prompt)[:32],
        "vocabulary_version": "lexicon@v1",
        "inputs_checksum": generate_checksum(json.dumps(spec, sort_keys=True)),
        "chunk_metadata": {
            "chunk_id": chunk_id,
            "components": components,
            "chunk_values": chunk_values,
            "permutation_index": perm_idx
        },
        "metadata": {
            "description": f"{chunk_id} chunk with {len(chunk_values)} components",
            "tags": [chunk_id.lower(), "chunk"] + [f"tenner_{comp[1:]}" for comp in components],
            "status": "pending",
            "approved": False,
            "notes": "Generated by Anamalia Tenner Chunking System"
        }
    }
    
    return bundle

@cli.command()
@click.option('--output-dir', default='data/chunk_catalog', help='Output directory for chunk catalog')
@click.option('--format', default='json', type=click.Choice(['json', 'csv', 'both']), help='Output format')
@click.option('--verbose', '-v', is_flag=True, help='Verbose output')
def chunk_catalog(output_dir, format, verbose):
    """Generate complete catalog of all possible chunk combinations."""
    click.echo("📚 Generating complete chunk catalog...")
    
    output_path = project_root / output_dir
    output_path.mkdir(exist_ok=True)
    
    # Load chunking structure
    chunks_file = project_root / 'data' / 'tenner_chunks' / 'Improved_Tenner_List_v3_TENNER_CHUNKS.json'
    if not chunks_file.exists():
        click.echo(f"❌ Chunking file not found: {chunks_file}")
        return
    
    with open(chunks_file, 'r') as f:
        chunks_data = json.load(f)
    
    # Load original Tenner data
    tenner_file = project_root / 'Improved_Tenner_List_v3.json'
    if not tenner_file.exists():
        click.echo(f"❌ Tenner data file not found: {tenner_file}")
        return
    
    with open(tenner_file, 'r') as f:
        tenner_data = json.load(f)
    
    # Load supporting data
    poses_data = load_csv_data(project_root / 'data' / 'poses.csv')
    scenes_data = load_csv_data(project_root / 'data' / 'scenes.csv')
    lighting_data = load_csv_data(project_root / 'data' / 'lighting_profiles.csv')
    model_data = load_csv_data(project_root / 'data' / 'model_profiles.csv')
    
    # Load film bible
    film_bible_path = project_root / 'film_bible' / 'header@1.0.0.txt'
    film_bible_text = ""
    if film_bible_path.exists():
        with open(film_bible_path, 'r') as f:
            film_bible_text = f.read().strip()
    
    # Generate complete catalog
    catalog = {
        "metadata": {
            "generated_at": datetime.now().isoformat(),
            "total_chunks": len(chunks_data),
            "total_permutations": len(tenner_data),
            "film_bible_version": "film_bible@1.0.0",
            "lexicon_version": "lexicon@v1"
        },
        "chunks": {}
    }
    
    total_combinations = 0
    
    for chunk in chunks_data:
        chunk_id = chunk.get('CHUNK ID', 'UNKNOWN')
        click.echo(f"🎯 Processing {chunk_id}...")
        
        # Extract Tenner components for this chunk
        components = []
        for key, value in chunk.items():
            if (key.startswith('tenner_component') or key.startswith('tenner_componenet')) and value:
                components.append(value)
        
        if verbose:
            click.echo(f"   Components: {', '.join(components)}")
        
        # Generate all possible combinations for this chunk
        chunk_combinations = []
        
        # Load individual Tenner data for each component
        tenner_values = {}
        for component in components:
            tenner_num = component[1:]  # Extract number from T1, T11, etc.
            tenner_file = project_root / 'data' / 'tenner_32' / f'tenner_{tenner_num.zfill(2)}.csv'
            if tenner_file.exists():
                tenner_data = load_csv_data(tenner_file)
                # Only use first 10 entries from each Tenner
                tenner_values[component] = [item.get('descriptor', '') for item in tenner_data[:10] if item.get('descriptor')]
            else:
                click.echo(f"⚠️  Warning: {tenner_file} not found for {component}")
                tenner_values[component] = []
        
        # Generate all combinations
        import itertools
        all_combinations = list(itertools.product(*[tenner_values[comp] for comp in components]))
        
        for perm_idx, combination in enumerate(all_combinations):
            chunk_values = list(combination)
            
            if not chunk_values or any(not val for val in chunk_values):
                continue
            
            # Create combination record
            combination = {
                "combination_id": f"{chunk_id.lower()}_perm_{perm_idx:03d}",
                "permutation_index": perm_idx,
                "components": components,
                "values": chunk_values,
                "assembled_text": " ".join(chunk_values),
                "prompt_bundle": create_chunk_bundle(
                    chunk_id, components, chunk_values, perm_idx, poses_data, scenes_data,
                    lighting_data, model_data, film_bible_text
                )
            }
            
            chunk_combinations.append(combination)
            total_combinations += 1
        
        # Store chunk data
        catalog["chunks"][chunk_id] = {
            "chunk_id": chunk_id,
            "components": components,
            "total_combinations": len(chunk_combinations),
            "combinations": chunk_combinations
        }
        
        if verbose:
            click.echo(f"   ✅ Generated {len(chunk_combinations)} combinations")
    
    # Save catalog in requested format(s)
    if format in ['json', 'both']:
        catalog_file = output_path / 'chunk_catalog.json'
        with open(catalog_file, 'w') as f:
            json.dump(catalog, f, indent=2)
        click.echo(f"📄 JSON catalog saved: {catalog_file}")
    
    if format in ['csv', 'both']:
        # Create CSV summary
        csv_data = []
        for chunk_id, chunk_data in catalog["chunks"].items():
            for combination in chunk_data["combinations"]:
                csv_data.append({
                    "chunk_id": chunk_id,
                    "combination_id": combination["combination_id"],
                    "permutation_index": combination["permutation_index"],
                    "components": "|".join(combination["components"]),
                    "values": "|".join(combination["values"]),
                    "assembled_text": combination["assembled_text"]
                })
        
        # Save CSV
        import csv
        csv_file = output_path / 'chunk_catalog.csv'
        with open(csv_file, 'w', newline='', encoding='utf-8') as f:
            if csv_data:
                fieldnames = csv_data[0].keys()
                writer = csv.DictWriter(f, fieldnames=fieldnames)
                writer.writeheader()
                writer.writerows(csv_data)
        click.echo(f"📊 CSV catalog saved: {csv_file}")
    
    # Create summary statistics
    summary = {
        "total_chunks": len(catalog["chunks"]),
        "total_combinations": total_combinations,
        "chunk_breakdown": {
            chunk_id: chunk_data["total_combinations"] 
            for chunk_id, chunk_data in catalog["chunks"].items()
        },
        "average_combinations_per_chunk": total_combinations / len(catalog["chunks"]) if catalog["chunks"] else 0
    }
    
    summary_file = output_path / 'catalog_summary.json'
    with open(summary_file, 'w') as f:
        json.dump(summary, f, indent=2)
    
    click.echo(f"🎉 Chunk catalog generation complete!")
    click.echo(f"📊 Total combinations: {total_combinations}")
    click.echo(f"📁 Output directory: {output_path}")
    click.echo(f"📈 Summary: {summary_file}")

@cli.command()
@click.option('--port', default=8080, help='Port for web viewer')
@click.option('--host', default='localhost', help='Host for web viewer')
def serve(port, host):
    """Start the web viewer server."""
    click.echo(f"🌐 Starting web viewer on {host}:{port}...")
    
    # Import and run the serve script
    import subprocess
    import sys
    
    serve_script = project_root / 'scripts' / 'serve.py'
    try:
        subprocess.run([sys.executable, str(serve_script), '--port', str(port), '--host', host], check=True)
    except subprocess.CalledProcessError as e:
        click.echo(f"❌ Error starting web viewer: {e}")
        sys.exit(1)
    except KeyboardInterrupt:
        click.echo("\n🛑 Web viewer stopped")

@cli.command()
@click.option('--tenners', default='1,7,10,19,20,21,22,23,24,25,32', help='Comma-separated list of Tenner numbers to generate')
@click.option('--output-dir', default='bundles', help='Output directory for individual Tenner bundles')
@click.option('--verbose', '-v', is_flag=True, help='Verbose output')
def individual_tenners(tenners, output_dir, verbose):
    """Generate prompts for individual unchunked Tenners."""
    click.echo("🎯 Generating individual Tenner prompts...")
    
    # Parse Tenner numbers
    try:
        tenner_numbers = [int(t.strip()) for t in tenners.split(',')]
    except ValueError:
        click.echo("❌ Error: Invalid Tenner numbers. Use comma-separated integers (e.g., '1,7,10')")
        return
    
    output_path = project_root / output_dir
    output_path.mkdir(exist_ok=True)
    
    # Load supporting data
    poses_data = load_csv_data(project_root / 'data' / 'poses.csv')
    scenes_data = load_csv_data(project_root / 'data' / 'scenes.csv')
    lighting_data = load_csv_data(project_root / 'data' / 'lighting_profiles.csv')
    model_data = load_csv_data(project_root / 'data' / 'model_profiles.csv')
    
    film_bible_path = project_root / 'film_bible' / 'header@1.0.0.txt'
    film_bible_text = ""
    if film_bible_path.exists():
        with open(film_bible_path, 'r') as f:
            film_bible_text = f.read().strip()
    
    total_bundles = 0
    
    for tenner_num in tenner_numbers:
        click.echo(f"🎯 Processing TENNER {tenner_num}...")
        
        # Load Tenner data
        tenner_file = project_root / 'data' / 'tenner_32' / f'tenner_{tenner_num:02d}.csv'
        if not tenner_file.exists():
            click.echo(f"⚠️  Warning: {tenner_file} not found for TENNER {tenner_num}")
            continue
        
        tenner_data = load_csv_data(tenner_file)
        # Only use first 10 entries from each Tenner
        tenner_entries = tenner_data[:10]
        
        if verbose:
            click.echo(f"   Found {len(tenner_entries)} entries for TENNER {tenner_num}")
        
        # Generate bundles for each entry
        for perm_idx, entry in enumerate(tenner_entries):
            if not entry.get('descriptor'):
                continue
            
            # Create bundle for this individual Tenner
            bundle = create_individual_tenner_bundle(
                tenner_num, entry, perm_idx, poses_data, scenes_data,
                lighting_data, model_data, film_bible_text
            )
            
            # Save bundle
            bundle_file = output_path / f'tenner_{tenner_num:02d}_perm_{perm_idx:03d}.json'
            with open(bundle_file, 'w') as f:
                json.dump(bundle, f, indent=2)
            
            if verbose:
                click.echo(f"   ✅ Created: {bundle_file.name}")
            
            total_bundles += 1
    
    click.echo(f"🎉 Individual Tenner generation complete!")
    click.echo(f"📊 Total bundles created: {total_bundles}")
    click.echo(f"📁 Output directory: {output_path}")

def create_individual_tenner_bundle(tenner_num, tenner_entry, perm_idx, poses_data, scenes_data, 
                                   lighting_data, model_data, film_bible_text):
    """Create a prompt bundle for an individual Tenner."""
    bundle_id = f"tenner_{tenner_num:02d}_perm_{perm_idx:03d}"
    
    # Assemble prompt text
    prompt_parts = []
    
    # Film Bible header
    if film_bible_text:
        prompt_parts.append(film_bible_text)
    
    # Add pose descriptor
    if poses_data and poses_data[0].get('descriptor'):
        pose_desc = poses_data[0]['descriptor']
        if isinstance(pose_desc, list):
            pose_desc = ' '.join(pose_desc)
        prompt_parts.append(pose_desc)
    
    # Add individual Tenner descriptor
    tenner_desc = tenner_entry.get('descriptor', '')
    if tenner_desc:
        prompt_parts.append(tenner_desc)
    
    # Add scene descriptor
    if scenes_data and scenes_data[0].get('descriptor'):
        scene_desc = scenes_data[0]['descriptor']
        if isinstance(scene_desc, list):
            scene_desc = ' '.join(scene_desc)
        prompt_parts.append(scene_desc)
    
    # Add lighting descriptor
    if lighting_data and lighting_data[0].get('descriptor'):
        light_desc = lighting_data[0]['descriptor']
        if isinstance(light_desc, list):
            light_desc = ' '.join(light_desc)
        prompt_parts.append(light_desc)
    
    # Camera and framing
    camera_parts = ["35mm lens", "eye-level", "1m height", "5° downward tilt"]
    if scenes_data and scenes_data[0].get('camera_framing'):
        camera_parts.insert(0, scenes_data[0]['camera_framing'])
    
    prompt_parts.append(f"Photographed with {', '.join(camera_parts)}")
    
    # Final assembly
    assembled_prompt = ". ".join([str(part) for part in prompt_parts if part]) + "."
    
    # Create spec
    spec = {
        "film_bible": "film_bible@1.0.0",
        "character": f"{bundle_id}@1.0.0",
        "pose": poses_data[0]['id'] if poses_data else "default@1.0.0",
        "wardrobe": [],
        "props": [],
        "scene": scenes_data[0]['id'] if scenes_data else "default@1.0.0",
        "lighting": lighting_data[0]['id'] if lighting_data else "default@1.0.0",
        "camera_override": None
    }
    
    # Generate checksum for inputs
    inputs_str = f"{spec['film_bible']}|{spec['character']}|{spec['pose']}|{spec['scene']}|{spec['lighting']}"
    inputs_checksum = generate_checksum(inputs_str)
    
    # Create bundle
    bundle = {
        "id": bundle_id,
        "version": "1.0.0",
        "created_at": datetime.now().isoformat(),
        "spec": spec,
        "assembled_prompt_text": assembled_prompt,
        "model_profile": model_data[0]['id'] if model_data else "t2i_model_x@0.9",
        "seed": generate_checksum(f"{bundle_id}_{datetime.now().isoformat()}")[:32],
        "vocabulary_version": "lexicon@v1",
        "inputs_checksum": inputs_checksum,
        "tenner_metadata": {
            "tenner_number": tenner_num,
            "permutation_index": perm_idx,
            "descriptor": tenner_entry.get('descriptor', ''),
            "type": "individual_tenner"
        }
    }
    
    return bundle

if __name__ == '__main__':
    cli()
