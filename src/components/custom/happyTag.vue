<template>
  <div class="happy-tag" :style="containerStyle">
    <div v-if="icon" class="icon" :style="iconStyle">
      <i :class="icon" />
    </div>
    <div class="label">
      <slot />
    </div>
  </div>
</template>

<script>
export default {
  name: 'HappyTag',
  props: {
    icon: {
      type: String,
      default: ''
    },
    color: {
      type: String,
      default: ''
    }
  },

  computed: {
    containerStyle() {
      return {
        background: `${this.color}`,
        border: `1px solid ${this.color}`
      }
    },

    iconStyle() {
      return {
        color: `${this.color}`
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.happy-tag{
  overflow: hidden;
  display: inline-flex;
  border-radius: 5px;
  min-width: 60px;
  box-sizing: border-box;
  height: 22px;

  >>> .icon{
    background: #fff;
    min-width: 22px;
    text-align: center;
    line-height: 20px;
  }

  >>> .label{
    min-width: 0;
    white-space: nowrap;
    padding: 0 5px;
    box-sizing: border-box;
    flex: 1;
    text-align: center;
    color: #fff;
    line-height: 20px;
    font-size: 12px;
  }
}
</style>
