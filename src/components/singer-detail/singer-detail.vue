<template>
  <music-list :title="title" :bg-image='bgImage' :songs='songs'></music-list>
</template>

<script>
import {mapGetters} from 'vuex'
import {getSingerDetail} from 'api/singer'
import {createSong} from 'common/js/song'
import MusicList from 'components/music-list/music-list'
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
    title () {
      return this.singer.name
    },
    bgImage () {
      return this.singer.picUrl
    },
    ...mapGetters([
      'singer'
    ])
  },
  async created () {
    if (!this.singer.id) {
      return this.$router.push('/singer')
    }
    let res = await getSingerDetail(this.singer.id)
    this.songs = this._normalizeSongs(res.data.hotSongs)
  },
  methods: {
    _normalizeSongs(list) {
      let ret = []
      list.forEach(item => {
        ret.push(createSong(item))
      })
      return ret
    }
  }
}
</script>

<style scoped lang='stylus'>
@import '~common/stylus/variable';
.slide-enter-active, .slide-leave-active
  transition all 0.3s
.slide-enter, .slide-leave-to
  transform translate3d(100%, 0, 0)
  // opacity 0
</style>