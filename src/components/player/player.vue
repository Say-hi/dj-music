<template>
  <div class="player" v-show='playList.length > 0'>
    <transition name='normal' @enter='enter' @after-enter='afterEnter' @leave='leave' @after-leave='afterLeave'>
      <div class="normal-player" v-show='fullScreen'>
        <div class="background">
          <img width='100%' height="100%" :src='currentSong.image'>
        </div>
        <div class="top">
          <div class="back" @click="back">
            <i class="icon-back"></i>
          </div>
          <h1 class="title" v-html='currentSong.name'></h1>
          <h2 class="subtitle" v-html='currentSong.singer'></h2>
        </div>
        <div class="middle" @touchmove.prevent='middleTouchMove' @touchend='middleTouchEnd' @touchstart.prevent='middleTouchStart'>
          <div class="middle-l" ref='middleL'>
            <div class="cd-wrapper" ref='cdWrapper'>
              <div class="cd" :class='cdCls'>
                <img class="image" :src='currentSong.image'>
              </div>
            </div>
          </div>
          <scroll class="middle-r" ref='lyricList' :data='currentLyric && currentLyric.lines'>
            <div class="lyric-wrapper">
              <div v-if='currentLyric'>
                <p class="text" :class="{'current': currentLineIndex == index}" ref='lyricLine' v-for='(line, index) in currentLyric.lines' :key='line.time'>{{ line.txt }}</p>
              </div>
            </div>
          </scroll>
        </div>
        <div class="bottom">
          <div class="dot-wrapper">
            <span :class="{'active': currentShow === 'cd'}" class="dot"></span>
            <span :class="{'active': currentShow === 'lyric'}" class="dot"></span>
          </div>
          <div class="progress-wrapper">
            <span class="time time-l">{{format(currentTime)}}</span>
            <div class="progress-bar-wrapper">
              <progress-bar :percent='percent' @percentChange='onProgressBarChange'></progress-bar>
            </div>
            <span class="time time-r">{{format(currentSong.duration)}}</span>
          </div>
          <div class="operators">
            <div class="icon i-left">
              <i @click="changeMode" :class="iconMode"></i>
            </div>
            <div class="icon i-left" :class='disableCls'>
              <i @click="prev" class="icon-prev"></i>
            </div>
            <div class="icon i-center" :class='disableCls'>
              <i @click="togglePlaying" :class="playIcon"></i>
            </div>
            <div class="icon i-right" :class='disableCls'>
              <i @click="next" class="icon-next"></i>
            </div>
            <div class="icon i-right">
              <i class="icon icon-not-favorite"></i>
            </div>
          </div>
        </div>
      </div>
    </transition>
    <transition name='mini'>
      <div @click='open' class="mini-player" v-show='!fullScreen'>
        <div class="icon" >
          <img :class='cdCls' width='40' height='40' :src='currentSong.image'>
        </div>
        <div class="text">
          <h2 class="name" v-html='currentSong.name'></h2>
          <p class="desc" v-html='currentSong.singer'></p>
        </div>
        <div class="control">
          <progress-circle :radius='radius' :percent='percent'>
            <i @click.stop="togglePlaying" class='icon-mini' :class="miniIcon"></i>
          </progress-circle>
        </div>
        <div class="control">
          <i class="icon-playlist"></i>
        </div>
      </div>
    </transition>
    <audio @timeupdate="updateTime" ref='audio' @ended="end" @canplay="ready" @error='error' :src="currentSong.url"></audio>
    <div v-if='noPlay' class="no-play">
      <span class='no-play-text'>因受版权方的保护，该歌曲咱不能提供免费播放.为您切换下一首歌曲</span>
    </div>
  </div>
</template>

