// lib/analytics.js
// Call these functions anywhere in the app to track user actions in GA4
// All free — no paid plan needed

/**
 * Track a custom event in Google Analytics
 * @param {string} eventName - The event name (snake_case)
 * @param {object} params - Optional extra data
 */
export function trackEvent(eventName, params = {}) {
  if (typeof window === 'undefined') return
  if (!window.gtag) return
  window.gtag('event', eventName, params)
}

// ── Pre-built events — call these at the right moments ──────────────

/** Called when user lands on homepage */
export const trackLanding = () => trackEvent('page_view_landing')

/** Called when user opens the auth/sign-up modal */
export const trackSignupStart = () => trackEvent('signup_start')

/** Called when user successfully signs in */
export const trackSignupComplete = () => trackEvent('signup_complete')

/** Called when user starts generating a museum */
export const trackMuseumStart = (selfCount) =>
  trackEvent('museum_generation_start', { self_count: selfCount })

/** Called when museum generation completes successfully */
export const trackMuseumComplete = () => trackEvent('museum_generation_complete')

/** Called when user clicks the Share button */
export const trackShareClick = (museumSlug) =>
  trackEvent('share_click', { museum_slug: museumSlug })

/** Called when user copies the share link */
export const trackLinkCopied = () => trackEvent('share_link_copied')

/** Called when user clicks Upgrade */
export const trackUpgradeClick = (location) =>
  trackEvent('upgrade_click', { location })

/** Called when Stripe checkout opens */
export const trackCheckoutStart = () => trackEvent('checkout_start')

/** Called when user lands back on /museum?upgraded=true */
export const trackUpgradeComplete = () => trackEvent('upgrade_complete')

/** Called when user visits a public shared museum */
export const trackPublicMuseumView = (slug) =>
  trackEvent('public_museum_view', { museum_slug: slug })

/** Called when visitor on public page clicks "Build Your Own" */
export const trackPublicCTAClick = () => trackEvent('public_cta_click')

/** Called when user opts in to email reminders */
export const trackEmailReminderOptIn = () => trackEvent('email_reminder_opt_in')

/** Called when user submits feedback */
export const trackFeedbackSubmit = (length) =>
  trackEvent('feedback_submit', { response_length: length })

/** Called when user reaches the Final Room */
export const trackFinalRoomView = () => trackEvent('final_room_view')
