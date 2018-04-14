/**
 * Modify blow code for module.exports exporting
 * https://github.com/Connormiha/jest-css-modules-transform/blob/5d5eb7ec4f8599aed7d652b97659c57c8cfc1eba/src/index.js
 */
const pathSep = require('path').sep

let stylus
let sass
let less

const moduleTemplate = `
    "use strict";
    Object.defineProperty(exports, "__esModule", {
       value: true
    });
    module.exports = %s;
`

const REG_EXP_NAME_BREAK_CHAR = /[\s,.{/#[]/

const getCSSSelectors = (css, path) => {
  const end = css.length
  let i = 0
  let char
  let bracketsCount = 0
  const result = {}

  while (i < end) {
    if (i === -1) {
      throw Error(`Parse error ${path}`)
    }

    if (css.indexOf('/**', i) === i) {
      i = css.indexOf('*/', i + 3)
      continue
    }

    char = css[i]

    if (char === '{') {
      bracketsCount++
      i++
      continue
    }

    if (char === '}') {
      bracketsCount--
      i++
      continue
    }

    if (char === '"') {
      do {
        i = css.indexOf('"', i + 1)
      } while (css[i - 1] === '\\')
      i++
      continue
    }

    if (char === "'") {
      do {
        i = css.indexOf("'", i + 1)
      } while (css[i - 1] === '\\')
      i++
      continue
    }

    if (bracketsCount > 0) {
      i++
      continue
    }

    if (char === '.' || char === '#') {
      i++
      const startWord = i

      while (!REG_EXP_NAME_BREAK_CHAR.test(css[i])) {
        i++
      }
      const word = css.slice(startWord, i)
      result[word] = word
      continue
    }

    if (css.indexOf('@keyframes', i) === i) {
      i += 10
      while (REG_EXP_NAME_BREAK_CHAR.test(css[i])) {
        i++
      }

      const startWord = i
      while (!REG_EXP_NAME_BREAK_CHAR.test(css[i])) {
        i++
      }

      const word = css.slice(startWord, i)
      result[word] = word
      continue
    }

    i++
  }

  return result
}

module.exports = {
  process(src, path) {
    const filename = path.slice(path.lastIndexOf(pathSep) + 1)
    const extention = filename.slice(filename.lastIndexOf('.') + 1)
    let textCSS = src

    switch (extention) {
      case 'styl':
        stylus = stylus || require('stylus')
        stylus.render(src, { filename: path }, (err, css) => {
          if (err) {
            throw err
          }

          textCSS = css
        })

        break

      case 'sass':
      case 'scss':
        sass = sass || require('node-sass')
        textCSS = String(
          sass.renderSync({
            data: src,
            file: path,
            indentedSyntax: extention === 'sass'
          }).css
        )
        break

      case 'less':
        less = less || require('less')
        less.render(src, { filename: path }, (err, css) => {
          if (err) {
            throw err
          }

          textCSS = css.css
        })

        break
    }

    return moduleTemplate.replace(
      '%s',
      JSON.stringify(getCSSSelectors(textCSS, path))
    )
  }
}
