#!/usr/bin/env python3
"""
Photo Upload and Horizontal Flip Tool
Upload a photo and automatically flip it horizontally for download
"""

import os
import sys
import argparse
from pathlib import Path
from PIL import Image
import tempfile
import shutil

def flip_image_horizontally(input_path, output_path=None):
    """
    Flip an image horizontally and save it.
    
    Args:
        input_path (str): Path to the input image
        output_path (str, optional): Path to save the flipped image. 
                                   If None, adds '_flipped' to filename
    
    Returns:
        str: Path to the saved flipped image
    """
    try:
        # Open the image
        with Image.open(input_path) as img:
            # Convert to RGB if necessary (handles RGBA, P mode, etc.)
            if img.mode != 'RGB':
                img = img.convert('RGB')
            
            # Flip horizontally
            flipped_img = img.transpose(Image.FLIP_LEFT_RIGHT)
            
            # Generate output path if not provided
            if output_path is None:
                input_file = Path(input_path)
                output_path = input_file.parent / f"{input_file.stem}_flipped{input_file.suffix}"
            
            # Save the flipped image
            flipped_img.save(output_path, quality=95)
            
            print(f"✅ Image flipped successfully!")
            print(f"📁 Original: {input_path}")
            print(f"📁 Flipped:  {output_path}")
            
            return str(output_path)
            
    except Exception as e:
        print(f"❌ Error processing image: {e}")
        return None

def main():
    parser = argparse.ArgumentParser(
        description="Upload a photo and automatically flip it horizontally for download"
    )
    parser.add_argument(
        "input_image", 
        help="Path to the input image file"
    )
    parser.add_argument(
        "-o", "--output", 
        help="Output path for the flipped image (optional)"
    )
    parser.add_argument(
        "--preview", 
        action="store_true", 
        help="Show image info before processing"
    )
    
    args = parser.parse_args()
    
    # Check if input file exists
    if not os.path.exists(args.input_image):
        print(f"❌ Error: Input file '{args.input_image}' not found")
        sys.exit(1)
    
    # Show preview if requested
    if args.preview:
        try:
            with Image.open(args.input_image) as img:
                print(f"📸 Image Preview:")
                print(f"   Size: {img.size[0]}x{img.size[1]} pixels")
                print(f"   Mode: {img.mode}")
                print(f"   Format: {img.format}")
        except Exception as e:
            print(f"❌ Error reading image: {e}")
            sys.exit(1)
    
    # Process the image
    output_path = flip_image_horizontally(args.input_image, args.output)
    
    if output_path:
        print(f"\n🎉 Success! Flipped image saved to: {output_path}")
    else:
        print(f"\n❌ Failed to process image")
        sys.exit(1)

if __name__ == "__main__":
    main()
