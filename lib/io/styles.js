import { writeFileSync } from 'fs'
import { resolve } from 'path'

function jsonToCss (json) {
  return Object.entries(json)
    .reduce((out, [key, val]) => {
      const useVal = val
        .trim().replace(/(.+:)/g, '  $1')
      out += `${key} {\r\n${useVal}\r\n}\r\n`
      return out
    }, '')
}

export default function Svc () {
  return {
    saveStyles (json, path = resolve(__dirname, '../assets/css/appliedStyles.css')) {
      writeFileSync(path, jsonToCss(json))
    }
  }
}
