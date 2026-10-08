#!/usr/bin/env python3
"""
Lightweight HTTP proxy that forwards /api/* requests from port 8001 to
Next.js on port 3000. Needed because the Kubernetes ingress on this
preview environment routes /api/* traffic to port 8001, while our
Next.js server (which handles the /api routes) listens on port 3000.
"""
import http.server
import http.client
import socketserver
import threading
import sys

UPSTREAM_HOST = "127.0.0.1"
UPSTREAM_PORT = 3000
BIND_HOST = "0.0.0.0"
BIND_PORT = 8001


class ProxyHandler(http.server.BaseHTTPRequestHandler):
    protocol_version = "HTTP/1.1"

    def _proxy(self, method):
        try:
            # Read request body if present
            length = int(self.headers.get("Content-Length", "0") or 0)
            body = self.rfile.read(length) if length > 0 else None

            # Prepare headers (drop hop-by-hop)
            HOP_BY_HOP = {"connection", "keep-alive", "proxy-authenticate",
                          "proxy-authorization", "te", "trailer",
                          "transfer-encoding", "upgrade", "host"}
            fwd_headers = {}
            for h, v in self.headers.items():
                if h.lower() in HOP_BY_HOP:
                    continue
                fwd_headers[h] = v
            fwd_headers["Host"] = f"{UPSTREAM_HOST}:{UPSTREAM_PORT}"

            conn = http.client.HTTPConnection(UPSTREAM_HOST, UPSTREAM_PORT, timeout=60)
            conn.request(method, self.path, body=body, headers=fwd_headers)
            resp = conn.getresponse()
            resp_body = resp.read()

            self.send_response(resp.status)
            for h, v in resp.getheaders():
                if h.lower() in HOP_BY_HOP:
                    continue
                # Skip Content-Length; we set our own
                if h.lower() == "content-length":
                    continue
                self.send_header(h, v)
            self.send_header("Content-Length", str(len(resp_body)))
            self.end_headers()
            if method != "HEAD":
                self.wfile.write(resp_body)
            conn.close()
        except Exception as e:
            self.send_response(502)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(f'{{"error":"proxy_failure","detail":"{str(e)}"}}'.encode())

    def do_GET(self): self._proxy("GET")
    def do_POST(self): self._proxy("POST")
    def do_PUT(self): self._proxy("PUT")
    def do_DELETE(self): self._proxy("DELETE")
    def do_PATCH(self): self._proxy("PATCH")
    def do_OPTIONS(self): self._proxy("OPTIONS")
    def do_HEAD(self): self._proxy("HEAD")

    def log_message(self, fmt, *args):
        # keep logs quiet but capture errors on stderr
        sys.stderr.write("[proxy] " + (fmt % args) + "\n")


class ThreadingHTTPServer(socketserver.ThreadingMixIn, http.server.HTTPServer):
    daemon_threads = True
    allow_reuse_address = True


if __name__ == "__main__":
    server = ThreadingHTTPServer((BIND_HOST, BIND_PORT), ProxyHandler)
    print(f"[api_proxy] Forwarding {BIND_HOST}:{BIND_PORT} -> {UPSTREAM_HOST}:{UPSTREAM_PORT}", flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        server.shutdown()