<script>
import {mapGetters, mapMutations} from 'vuex'
import animations from 'create-keyframe-animation'
import {prefixStyle} from 'common/js/dom'
import ProgressBar from 'base/progress-bar/progress-bar'
import ProgressCircle from 'base/progress-circle/progress-circle'
import {playMode} from 'common/js/config'
import {shuffle} from 'common/js/util'
import Scroll from 'base/scroll/scroll'
// import Lyric from 'lyric-parser'
import Lyric from 'common/js/lyric'
const transform = prefixStyle('transform')
const transitionDuration = prefixStyle('transitionDuration')
export default {
  data () {
    return {
      songReady: false,
      currentTime: 0,
      radius: 32,
      currentLyric: null,
      currentLineIndex: 0,
      currentShow: 'cd',
      noPlay: false
    }
  },
  components: {
    ProgressBar,
    ProgressCircle,
    Scroll
  },
  computed: {
    ...mapGetters([
      'fullScreen',
      'playList',
      'currentSong',
      'playing',
      'currentIndex',
      'mode',
      'sequenceList'
    ]),
    iconMode () {
      return this.mode === playMode.sequence ? 'icon-sequence' : this.mode === playMode.loop ? 'icon-loop' : 'icon-random'
    },
    percent () {
      return this.currentTime / this.currentSong.duration
    },
    cdCls () {
      return this.playing ? 'play' : 'play pause'
    },
    playIcon() {
      return this.playing ? 'icon-pause' : 'icon-play'
    },
    miniIcon () {
      return this.playing ? 'icon-pause-mini' : 'icon-play-mini'
    },
    disableCls () {
      return this.songReady ? '' : 'disable'
    }
  },
  methods: {
    ...mapMutations({
      setFullScreen: 'SET_FULL_SCREEN',
      setPlayingState: 'SET_PLAYING_STATE',
      setCurrentIndex: 'SET_CURRENT_INDEX',
      setPlayList: 'SET_PLAY_LIST',
      setPlayMode: 'SET_PLAY_MODE'
    }),
    middleTouchStart(e) {
      // console.log('start', e)
      this.touch.initiated = false
      const touch = e.touches[0]
      this.touch.startX = touch.pageX
      this.touch.startY = touch.pageY
    },
    middleTouchMove(e) {
      // console.log('move', e)
      this.touch.initiated = true
      if (!this.touch.initiated) return
      const touch = e.touches[0]
      const deltaX = touch.pageX - this.touch.startX
      const deltaY = touch.pageY - this.touch.startY
      if (Math.abs(deltaY) > Math.abs(deltaX)) return
      const left = this.currentShow === 'cd' ? 0 : -window.innerWidth
      const offsetWidth = Math.min(0, Math.max(-window.innerWidth, left + deltaX))
      this.touch.percent = Math.abs(offsetWidth / window.innerWidth)
      this.$refs.lyricList.$el.style[transform] = `translate3d(${offsetWidth}px, 0, 0)`
      this.$refs.lyricList.$el.style[transitionDuration] = '0'
      this.$refs.middleL.style.opacity = 1 - this.touch.percent
      this.$refs.middleL.style[transitionDuration] = '0'
    },
    middleTouchEnd(e) {
      if (!this.touch.initiated) return
      // console.log('end', e)
      let offsetWidth = 0
      let opacity = 0
      if (this.currentShow === 'cd') {
        if (this.touch.percent > 0.1) {
          offsetWidth = -window.innerWidth
          opacity = 0
          this.currentShow = 'lyric'
        } else {
          offsetWidth = 0
          opacity = 1
        }
      } else {
        if (this.touch.percent < 0.9) {
          offsetWidth = 0
          this.currentShow = 'cd'
          opacity = 1
        } else {
          offsetWidth = -window.innerWidth
          opacity = 0
        }
      }
      this.$refs.lyricList.$el.style[transform] = `translate3d(${offsetWidth}px, 0, 0)`
      this.$refs.lyricList.$el.style[transitionDuration] = '300ms'
      this.$refs.middleL.style[transitionDuration] = '300ms'
      this.$refs.middleL.style.opacity = opacity
    },
    currentNum () {
      let that = this
      let time = this.currentTime * 1000
      let timeArr = this.currentLyric.lines
      timeArr.find((item, index) => {
        if (time >= item.time && time < (timeArr[index + 1] ? timeArr[index + 1].time : 99999999)) {
          that.currentLineIndex = index
        }
      })
    },
    end () {
      if (this.mode === playMode.loop) {
        this.loop()
      } else {
        this.next()
      }
    },
    loop() {
      this.$refs.audio.currentTime = 0
      this.$refs.audio.play()
    },
    changeMode () {
      const mode = (this.mode + 1) % 3
      this.setPlayMode(mode)
      let list = null
      if (mode === playMode.random) {
        list = shuffle(this.sequenceList)
      } else {
        list = this.sequenceList
      }
      this._resetCurrentIndex(list)
      this.setPlayList(list)
    },
    _resetCurrentIndex (list) {
      let index = list.findIndex(item => {
        return item.id === this.currentSong.id
      })
      this.setCurrentIndex(index)
    },
    onProgressBarChange (percent) {
      // console.log(this.currentSong.duration * percent)
      this.$refs.audio.currentTime = this.currentSong.duration * percent
      if (!this.playing) this.togglePlaying()
    },
    format (interval) {
      interval = interval | 0 // 向下取整
      const minute = this._pad(interval / 60 | 0)
      const second = this._pad(interval % 60)
      return `${minute}:${second}`
    },
    _pad (num, n = 2) {
      let len = num.toString().length
      while (len < n) {
        num = '0' + num
        len++
      }
      return num
    },
    updateTime (e) {
      // console.log(e)
      this.currentTime = e.target.currentTime
      this.currentNum()
    },
    ready () {
      this.songReady = true
      this.noPlay = false
    },
    error () {
      this.songReady = true
      this.noPlay = true
      setTimeout(() => {
        this.next()
      }, 1000)
    },
    next () {
      if (!this.songReady) return
      let index = this.currentIndex + 1
      if (index === this.playList.length) {
        index = 0
      }
      this.setCurrentIndex(index)
      if (!this.playing) {
        this.togglePlaying()
      }
      this.songReady = false
    },
    prev () {
      if (!this.songReady) return
      let index = this.currentIndex - 1
      if (index === -1) {
        index = this.playList.length - 1
      }
      this.setCurrentIndex(index)
      if (!this.playing) {
        this.togglePlaying()
      }
      this.songReady = false
    },
    togglePlaying () {
      this.setPlayingState(!this.playing)
    },
    back () {
      this.setFullScreen(false)
    },
    open () {
      this.setFullScreen(true)
    },
    enter(el, done) {
      const {x, y, scale} = this._getPosAndScale()
      let animation = {
        0: {
          transform: `translate3d(${x}px, ${y}px, 0) scale(${scale})`
        },
        60: {
          transform: `translate3d(0, 0, 0) scale(1.1)`
        },
        100: {
          transform: `translate3d(0, 0, 0) scale(1)`
        }
      }
      animations.registerAnimation({
        name: 'move',
        animation,
        presets: {
          duration: 400,
          easing: 'linear'
        }
      })
      animations.runAnimation(this.$refs.cdWrapper, 'move', done)
    },
    afterEnter() {
      animations.unregisterAnimation('move')
      this.$refs.cdWrapper.style.animation = ''
    },
    leave (el, done) {
      this.$refs.cdWrapper.style.transition = `all 0.4s`
      const {x, y, scale} = this._getPosAndScale()
      this.$refs.cdWrapper.style[transform] = `translate3d(${x}px, ${y}px, 0) scale(${scale})`
      this.$refs.cdWrapper.addEventListener('transitionend', done)
    },
    afterLeave() {
      this.$refs.cdWrapper.style.transition = ''
      this.$refs.cdWrapper.style[transform] = ''
    },
    _getPosAndScale() {
      const targetWidth = 40
      const paddingLeft = 40
      const paddingBottom = 30
      const paddingTop = 80
      const width = window.innerWidth * 0.8
      const scale = targetWidth / width
      const x = -(window.innerWidth / 2 - paddingLeft)
      const y = window.innerHeight - paddingTop - width / 2 - paddingBottom
      return {
        x,
        y,
        scale
      }
    },
    async getLyric () {
      let lyric = await this.currentSong.getLyric()
      this.currentLyric = new Lyric(lyric.data.lrc.lyric)
    }
  },
  watch: {
    currentLineIndex (newVal, oldVal) {
      if (newVal === oldVal) return
      if (newVal > 6) {
        let lineEl = this.$refs.lyricLine[newVal - 6]
        this.$refs.lyricList.scrollToElement(lineEl, 1000)
      } else {
        this.$refs.lyricList.scrollTo(0, 0, 1000)
      }
    },
    async currentSong (newSong, oldSong) {
      if (newSong.id !== oldSong.id) {
        if (!newSong.pl) {
          this.songReady = true
          return this.next()
        }
        this.$nextTick(() => { this.$refs.audio.play() })
        this.getLyric()
      }
    },
    playing(newVal) {
      const audio = this.$refs.audio
      this.$nextTick(() => {
        newVal ? audio.play() : audio.pause()
      })
    }
  },
  created() {
    this.touch = {}
  }
}
</script>

