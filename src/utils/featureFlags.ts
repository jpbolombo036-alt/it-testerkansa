export interface FeatureFlags {
  presencesEnabled: boolean
  documentArchiveEnabled: boolean
}

export const defaultFeatureFlags: FeatureFlags = {
  presencesEnabled: true,
  documentArchiveEnabled: true
}

let flags: FeatureFlags = { ...defaultFeatureFlags }

export const getFeatureFlags = (): FeatureFlags => flags

export const setFeatureFlags = (newFlags: Partial<FeatureFlags>) => {
  flags = { ...flags, ...newFlags }
}

export const isFeatureEnabled = (feature: keyof FeatureFlags): boolean => {
  return flags[feature]
}