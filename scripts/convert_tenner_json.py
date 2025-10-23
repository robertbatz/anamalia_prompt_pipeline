#!/usr/bin/env python3
"""
Convert the 32-Tenner JSON data into CSV format for the Anamalia Prompt Assembler
"""

import json
import csv
import sys
from pathlib import Path

def convert_tenner_json_to_csv(json_file_path, output_dir):
    """Convert the 32-Tenner JSON data to CSV format."""
    
    # Load the JSON data
    with open(json_file_path, 'r') as f:
        data = json.load(f)
    
    # Create output directory
    output_path = Path(output_dir)
    output_path.mkdir(exist_ok=True)
    
    # Extract the 32 Tenner categories
    tenner_categories = []
    for i in range(1, 33):  # T1 to T32
        category_key = f"TENNER {i} (T{i})"
        tenner_categories.append(category_key)
    
    # Create CSV files for each Tenner category
    for i, category_key in enumerate(tenner_categories, 1):
        csv_filename = f"tenner_{i:02d}.csv"
        csv_path = output_path / csv_filename
        
        # Extract all non-null values for this Tenner
        tenner_values = []
        for option in data:
            if option.get(category_key) is not None:
                tenner_values.append({
                    'id': f"tenner_{i:02d}_{len(tenner_values):02d}",
                    'version': '1.0.0',
                    'descriptor': option[category_key],
                    'option_index': option['option'],
                    'notes': f"Tenner {i} option {option['option']}"
                })
        
        # Write CSV file
        if tenner_values:
            with open(csv_path, 'w', newline='', encoding='utf-8') as f:
                fieldnames = ['id', 'version', 'descriptor', 'option_index', 'notes']
                writer = csv.DictWriter(f, fieldnames=fieldnames)
                writer.writeheader()
                writer.writerows(tenner_values)
            
            print(f"✅ Created {csv_filename} with {len(tenner_values)} items")
        else:
            print(f"⚠️  Skipped {csv_filename} - no data found")
    
    # Create a summary file
    summary_path = output_path / "tenner_summary.json"
    summary = {
        "total_tenners": 32,
        "total_permutations": len(data),
        "complete_permutations": len([opt for opt in data if all(opt.get(f"TENNER {i} (T{i})") is not None for i in range(1, 33))]),
        "tenner_categories": tenner_categories,
        "conversion_notes": "Converted from Improved_Tenner_List_v3.json"
    }
    
    with open(summary_path, 'w') as f:
        json.dump(summary, f, indent=2)
    
    print(f"📊 Summary: {summary['complete_permutations']} complete permutations out of {summary['total_permutations']} total")
    print(f"📄 Created summary file: {summary_path}")

if __name__ == '__main__':
    if len(sys.argv) != 3:
        print("Usage: python convert_tenner_json.py <json_file> <output_dir>")
        sys.exit(1)
    
    json_file = sys.argv[1]
    output_dir = sys.argv[2]
    
    convert_tenner_json_to_csv(json_file, output_dir)
