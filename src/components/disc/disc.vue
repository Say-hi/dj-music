<template>
  <transition name='slide'>
    <music-list :title='title' :bg-image='bgImage' :songs='songs'></music-list>
  </transition>
</template>

<script>
import MusicList from 'components/music-list/music-list'
import {mapGetters} from 'vuex'
import { getDiscDetail } from 'api/recommend'
import {createSong} from 'common/js/song'
export default {
  data () {
    return {
      songs: []
    }
  },
  components: {
    MusicList
  },
  computed: {
    ...mapGetters([
      'disc'
    ]),
    title () {
      return this.disc.name
    },
    bgImage () {
      return this.disc.coverImgUrl
    }
  },
  methods: {
    _getSongList () {
      getDiscDetail(this.disc.id).then(res => {
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

<style scoped lang='stylus'>
.slide-enter-active, .slide-leave-active
  transition all 0.3s
.slide-enter, .slide-leave-to
  transform translate3d(100%,0,0)
</style>