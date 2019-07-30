import TypeScript from 'typescript'

export const compileTypeScript = (code: string, compilerOption: TypeScript.CompilerOptions = {}) => {
  const option: TypeScript.CompilerOptions = {
    target: TypeScript.ScriptTarget.ES2015,
    lib: ['es2015', 'es2016'],
    ...compilerOption,
  }

  return TypeScript.transpile(code, option)
}
