import fs from 'fs'
import path from 'path'

const srcDir = path.resolve('.')
const tmplDir = path.resolve('./lib/templates')

export default function genTest({
  framework = 'ava',
  componentDir = '#root/components',
  name
}) {
  const tmpl = fs.readFileSync(`${tmplDir}/vueTest.${framework}.tmpl`, { encoding: 'utf-8' })
  const test = {
    file: path.resolve(`${srcDir}/test/e2e/${name}.js`),
    contents: tmpl
      .replace(/\[ComponentDir\]/g, componentDir)
      .replace(/\[Component\]/g, name)
  }

  fs.writeFileSync(test.file, test.contents)
}

genTest({
  componentDir: '#root/lib/components',
  name: 'ModeSelect'
})