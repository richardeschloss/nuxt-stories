// import DOMPurify from 'dompurify' // TBD: re-add. Since we compile vue on-the-fly, sanitizing will break that. (may be ok since it's a dev-only tool).
import { marked } from 'marked'

import hljs from 'highlight.js'
import hljsJavascript from 'highlight.js/lib/languages/javascript'
import matter from 'gray-matter'

hljs.registerLanguage('javascript', hljsJavascript)

const renderer = new marked.Renderer()

// Renderer Overrides:
Object.assign(
  renderer,
  {
    code (code, language) {
      const validLanguage = hljs.getLanguage(language) ? language : 'plaintext'
      const { value: codeBlock } = hljs.highlight(code, { language: validLanguage })
      return `<pre><code class="${language} hljs">${codeBlock}</code></pre>`
    },
    table (header, body) {
      const hdr = header
        .replace(/align="center"/g, 'style="text-align: center;"')
        .replace(/align="right"/g, 'style="text-align: right;"')
      return `<table class="table table-striped">${hdr}${body}</table>`
    }
  }
)

const mdOptions = {
  renderer
}

const Markdown = {
  parseTOC (tokens) {
    const hdrs = tokens
      .filter(({ type, depth }) => type === 'heading' && depth <= 3)
      .map((hdr) => {
        hdr.href = '#' + hdr.text.toLowerCase()
          .replace(/[!@#$%^&*()_+\/\\\,\.\<\>\~\`\=\:\:\'\"\?\{\}]/g, '')
          .replace(/ /g, '-')
        return hdr
      })
    return hdrs
  },
  parse (input) {
    let parsedMatter
    try {
      parsedMatter = matter(input)
    } catch (err) {
      parsedMatter = { content: input, data: {} }
    }
    const { content, data: frontMatter } = parsedMatter
    const lexer = new marked.Lexer()
    const md = content
    const tokens = lexer.lex(md)
    const toc = Markdown.parseTOC(tokens)
    const compiled = marked(md, mdOptions)
    // const compiled = DOMPurify.sanitize(marked(md, mdOptions))
    return { toc, md, compiled, frontMatter }
  }
}

export default Markdown
