import { DelirException, ErrorDetail } from './DelirException'

interface MissingDetail extends ErrorDetail {
  effectId: string
}

export class EffectPluginMissingException extends DelirException<MissingDetail> {}
