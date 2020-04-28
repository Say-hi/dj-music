let timeREG = /\[(\d{2,}):(\d{2})(?:\.(\d{2,3}))?]/g
export default class Lyric {
  constructor(lyric, handle) {
    this.lyric = lyric
    this.handle = handle || function () {}
    this.lyricArr = []
    this.lines = []
    this._init()
  }
  _init () {
    // 生成歌词数组
    this.lyricArr = this.lyric.split('\n')
    this.lyricArr.map(item => {
      let timeArr = item.match(timeREG)
      if (timeArr) {
        let txt = item.replace(timeREG, '')
        for (let v of timeArr) {
          this.lines.push({
            time: this._calculateTime(v),
            txt
          })
        }
      }
    })
    this.lines.sort((a, b) => a.time - b.time)
  }
  _createTimeStr(time) {
    // 创建时间字符串
    let str = time.replace(/[[,\]]/g, '')
    return str
  }
  _calculateTime(timeStr) {
    // 计算返回毫秒数
    let str = this._createTimeStr(timeStr)
    let temp1 = str.split('.')
    let temp2 = temp1[0].split(':')
    let m = temp2[0] * 60 * 1000
    let s = temp2[1] * 1000
    let ms = ('0.' + temp1[1]) * 1000
    return m + s + ms
  }
}
