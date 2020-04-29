<template>
  <transition name='slide'>
    <music-list :title='title' :bg-image='bgImage' :songs='songs' :rank='rank'></music-list>
  </transition>
</template>

<script>
import MusicList from 'components/music-list/music-list'
import {mapGetters} from 'vuex'
import {getTopListDetail} from 'api/rank'
import {createSong} from 'common/js/song'
export default {
  data () {
    return {
      songs: [],
      rank: true
    }
  },
  components: {
    MusicList
  },
  computed: {
    title () {
      return this.topList.name
    },
    bgImage () {
      return this.topList.coverImgUrl
    },
    ...mapGetters([
      'topList'
    ])
  },
  methods: {
    _getSongList () {
      getTopListDetail(this.topList.id).then(res => {
        this.songs = this._normalizeSongs(res.data.playlist.tracks)
      })
    },
    _normalizeSongs(list) {
      let ret = []
      list.forEach(item => {
        ret.push(createSong(item))
      })
      return ret
    }
  },
  async created () {
    this._getSongList()
  }
}
</script>

<style lang='stylus' scoped>
.slide-enter-active, .slide-leave-active
  transition all 0.3s ease
.slide-enter, .slide-leave-to
  transform translate3d(100%, 0, 0)
</style>
