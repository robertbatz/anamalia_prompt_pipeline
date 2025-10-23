#!/usr/bin/env python3
"""
Simple HTTP server for the Anamalia Prompt Assembler web viewer
"""

import http.server
import socketserver
import os
import sys
from pathlib import Path

# Add the project root to the Python path
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

class CustomHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(project_root), **kwargs)
    
    def end_headers(self):
        # Add CORS headers for development
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

def serve(port=8080, host='localhost'):
    """Start the web server."""
    os.chdir(project_root)
    
    with socketserver.TCPServer((host, port), CustomHTTPRequestHandler) as httpd:
        print(f"🌐 Anamalia Prompt Assembler Web Viewer")
        print(f"📡 Server running at http://{host}:{port}")
        print(f"📁 Serving from: {project_root}")
        print(f"🔗 Web viewer: http://{host}:{port}/webviewer/")
        print(f"📦 Bundles: http://{host}:{port}/bundles/")
        print(f"🎨 Renders: http://{host}:{port}/renders/")
        print(f"⏹️  Press Ctrl+C to stop")
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print(f"\n🛑 Server stopped")

if __name__ == '__main__':
    import argparse
    
    parser = argparse.ArgumentParser(description='Serve the Anamalia Prompt Assembler web viewer')
    parser.add_argument('--port', type=int, default=8080, help='Port to serve on')
    parser.add_argument('--host', default='localhost', help='Host to serve on')
    
    args = parser.parse_args()
    serve(args.port, args.host)
