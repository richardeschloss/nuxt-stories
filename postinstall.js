const gentlyCopy = require('gently-copy')

const destDir = process.env.INIT_CWD
gentlyCopy(['.stories'], destDir, { overwrite: false })
