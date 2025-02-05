<template>
  <div class="app-container">
    <!--工具栏-->
    <div class="head-container">
      <!--如果想在工具栏加入更多按钮，可以使用插槽方式， slot = 'left' or 'right'-->
      <crudOperation :permission="permission" />
      <!--表单组件-->
      <el-dialog
        :close-on-click-modal="false"
        :before-close="crud.cancelCU"
        :visible.sync="crud.status.cu > 0"
        :title="crud.status.title"
        :destroy-on-close="true"
        width="500px"
      >
        <el-form
          ref="form"
          :model="form"
          :rules="rules"
          size="small"
          label-width="80px"
        >
          <!-- <el-form-item label="id">
            <el-input v-model="form.id" style="width: 370px;" />
          </el-form-item> -->
          <!-- <el-form-item label="图片">
            <el-input v-model="form.picUrl" style="width: 370px;" />
          </el-form-item> -->
          <el-form-item label="类型">
            <el-select
              v-model="form.type"
              style="width: 370px"
              placeholder="请选择"
            >
              <el-option
                v-for="item in typeList"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="上传图片">
            <el-upload
              ref="upload"
              accept=".jpg, .jpeg, .png"
              :limit="1"
              :auto-upload="true"
              :headers="headers"
              :on-error="handleError"
              :on-success="handleSuccess"
              :action="baseApi + '/api/localStorage/upload'"
            >
              <div v-if="form.picUrl" class="imgviewer">
                <img
                  v-if="form.picUrl"
                  :src="baseApi + '/file/' + form.picUrl"
                  class="avatar"
                >
                <div class="reset-img">点击更换图片</div>
              </div>
              <div v-else class="eladmin-upload">
                <i class="el-icon-upload" /> 添加图片
              </div>
              <div slot="tip" class="el-upload__tip">
                可上传图片文件，且不超过6M<br>
                <template v-if="form.type === 1">
                  （建议使用尺寸1366*525）<br>
                </template>

                <template v-if="form.type === 2">
                  （建议使用尺寸1001*203）<br>
                </template>

              </div>
            </el-upload>
          </el-form-item>
          <!-- <el-form-item label="选择设备">
            <el-select
              v-model="form.pcPhone"
              style="width: 370px"
              placeholder="请选择"
            >
              <el-option
                v-for="item in equipmentList"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </el-select>
          </el-form-item> -->
          <el-form-item label="超链地址">
            <el-input v-model="form.hyperlink" placeholder="请以 'http://' 或 'https://' 开头" style="width: 370px" />
          </el-form-item>
          <el-form-item label="展示位置" class="item-rela">
            <div v-if="form.type === 1">
              <img alt="" width="200" src="../../../assets/images/ex1.jpg">
              <div class="item-banner">首页轮播</div>
            </div>
            <div v-if="form.type === 2" class="item-rela">
              <img alt="" width="200" src="../../../assets/images/ex2.jpg">
              <div class="item-banner2">固定横幅</div>
            </div>
          </el-form-item>
          <!-- <el-form-item label="图片名字">
            <el-input v-model="form.picName" style="width: 370px" />
          </el-form-item> -->
          <!-- <el-form-item label="创建者">
            <el-input v-model="form.createBy" style="width: 370px;" />
          </el-form-item> -->
          <!-- <el-form-item label="更新者">
            <el-input v-model="form.updateBy" style="width: 370px;" />
          </el-form-item> -->
          <!-- <el-form-item label="创建时间">
            <el-input v-model="form.createTime" style="width: 370px;" />
          </el-form-item> -->
          <!-- <el-form-item label="更新时间">
            <el-input v-model="form.updateTime" style="width: 370px;" />
          </el-form-item> -->
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button type="text" @click="crud.cancelCU">取消</el-button>
          <el-button
            :loading="crud.cu === 2"
            type="primary"
            @click="crud.submitCU"
          >确认</el-button>
        </div>
      </el-dialog>
      <!--表格渲染-->
      <el-table
        ref="table"
        v-loading="crud.loading"
        :data="crud.data"
        size="small"
        style="width: 100%"
        @selection-change="crud.selectionChangeHandler"
      >
        <el-table-column type="selection" width="55" />
        <!-- <el-table-column prop="id" label="id" /> -->

        <el-table-column prop="picName" label="图片名字" />
        <el-table-column prop="picUrl" label="图片预览">
          <template slot-scope="scope">
            <img width="100" :src="`${filePath}/file/${scope.row.picUrl}`" alt="" srcset="">
          </template>
        </el-table-column>
        <el-table-column prop="type" label="类型">
          <template slot-scope="scope">
            <span v-if="scope.row.type === 1">首页轮播</span>
            <span v-else>固定横幅</span>
          </template>
        </el-table-column>
        <el-table-column prop="hyperlink" label="链接地址">
          <template slot-scope="scope">
            <a :href="scope.row.hyperlink" target="_blank">{{ scope.row.hyperlink }}</a>
          </template>
        </el-table-column>
        <el-table-column
          v-permission="['admin', 'rotationPic:edit', 'rotationPic:del']"
          label="操作"
          width="150px"
          align="center"
        >
          <template slot-scope="scope">
            <udOperation :data="scope.row" :permission="permission" />
          </template>
        </el-table-column>
      </el-table>
      <!--分页组件-->
      <pagination />
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import crudRotationPic from '@/api/rotationPic'
import CRUD, { presenter, header, form, crud } from '@crud/crud'
import { Notification } from 'element-ui'
// import rrOperation from '@crud/RR.operation'
import { getToken } from '@/utils/auth'
import crudOperation from '@crud/CRUD.operation'
import udOperation from '@crud/UD.operation'
import pagination from '@crud/Pagination'

