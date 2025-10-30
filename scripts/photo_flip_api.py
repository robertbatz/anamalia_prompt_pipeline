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
from flask_cors import CORS
from PIL import Image
import io
from datetime import datetime
import zipfile
import uuid
from rembg import remove

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
# Enable CORS for all /api/* routes (frontend served from a different port)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Configure upload settings
app.config['MAX_CONTENT_LENGTH'] = 10 * 1024 * 1024  # 10MB max file size
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

@app.route('/api/gdrive/upload', methods=['POST'])
def gdrive_upload():
    """Upload flipped image to Google Drive"""
    try:
        if not GDRIVE_AVAILABLE:
            return jsonify({'error': 'Google Drive API not available'}), 503
        
        # Get image data from request
        if 'image_data' not in request.json:
            return jsonify({'error': 'No image data provided'}), 400
        
        image_data = request.json['image_data']
        filename = request.json.get('filename', 'flipped_image.jpg')
        
        # Decode base64 image data
        import base64
        if image_data.startswith('data:image'):
            # Remove data URL prefix
            image_data = image_data.split(',')[1]
        
        image_bytes = base64.b64decode(image_data)
        
        # Get Google Drive service
        service = get_gdrive_service()
        config = load_gdrive_config()
        
        # Create file metadata
        file_metadata = {
            'name': filename,
            'parents': [config['target_folder_id']]
        }
        
        # Upload file
        media = MediaIoBaseUpload(io.BytesIO(image_bytes), mimetype='image/jpeg')
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
        return jsonify({'error': f'Error uploading to Google Drive: {str(e)}'}), 500

@app.route('/api/gdrive/download', methods=['POST'])
def gdrive_download():
    """Download image from Google Drive by file ID"""
    try:
        if not GDRIVE_AVAILABLE:
            return jsonify({'error': 'Google Drive API not available'}), 503
        
        if 'file_id' not in request.json:
            return jsonify({'error': 'No file ID provided'}), 400
        
        file_id = request.json['file_id']
        
        # Get Google Drive service
        service = get_gdrive_service()
        
        # Get file metadata
        file_metadata = service.files().get(fileId=file_id).execute()
        
        # Check if it's an image
        mime_type = file_metadata.get('mimeType', '')
        if not mime_type.startswith('image/'):
            return jsonify({'error': 'File is not an image'}), 400
        
        # Download file content
        request_download = service.files().get_media(fileId=file_id)
        file_content = io.BytesIO()
        downloader = MediaIoBaseDownload(file_content, request_download)
        
        done = False
        while done is False:
            status, done = downloader.next_chunk()
        
        file_content.seek(0)
        
        # Convert to base64 for frontend
        import base64
        image_data = base64.b64encode(file_content.getvalue()).decode('utf-8')
        
        return jsonify({
            'success': True,
            'filename': file_metadata.get('name'),
            'mime_type': mime_type,
            'image_data': f"data:{mime_type};base64,{image_data}",
            'file_id': file_id
        })
        
    except Exception as e:
        return jsonify({'error': f'Error downloading from Google Drive: {str(e)}'}), 500

@app.route('/api/gdrive/list', methods=['GET'])
def gdrive_list():
    """List files in the target Google Drive folder"""
    try:
        if not GDRIVE_AVAILABLE:
            return jsonify({'error': 'Google Drive API not available'}), 503
        
        # Get Google Drive service
        service = get_gdrive_service()
        config = load_gdrive_config()
        
        # List files in target folder
        results = service.files().list(
            q=f"'{config['target_folder_id']}' in parents and mimeType contains 'image/'",
            fields="files(id,name,mimeType,createdTime,size,webViewLink)"
        ).execute()
        
        files = results.get('files', [])
        
        return jsonify({
            'success': True,
            'files': files,
            'count': len(files)
        })
        
    except Exception as e:
        return jsonify({'error': f'Error listing Google Drive files: {str(e)}'}), 500

@app.route('/api/info', methods=['GET'])
def api_info():
    """API information endpoint"""
    endpoints = {
        'POST /api/flip-photo': 'Flip an image horizontally',
        'POST /api/remove-bg': 'Remove background from a single image (PNG with alpha)',
        'POST /api/remove-bg-batch': 'Remove background from multiple images (ZIP of PNGs)',
        'GET /api/health': 'Health check',
        'GET /api/info': 'API information'
    }
    
    if GDRIVE_AVAILABLE:
        endpoints.update({
            'POST /api/gdrive/upload': 'Upload image to Google Drive',
            'POST /api/gdrive/download': 'Download image from Google Drive',
            'GET /api/gdrive/list': 'List images in Google Drive folder'
        })
    
    return jsonify({
        'name': 'Anamalia Photo Flip API',
        'version': '1.0.0',
        'endpoints': endpoints,
        'max_file_size': '10MB',
        'supported_formats': ['JPEG', 'PNG', 'GIF', 'WebP', 'BMP', 'TIFF'],
        'google_drive_available': GDRIVE_AVAILABLE
    })

@app.route('/api/remove-bg', methods=['POST'])
def remove_bg_api():
    """Remove background from a single image and return PNG with alpha"""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file uploaded'}), 400

        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        if not file.content_type.startswith('image/'):
            return jsonify({'error': 'File must be an image'}), 400

        image_data = file.read()
        with Image.open(io.BytesIO(image_data)) as img:
            if img.mode not in ('RGBA', 'RGB'):
                img = img.convert('RGBA')
            elif img.mode == 'RGB':
                img = img.convert('RGBA')

            result = remove(img)

            temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.png')
            result.save(temp_file.name, 'PNG')
            temp_file.close()

            original_name = Path(file.filename).stem
            out_name = f"{original_name}_no_bg.png"

            return send_file(
                temp_file.name,
                as_attachment=True,
                download_name=out_name,
                mimetype='image/png'
            )
    except Exception as e:
        return jsonify({'error': f'Error removing background: {str(e)}'}), 500

@app.route('/api/remove-bg-batch', methods=['POST'])
def remove_bg_batch_api():
    """Remove backgrounds from multiple images and return a ZIP of PNGs"""
    try:
        files = request.files.getlist('files')
        if not files:
            return jsonify({'error': 'No files uploaded'}), 400

        # Create a temp directory to store outputs
        temp_dir = tempfile.mkdtemp(prefix='remove_bg_')
        output_paths = []

        for f in files:
            if f and f.filename and f.mimetype and f.mimetype.startswith('image/'):
                try:
                    with Image.open(io.BytesIO(f.read())) as img:
                        if img.mode not in ('RGBA', 'RGB'):
                            img = img.convert('RGBA')
                        elif img.mode == 'RGB':
                            img = img.convert('RGBA')
                        result = remove(img)

                        stem = Path(f.filename).stem
                        out_path = Path(temp_dir) / f"{stem}_no_bg.png"
                        result.save(out_path, 'PNG')
                        output_paths.append(out_path)
                except Exception:
                    # Skip problematic file but continue processing others
                    continue

        if not output_paths:
            return jsonify({'error': 'No valid images processed'}), 400

        # Create zip archive
        zip_name = Path(temp_dir) / f"removed_background_{uuid.uuid4().hex}.zip"
        with zipfile.ZipFile(zip_name, 'w', zipfile.ZIP_DEFLATED) as zipf:
            for p in output_paths:
                zipf.write(p, arcname=p.name)

        return send_file(
            str(zip_name),
            as_attachment=True,
            download_name='removed_background.zip',
            mimetype='application/zip'
        )
    except Exception as e:
        return jsonify({'error': f'Error in batch background removal: {str(e)}'}), 500

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
