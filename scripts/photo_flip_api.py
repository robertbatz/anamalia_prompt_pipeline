#!/usr/bin/env python3
"""
Photo Flip API server for Anamalia Prompt Assembler
Provides API endpoints for photo flipping functionality
"""

import os
import sys
import tempfile
import json
from pathlib import Path
from flask import Flask, request, jsonify, send_file
from PIL import Image
import io

# Add the project root to the Python path
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

app = Flask(__name__)

# Configure upload settings
app.config['MAX_CONTENT_LENGTH'] = 10 * 1024 * 1024  # 10MB max file size
UPLOAD_FOLDER = project_root / 'uploads'
UPLOAD_FOLDER.mkdir(exist_ok=True)

@app.route('/api/flip-photo', methods=['POST'])
def flip_photo():
    """
    API endpoint to flip a photo horizontally
    """
    try:
        # Check if file was uploaded
        if 'file' not in request.files:
            return jsonify({'error': 'No file uploaded'}), 400
        
        file = request.files['file']
        
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        # Validate file type
        if not file.content_type.startswith('image/'):
            return jsonify({'error': 'File must be an image'}), 400
        
        # Read image data
        image_data = file.read()
        
        # Open and process image
        with Image.open(io.BytesIO(image_data)) as img:
            # Convert to RGB if necessary
            if img.mode != 'RGB':
                img = img.convert('RGB')
            
            # Flip horizontally
            flipped_img = img.transpose(Image.FLIP_LEFT_RIGHT)
            
            # Save to temporary file
            temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.jpg')
            flipped_img.save(temp_file.name, 'JPEG', quality=95)
            temp_file.close()
            
            # Generate filename
            original_name = Path(file.filename).stem
            original_ext = Path(file.filename).suffix
            flipped_filename = f"{original_name}_flipped{original_ext}"
            
            return send_file(
                temp_file.name,
                as_attachment=True,
                download_name=flipped_filename,
                mimetype='image/jpeg'
            )
    
    except Exception as e:
        return jsonify({'error': f'Error processing image: {str(e)}'}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy', 
        'service': 'photo-flip-api',
        'version': '1.0.0'
    })

@app.route('/api/info', methods=['GET'])
def api_info():
    """API information endpoint"""
    return jsonify({
        'name': 'Anamalia Photo Flip API',
        'version': '1.0.0',
        'endpoints': {
            'POST /api/flip-photo': 'Flip an image horizontally',
            'GET /api/health': 'Health check',
            'GET /api/info': 'API information'
        },
        'max_file_size': '10MB',
        'supported_formats': ['JPEG', 'PNG', 'GIF', 'WebP', 'BMP', 'TIFF']
    })

if __name__ == '__main__':
    import argparse
    
    parser = argparse.ArgumentParser(description='Start the Photo Flip API server')
    parser.add_argument('--port', type=int, default=5000, help='Port to serve on')
    parser.add_argument('--host', default='localhost', help='Host to serve on')
    parser.add_argument('--debug', action='store_true', help='Enable debug mode')
    
    args = parser.parse_args()
    
    print(f"🖼️  Anamalia Photo Flip API Server")
    print(f"📡 Server running at http://{args.host}:{args.port}")
    print(f"🔗 API endpoint: http://{args.host}:{args.port}/api/flip-photo")
    print(f"📁 Upload folder: {UPLOAD_FOLDER}")
    print(f"⏹️  Press Ctrl+C to stop")
    
    app.run(debug=args.debug, host=args.host, port=args.port)
