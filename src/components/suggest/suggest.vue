<template>
  <div class="suggest">
    <ul class="suggest-list">
      <li class="suggest-item" v-for='item in result' :key='item.id'>
        <div class="icon">
          <i :class='getIconCls(item)'></i>
        </div>
        <div class="name">
          <p class="text">{{ item.name }}</p>
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
import {getSearch} from 'api/search'
export default {
  props: {
    query: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      page: 0,
      result: []
    }
  },
  methods: {
    getIconCls (item) {
      if (item.type === 'singer') {
        return 'icon-mine'
      } else {
        return 'icon-music'
      }
    },
    async search () {
      let res = await getSearch(this.query, this.page++, this.page <= 1)
      this.result = this._genResult(res)
    },
    _genResult (data) {
      let ret = []
      if (data.singer) {
        ret.push({
          ...data.singer[0],
          type: 'singer'
        })
      }
      return ret.concat(data.songs)
    }
  },
  watch: {
    query (newQuery) {
      if (!newQuery) {
        return
      }
      this.page = 0
      this.result = []
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
