import I18n from '../../utils/I18n'

export default I18n({
    ja: {
        fields: {
            compositionName: 'コンポジション名',
            dimensions: '解像度(px)',
            backgroundColor: '背景色',
            framerate: 'フレームレート',
            durationSec: '時間 (秒)',
            samplingRate: 'サンプリングレート',
            audioChannels: 'チャンネル数',
        },
        values: {
            audioChannels: {
                stereo: 'ステレオ(2ch)',
                mono: 'モノラル(1ch)',
            },
        },
        cancel: 'キャンセル',
        apply: '適用',
        create: '作成',
    },
    en: {
        fields: {
            compositionName: 'Composition Name',
            dimensions: 'Resolution(px)',
            backgroundColor: 'Background Color',
            framerate: 'Framerate',
            durationSec: 'Duration (sec)',
            samplingRate: 'Sampling rate',
            audioChannels: 'Audio Channels',
        },
        values: {
            audioChannels: {
                stereo: 'Stereo (2ch)',
                mono: 'Mono (1ch)',
            },
        },
        cancel: 'Cancel',
        apply: 'Apply',
        create: 'Create',
    },
})
