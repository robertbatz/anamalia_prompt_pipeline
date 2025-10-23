"""
Tests for the Anamalia Prompt Assembler CLI functionality
"""

import pytest
import json
import os
import tempfile
import shutil
from pathlib import Path
from unittest.mock import patch, MagicMock

# Add the project root to the Python path
project_root = Path(__file__).parent.parent
import sys
sys.path.insert(0, str(project_root))

from scripts.pa import cli, load_csv_data, create_prompt_bundle, validate_against_schema

class TestCLIFunctionality:
    """Test the CLI functionality"""
    
    def test_load_csv_data(self):
        """Test CSV data loading"""
        # Create a temporary CSV file
        with tempfile.NamedTemporaryFile(mode='w', suffix='.csv', delete=False) as f:
            f.write('id,version,descriptor\n')
            f.write('test_item,1.0.0,Test description\n')
            temp_csv = f.name
        
        try:
            data = load_csv_data(Path(temp_csv))
            assert len(data) == 1
            assert data[0]['id'] == 'test_item'
            assert data[0]['version'] == '1.0.0'
            assert data[0]['descriptor'] == 'Test description'
        finally:
            os.unlink(temp_csv)
    
    def test_validate_against_schema(self):
        """Test schema validation"""
        schema = {
            "type": "object",
            "properties": {
                "id": {"type": "string"},
                "version": {"type": "string", "pattern": "^\\d+\\.\\d+\\.\\d+$"}
            },
            "required": ["id", "version"]
        }
        
        # Valid data
        valid_data = {"id": "test", "version": "1.0.0"}
        errors = validate_against_schema(valid_data, schema)
        assert len(errors) == 0
        
        # Invalid data
        invalid_data = {"id": "test", "version": "1.0"}
        errors = validate_against_schema(invalid_data, schema)
        assert len(errors) > 0
    
    def test_create_prompt_bundle(self):
        """Test prompt bundle creation"""
        character = {
            'id': 'test_char',
            'version': '1.0.0',
            'descriptor': 'Test character'
        }
        pose = {
            'id': 'test_pose',
            'version': '1.0.0',
            'descriptor': 'Test pose'
        }
        scene = {
            'id': 'test_scene',
            'version': '1.0.0',
            'descriptor': 'Test scene',
            'camera_framing': 'full-body'
        }
        
        bundle = create_prompt_bundle(character, pose, scene, [], None, None, "Film Bible")
        
        assert bundle['id'] is not None
        assert bundle['version'] == '1.0.0'
        assert 'assembled_prompt_text' in bundle
        assert bundle['spec']['character'] == 'test_char@1.0.0'
        assert bundle['spec']['pose'] == 'test_pose@1.0.0'
        assert bundle['spec']['scene'] == 'test_scene@1.0.0'
    
    def test_cli_help(self):
        """Test CLI help command"""
        from click.testing import CliRunner
        
        runner = CliRunner()
        result = runner.invoke(cli, ['--help'])
        
        assert result.exit_code == 0
        assert 'Anamalia Prompt Assembler' in result.output
        assert 'validate' in result.output
        assert 'assemble' in result.output
    
    def test_validate_command(self):
        """Test the validate command"""
        from click.testing import CliRunner
        
        runner = CliRunner()
        
        # Test with a temporary data directory
        with tempfile.TemporaryDirectory() as temp_dir:
            temp_path = Path(temp_dir)
            
            # Create a minimal CSV file
            csv_file = temp_path / 'characters.csv'
            csv_file.write_text('id,version,species,anthro_ratio,descriptor,angles,constraints,notes\n')
            
            # Mock the project root to use our temp directory
            with patch('scripts.pa.project_root', temp_path):
                result = runner.invoke(cli, ['validate', '--data-dir', str(temp_path)])
                
                # Should not crash, even if validation fails
                assert result.exit_code in [0, 1]  # 0 for success, 1 for validation errors
    
    def test_assemble_command(self):
        """Test the assemble command"""
        from click.testing import CliRunner
        
        runner = CliRunner()
        
        # Test with a temporary data directory
        with tempfile.TemporaryDirectory() as temp_dir:
            temp_path = Path(temp_dir)
            
            # Create data directory
            data_path = temp_path / 'data'
            data_path.mkdir()
            
            # Create minimal CSV files in data directory
            (data_path / 'characters.csv').write_text(
                'id,version,species,anthro_ratio,descriptor,angles,constraints,notes\n'
                'test_char,1.0.0,rhino,0.8,Test character,front,no clothes,Test notes\n'
            )
            (data_path / 'poses.csv').write_text(
                'id,version,descriptor,gesture_tags,rotation_deg,wardrobe_zones_allowed,exclusions,notes\n'
                'test_pose,1.0.0,Test pose,welcome,15,torso,,Test notes\n'
            )
            (data_path / 'scenes.csv').write_text(
                'id,version,descriptor,camera_framing,backdrop_geom,allowed_lighting_profiles,notes\n'
                'test_scene,1.0.0,Test scene,full-body,floor_wall_90_deg,golden_hour,Test notes\n'
            )
            (data_path / 'lighting_profiles.csv').write_text(
                'id,version,descriptor,temperature_K,key_dir_deg,fill_logic,rim_logic,notes\n'
                'test_light,1.0.0,Test lighting,4800,45,opposite_side_25pct,subtle_back_rim_15pct,\n'
            )
            (data_path / 'model_profiles.csv').write_text(
                'id,version,model_name,sampler,steps,cfg,resolution,notes\n'
                'test_model,1.0.0,test-model,DPM++,28,5.5,1920x1920,Test notes\n'
            )
            
            # Create film bible
            (temp_path / 'film_bible').mkdir()
            (temp_path / 'film_bible' / 'header@1.0.0.txt').write_text('Film Bible Content')
            
            # Create bundles directory
            (temp_path / 'bundles').mkdir()
            
            # Mock the project root to use our temp directory
            with patch('scripts.pa.project_root', temp_path):
                result = runner.invoke(cli, [
                    'assemble', 
                    '--characters', 'test_char',
                    '--poses', 'test_pose', 
                    '--scenes', 'test_scene',
                    '--wardrobe', 'none',
                    '--output-dir', 'bundles'
                ])
                
                print(f"Exit code: {result.exit_code}")
                print(f"Output: {result.output}")
                print(f"Exception: {result.exception}")
                
                # Should create bundles successfully
                assert result.exit_code == 0
                assert 'Assembly complete' in result.output
                
                # Check that bundle was created
                bundle_files = list((temp_path / 'bundles').glob('*.json'))
                assert len(bundle_files) > 0

if __name__ == '__main__':
    pytest.main([__file__])
