import config from './config'

export async function getRecommend () {
  let res = await config.axios.get(`${config.baseUrl}/banner?type=2`)
  return res
}

export function getDiscList () {
  return config.axios.get(`${config.baseUrl}/top/playlist`)
}

export function getDiscDetail (id) {
  return config.axios.get(`${config.baseUrl}/playlist/detail?id=${id}`)
}