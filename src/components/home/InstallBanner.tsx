import { Download, X } from 'lucide-react'
import { useInstallPrompt } from '../../hooks/useInstallPrompt'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'

/** Detects non-Safari browsers on iOS */
function isNonSafariIOS(): boolean {
  const ua = navigator.userAgent
  if (!/iPhone|iPad|iPod/i.test(ua)) return false
  // Chrome on iOS, Firefox on iOS, in-app browsers
  return /CriOS|FxiOS|Instagram|FBAV|Twitter|LinkedIn/i.test(ua)
}

/** Safari share icon as inline SVG */
function ShareIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-tq-teal">
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
      <polyline points="16 6 12 2 8 6" />
      <line x1="12" y1="2" x2="12" y2="15" />
    </svg>
  )
}

export function InstallBanner() {
  const { isIOS, isAndroid, canPromptInstall, promptInstall, dismissInstallBanner, showInstallBanner } = useInstallPrompt()

  if (!showInstallBanner) return null

  // Non-Safari iOS: can't install from other browsers
  if (isIOS && isNonSafariIOS()) {
    return (
      <Card>
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <Download size={20} className="text-tq-gold" />
              <h3 className="font-bold text-tq-text text-sm">Open in Safari</h3>
            </div>
            <button onClick={dismissInstallBanner} className="p-1 text-tq-text-muted" aria-label="Dismiss">
              <X size={16} />
            </button>
          </div>
          <p className="text-tq-text-sec text-sm">
            Only Safari can install web apps on iPhone. Copy this link and paste it in Safari:
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-xs bg-tq-bg rounded-lg px-3 py-2 text-tq-teal truncate">
              {window.location.hostname}
            </code>
            <Button
              className="!h-9 !px-3 !text-xs"
              onClick={() => navigator.clipboard.writeText(window.location.origin)}
            >
              Copy
            </Button>
          </div>
        </div>
      </Card>
    )
  }

  // iPhone Safari: show Add to Home Screen instructions
  if (isIOS) {
    return (
      <Card>
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <Download size={20} className="text-tq-teal" />
              <h3 className="font-bold text-tq-text text-sm">Install Transform Quest</h3>
            </div>
            <button onClick={dismissInstallBanner} className="p-1 text-tq-text-muted" aria-label="Dismiss">
              <X size={16} />
            </button>
          </div>

          <div className="space-y-2.5">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-tq-surface-2 flex items-center justify-center flex-shrink-0 text-xs font-bold text-tq-text-sec">1</div>
              <div className="flex items-center gap-1.5 text-sm text-tq-text">
                Tap the <ShareIcon /> <span className="font-semibold">Share</span> button
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-tq-surface-2 flex items-center justify-center flex-shrink-0 text-xs font-bold text-tq-text-sec">2</div>
              <span className="text-sm text-tq-text">
                Scroll down and tap <span className="font-semibold">&quot;Add to Home Screen&quot;</span>
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-tq-surface-2 flex items-center justify-center flex-shrink-0 text-xs font-bold text-tq-text-sec">3</div>
              <span className="text-sm text-tq-text">
                Tap <span className="font-semibold">&quot;Add&quot;</span>
              </span>
            </div>
          </div>

          <button
            onClick={dismissInstallBanner}
            className="text-tq-text-muted text-xs font-semibold"
          >
            Got it
          </button>
        </div>
      </Card>
    )
  }

  // Android: native install prompt or manual instructions
  if (isAndroid) {
    return (
      <Card>
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <Download size={20} className="text-tq-teal" />
              <h3 className="font-bold text-tq-text text-sm">Install Transform Quest</h3>
            </div>
            <button onClick={dismissInstallBanner} className="p-1 text-tq-text-muted" aria-label="Dismiss">
              <X size={16} />
            </button>
          </div>

          {canPromptInstall ? (
            <>
              <p className="text-tq-text-sec text-sm">
                Add Transform Quest to your home screen for the best experience.
              </p>
              <Button fullWidth onClick={promptInstall}>
                Install
              </Button>
            </>
          ) : (
            <>
              <p className="text-tq-text-sec text-sm">
                Tap the <span className="font-semibold">&#8942;</span> menu in your browser, then tap <span className="font-semibold">&quot;Add to Home Screen&quot;</span>.
              </p>
            </>
          )}

          <button
            onClick={dismissInstallBanner}
            className="text-tq-text-muted text-xs font-semibold"
          >
            Not now
          </button>
        </div>
      </Card>
    )
  }

  // Desktop or other: generic install banner
  if (canPromptInstall) {
    return (
      <Card>
        <div className="flex items-center gap-3">
          <Download size={20} className="text-tq-teal flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-bold text-tq-text">Install Transform Quest</p>
            <p className="text-xs text-tq-text-sec">Add to your home screen for the best experience</p>
          </div>
          <Button className="!h-9 !px-3 !text-xs" onClick={promptInstall}>Install</Button>
          <button onClick={dismissInstallBanner} className="p-1 text-tq-text-muted" aria-label="Dismiss">
            <X size={16} />
          </button>
        </div>
      </Card>
    )
  }

  return null
}
