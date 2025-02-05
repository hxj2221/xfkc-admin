<template>
  <div class="app-container">
    <!--工具栏-->
    <div class="head-container">
      <!--如果想在工具栏加入更多按钮，可以使用插槽方式， slot = 'left' or 'right'-->
      <crudOperation :permission="permission" />
      <!--表单组件-->

      <el-dialog
        :destroy-on-close="true"
        :close-on-click-modal="false"
        :before-close="dialogClose"
        :title="crud.status.title"
        :visible.sync="crud.status.cu > 0"
        width="1000px"
      >
        <el-form ref="form" :model="form" :rules="rules" size="small" label-width="120px">
          <!-- <el-form-item label="id">
            <el-input v-model="form.id" style="width: 370px;" />
          </el-form-item> -->
          <el-form-item v-if="false" label="封面图">
            <el-upload
              ref="upload"
              accept=".jpg, .jpeg, .png"
              :show-file-list="false"
              :auto-upload="true"
              :headers="headers"
              :on-success="handleSuccess"
              :on-error="handleError"
              :limit="9"
              :action="baseApi + '/api/localStorage/upload'"
            >
              <img v-if="form.hardwarePicture" :src="baseApi + '/file/' +form.hardwarePicture" class="avatar">
              <div v-else class="eladmin-upload">
                <i class="el-icon-upload" /> 添加文件
              </div>
              <div slot="tip" class="el-upload__tip">可上传图片文件，且不超过6M</div>
            </el-upload>
          </el-form-item>
          <!-- <el-form-item label="学校名称">
            <el-input v-model="form.schoolName" style="width: 370px;" />
          </el-form-item> -->
          <!-- <el-form-item label="createBy">
            <el-input v-model="form.createBy" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="updateBy">
            <el-input v-model="form.updateBy" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="createTime">
            <el-input v-model="form.createTime" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="updateTime">
            <el-input v-model="form.updateTime" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="学校部门id">
            <el-input v-model="form.deptId" style="width: 370px;" />
          </el-form-item> -->
          <el-form-item label="图集">
            <el-upload
              :on-success="handlePicListSuccess"
              list-type="picture-card"
              :on-preview="picListPreview"
              :on-remove="picListRemove"
              :action="baseApi + '/api/localStorage/upload'"
              :headers="headers"
              :file-list="form.imgList"
            >
              <i class="el-icon-plus" />
            </el-upload>
            <div style="margin-top:4px;color:#606266;font-weight:bold">仅用第一张图作为展示</div>
          </el-form-item>

          <el-form-item label="实践资源视频" prop="Video">
            <el-upload
              v-show="!videoUrl"
              ref="uploadVideo"
              class="avatar-uploader el-upload--text"
              :action="baseApi + '/api/localStorage/upload'"
              :show-file-list="false"
              :headers="headers"
              :drag="isVideo"
              :on-success="handleVideoSuccess"
              :on-progress="uploadVideoProcess"
            >
              <i class="el-icon-upload" />
              <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
            </el-upload>

            <el-progress v-if="videoFlag" type="circle" :percentage="videoUploadPercents" style="margin-top:30px;" />

            <video v-if="videoUrl !='' && videoFlag == false" :src="videoUrl" class="video-size" controls="controls">您的浏览器不支持视频播放</video>
            <div v-if="videoUrl !='' && videoFlag == false" class="dialog-btn" @click="chooseFile">
              <el-button size="small" type="primary">重新上传视频</el-button>
            </div>
          </el-form-item>

          <el-form-item label="实践资源名称">
            <el-input v-model="form.name" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="容纳人数">
            <el-input v-model="form.containsPeople" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="实践资源详情">
            <editor-bar v-model="form.detail" @change="change" />
          </el-form-item>
          <!-- <el-form-item label="开放起始时间">
            <el-input v-model="form.openStartTime" style="width: 370px;" />
          </el-form-item> -->
          <!-- <el-form-item label="开放结束时间">
            <el-input v-model="form.openEndTime" style="width: 370px;" />
          </el-form-item> -->
          <!-- <el-form-item label="硬件特点">
            <el-input v-model="form.feature" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="联系电话">
            <el-input v-model="form.phone" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="学校地址">
            <el-input v-model="form.address" style="width: 370px;" />
          </el-form-item> -->
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button type="text" @click="dialogClose">取消</el-button>
          <el-button :loading="crud.cu === 2" type="primary" @click="toSubmit">确认</el-button>
        </div>
      </el-dialog>
      <!--表格渲染-->
      <el-table ref="table" v-loading="crud.loading" :data="crud.data" size="small" style="width: 100%;" @selection-change="crud.selectionChangeHandler">
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="id" />
        <!-- <el-table-column prop="hardwarePicture" label="硬件图片" /> -->
        <el-table-column prop="schoolName" label="学校名称" />
        <!-- <el-table-column prop="createBy" label="createBy" />
        <el-table-column prop="updateBy" label="updateBy" />
        <el-table-column prop="createTime" label="createTime">
          <template slot-scope="scope">
            <span>{{ parseTime(scope.row.createTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="updateTime" label="updateTime">
          <template slot-scope="scope">
            <span>{{ parseTime(scope.row.updateTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="deptId" label="学校部门id" /> -->
        <el-table-column prop="name" label="实践资源名称" />
        <el-table-column prop="containsPeople" label="容纳人数" />
        <!-- <el-table-column prop="openStartTime" label="开放起始时间">
          <template slot-scope="scope">
            <span>{{ parseTime(scope.row.openStartTime) }}</span>
          </template>
        </el-table-column> -->
        <!-- <el-table-column prop="openEndTime" label="开放结束时间">
          <template slot-scope="scope">
            <span>{{ parseTime(scope.row.openEndTime) }}</span>
          </template>
        </el-table-column> -->
        <!-- <el-table-column prop="feature" label="硬件特点" /> -->
        <!-- <el-table-column prop="phone" label="联系电话" /> -->
        <!-- <el-table-column prop="address" label="学校地址" /> -->
        <el-table-column v-permission="['admin','hardware:edit','hardware:del']" label="操作" width="150px" align="center">
          <template slot-scope="scope">
            <udOperation
              :data="scope.row"
              :permission="permission"
            />
          </template>
        </el-table-column>
      </el-table>
      <!--分页组件-->
      <pagination />
    </div>
    <!-- 图集dialog -->
    <el-dialog :visible.sync="dialogPicList">
      <img width="100%" :src="dialogPicListUrl" alt="">
    </el-dialog>
    <!-- 视频预览 -->
    <div>
      <el-dialog
        title="课程视频"
        :visible.sync="videoDialog.show"
        width="800px"
        height="600px"
        :before-close="handleClose"
      >
        <video :src="videoDialog.url" class="dialog-video" controls="controls" />
      </el-dialog>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import crudHardware from '@/api/hardware'
import { Notification } from 'element-ui'
import CRUD, { presenter, header, form, crud } from '@crud/crud'
import { getToken } from '@/utils/auth'
import EditorBar from '../news/text'
// import rrOperation from '@crud/RR.operation'
import crudOperation from '@crud/CRUD.operation'
import udOperation from '@crud/UD.operation'
import pagination from '@crud/Pagination'

const defaultForm = { id: null, hardwarePicture: null, deptId: null, name: null, imgList: [], containsPeople: null, feature: null, detail: '', video: null }
export default {
  name: 'Hardware',
  components: { pagination, crudOperation, udOperation, EditorBar },
  mixins: [presenter(), header(), form(defaultForm), crud()],
  cruds() {
    return CRUD({ title: '实践资源', url: 'api/hardware', params: { type: 2 }, sort: 'id,desc', crudMethod: { ...crudHardware }})
  },
  data() {
    return {
      videoPath: '',
      videoUrl: '', // 预览需要
      videoFlag: false, // 是否上传中（显示进度条）
      isVideo: true, // 是否拖拽上传
      dialogPicListUrl: '',
      dialogPicList: false,
      headers: { Authorization: getToken() },
      permission: {
        add: ['admin', 'hardware:add', 'dept:add'],
        edit: ['admin', 'hardware:edit', 'dept:edit'],
        del: ['admin', 'hardware:del', 'dept:del']
      },
      rules: {
      },
      // 视频预览窗口
      videoDialog: {
        show: false,
        url: ''
      },
      videoUploadPercent: 0 // 视频上传动画
    }
  },
  computed: {
    ...mapGetters(['baseApi', 'fileUploadApi', 'user']),
    videoUploadPercents() {
      return this.videoUploadPercent
    }
  },
  created() {
    // console.log(this.crud)
  },
  methods: {
    // 钩子：在获取表格数据之前执行，false 则代表不获取数据
    [CRUD.HOOK.beforeRefresh]() {
      return true
    },
    [CRUD.HOOK.beforeToEdit](crud, form) {
      // console.log(form)
      if (form.hardwarePicture !== null && form.hardwarePicture.indexOf(',') !== -1) {
        const imglist = form.hardwarePicture.split(',').map(str => {
          return {
            url: this.$comm.url(str),
            name: '',
            path: str

          }
        })
        this.form.imgList = imglist
      } else {
        const imgAll = {
          name: '',
          url: this.$comm.url(form.hardwarePicture)
        }
        this.form.imgList.push(imgAll)
      }
      if (form.video) {
        this.videoUrl = this.$comm.url(form.video)
      }
    },
    // dialog确定
    toSubmit() {
      // defaultForm.containsPeople = this.crud.form.containsPeople
      this.crud.submitCU()
      this.isVideo = true
      this.videoUrl = ''
      this.videoPath = ''
    },
    // 关闭dialog
    dialogClose() {
      this.isVideo = true
      this.videoUrl = ''
      this.videoPath = ''
      this.crud.cancelCU()
    },
    picListRemove(file, fileList) {
      this.form.imgList = fileList
      this.form.hardwarePicture = this.form.imgList.map(item => item.path).join(',')
    },
    picListPreview(file) {
      this.dialogPicListUrl = file.url
      this.dialogPicList = true
    },
    handlePicListSuccess(file) {
      // console.log(file)

      this.form.imgList.push({
        url: this.$comm.url(file.path),
        name: file.name,
        path: file.path
      })
      // for (var i = 0; i < this.form.imgList.length; i++) {
      //   this.form.imgList.push(this.form.imgList[i].file.path)
      // }
      // this.form.imgList.push(file.path)
      this.form.hardwarePicture = this.form.imgList.map(item => item.path).join(',')
    },
    change(val) {
      // console.log(val)
    },
    // 封面图上传成功
    handleSuccess(response) {
      // console.log(this.form)
      this.form.hardwarePicture = response.path
    },
    handleError(response) {
      if (response.status === 400) {
        Notification.error({
          title: '图片大小不能超过6MB'
        })
      }
    },
    // 视频上传
    handleVideoSuccess(res, file) {
      this.videoFlag = false
      this.isVideo = false
      this.videoUploadPercent = 0
      this.form.video = res.path
      this.videoPath = res.path
      this.videoUrl = this.$comm.url(res.path)
    },
    // 重新上传视频
    chooseFile() {
      this.$refs.uploadVideo.$el.children[0].children[0].click()
    },
    // 视频上传钩子
    uploadVideoProcess(event, file) {
      this.videoFlag = true
      this.videoUploadPercent = Math.floor(event.percent)
    },
    // 预览视频关闭
    handleClose() {
      this.videoDialog.url = ''
      this.videoDialog.show = false
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.video-size {
  width: 360px;
  height: 180px;
}
.avatar {
  width: 368px;
  height: 200px;
}

>>>.w-e-text,>>>.text {
  min-height: 200px;
  max-height: 200px;
}
</style>
