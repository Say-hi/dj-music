import config from './config'

export function getSinger () {
  return config.axios.get(`${config.baseUrl}/artist/list?type=-1&area=7&limit=100`)
}

export function getSingerDetail (id) {
  return config.axios.get(`${config.baseUrl}/artists?id=${id}`)
}
export function getSongLyric (id) {
  return config.axios.get(`${config.baseUrl}/lyric?id=${id}`)
}