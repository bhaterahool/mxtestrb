import axios from 'axios'
import _ from 'lodash'
import { cacheAdapterEnhancer } from 'axios-extensions'
import config from './config'

export const api = axios.create({
  baseURL: '/maximo/oslc',
  adapter: cacheAdapterEnhancer(axios.defaults.adapter, {
    enabledByDefault: false,
    cacheFlag: 'useCache'
  })
})

