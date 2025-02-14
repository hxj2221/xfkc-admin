<template lang="html">
  <div class="editor">
    <toolbar :default-config="toolbarConfig" :editor="editor" mode="default" />
    <editor
      v-show="isShow"
      v-model="info_"
      class="text"
      :default-config="editorConfig"
      mode="default"
      @onCreated="onCreated"
    />
    <el-input
      v-show="!isShow"
      v-model="textarea2"
      type="textarea"
      :autosize="{ minRows: 22}"
      placeholder=""
    />
    <button @click="changeEditor"> {{ isShow?'切换源码':'切换视图' }}</button>

  </div>
</template>

<script>
import { Toolbar, Editor } from '@wangeditor/editor-for-vue'
import { Boot } from '@wangeditor/editor'
import '@wangeditor/editor/dist/css/style.css'
import attchmentModule from '@wangeditor/plugin-upload-attachment'
import { getToken } from '@/utils/auth'
import { mapGetters } from 'vuex'

Boot.registerModule(attchmentModule)

export default {
  name: 'Editoritem',
  components: {
    Toolbar,
    Editor
  },
  props: {
    value: {
      type: String,
      default: ''
    },
    isClear: {
      type: Boolean,
      default: false
    }
  },
  data() {
    const headers = { Authorization: getToken() }

    return {
      // uploadPath,
      textarea2: '',
      isShow: true,
      editor: null,
      info_: null,
      toolbarConfig: {
        insertKeys: {
          index: 0, // 自定义插入的位置
          keys: ['uploadAttachment'] // “上传附件”菜单
        }
      },
      editorConfig: {
        hoverbarKeys: {
          attachment: {
            menuKeys: ['downloadAttachment'] // “下载附件”菜单
          }
        },
        MENU_CONF: {
          uploadImage: {
            server: process.env.VUE_APP_BASE_API + '/api/localStorage/upload',
            fieldName: 'file',
            headers: headers,
            onFailed: (xhr, editor, result) => {
              // 插入图片失败回调
              console.log('失败')
            },
            onSuccess: (xhr, editor, result) => {
              // 图片上传成功回调
              console.log('成功')
            },
            onError: (xhr, editor) => {
              // 图片上传错误的回调
            },
            customInsert: (result, insertImg) => {
              // 图片上传成功，插入图片的回调
              // result为上传图片成功的时候返回的数据，这里我打印了一下发现后台返回的是data：[{url:"路径的形式"},...]
              // console.log(result.data[0].url)
              // insertImg()为插入图片的函数
              // 循环插入图片
              // for (let i = 0; i < 1; i++) {
              // console.log(result)
              console.log(result)
              const url = process.env.VUE_APP_BASE_API + '/file/' + result.path
              insertImg(url)
            }
          },
          uploadVideo: {
            server: process.env.VUE_APP_BASE_API + '/api/localStorage/upload',
            fieldName: 'file',
            headers: headers,
            onFailed: (xhr, editor, result) => {
              // 插入图片失败回调
              console.log('失败')
            },
            onSuccess: (xhr, editor, result) => {
              // 图片上传成功回调
              console.log('成功')
            },
            onError: (xhr, editor) => {
              // 图片上传错误的回调
            },
            customInsert: (result, insertVideo) => {
              // 图片上传成功，插入图片的回调
              // result为上传图片成功的时候返回的数据，这里我打印了一下发现后台返回的是data：[{url:"路径的形式"},...]
              // console.log(result.data[0].url)
              // insertImg()为插入图片的函数
              // 循环插入图片
              // for (let i = 0; i < 1; i++) {
              // console.log(result)
              console.log(result)
              const url = process.env.VUE_APP_BASE_API + '/file/' + result.path
              insertVideo(url)
            }
          },
          uploadAttachment: {
            server: process.env.VUE_APP_BASE_API + '/api/localStorage/upload',
            fieldName: 'file',
            headers: headers,
            onFailed: (xhr, editor, result) => {
              // 插入图片失败回调
              console.log('失败')
            },
            onSuccess: (xhr, editor, result) => {
              // 图片上传成功回调
              console.log('成功')
            },
            onError: (xhr, editor) => {
              // 图片上传错误的回调
            },
            customInsert: (result, file, insertAttachment) => {
              // 图片上传成功，插入图片的回调
              // result为上传图片成功的时候返回的数据，这里我打印了一下发现后台返回的是data：[{url:"路径的形式"},...]
              // console.log(result.data[0].url)
              // insertImg()为插入图片的函数
              // 循环插入图片
              // for (let i = 0; i < 1; i++) {
              // console.log(result)
              const url = process.env.VUE_APP_BASE_API + '/file/' + result.path
              insertAttachment('file', url)
            }
          }
        }
      }
    }
  },
  computed: {
    ...mapGetters(['baseApi'])
  },

  watch: {
    isClear(val) {
      // 触发清除文本域内容
      if (val) {
        this.editor.clear()
        this.info_ = null
      }
    },
    value: {
      handler: function(value) {
        if (value !== this.info_) {
          this.info_ = value
        }
      },
      immediate: true
    },
    info_: function(val) {
      this.$emit('change', val)
    }
    // value为编辑框输入的内容，这里我监听了一下值，当父组件调用得时候，如果给value赋值了，子组件将会显示父组件赋给的值
  },
  methods: {
    onCreated(editor) {
      this.editor = Object.seal(editor) // 一定要用 Object.seal() ，否则会报错
    },
    changeEditor() {
      this.isShow = !this.isShow
      if (this.isShow) {
        this.info_ = this.textarea2
      } else {
        this.textarea2 = this.editor.getHtml()
        console.log(this.textarea2, 192)
      }
    }
  }
}
</script>

<style lang="css">
.editor {
  width: 100%;
  margin: 0 auto;
  position: relative;
  z-index: 0;
}
.toolbar {
  border: 1px solid #ccc;
}
.text {
  border: 1px solid #ccc;
  min-height: 500px;
}
</style>
