// @flow
import PluginBase from './plugin-base.js'
import {
    InvalidPluginLoadedException
} from '../../exceptions/index'

export default class CustomLayerPluginBase extends PluginBase
{
    static pluginDidLoad()
    {
        const subClassName = this ? this.name : '<<do not known>>'
        throw new InvalidPluginLoadedException(`CustomLayer plugin class \`${subClassName}\` not implement \`static pluginDidLoad\` method`, {
            class: this,
        })
    }

    constructor()
    {
        super()
    }

    // MEMO: キャッシュが必要な（例えば音声ファイルなど）パラメータの変更を検知するためのAPI
    onDidParameterChanged(newParam, oldParam)
    {

    }

    // MEMO:
    // optionsは、そのレンダラがフレームをレンダリングするために必要とするパラメータのみが必要で
    // 変形やエフェクト・マスク処理のパラメータや、キーフレームやエクスプレッションなどは上位レイヤーで考慮すべき
    // 先フレーム予測などが必要なら別途APIを用意する
    // （パフォーマンスはよろしくないけど）
    render(options)
    {

    }
}
