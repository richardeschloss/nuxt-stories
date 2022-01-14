import nodeFetch from 'node-fetch'
import Fetch from './fetch.js'

global.fetch = nodeFetch

export default Fetch
