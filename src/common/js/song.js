import {getSongLyric} from 'api/singer'
export default class Song {
  constructor({id, mid, singer, name, album, duration, image, url, pl}) {
    this.id = id
    this.mid = mid
    this.singer = singer
    this.name = name
    this.album = album
    this.duration = duration
    this.image = image
    this.url = url
    this.pl = pl
  }
  getLyric () {
    return getSongLyric(this.id)
  }
}

export function createSong(musicData) {
  return new Song({
    id: musicData.id,
    mid: musicData.al.id,
    singer: filterSinger(musicData.ar),
    name: musicData.name,
    album: musicData.al.name,
    duration: musicData.dt / 1000,
    image: musicData.al.picUrl,
    pl: musicData.privilege ? musicData.privilege.pl : 12800,
    url: `https://music.163.com/song/media/outer/url?id=${musicData.id}.mp3`
  })
}

function filterSinger(singer) {
  let ret = []
  if (!singer) {
    return ''
  }
  singer.forEach((s) => {
    ret.push(s.name)
  })
  return ret.join('/')
}