const defaultForm = {
  id: null,
  deptId: null,
  picUrl: '',
  picName: '',
  hyperlink: '',
  type: 1,
  createBy: null,
  updateBy: null,
  createTime: null,
  updateTime: null
}
export default {
  name: 'RotationPic',
  components: { pagination, crudOperation, udOperation },
  mixins: [presenter(), header(), form(defaultForm), crud()],
  cruds() {
    return CRUD({
      title: '首页轮播/固定横幅',
      url: 'api/rotationPic',
      sort: 'id,desc',
      crudMethod: { ...crudRotationPic }
    })
  },
  data() {
    return {
      headers: { Authorization: getToken() },
      typeList: [
        { id: 1, name: '首页轮播' },
        { id: 2, name: '固定横幅' }
      ],
      equipmentList: [
        {
          id: 1,
          name: 'pc端'
        },
        {
          id: 2,
          name: '手机'
        }
      ],
      permission: {
        add: ['admin', 'rotationPic:add', 'dept:add'],
        edit: ['admin', 'rotationPic:edit', 'dept:edit'],
        del: ['admin', 'rotationPic:del', 'dept:del']
      },
      rules: {}
    }
  },
  computed: {
    ...mapGetters(['baseApi', 'fileUploadApi', 'user']),
    filePath() {
      return process.env.VUE_APP_BASE_API
    }
  },
  methods: {
    // 钩子：在获取表格数据之前执行，false 则代表不获取数据
    [CRUD.HOOK.beforeRefresh]() {
      return true
    },
    handleError(response) {
      if (response.status === 400) {
        Notification.error({
          title: '图片大小不能超过6MB'
        })
      }
    },
    handleSuccess(response) {
      console.log(response)
      this.form.picUrl = response.path
      this.form.picName = response.name
    }
  }
}
</script>

<style lang="scss" scoped>
.avatar {
  width: 368px;
  height: 145px;
  display: block;
  border-radius: 0;
}

.imgviewer{
  position: relative;

  .reset-img{
    position: absolute;
    bottom: 0;
    height: 30px;
    line-height: 30px;
    width: 100%;
    background: rgba(0,0,0,.3);
    color: #fff;
  }
}
.item-rela {
  position: relative
}
.item-banner {
   position: absolute;
   left: 60px;
   top: 37px;
   color: red;
   font-size: 20px;
}
.item-banner2 {
   position: absolute;
   left: 33px;
   top: 146px;
   color: red;
   font-size: 20px;
}
</style>
