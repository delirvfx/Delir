interface EffectPluginMissingExceptionDetail {
  effectId: string
}

export default class EffectPluginMissingException extends Error {
  constructor(message: string, public detail: EffectPluginMissingExceptionDetail) {
    super(message)
  }
}
