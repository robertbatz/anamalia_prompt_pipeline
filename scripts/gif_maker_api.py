#!/usr/bin/env python3
"""
GIF Maker API server for Anamalia Prompt Assembler
Provides API endpoints for creating animated GIFs from multiple images
"""

import os
import sys
import tempfile
import json
import base64
from pathlib import Path
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from PIL import Image
import io
from datetime import datetime

# Google Drive imports
try:
    from google.auth.transport.requests import Request
    from google.oauth2 import service_account
    from googleapiclient.discovery import build
    from googleapiclient.http import MediaIoBaseUpload, MediaIoBaseDownload
    GDRIVE_AVAILABLE = True
except ImportError:
    GDRIVE_AVAILABLE = False

# Add the project root to the Python path
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

app = Flask(__name__)

# Enable CORS for all routes
CORS(app)

# Configure upload settings
app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024  # 50MB max file size for multiple images
UPLOAD_FOLDER = project_root / 'uploads'
UPLOAD_FOLDER.mkdir(exist_ok=True)

# Google Drive configuration
GDRIVE_CONFIG = None
GDRIVE_SERVICE = None

def load_gdrive_config():
    """Load Google Drive configuration"""
    global GDRIVE_CONFIG
    config_file = project_root / 'config' / 'gdrive_config.json'
    if config_file.exists():
        with open(config_file, 'r') as f:
            GDRIVE_CONFIG = json.load(f)
    return GDRIVE_CONFIG

def get_gdrive_service():
    """Get authenticated Google Drive service"""
    global GDRIVE_SERVICE
    
    if not GDRIVE_AVAILABLE:
        raise Exception("Google Drive API not available. Install required packages.")
    
    if GDRIVE_SERVICE is not None:
        return GDRIVE_SERVICE
    
    config = load_gdrive_config()
    if not config:
        raise Exception("Google Drive configuration not found")
    
    credentials_file = project_root / config['credentials_file']
    if not credentials_file.exists():
        raise Exception(f"Google Drive credentials file not found: {credentials_file}")
    
    # Load service account credentials
    credentials = service_account.Credentials.from_service_account_file(
        str(credentials_file),
        scopes=['https://www.googleapis.com/auth/drive.file']
    )
    
    # Build the service
    GDRIVE_SERVICE = build('drive', 'v3', credentials=credentials)
    return GDRIVE_SERVICE

def validate_images(images_data):
    """Validate uploaded images"""
    if not images_data:
        return False, "No images provided"
    
    if len(images_data) > 20:
        return False, "Too many images. Maximum 20 allowed"
    
    if len(images_data) < 2:
        return False, "At least 2 images required to create a GIF"
    
    return True, "Valid"

def process_image_data(image_data):
    """Process base64 image data and return PIL Image"""
    try:
        # Remove data URL prefix if present
        if image_data.startswith('data:image'):
            image_data = image_data.split(',')[1]
        
        # Decode base64
        image_bytes = base64.b64decode(image_data)
        
        # Open with PIL
        image = Image.open(io.BytesIO(image_bytes))
        
        # Convert to RGB if necessary
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        return image
    except Exception as e:
        raise Exception(f"Error processing image: {str(e)}")

@app.route('/api/create-gif', methods=['POST'])
def create_gif():
    """
    API endpoint to create a GIF from multiple images
    """
    try:
        data = request.get_json()
        
        # Validate required fields
        if 'images' not in data:
            return jsonify({'error': 'No images provided'}), 400
        
        images_data = data['images']
        is_valid, message = validate_images(images_data)
        if not is_valid:
            return jsonify({'error': message}), 400
        
        # Get settings with defaults
        frame_duration = data.get('frame_duration', 500)  # milliseconds
        loop_count = data.get('loop_count', 0)  # 0 = infinite
        quality = data.get('quality', 'medium')  # low, medium, high
        
        # Validate settings
        if not (100 <= frame_duration <= 2000):
            return jsonify({'error': 'Frame duration must be between 100-2000ms'}), 400
        
        if not (0 <= loop_count <= 10):
            return jsonify({'error': 'Loop count must be between 0-10'}), 400
        
        if quality not in ['low', 'medium', 'high']:
            return jsonify({'error': 'Quality must be low, medium, or high'}), 400
        
        # Process images
        processed_images = []
        for i, image_data in enumerate(images_data):
            try:
                image = process_image_data(image_data)
                processed_images.append(image)
            except Exception as e:
                return jsonify({'error': f'Error processing image {i+1}: {str(e)}'}), 400
        
        # Create GIF
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.gif')
        
        # Set quality parameters
        if quality == 'low':
            optimize = False
            quality_val = 50
        elif quality == 'medium':
            optimize = True
            quality_val = 80
        else:  # high
            optimize = True
            quality_val = 95
        
        # Save as GIF
        processed_images[0].save(
            temp_file.name,
            save_all=True,
            append_images=processed_images[1:],
            duration=frame_duration,
            loop=loop_count,
            optimize=optimize,
            quality=quality_val
        )
        temp_file.close()
        
        # Generate filename
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        gif_filename = f"animated_gif_{timestamp}.gif"
        
        return send_file(
            temp_file.name,
            as_attachment=True,
            download_name=gif_filename,
            mimetype='image/gif'
        )
    
    except Exception as e:
        return jsonify({'error': f'Error creating GIF: {str(e)}'}), 500

