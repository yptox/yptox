import http.server
import socketserver
import os
import urllib.parse
import urllib.parse

PORT = 8000

class CleanUrlHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        # Parse the URL to separate path and query
        parsed_path = urllib.parse.urlparse(self.path)
        path_only = parsed_path.path
        
        # If the path doesn't have an extension and isn't a directory, try adding .html
        if '.' not in path_only and not path_only.endswith('/'):
            potential_html = path_only + '.html'
            if os.path.exists(os.path.join(os.getcwd(), potential_html.lstrip('/'))):
                # Just serve the file, ignore query string for internal path
                self.path = potential_html
        
        # If path is /nonexistent, serve 404.html manually if it exists
        # (SimpleHTTPRequestHandler sends its own 404 by default)
        
        return super().do_GET()

    def send_error(self, code, message=None, explain=None):
        if code == 404:
            self.error_message_format = open('404.html').read() if os.path.exists('404.html') else "File not found"
            self.send_response(code)
            self.send_header("Content-Type", "text/html")
            self.end_headers()
            self.wfile.write(self.error_message_format.encode())
        else:
            super().send_error(code, message, explain)

with socketserver.TCPServer(("", PORT), CleanUrlHandler) as httpd:
    print(f"Serving at http://localhost:{PORT}")
    httpd.serve_forever()
