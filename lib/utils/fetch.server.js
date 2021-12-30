import nodeFetch from 'node-fetch'
import Fetch, { useParsers } from './fetch.js'

global.fetch = nodeFetch

useParsers(['csv', 'xml'])

export default Fetch
