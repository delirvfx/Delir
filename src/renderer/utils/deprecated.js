export default function deprecated(target, name, descriptor) {
    if (typeof descriptor.value !== 'function') {
        throw new Error(`@deprecate only set to function`)
    }

    const original = descriptor.value
    descriptor.value = (...args) => {
        console.warn(`Deprecated method called ${target.constructor.name}#${name}`, target, original)
        return original(...args)
    }

    return descriptor
}