@app.route('/api/gdrive/upload-gif', methods=['POST'])
def gdrive_upload_gif():
    """Upload generated GIF to Google Drive"""
    try:
        if not GDRIVE_AVAILABLE:
            return jsonify({'error': 'Google Drive API not available'}), 503
        
        # Get GIF data from request
        if 'gif_data' not in request.json:
            return jsonify({'error': 'No GIF data provided'}), 400
        
        gif_data = request.json['gif_data']
        filename = request.json.get('filename', 'animated_gif.gif')
        
        # Decode base64 GIF data
        if gif_data.startswith('data:image'):
            # Remove data URL prefix
            gif_data = gif_data.split(',')[1]
        
        gif_bytes = base64.b64decode(gif_data)
        
        # Get Google Drive service
        service = get_gdrive_service()
        config = load_gdrive_config()
        
        # Create file metadata
        file_metadata = {
            'name': filename,
            'parents': [config['target_folder_id']]
        }
        
        # Upload file
        media = MediaIoBaseUpload(io.BytesIO(gif_bytes), mimetype='image/gif')
        file = service.files().create(
            body=file_metadata,
            media_body=media,
            fields='id,name,webViewLink'
        ).execute()
        
        return jsonify({
            'success': True,
            'file_id': file.get('id'),
            'filename': file.get('name'),
            'web_view_link': file.get('webViewLink'),
            'message': f"Successfully uploaded {filename} to Google Drive"
        })
        
    except Exception as e:
        return jsonify({'error': f'Error uploading GIF to Google Drive: {str(e)}'}), 500

@app.route('/api/gdrive/download-images', methods=['POST'])
def gdrive_download_images():
    """Download multiple images from Google Drive by file IDs"""
    try:
        if not GDRIVE_AVAILABLE:
            return jsonify({'error': 'Google Drive API not available'}), 503
        
        if 'file_ids' not in request.json:
            return jsonify({'error': 'No file IDs provided'}), 400
        
        file_ids = request.json['file_ids']
        
        if len(file_ids) > 20:
            return jsonify({'error': 'Too many files. Maximum 20 allowed'}), 400
        
        # Get Google Drive service
        service = get_gdrive_service()
        
        downloaded_images = []
        
        for file_id in file_ids:
            try:
                # Get file metadata
                file_metadata = service.files().get(fileId=file_id).execute()
                
                # Check if it's an image
                mime_type = file_metadata.get('mimeType', '')
                if not mime_type.startswith('image/'):
                    continue  # Skip non-image files
                
                # Download file content
                request_download = service.files().get_media(fileId=file_id)
                file_content = io.BytesIO()
                downloader = MediaIoBaseDownload(file_content, request_download)
                
                done = False
                while done is False:
                    status, done = downloader.next_chunk()
                
                file_content.seek(0)
                
                # Convert to base64 for frontend
                image_data = base64.b64encode(file_content.getvalue()).decode('utf-8')
                
                downloaded_images.append({
                    'file_id': file_id,
                    'filename': file_metadata.get('name'),
                    'mime_type': mime_type,
                    'image_data': f"data:{mime_type};base64,{image_data}"
                })
                
            except Exception as e:
                print(f"Error downloading file {file_id}: {str(e)}")
                continue  # Skip failed downloads
        
        return jsonify({
            'success': True,
            'images': downloaded_images,
            'count': len(downloaded_images),
            'message': f"Successfully downloaded {len(downloaded_images)} images"
        })
        
    except Exception as e:
        return jsonify({'error': f'Error downloading images from Google Drive: {str(e)}'}), 500

@app.route('/api/gif/health', methods=['GET'])
def gif_health_check():
    """Health check endpoint for GIF maker"""
    return jsonify({
        'status': 'healthy', 
        'service': 'gif-maker-api',
        'version': '1.0.0',
        'max_images': 20,
        'supported_formats': ['JPEG', 'PNG', 'GIF', 'WebP', 'BMP', 'TIFF']
    })

@app.route('/api/gif/info', methods=['GET'])
def gif_api_info():
    """API information endpoint for GIF maker"""
    endpoints = {
        'POST /api/create-gif': 'Create animated GIF from multiple images',
        'POST /api/gdrive/upload-gif': 'Upload generated GIF to Google Drive',
        'POST /api/gdrive/download-images': 'Download multiple images from Google Drive',
        'GET /api/gif/health': 'Health check',
        'GET /api/gif/info': 'API information'
    }
    
    return jsonify({
        'name': 'Anamalia GIF Maker API',
        'version': '1.0.0',
        'endpoints': endpoints,
        'max_file_size': '50MB total',
        'max_images': 20,
        'supported_formats': ['JPEG', 'PNG', 'GIF', 'WebP', 'BMP', 'TIFF'],
        'frame_duration_range': '100-2000ms',
        'loop_count_range': '0-10 (0=infinite)',
        'quality_levels': ['low', 'medium', 'high'],
        'google_drive_available': GDRIVE_AVAILABLE
    })

if __name__ == '__main__':
    import argparse
    
    parser = argparse.ArgumentParser(description='Start the GIF Maker API server')
    parser.add_argument('--port', type=int, default=5001, help='Port to serve on')
    parser.add_argument('--host', default='localhost', help='Host to serve on')
    parser.add_argument('--debug', action='store_true', help='Enable debug mode')
    
    args = parser.parse_args()
    
    print(f"🎬 Anamalia GIF Maker API Server")
    print(f"📡 Server running at http://{args.host}:{args.port}")
    print(f"🔗 API endpoint: http://{args.host}:{args.port}/api/create-gif")
    print(f"📁 Upload folder: {UPLOAD_FOLDER}")
    print(f"⏹️  Press Ctrl+C to stop")
    
    app.run(debug=args.debug, host=args.host, port=args.port)
