import { action } from '@ragg/fleur'

export interface NavigationPayload {
    url: string,
    method: string
    error?: Error
}

// Action payloads
export const navigateStart = action<NavigationPayload>()
export const navigateSuccess = action<NavigationPayload>()
export const navigateFailure = action<NavigationPayload>()
