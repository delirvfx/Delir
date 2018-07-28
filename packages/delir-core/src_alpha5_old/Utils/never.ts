export default function never(): never {
    throw new Error('Reached the code which should not be reached')
}
