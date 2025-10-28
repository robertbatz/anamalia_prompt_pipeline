# Photo Flip Tool Usage Guide

The Photo Flip Tool has been integrated into the Anamalia Prompt Assembler project. It allows you to upload photos and automatically flip them horizontally for download.

## Features

- **Drag & Drop Support**: Drag images directly onto the upload area
- **Multiple Format Support**: Handles JPG, PNG, GIF, WebP, and other common formats
- **Real-time Preview**: Shows both original and flipped images side by side
- **Automatic Naming**: Adds "_flipped" to the filename automatically
- **Error Handling**: Validates file types and sizes (max 10MB)
- **Progress Indication**: Shows processing status
- **One-click Download**: Download the flipped image immediately

## Usage Methods

### 1. Web Interface (Recommended)

1. Start the web server:
   ```bash
   python scripts/serve.py
   ```

2. Open your browser and go to:
   ```
   http://localhost:8080/webviewer/photo_flip.html
   ```

3. Or access it from the main interface:
   ```
   http://localhost:8080/webviewer/
   ```
   Then click on the "Photo Flip" tool card.

### 2. Command Line Script

Use the standalone Python script for batch processing:

```bash
# Basic usage
python scripts/photo_flip.py path/to/your/image.jpg

# With custom output path
python scripts/photo_flip.py path/to/your/image.jpg -o flipped_image.jpg

# With preview information
python scripts/photo_flip.py path/to/your/image.jpg --preview
```

### 3. API Server (Advanced)

For programmatic access or integration with other tools:

1. Start the API server:
   ```bash
   python scripts/photo_flip_api.py
   ```

2. The API will be available at:
   ```
   http://localhost:5000/api/flip-photo
   ```

3. Send a POST request with a file to flip it:
   ```bash
   curl -X POST -F "file=@your_image.jpg" http://localhost:5000/api/flip-photo --output flipped_image.jpg
   ```

## File Structure

The photo flip functionality is integrated into the existing project structure:

```
anamalia_prompt_pipeline/
├── scripts/
│   ├── photo_flip.py          # Standalone CLI script
│   └── photo_flip_api.py      # Flask API server
├── webviewer/
│   ├── photo_flip.html        # Web interface
│   ├── index.html             # Main interface (with tool link)
│   └── styles.css             # Updated with tool styles
└── uploads/                   # Created automatically for API uploads
```

## Technical Details

- **Image Processing**: Uses Python PIL (Pillow) library
- **Web Interface**: Pure JavaScript with HTML5 Canvas for client-side processing
- **API**: Flask-based REST API with file upload support
- **Supported Formats**: JPEG, PNG, GIF, WebP, BMP, TIFF
- **Max File Size**: 10MB (configurable)
- **Output Quality**: 95% JPEG quality for optimal balance

## Integration Notes

The photo flip tool is fully integrated with the existing Anamalia Prompt Assembler:

- Uses the same styling and design language
- Follows the same navigation patterns
- Maintains consistency with the overall project structure
- Can be easily extended with additional image processing features

## Troubleshooting

### Common Issues

1. **"File size too large"**: Reduce image size or compress before uploading
2. **"File must be an image"**: Ensure you're uploading a valid image format
3. **Canvas errors**: Try refreshing the page or using a different browser
4. **API connection issues**: Ensure the API server is running on port 5000

### Browser Compatibility

The web interface works best with modern browsers that support:
- HTML5 Canvas
- File API
- Drag and Drop API

Recommended browsers: Chrome, Firefox, Safari, Edge (latest versions)

## Future Enhancements

Potential additions to the photo flip tool:
- Vertical flipping
- Rotation options
- Batch processing
- Image filters and effects
- Integration with the main prompt assembly workflow
