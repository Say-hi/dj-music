<template>
  <div class="search">
    <div class="search-box-wrapper">
      <search-box @query='queryChnage' ref='searchBox'></search-box>
    </div>
    <div v-show='!query' class="shortcut-wrapper">
      <div class="shortcut">
        <div class="hot-key">
          <h1 class="title">热门搜索</h1>
          <ul>
            <li @click="addQuery(item.first)" class='item' v-for='item in hotKey' :key='item.first'>
              <span>{{item.first}}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
    <div v-show='query' class="search-result">
      <suggest @select='saveSearch' @listScroll='blurInput' :query='query'></suggest>
    </div>
    <router-view></router-view>
  </div>
</template>

<script>
import SearchBox from 'base/search-box/search-box'
import Suggest from 'components/suggest/suggest'
import {getHotKey} from 'api/search'
import {mapActions} from 'vuex'
export default {
  data () {
    return {
      hotKey: [],
      query: ''
    }
  },
  components: {
    SearchBox,
    Suggest
  },
  created () {
    this._getHotKey()
  },
  methods: {
    ...mapActions([
      'saveSearchHistory'
    ]),
    saveSearch () {
      // this.savesearchHistory(this.query)
    },
    blurInput () {
      this.$refs.searchBox.blur()
    },
    addQuery (query) {
      this.$refs.searchBox.setQuery(query)
    },
    _getHotKey () {
      getHotKey().then(res => {
        this.hotKey = res.data.result.hots.slice(0, 10)
      })
    },
    queryChnage (query) {
      this.query = query
    }
  }
}
</script>

<style lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"
  .search
    .search-box-wrapper
      margin: 20px
    .shortcut-wrapper
      position: fixed
      top: 178px
      bottom: 0
      width: 100%
      .shortcut
        height: 100%
        overflow: hidden
        .hot-key
          margin: 0 20px 20px 20px
          .title
            margin-bottom: 20px
            font-size: $font-size-medium
            color: $color-text-l
          .item
            display: inline-block
            padding: 5px 10px
            margin: 0 10px 10px 0
            border-radius: 6px
            background: $color-highlight-background
            font-size: $font-size-medium
            color: $color-text-d
        .search-history
          position: relative
          margin: 0 20px
          .title
            display: flex
            align-items: center
            height: 40px
            font-size: $font-size-medium
            color: $color-text-l
            .text
              flex: 1
            .clear
              extend-click()
              .icon-clear
                font-size: $font-size-medium
                color: $color-text-d
    .search-result
      position: fixed
      width: 100%
      top: 178px
      bottom: 0
</style>
