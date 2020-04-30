import config from './config'

export function getHotKey () {
  return config.axios.get(`${config.baseUrl}/search/hot`)
}
export async function getSearch (query, page = 0, zhida = true) {
  let songs = await config.axios.get(`${config.baseUrl}/search?keywords=${query}&offset=${page * 30}`)
  let singer = null
  if (zhida) {
    singer = await config.axios.get(`${config.baseUrl}/search?keywords=${query}&type=100`)
  }
  return {
    songs: songs.data.result.songs,
    singer: singer ? singer.data.result.artists : null
  }
}
