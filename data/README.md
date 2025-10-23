# Anamalia Prompt Assembler — Spreadsheet & JSON Templates

This folder contains CSV templates ready to import into **Google Sheets** (one sheet per file) and a combined **assets_template.json** with example records.

## How to use with Google Sheets
1. Create a new Google Spreadsheet.
2. For each CSV file, use **File → Import → Upload** and select **Insert new sheet(s)**.
3. Keep the first row (headers) unchanged; replace the example row with your real data.
4. Maintain the same column order and casing to ensure the CLI validator works correctly.

## Files
- characters.csv
- poses.csv
- wardrobe.csv
- props.csv
- scenes.csv
- lighting_profiles.csv
- model_profiles.csv
- lexicon.csv
- assets_template.json

## Notes
- Multi-valued fields in CSVs use `;` as the separator (e.g., angles, tags).
- The JSON template mirrors the same fields but uses arrays instead of `;`-separated strings.
- Keep versions in **semver** where possible (e.g., 1.0.0).
