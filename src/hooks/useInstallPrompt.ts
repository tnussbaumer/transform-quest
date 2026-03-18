import { useState, useEffect, useCallback } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

interface InstallPromptState {
  isInstalled: boolean
  isIOS: boolean
  isAndroid: boolean
  canPromptInstall: boolean
  promptInstall: () => void
  dismissInstallBanner: () => void
  showInstallBanner: boolean
}

const DISMISS_KEY = 'tq-install-dismissed'
const VISIT_KEY = 'tq-visit-count'

function getIsInstalled(): boolean {
  // iOS standalone
  if ('standalone' in navigator && (navigator as { standalone?: boolean }).standalone === true) {
    return true
  }
  // Standard display-mode
  if (window.matchMedia('(display-mode: standalone)').matches) {
    return true
  }
  return false
}

function getIsIOS(): boolean {
  return /iPhone|iPad|iPod/i.test(navigator.userAgent)
}

function getIsAndroid(): boolean {
  return /Android/i.test(navigator.userAgent)
}

export function useInstallPrompt(): InstallPromptState {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  const isIOS = getIsIOS()
  const isAndroid = getIsAndroid()

  useEffect(() => {
    setIsInstalled(getIsInstalled())

    // Track visit count
    const visits = parseInt(localStorage.getItem(VISIT_KEY) || '0', 10) + 1
    localStorage.setItem(VISIT_KEY, String(visits))

    // Check if previously dismissed
    if (localStorage.getItem(DISMISS_KEY) === 'true') {
      setDismissed(true)
    }

    // Listen for the beforeinstallprompt event (Android Chrome)
    function handleBeforeInstall(e: Event) {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }

    // Detect when app is installed
    function handleAppInstalled() {
      setIsInstalled(true)
      setDeferredPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstall)
    window.addEventListener('appinstalled', handleAppInstalled)

    // Also listen for display-mode changes
    const mql = window.matchMedia('(display-mode: standalone)')
    function handleDisplayChange(e: MediaQueryListEvent) {
      setIsInstalled(e.matches)
    }
    mql.addEventListener('change', handleDisplayChange)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
      window.removeEventListener('appinstalled', handleAppInstalled)
      mql.removeEventListener('change', handleDisplayChange)
    }
  }, [])

  const promptInstall = useCallback(() => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      deferredPrompt.userChoice.then((choice) => {
        if (choice.outcome === 'accepted') {
          setIsInstalled(true)
        }
        setDeferredPrompt(null)
      })
    }
  }, [deferredPrompt])

  const dismissInstallBanner = useCallback(() => {
    localStorage.setItem(DISMISS_KEY, 'true')
    setDismissed(true)
  }, [])

  // Show banner logic
  const visitCount = parseInt(localStorage.getItem(VISIT_KEY) || '0', 10)
  const hasVisitedEnough = visitCount >= 2
  const showInstallBanner = !isInstalled && !dismissed && hasVisitedEnough

  return {
    isInstalled,
    isIOS,
    isAndroid,
    canPromptInstall: deferredPrompt !== null,
    promptInstall,
    dismissInstallBanner,
    showInstallBanner,
  }
}
