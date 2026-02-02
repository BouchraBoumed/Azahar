import http.server
import socketserver
import os
import webbrowser
from pathlib import Path

PORT = 8080
DIRECTORY = "front-end"

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)
    
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        self.send_header('Expires', '0')
        super().end_headers()

os.chdir(Path(__file__).parent)

with socketserver.TCPServer(("", PORT), MyHTTPRequestHandler) as httpd:
    print(f"🚀 Azahar website running at http://localhost:{PORT}")
    print(f"📂 Serving files from: {os.path.join(os.getcwd(), DIRECTORY)}")
    print("\nAvailable pages:")
    print(f"   Home:         http://localhost:{PORT}/index.html")
    print(f"   Services:     http://localhost:{PORT}/services.html")
    print(f"   Reservations: http://localhost:{PORT}/reservations.html")
    print(f"   Account:      http://localhost:{PORT}/account.html")
    print("\n✨ Press Ctrl+C to stop the server\n")
    
    webbrowser.open(f'http://localhost:{PORT}/index.html')
    
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n\n👋 Server stopped")
