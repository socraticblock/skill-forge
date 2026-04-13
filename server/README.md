# SkillForge Proxy Server

A tiny Python HTTP server that wraps MiniMax API calls. The React frontend calls this server locally — your API key stays on your machine and never touches Vercel or any public host.

## Quick Start

```bash
# 1. Set your API key
export MINIMAX_API_KEY=sk-cp-your-key-here

# 2. Run the server
python minimax_proxy.py

# Output:
# ✦ SkillForge proxy running on http://localhost:8080
#   POST /generate  →  generate prompt variations
#   API key: sk-cp-...XXXX
```

Then open the React app at `http://localhost:5173` and use the Prompt Builder tab.

## API

```
POST /generate
Content-Type: application/json

{
  "goal": "Help me debug my Python code",
  "variation_count": 2
}

Response:
{
  "variations": [
    {
      "id": "var-0",
      "title": "Socratic Conversational",
      "prompt": "You are a Socratic AI assistant...",
      "tone": "Socratic",
      "structure": "Conversational"
    }
  ]
}
```

## Troubleshooting

**"MINIMAX_API_KEY not set" error**
- Make sure you have an API key from https://platform.minimax.io
- Run: `export MINIMAX_API_KEY=sk-cp-your-key-here`

**"Connection refused" in browser**
- The Python server isn't running. Start it with: `python minimax_proxy.py`

**CORS errors**
- The server includes `Access-Control-Allow-Origin: *` for all responses
- Should work fine in dev with Vite proxy
