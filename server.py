from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
import os
import webbrowser

ROOT = Path(__file__).resolve().parent
os.chdir(ROOT)

HOST = "127.0.0.1"
PORT = 8765
URL = f"http://{HOST}:{PORT}"

print("\n==========================================")
print("STORE PAGE BUILDER")
print("==========================================")
print(f"Öppnar: {URL}")
print("Stäng PowerShell-fönstret när du är klar.\n")

webbrowser.open(URL)
server = ThreadingHTTPServer((HOST, PORT), SimpleHTTPRequestHandler)

try:
    server.serve_forever()
except KeyboardInterrupt:
    print("\nStore Page Builder stoppad.")
finally:
    server.server_close()
