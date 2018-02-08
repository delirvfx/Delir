import FrameContext from 'Engine/FrameContext'

export interface Work {
    work(ctx: FrameContext): Promise<void>
}
