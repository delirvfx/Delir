const assert = b => {
    if (b === false) throw 'Assertion failed'
}
assert(typeof console.log === 'function')
assert(typeof Math.abs === 'function')
assert(typeof Array === 'function')
assert(typeof Date === 'function')
