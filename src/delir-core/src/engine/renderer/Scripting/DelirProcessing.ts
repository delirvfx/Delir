import 'processing-js'

const Processing: typeof ProcessingJS.Processing = (global as any).Processing
const originalLoadImage = Processing.prototype.loadImage
// delete (global as any).Processing

Object.assign(Processing.prototype, {
    // loadImage(path: string, ext: string, callback?: () => void)
    // {
    //     console.log(this)
    //     originalLoadImage.call(this, 'file:///Users/ragg/Desktop/スクリーンショット\ 2017-11-08\ 22.55.46.png', ext, callback)
    // }
})

// class DelirProcessing extends Processing {}

console.dir(Processing)

// ;(global as any).Processing = DelirProcessing
export default Processing
