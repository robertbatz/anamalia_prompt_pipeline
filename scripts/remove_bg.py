#!/usr/bin/env python3
"""
Background removal tool: outputs PNG with transparent alpha
- Single file or directory (recursive) processing
- Keeps filename and adds _no_bg suffix by default
"""

import os
import sys
import argparse
from pathlib import Path
from typing import Optional
from PIL import Image
from rembg import remove


def remove_background(input_path: Path, output_path: Optional[Path] = None, keep_size: bool = True) -> Path:
    """Remove background from a single image and save as PNG with transparency."""
    with Image.open(input_path) as img:
        if img.mode not in ('RGBA', 'RGB'):
            img = img.convert('RGBA')
        elif img.mode == 'RGB':
            img = img.convert('RGBA')

        result = remove(img)

        if output_path is None:
            output_path = input_path.parent / f"{input_path.stem}_no_bg.png"

        if keep_size and result.size != img.size:
            result = result.resize(img.size, Image.LANCZOS)

        result.save(output_path, format='PNG')
        return output_path


def process_directory(
    input_dir: Path,
    output_dir: Optional[Path],
    exts={'.jpg', '.jpeg', '.png', '.webp', '.bmp', '.tiff'},
    recursive: bool = True,
    keep_size: bool = True,
):
    if output_dir:
        output_dir.mkdir(parents=True, exist_ok=True)
    count = 0
    for root, _, files in os.walk(input_dir):
        for fname in files:
            if Path(fname).suffix.lower() in exts:
                src = Path(root) / fname
                if output_dir:
                    rel = src.relative_to(input_dir)
                    out_path = output_dir / rel.with_suffix('.png')
                    out_path.parent.mkdir(parents=True, exist_ok=True)
                    out_path = out_path.with_name(out_path.stem + '_no_bg.png')
                else:
                    out_path = src.parent / (src.stem + '_no_bg.png')
                remove_background(src, out_path, keep_size=keep_size)
                count += 1
        if not recursive:
            break
    return count


def main():
    parser = argparse.ArgumentParser(description="Remove image background and output PNG with transparent alpha")
    parser.add_argument("input", help="Input image file or directory")
    parser.add_argument("-o", "--output", help="Output file or directory (optional)")
    parser.add_argument("--non-recursive", action="store_true", help="When input is a directory, do not recurse")
    parser.add_argument("--keep-size", action="store_true", default=True, help="Preserve original dimensions (default: True)")
    args = parser.parse_args()

    input_path = Path(args.input)
    if not input_path.exists():
        print(f"❌ Input not found: {input_path}")
        sys.exit(1)

    if input_path.is_file():
        out_path = Path(args.output) if args.output else None
        dest = remove_background(input_path, out_path, keep_size=args.keep_size)
        print(f"✅ Saved: {dest}")
    else:
        out_dir = Path(args.output) if args.output else None
        n = process_directory(input_path, out_dir, recursive=not args.non_recursive, keep_size=args.keep_size)
        print(f"✅ Processed {n} images")


if __name__ == "__main__":
    main()


