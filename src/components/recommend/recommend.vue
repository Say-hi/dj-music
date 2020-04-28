<template>
  <div class="recommend" ref='recommend'>
    <scroll ref='scroll' :data='discList' class="recommend-content">
      <div>
        <div v-if='recommends.length' class='slider-wrapper'>
          <slider>
            <div v-for='item in recommends' :key='item.bannerId'>
              <a href="http://vue.jiangwenqiang.com/">
                <img class='needsclick' @load="loadImage" :src="item.pic" alt="">
              </a>
            </div>
          </slider>
        </div>
        <div class="recommend-list">
          <h1 class="list-title">热门歌单推荐</h1>
          <ul>
            <li @click="selectItem(item)" v-for='item in discList' :key='item.id' class='item'>
              <div class="icon">
                <img style='width: 100%;' v-lazy="item.coverImgUrl" alt="">
              </div>
              <div class="text">
                <h2 class='name' v-html="item.name"></h2>
                <p class="desc" v-html="item.description.length> 35 ? item.description.substring(0,35) + '...' : item.description"></p>
              </div>
            </li>
          </ul>
        </div>
      </div>
      <div class="loading-container">
          <loading v-if='!discList.length'></loading>
      </div>
    </scroll>
    <router-view></router-view>
  </div>
</template>

<script>
import Slider from 'base/slider/slider'
import {getRecommend, getDiscList} from 'api/recommend'
import {Swiper, Slide} from 'vue-swiper-component'
import Scroll from 'base/scroll/scroll'
import {playlistMixin} from 'common/js/mixin'
import {mapMutations} from 'vuex'
export default {
  mixins: [
    playlistMixin
  ],
  components: {
    Slider,
    Swiper,
    Slide,
    Scroll
  },
  data () {
    return {
      recommends: [],
      discList: []
    }
  },
  methods: {
    ...mapMutations({
      setDisc: 'SET_DISC'
    }),
    selectItem (item) {
      this.$router.push({
        path: `/recommend/${item.id}`
      }).catch(() => {})
      this.setDisc(item)
    },
    handlePlaylist (playList) {
      const bottom = playList.length > 0 ? '60px' : ''
      this.$refs.recommend.style.bottom = bottom
      this.$refs.scroll.refresh()
    },
    async _getRecommend() {
      let res = await getRecommend()
      this.recommends = res.data.banners
    },
    async _getDiscList () {
      let res = await getDiscList()
      this.discList = res.data.playlists
    },
    loadImage () {
      if (!this.checkLoaded) {
        this.$refs.scroll.refresh()
        this.checkLoaded = true
      }
    }
  },

  created() {
    this._getRecommend()
    this._getDiscList()
  }
}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"

  .recommend
    position: fixed
    width: 100%
    top: 88px
    bottom: 0
    .recommend-content
      height: 100%
      overflow: hidden
      .slider-wrapper
        position: relative
        width: 100%
        overflow: hidden
      .recommend-list
        .list-title
          height: 65px
          line-height: 65px
          text-align: center
          font-size: $font-size-medium
          color: $color-theme
        .item
          display: flex
          box-sizing: border-box
          align-items: center
          padding: 0 20px 20px 20px
          .icon
            flex: 0 0 60px
            width: 60px
            padding-right: 20px
          .text
            display: flex
            flex-direction: column
            justify-content: center
            flex: 1
            line-height: 20px
            overflow: hidden
            font-size: $font-size-medium
            .name
              margin-bottom: 10px
              color: $color-text
            .desc
              color: $color-text-d
      .loading-container
        position: absolute
        width: 100%
        top: 50%
        transform: translateY(-50%)
</style>