"""
SkillForge MiniMax Proxy Server
Run: python minimax_proxy.py
Calls MiniMax API with the user's key, returns prompt variations.
Key is read from MINIMAX_API_KEY env var (or ~/.hermes/config.yaml fallback).
"""

import json
import os
import sys
import re
import urllib.request
import urllib.error
from pathlib import Path

# ─── Configuration ────────────────────────────────────────────────────────────

HOST = "0.0.0.0"
PORT = 8080
BASE_URL = "https://api.minimax.io/v1"
MODEL = "MiniMax-M2.7"

# ─── Key Loading ───────────────────────────────────────────────────────────────

def get_api_key() -> str:
    """Try MINIMAX_API_KEY env var first, then scan ~/.hermes/config.yaml."""
    key = os.environ.get("MINIMAX_API_KEY", "").strip()
    if key:
        return key

    config_path = Path.home() / ".hermes" / "config.yaml"
    if config_path.exists():
        content = config_path.read_text()
        # Find the actual (unmasked) key — it's usually the full line
        for line in content.splitlines():
            if "api_key:" in line and "sk-cp-" in line:
                # Extract everything after 'api_key:'
                val = line.split("api_key:", 1)[1].strip()
                # If it looks like a full key (not masked), use it
                if val.startswith("sk-cp-") and "..." not in val:
                    return val

    raise RuntimeError(
        "MINIMAX_API_KEY not set. "
        "Set it in your shell: export MINIMAX_API_KEY=your_key_here"
    )

# ─── Prompt Generation ────────────────────────────────────────────────────────

TONES = ["Socratic", "Directive", "Collaborative", "Expert"]
STRUCTURES = ["Step-by-step", "Conversational", "Checklist", "Narrative"]


def build_system_prompt(tone: str, structure: str) -> str:
    tone_map = {
        "Socratic": (
            "You are a Socratic AI assistant. Guide the user through questions — "
            "ask targeted questions that lead them to discover the answer themselves. "
            "Use phrases like 'What have you tried?', 'What do you think causes...', 'If we looked at it from...'"
        ),
        "Directive": (
            "You are a directive AI assistant. Be direct and authoritative. "
            "Provide clear instructions and definitive guidance. "
            "Take charge of the problem-solving process with confidence."
        ),
        "Collaborative": (
            "You are a collaborative AI assistant. Work alongside the user as a partner. "
            "Share your thinking process openly. Use 'Let\\'s', 'We can', 'I suggest we try...'"
        ),
        "Expert": (
            "You are an expert AI assistant. Draw on deep expertise. "
            "Reference specific patterns, principles, or past cases. "
            "Explain the 'why' behind recommendations with technical depth."
        ),
    }
    structure_map = {
        "Step-by-step": "Present your response as a numbered sequence of clear, actionable steps.",
        "Conversational": "Engage in a natural back-and-forth dialogue. Check understanding before proceeding.",
        "Checklist": "Use a clear checklist format so the user can track their progress item by item.",
        "Narrative": "Tell a story about how this problem was solved. Make it engaging and memorable.",
    }
    return f"{tone_map[tone]}\n\n{structure_map[structure]}"


def generate_variations(goal: str, count: int, api_key: str) -> list[dict]:
    """Call MiniMax for each variation and return structured results."""
    results = []

    for i in range(count):
        tone = TONES[i % len(TONES)]
        structure = STRUCTURES[(i + 2) % len(STRUCTURES)]
        system_msg = build_system_prompt(tone, structure)

        payload = json.dumps({
            "model": MODEL,
            "messages": [
                {"role": "system", "content": system_msg},
                {"role": "user", "content": (
                    f"Generate a complete AI prompt (system prompt) for the following goal.\n"
                    f"Return ONLY the prompt text, nothing else.\n\n"
                    f"Goal: {goal}\n\n"
                    f"Requirements:\n"
                    f"- Tone: {tone}\n"
                    f"- Structure: {structure}\n"
                    f"- Make it specific, actionable, and ready to use\n"
                    f"- Include guidance on how to handle edge cases or ambiguity"
                )},
            ],
            "max_tokens": 500,
            "temperature": 0.9,
        }).encode("utf-8")

        req = urllib.request.Request(
            f"{BASE_URL}/chat/completions",
            data=payload,
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
            method="POST",
        )

        try:
            with urllib.request.urlopen(req, timeout=30) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                prompt_text = data["choices"][0]["message"]["content"].strip()
        except urllib.error.HTTPError as e:
            error_body = e.read().decode("utf-8") if e.fp else ""
            print(f"[MiniMax API error {e.code}]: {error_body[:300]}", file=sys.stderr)
            raise RuntimeError(f"MiniMax API error {e.code}: {error_body[:200]}")

        results.append({
            "id": f"var-{i}",
            "title": f"{tone} {structure}",
            "prompt": prompt_text,
            "tone": tone,
            "structure": structure,
        })

    return results


# ─── HTTP Server ──────────────────────────────────────────────────────────────

def run_server(api_key: str):
    """Simple HTTP server using Python's built-in http.server."""
    from http.server import HTTPServer, BaseHTTPRequestHandler

    class Handler(BaseHTTPRequestHandler):
        def log_message(self, format, *args):
            print(f"[{self.log_date_time_string()}] {format % args}")

        def do_POST(self):
            if self.path != "/generate":
                self.send_error(404, "Not found")
                return

            try:
                content_length = int(self.headers.get("Content-Length", 0))
                body = self.rfile.read(content_length).decode("utf-8")
                payload = json.loads(body)

                goal = payload.get("goal", "").strip()
                count = int(payload.get("variation_count", 2))
                count = max(1, min(count, 4))  # clamp 1-4

                if not goal:
                    self.send_response(400)
                    self.send_header("Content-Type", "application/json")
                    self.end_headers()
                    self.wfile.write(json.dumps({"error": "goal is required"}).encode())
                    return

                print(f"  → Generating {count} variations for: {goal[:60]}{'...' if len(goal) > 60 else ''}")
                variations = generate_variations(goal, count, api_key)
                print(f"  ← {len(variations)} variations ready")

                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()
                self.wfile.write(json.dumps({"variations": variations}).encode())

            except json.JSONDecodeError:
                self.send_response(400)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"error": "Invalid JSON"}).encode())
            except Exception as e:
                print(f"[ERROR] {e}", file=sys.stderr)
                self.send_response(500)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"error": str(e)}).encode())

        def do_OPTIONS(self):
            self.send_response(200)
            self.send_header("Access-Control-Allow-Origin", "*")
            self.send_header("Access-Control-Allow-Headers", "Content-Type")
            self.end_headers()

    server = HTTPServer((HOST, PORT), Handler)
    print(f"✦ SkillForge proxy running on http://localhost:{PORT}")
    print(f"  POST /generate  →  generate prompt variations")
    print(f"  API key: {api_key[:12]}...{api_key[-4:]}")
    print()
    server.serve_forever()


if __name__ == "__main__":
    try:
        key = get_api_key()
        run_server(key)
    except RuntimeError as e:
        print(f"[FATAL] {e}", file=sys.stderr)
        sys.exit(1)
