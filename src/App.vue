<template>
  <div id="app">
    <m-header></m-header>
    <tab></tab>
    <transition name="fade">
      <keep-alive>
        <router-view />
      </keep-alive>
    </transition>
    <player></player>
  </div>
</template>

<script>
import MHeader from 'components/m-header/m-header'
import Tab from 'components/tab/tab'
import Player from 'components/player/player'
export default {
  name: 'App',
  components: {
    MHeader,
    Tab,
    Player
  }
}
</script>

<style scoped lang='stylus'>
.fade-enter-active, .fade-leave-active {
  transition: opacity .5s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}
</style>
