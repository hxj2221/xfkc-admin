<template>
  <div class="app-container">
    <!--工具栏-->
    <div class="head-container">
      <!--如果想在工具栏加入更多按钮，可以使用插槽方式， slot = 'left' or 'right'-->
      <crudOperation :permission="permission" />
      <!--表单组件-->
      <el-dialog :close-on-click-modal="false" :before-close="crud.cancelCU" :visible.sync="crud.status.cu > 0" :title="crud.status.title" width="500px">
        <el-form ref="form" :model="form" :rules="rules" size="small" label-width="80px">
          <!-- <el-form-item label="id">
            <el-input v-model="form.id" style="width: 370px;" />
          </el-form-item> -->
          <el-form-item label="物品名称" prop="name">
            <el-input v-model="form.name" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="物品图片" prop="picUrl">
            <!-- <el-input v-model="form.picUrl" style="width: 370px;" /> -->
            <el-upload
              ref="upload"
              accept=".jpg, .jpeg, .png"
              :limit="1"
              :auto-upload="true"
              :headers="headers"
              :on-success="handleSuccess"
              :on-error="handleError"
              :action="baseApi + '/api/localStorage/upload'"
            >
              <img v-if="form.picUrl" :src="baseApi + '/file/' + form.picUrl" class="avatar">
              <div v-else class="eladmin-upload">
                <i class="el-icon-upload" /> 添加文件
              </div>
              <div slot="tip" class="el-upload__tip">可上传图片文件，且不超过6M</div>
            </el-upload>
          </el-form-item>
          <el-form-item label="物品详细介绍" prop="detail">
            <el-input v-model="form.detail" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="兑换所需积分" prop="requiredPoints">
            <el-input v-model="form.requiredPoints" oninput="value=value.replace(/[^\d]/g,'')" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="库存" prop="number">
            <el-input v-model="form.number" oninput="value=value.replace(/[^\d]/g,'')" style="width: 370px;" />
          </el-form-item>
          <!-- <el-form-item label="创建者">
            <el-input v-model="form.createBy" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="更新者">
            <el-input v-model="form.updateBy" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="创建时间">
            <el-input v-model="form.createTime" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="更新时间">
            <el-input v-model="form.updateTime" style="width: 370px;" />
          </el-form-item> -->
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button type="text" @click="crud.cancelCU">取消</el-button>
          <el-button :loading="crud.cu === 2" type="primary" @click="crud.submitCU">确认</el-button>
        </div>
      </el-dialog>
      <!--表格渲染-->
      <el-table ref="table" v-loading="crud.loading" :data="crud.data" size="small" style="width: 100%;" @selection-change="crud.selectionChangeHandler">
        <el-table-column type="selection" width="55" />
        <!-- <el-table-column prop="id" label="id" /> -->
        <el-table-column prop="name" label="物品名称" />
        <!-- <el-table-column prop="picUrl" label="物品图片" /> -->
        <el-table-column prop="detail" label="物品详细介绍" />
        <el-table-column prop="requiredPoints" label="兑换所需积分" />
        <el-table-column prop="number" label="库存" />
        <el-table-column prop="createBy" label="创建者" />
        <el-table-column prop="updateBy" label="更新者" />
        <el-table-column prop="createTime" label="创建时间">
          <template slot-scope="scope">
            <span>{{ parseTime(scope.row.createTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="updateTime" label="更新时间">
          <template slot-scope="scope">
            <span>{{ parseTime(scope.row.updateTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column v-permission="['admin','exchangeableGoods:edit','exchangeableGoods:del']" label="操作" width="150px" align="center">
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
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { Notification } from 'element-ui'
import crudExchangeableGoods from '@/api/exchangeableGoods'
import CRUD, { presenter, header, form, crud } from '@crud/crud'
import { getToken } from '@/utils/auth'
// import rrOperation from '@crud/RR.operation'
import crudOperation from '@crud/CRUD.operation'
import udOperation from '@crud/UD.operation'
import pagination from '@crud/Pagination'

const defaultForm = { id: null, name: null, picUrl: null, detail: null, requiredPoints: null, number: null, createBy: null, updateBy: null, createTime: null, updateTime: null }
export default {
  name: 'ExchangeableGoods',
  components: { pagination, crudOperation, udOperation },
  mixins: [presenter(), header(), form(defaultForm), crud()],
  cruds() {
    return CRUD({ title: '物品列表', url: 'api/exchangeableGoods', sort: 'id,desc', crudMethod: { ...crudExchangeableGoods }})
  },

  data() {
    return {
      headers: { Authorization: getToken() },
      permission: {
        add: ['admin', 'exchangeableGoods:add', 'dept:add'],
        edit: ['admin', 'exchangeableGoods:edit', 'dept:edit'],
        del: ['admin', 'exchangeableGoods:del', 'dept:del']
      },
      rules: {
        name: [
          { required: true, message: '物品名称不能为空', trigger: 'blur' }
        ],
        picUrl: [
          { required: true, message: '物品图片不能为空', trigger: 'blur' }
        ],
        detail: [
          { required: true, message: '物品详细介绍不能为空', trigger: 'blur' }
        ],
        requiredPoints: [
          { required: true, message: '兑换所需积分不能为空', trigger: 'blur' }
        ],
        number: [
          { required: true, message: '库存不能为空', trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    ...mapGetters(['baseApi', 'fileUploadApi', 'user'])
  },
  methods: {
    // 钩子：在获取表格数据之前执行，false 则代表不获取数据
    [CRUD.HOOK.beforeRefresh]() {
      return true
    },
    handleSuccess(response) {
      console.log(response)
      this.form.picUrl = response.path
      this.form.picName = response.name
    },
    handleError(response) {
      if (response.status === 400) {
        Notification.error({
          title: '图片大小不能超过6MB'
        })
      }
    }
  }
}
</script>

<style scoped>
.avatar{
  width: 300px;
  height: 150px;
}
</style>
