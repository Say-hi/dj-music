<template>
  <scroll class="suggest" :data='result' :pullup='pullup' :beforeScroll='beforeScroll' @beforeScroll='listScroll' @scrollToEnd='searchMore' ref='suggest'>
    <ul class="suggest-list">
      <li @click="selectItem(item)" class="suggest-item" v-for='item in result' :key='item.id'>
        <div class="icon">
          <i :class='getIconCls(item)'></i>
        </div>
        <div class="name">
          <p class="text">{{ item.name }}</p>
        </div>
      </li>
      <loading v-show='loading' title=''></loading>
    </ul>
  </scroll>
</template>

<script>
import {getSearch} from 'api/search'
import {createSong} from 'common/js/song'
import Scroll from 'base/scroll/scroll'
import {mapMutations, mapActions} from 'vuex'
export default {
  components: {
    Scroll
  },
  props: {
    query: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      page: 0,
      result: [],
      pullup: true,
      hasMore: true,
      loading: true,
      beforeScroll: true
    }
  },
  methods: {
    ...mapMutations({
      setSinger: 'SET_SINGER'
    }),
    ...mapActions([
      'insertSong'
    ]),
    listScroll () {
      this.$emit('listScroll')
    },
    selectItem (item) {
      if (item.type === 'singer') {
        this.$router.push({
          path: `/search/${item.id}`
        }).catch(() => {})
        this.setSinger(item)
      } else {
        this.insertSong(item)
      }
      this.$emit('select')
    },
    getIconCls (item) {
      if (item.type === 'singer') {
        return 'icon-mine'
      } else {
        return 'icon-music'
      }
    },
    async search () {
      this.hasMore = true
      let res = await getSearch(this.query, this.page++, this.page <= 1)
      if (res.songs.length < 30 || !res.songs) this.hasMore = false
      this.result = this.result.concat(this._genResult(res))
    },
    searchMore () {
      if (!this.hasMore) { this.loading = false } else {
        this.search()
      }
    },
    _genResult (data) {
      let ret = []
      if (data.singer) {
        ret.push({
          ...data.singer[0],
          type: 'singer'
        })
      }
      return ret.concat(this._normalizeSongs(data.songs))
    },
    _normalizeSongs (list) {
      // console.log(list)
      let ret = []
      list.forEach(item => {
        if (item.id && item.album.id) {
          ret.push(createSong(item))
        }
      })
      return ret
    }
  },
  watch: {
    query (newQuery) {
      if (!newQuery) {
        return
      }
      this.page = 0
      this.loading = true
      this.result = []
      this.$refs.suggest.scrollTo(0, 0)
      this.search()
    }
  }
}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"
  .suggest
    height: 100%
    overflow: hidden
    .suggest-list
      padding: 0 30px
      .suggest-item
        display: flex
        align-items: center
        padding-bottom: 20px
      .icon
        flex: 0 0 30px
        width: 30px
        [class^="icon-"]
          font-size: 14px
          color: $color-text-d
      .name
        flex: 1
        font-size: $font-size-medium
        color: $color-text-d
        overflow: hidden
        .text
          no-wrap()
    .no-result-wrapper
      position: absolute
      width: 100%
      top: 50%
      transform: translateY(-50%)
</style>
