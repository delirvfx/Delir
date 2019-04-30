interface EffectPluginMissingExceptionDetail {
    effectId: string
}
export default class EffectPluginMissingException extends Error {
    public detail: EffectPluginMissingExceptionDetail
    constructor(message: string, detail: EffectPluginMissingExceptionDetail)
}
export {}
