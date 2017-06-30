const frame = document.createElement('iframe')
frame.src = './monaco-loader.html'
frame.setAttribute('sandbox', 'allow-scripts allow-same-origin')
frame.style.display = 'none'
frame.onload = () => {
    const observer: MutationObserver = new frame.contentWindow.MutationObserver((mutations: MutationRecord[]) => {
        mutations.forEach(m => {
            if (m.type !== 'childList') return;

            m.addedNodes.forEach(node => {
                console.log(node)
                document.head.appendChild(node.cloneNode())
            })
        })
    })

    observer.observe(frame.contentDocument.head, {
        childList: true
    })

    // setTimeout(() => {
    //     const styles = frame.contentDocument.querySelectorAll('style,link[rel="stylesheet"]');
    //     console.log(styles)
    //     styles.forEach(el => {
    //         document.head.appendChild(el.cloneNode())
    //     })
    // }, 100)
    Object.assign(monaco, frame.contentWindow.monaco)
}
document.body.appendChild(frame)

let monaco = {}
export default monaco;
