// keymirrorのexportがModulesじゃない関係で
// declare書いてもうまく解決してくれなかったのでポリフィル…
export default function keyMirror<K>(keys: K): {[P in keyof K]: P} {
    const mirrored = Object.create(null)

    for (const key in keys) {
        if (keys.hasOwnProperty(key)) {
            mirrored[key] = key
        }
    }

    return mirrored
}