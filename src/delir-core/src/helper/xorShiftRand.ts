// Thanks: https://sbfl.net/blog/2017/06/01/javascript-reproducible-random/

type Seeds = [number, number, number]

export const rand = ([s1, s2, s3]: Seeds) => {
    const t = s2 ^ (s2 << 11)
    const w = (s1 ^ (s1 >>> 19)) ^ (t ^ (t >>> 8))

    // シード値の大きさによって出現する値の範囲が偏るので
    // もう一度乱数を回す
    const x = s3
    const t2 = x ^ (x << 11)

    return (w ^ (w >>> 19)) ^ (t2 ^ (t2 >>> 8))
}

export const randIntRange = (min, max, seeds: Seeds = [0, 1, 2]) => {
    return min + (rand(seeds) % (max + 1 - min))
}

export const randFloat = (seeds: Seeds = [0, 1, 2], digits = 5) => {
    const max = 10 ** digits
    return randIntRange(0, max, seeds) / max
}