<style scoped lang='stylus'>
@import "~common/stylus/variable"
@import "~common/stylus/mixin"
  .no-play
    position fixed
    top 40px
    left 0
    bottom 0
    right 0
    text-align center
    font-size 30px
    font-weight 700
    color #0094ff
    background rgba(0,0,0,0.5)
    z-index 151
    .no-play-text
      position absolute
      width 90%
      line-height 40px
      top 50%
      left 50%
      transform translate(-50%, -50%)
  .player
    .normal-player
      position: fixed
      left: 0
      right: 0
      top: 0
      bottom: 0
      z-index: 150
      background: $color-background
      .background
        position: absolute
        left: 0
        top: 0
        width: 100%
        height: 100%
        z-index: -1
        opacity: 0.6
        filter: blur(20px)
      .top
        position: relative
        margin-bottom: 25px
        .back
          position absolute
          top: 0
          left: 6px
          z-index: 50
          .icon-back
            display: block
            padding: 9px
            font-size: $font-size-large-x
            color: $color-theme
            transform: rotate(-90deg)
        .title
          width: 70%
          margin: 0 auto
          line-height: 40px
          text-align: center
          no-wrap()
          font-size: $font-size-large
          color: $color-text
        .subtitle
          line-height: 20px
          text-align: center
          font-size: $font-size-medium
          color: $color-text
      .middle
        position: fixed
        width: 100%
        top: 80px
        bottom: 170px
        white-space: nowrap
        font-size: 0
        .middle-l
          display: inline-block
          vertical-align: top
          position: relative
          width: 100%
          height: 0
          padding-top: 80%
          .cd-wrapper
            position: absolute
            left: 10%
            top: 0
            width: 80%
            box-sizing: border-box
            height: 100%
            .cd
              width: 100%
              height: 100%
              border-radius: 50%
              .image
                position: absolute
                left: 0
                top: 0
                width: 100%
                height: 100%
                box-sizing: border-box
                border-radius: 50%
                border: 10px solid rgba(255, 255, 255, 0.1)
            .play
              animation: rotate 20s linear infinite
            .pause
              animation-play-state: paused
          .playing-lyric-wrapper
            width: 80%
            margin: 30px auto 0 auto
            overflow: hidden
            text-align: center
            .playing-lyric
              height: 20px
              line-height: 20px
              font-size: $font-size-medium
              color: $color-text-l
        .middle-r
          display: inline-block
          vertical-align: top
          width: 100%
          height: 100%
          overflow: hidden
          .lyric-wrapper
            width: 80%
            margin: 0 auto
            overflow: hidden
            text-align: center
            .text
              line-height: 32px
              color: $color-text-l
              font-size: $font-size-medium
              &.current
                color: $color-text
            .pure-music
              padding-top: 50%
              line-height: 32px
              color: $color-text-l
              font-size: $font-size-medium
      .bottom
        position: absolute
        bottom: 50px
        width: 100%
        .dot-wrapper
          text-align: center
          font-size: 0
          .dot
            display: inline-block
            vertical-align: middle
            margin: 0 4px
            width: 8px
            height: 8px
            border-radius: 50%
            background: $color-text-l
            &.active
              width: 20px
              border-radius: 5px
              background: $color-text-ll
        .progress-wrapper
          display: flex
          align-items: center
          width: 80%
          margin: 0px auto
          padding: 10px 0
          .time
            color: $color-text
            font-size: $font-size-small
            flex: 0 0 30px
            line-height: 30px
            width: 30px
            &.time-l
              margin-right: 10px
              text-align: left
            &.time-r
              margin-left: 10px
              text-align: right
          .progress-bar-wrapper
            flex: 1
        .operators
          display: flex
          align-items: center
          .icon
            flex: 1
            color: $color-theme
            &.disable
              color: $color-theme-d
            i
              font-size: 30px
          .i-left
            text-align: right
          .i-center
            padding: 0 20px
            text-align: center
            i
              font-size: 40px
          .i-right
            text-align: left
          .icon-favorite
            color: $color-sub-theme
      &.normal-enter-active, &.normal-leave-active
        transition: all 0.4s
        .top, .bottom
          transition: all 0.4s cubic-bezier(0.86, 0.18, 0.82, 1.32)
      &.normal-enter, &.normal-leave-to
        opacity: 0
        .top
          transform: translate3d(0, -100px, 0)
        .bottom
          transform: translate3d(0, 100px, 0)
    .mini-player
      display: flex
      align-items: center
      position: fixed
      left: 0
      bottom: 0
      z-index: 180
      width: 100%
      height: 60px
      background: $color-highlight-background
      &.mini-enter-active, &.mini-leave-active
        transition: all 0.4s
      &.mini-enter, &.mini-leave-to
        opacity: 0
      .icon
        flex: 0 0 40px
        width: 40px
        height: 40px
        padding: 0 10px 0 20px
        .imgWrapper
          height: 100%
          width: 100%
        img
          border-radius: 50%
          &.play
            animation: rotate 10s linear infinite
          &.pause
            animation-play-state: paused  // 动画暂停
      .text
        display: flex
        flex-direction: column
        justify-content: center
        flex: 1
        line-height: 20px
        overflow: hidden
        .name
          margin-bottom: 2px
          no-wrap()
          font-size: $font-size-medium
          color: $color-text
        .desc
          no-wrap()
          font-size: $font-size-small
          color: $color-text-d
      .control
        flex: 0 0 30px
        width: 30px
        padding: 0 10px
        .icon-play-mini, .icon-pause-mini, .icon-playlist
          font-size: 30px
          color: $color-theme-d
        .icon-mini
          font-size: 32px
          position: absolute
          left: 0
          top: 0
  @keyframes rotate
    0%
      transform: rotate(0)
    100%
      transform: rotate(360deg)
</style>
