const gentlyCopy = require('gently-copy')

const destDir = process.env.INIT_CWD
gentlyCopy(['.stories'], destDir, { overwrite: false })
// gentlyCopy(['store/nuxt-stories.js'], destDir, { overwrite: true })
