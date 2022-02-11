import { readFileSync, writeFileSync } from 'fs'
import { resolve } from 'path'

// global.__dirname = './lib/io' // TBD
const dfltPath = resolve(__dirname, '../assets/css/appliedStyles.css')

function toStyleJson (str) {
  return str.split(/\s*;\s*/)
    .reduce((out, pair) => {
      if (pair !== '') {
        const [key, val] = pair.split(/\s*:\s*/)
        out[key] = val
      }
      return out
    }, {})
}

function cssToJson (css) {
  const blocks = css.match(/[#.][^{]+\{[^}]+\}/g)
  return blocks.reduce((out, block) => {
    const parts = block.split(/\s*{/)
    const key = parts[0]
    const val = parts[1].split(/s*}/)[0].trim()
    out[key] = toStyleJson(val)
    return out
  }, {})
}

function fromStyleJson (json) {
  return Object.entries(json)
    .reduce((out, [key, val]) => {
      if (val) {
        out += `${key}: ${val};\r\n`
      }
      return out
    }, '')
}

function jsonToCss (json) {
  return Object.entries(json)
    .reduce((out, [key, val]) => {
      const useVal = fromStyleJson(val)
        .trim().replace(/(.+:)/g, '  $1')
      out += `${key} {\r\n${useVal}\r\n}\r\n`
      return out
    }, '')
}

export default function Svc () {
  const svc = {
    loadStyles (path = dfltPath) {
      return cssToJson(readFileSync(path, { encoding: 'utf-8' }))
    },
    updateStyle ({ selector, style, path = dfltPath }) {
      const styles = svc.loadStyles(path)
      if (styles[selector]) {
        Object.assign(styles[selector], style)
      } else {
        styles[selector] = style
      }
      svc.saveStyles(styles, path)
    },
    saveStyles (json, path = dfltPath) {
      writeFileSync(path, jsonToCss(json))
    }
  }
  return svc
}
