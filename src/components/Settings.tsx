'use client'

import { useState } from 'react'
import { ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { useSettingsStore } from '../stores/settingsStore'

interface SettingsProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function Settings({ open, onOpenChange }: SettingsProps) {
  const { proxyUrl, setProxyUrl } = useSettingsStore()
  const [localUrl, setLocalUrl] = useState(proxyUrl)

  const handleSave = () => {
    setProxyUrl(localUrl.trim())
    onOpenChange(false)
  }

  const handleReset = () => {
    setLocalUrl('http://localhost:8080')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="settings-dialog">
        <DialogHeader>
          <DialogTitle className="settings-title">Settings</DialogTitle>
          <DialogDescription className="settings-description">
            Configure how SkillForge connects to your AI backend.
          </DialogDescription>
        </DialogHeader>

        <div className="settings-body">
          {/* Proxy URL */}
          <div className="settings-field">
            <label className="settings-label">
              MiniMax Proxy URL
              <span className="settings-label-hint">The address of your local proxy server</span>
            </label>
            <div className="settings-input-row">
              <Input
                value={localUrl}
                onChange={(e) => setLocalUrl(e.target.value)}
                placeholder="http://localhost:8080"
                className="settings-input"
              />
              <Button variant="secondary" size="sm" onClick={handleReset}>
                Reset
              </Button>
            </div>
            <p className="settings-hint">
              Start the proxy server with:{' '}
              <code>cd server && export MINIMAX_API_KEY=your-key && python minimax_proxy.py</code>
            </p>
          </div>

          {/* Info */}
          <div className="settings-info">
            <h4>How it works</h4>
            <p>
              The proxy server runs locally on your machine and forwards requests to the MiniMax API.
              Your API key never leaves your computer — it stays in the <code>MINIMAX_API_KEY</code> environment
              variable on your local machine.
            </p>
            <a
              href="https://github.com/socraticblock/skill-forge"
              target="_blank"
              rel="noopener noreferrer"
              className="settings-link"
            >
              <ExternalLink size={12} />
              View server setup on GitHub
            </a>
          </div>
        </div>

        <div className="settings-footer">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Settings
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
