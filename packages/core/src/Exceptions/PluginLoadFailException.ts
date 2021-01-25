import { DelirException, ErrorDetail } from './DelirException'

interface Reason extends ErrorDetail {
  reason: string[]
}

export class PluginLoadFailException extends DelirException<Reason> {}
