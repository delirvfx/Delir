export const selectFile = async ({
  extensions,
  directory,
  multiple,
}: {
  extensions?: string[]
  directory?: boolean
  multiple?: boolean
} = {}): Promise<File[]> => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = (extensions || []).map(ext => `.${ext}`).join(',')
  input.multiple = !!multiple
  if (directory) input.setAttribute('webkitDirectory', '')

  return new Promise(resolve => {
    const resolveCallback = () => {
      resolve([...input.files!])
    }

    input.addEventListener('change', resolveCallback, { once: true })

    input.focus()
    input.click()
  })
}
