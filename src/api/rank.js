import config from './config'

export function getTopList () {
  return config.axios.get(`${config.baseUrl}/toplist/detail`)
}

export function getTopListDetail (id) {
  return config.axios.get(`${config.baseUrl}/playlist/detail?id=${id}`)
}
