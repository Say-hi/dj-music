<template>
  <div class="singer" ref='singer'>
    <loading v-if='!singers.length'></loading>
    <list-view ref='listView' @select='selectSinger' :data='singers'></list-view>
    <transition name='slide'>
      <router-view></router-view>
    </transition>
  </div>
</template>

<script>
import {getSinger} from 'api/singer'
import pinyin from 'js-pinyin'
import ListView from 'base/listview/listview'
import {mapMutations} from 'vuex'
import {playlistMixin} from 'common/js/mixin'
// import Singer from 'common/js/singer'
const HOT_NAME = '热门'
const HOT_SINGER_NUM = 10
export default {
  mixins: [
    playlistMixin
  ],
  components: {
    ListView
  },
  data () {
    return {
      singers: []
    }
  },
  created() {
    this._getSingerList()
  },
  methods: {
    handlePlaylist (playList) {
      const bottom = playList.length > 0 ? '60px' : ''
      this.$refs.singer.style.bottom = bottom
      this.$refs.listView.refresh()
    },
    selectSinger (singer) {
      this.$router.push({
        path: `/singer/${singer.id}`
      }).catch(() => {})
      this.setSinger(singer)
    },
    async _getSingerList () {
      let res = await getSinger()
      res.data.artists.forEach(item => {
        item['Findex'] = pinyin.getFullChars(item.name).toUpperCase().substring(0, 1)
      })
      this.singers = this._normalizeSinger(res.data.artists)
    },
    _normalizeSinger (list) {
      let map = {
        hot: {
          title: HOT_NAME,
          items: []
        }
      }
      list.forEach((item, index) => {
        if (index < HOT_SINGER_NUM) {
          map.hot.items.push(item)
        }
        const key = item.Findex
        if (!map[key]) {
          map[key] = {
            title: key,
            items: []
          }
        }
        map[key].items.push(item)
      })
      let hot = []
      let ret = []
      for (let key in map) {
        let item = map[key]
        if (item.title.match(/[a-zA-Z]/)) {
          ret.push(item)
        } else if (item.title === HOT_NAME) {
          hot.push(item)
        }
      }
      ret.sort((a, b) => a.title.charCodeAt(0) - b.title.charCodeAt(0))
      return hot.concat(ret)
    },
    ...mapMutations({
      setSinger: 'SET_SINGER'
    })
  }
}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
.singer
    position: fixed
    top: 88px
    bottom: 0
    width: 100%
.slide-enter-active, .slide-leave-active
  transition all 0.3s
.slide-enter, .slide-leave-to
  transform translate3d(100%, 0, 0)
</style>