export default <T>(dest: T, ...sources: Partial<T>[]): T => Object.assign(dest as any, ...sources)
