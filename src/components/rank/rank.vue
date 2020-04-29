<template>
  <div class='rank'>
    <scroll class="toplist" :data='topList'>
      <ul>
        <li @click="selectItem(item)" class="item" v-for='item in topList' :key='item.id'>
          <div class="icon">
            <img v-lazy='item.coverImgUrl' :alt='item.description' height="100">
          </div>
          <ul v-if='item.tracks.length' class="songlist">
            <li class="song" v-for='(song,index) in item.tracks' :key='song.name'>
              <span>{{ index + 1 }}</span>
              <span>{{ song.first }}-{{song.second}}</span>
            </li>
          </ul>
          <ul v-else class='songlist'>
            <li class="song">暂无上榜歌曲</li>
          </ul>
        </li>
      </ul>
       <div class="loading-container">
         <loading v-show='!topList.length'></loading>
       </div>
    </scroll>
    <router-view></router-view>
  </div>
</template>

<script>
import { getTopList } from 'api/rank'
import Scroll from 'base/scroll/scroll'
import {mapMutations} from 'vuex'
export default {
  data () {
    return {
      topList: []
    }
  },
  components: {
    Scroll
  },
  methods: {
    ...mapMutations({
      setTopList: 'SET_TOP_LIST'
    }),
    async _getRankList () {
      let res = await getTopList()
      this.topList = res.data.list
    },
    selectItem (item) {
      this.setTopList(item)
      this.$router.push({
        path: `/rank/${item.id}`
      }).catch(err => console.log(err))
    }
  },
  created () {
    this._getRankList()
  }
}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"

  .rank
    position: fixed
    width: 100%
    top: 88px
    bottom: 0
    .toplist
      height: 100%
      overflow: hidden
      .item
        display: flex
        margin: 0 20px
        padding-top: 20px
        height: 100px
        &:last-child
          padding-bottom: 20px
        .icon
          flex: 0 0 100px
          width: 100px
          height: 100px
        .songlist
          flex: 1
          display: flex
          flex-direction: column
          justify-content: center
          padding: 0 20px
          height: 100px
          overflow: hidden
          background: $color-highlight-background
          color: $color-text-d
          font-size: $font-size-small
          .song
            no-wrap()
            line-height: 26px
      .loading-container
        position: absolute
        width: 100%
        top: 50%
        transform: translateY(-50%)
</style>
