import { DelirException } from './DelirException'

interface EffectPluginMissingExceptionDetail {
  effectId: string
}

export class EffectPluginMissingException extends DelirException {
  constructor(message: string, public detail: EffectPluginMissingExceptionDetail) {
    super(message)
  }
}
