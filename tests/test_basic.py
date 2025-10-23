"""
Basic tests for the Anamalia Prompt Assembler
"""

import pytest
import json
import os
from pathlib import Path

def test_project_structure():
    """Test that the project has the expected directory structure."""
    project_root = Path(__file__).parent.parent
    
    expected_dirs = [
        'data', 'assets', 'bundles', 'renders', 'specs',
        'film_bible', 'lexicon', 'schemas', 'scripts',
        'webviewer', 'docs', 'logs', '.golden'
    ]
    
    for dir_name in expected_dirs:
        dir_path = project_root / dir_name
        assert dir_path.exists(), f"Directory {dir_name} should exist"
        assert dir_path.is_dir(), f"{dir_name} should be a directory"

def test_essential_files():
    """Test that essential files exist."""
    project_root = Path(__file__).parent.parent
    
    essential_files = [
        'README.md',
        'requirements.txt',
        'package.json',
        'Makefile',
        '.gitignore',
        'scripts/pa.py',
        'film_bible/header@1.0.0.txt',
        'lexicon/lexicon@v1.json',
        'schemas/character.json',
        'schemas/pose.json',
        'bundles/example_bundle.json',
        'webviewer/index.html'
    ]
    
    for file_name in essential_files:
        file_path = project_root / file_name
        assert file_path.exists(), f"File {file_name} should exist"
        assert file_path.is_file(), f"{file_name} should be a file"

def test_json_schemas():
    """Test that JSON schemas are valid."""
    project_root = Path(__file__).parent.parent
    schema_dir = project_root / 'schemas'
    
    schema_files = list(schema_dir.glob('*.json'))
    assert len(schema_files) > 0, "Should have at least one schema file"
    
    for schema_file in schema_files:
        with open(schema_file, 'r') as f:
            schema = json.load(f)
            assert 'type' in schema, f"Schema {schema_file.name} should have a type"
            assert 'properties' in schema, f"Schema {schema_file.name} should have properties"

def test_example_bundle():
    """Test that the example bundle is valid."""
    project_root = Path(__file__).parent.parent
    bundle_file = project_root / 'bundles' / 'example_bundle.json'
    
    with open(bundle_file, 'r') as f:
        bundle = json.load(f)
        
    # Check required fields
    required_fields = ['id', 'version', 'created_at', 'spec', 'assembled_prompt_text']
    for field in required_fields:
        assert field in bundle, f"Bundle should have {field} field"
    
    # Check spec structure
    spec = bundle['spec']
    spec_fields = ['film_bible', 'character', 'pose', 'wardrobe', 'props', 'scene', 'lighting']
    for field in spec_fields:
        assert field in spec, f"Spec should have {field} field"

def test_lexicon_structure():
    """Test that the lexicon has the expected structure."""
    project_root = Path(__file__).parent.parent
    lexicon_file = project_root / 'lexicon' / 'lexicon@v1.json'
    
    with open(lexicon_file, 'r') as f:
        lexicon = json.load(f)
    
    assert 'metadata' in lexicon, "Lexicon should have metadata"
    assert 'categories' in lexicon, "Lexicon should have categories"
    
    # Check that categories have the expected structure
    for category, terms in lexicon['categories'].items():
        assert isinstance(terms, dict), f"Category {category} should be a dict"
        for term, data in terms.items():
            assert 'allowed' in data, f"Term {term} should have allowed field"
            assert isinstance(data['allowed'], bool), f"Term {term} allowed should be boolean"

if __name__ == '__main__':
    pytest.main([__file__])
