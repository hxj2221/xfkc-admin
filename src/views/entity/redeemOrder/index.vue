<template>
  <div class="app-container">
    <!--工具栏-->
    <div class="head-container">
      <div v-if="crud.props.searchToggle">
        <!-- 搜索 -->
        <label class="el-form-item-label">用户名字</label>
        <el-input
          v-model="query.userName"
          clearable
          placeholder="用户名字"
          style="width: 185px"
          class="filter-item"
          @keyup.enter.native="crud.toQuery"
        />
        <rrOperation :crud="crud" />
      </div>
      <!--如果想在工具栏加入更多按钮，可以使用插槽方式， slot = 'left' or 'right'-->
      <crudOperation :permission="permission" />
      <!--表单组件-->
      <el-dialog
        :close-on-click-modal="false"
        :before-close="crud.cancelCU"
        :visible.sync="crud.status.cu > 0"
        :title="crud.status.title"
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
          <!-- <el-form-item label="可兑换的商品表id" prop="exchangeableGoodsId">
            <el-input v-model="form.exchangeableGoodsId" style="width: 370px;" />
          </el-form-item> -->
          <el-form-item label="订单状态，0：未领取，1：已领取">
            <el-input v-model="form.status" style="width: 370px" />
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
          <el-form-item label="用户名字" prop="userName">
            <el-input v-model="form.userName" style="width: 370px" />
          </el-form-item>
          <!-- <el-form-item label="用户id" prop="userId">
            <el-input v-model="form.userId" style="width: 370px;" />
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
        <el-table-column prop="id" label="id" />
        <!-- <el-table-column prop="exchangeableGoodsId" label="可兑换的商品表id" /> -->
        <el-table-column prop="exchangeableGoodsName" label="商品名字" />
        <el-table-column prop="status" label="订单状态，0：未领取，1：已领取" />
        <el-table-column prop="createBy" label="申请人" />
        <!-- <el-table-column prop="updateBy" label="更新者" /> -->
        <el-table-column prop="createTime" label="申请时间">
          <template slot-scope="scope">
            <span>{{ parseTime(scope.row.createTime) }}</span>
          </template>
        </el-table-column>
        <!-- <el-table-column prop="updateTime" label="更新时间">
          <template slot-scope="scope">
            <span>{{ parseTime(scope.row.updateTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="userName" label="用户名字" /> -->
        <!-- <el-table-column prop="userId" label="用户id" /> -->
        <el-table-column
          v-permission="['admin', 'redeemOrder:edit', 'redeemOrder:del']"
          label="操作"
          width="150px"
          align="center"
        >
          <template slot-scope="scope">
            <!-- <udOperation
              v-if="!scope.row.status"
              :data="scope.row"
              :permission="permission"
            /> -->
            <div>
              <el-button
                class="filter-item"
                size="mini"
                type="success"
                @click="agree(scope.row.id)"
              >同意</el-button>
              <el-button
                class="filter-item"
                size="mini"
                type="danger"
                @click="check(scope.row.id)"
              >驳回</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
      <!--分页组件-->
      <pagination />
    </div>
  </div>
</template>

<script>
import { crudRedeemOrder, agree, reject } from '@/api/redeemOrder'
import CRUD, { presenter, header, form, crud } from '@crud/crud'
import rrOperation from '@crud/RR.operation'
import crudOperation from '@crud/CRUD.operation'
// import udOperation from '@crud/UD.operation'
import pagination from '@crud/Pagination'

const defaultForm = {
  id: null,
  exchangeableGoodsId: null,
  status: null,
  createBy: null,
  updateBy: null,
  createTime: null,
  updateTime: null,
  userName: null,
  userId: null
}
export default {
  name: 'RedeemOrder',
  components: { pagination, crudOperation, rrOperation },
  mixins: [presenter(), header(), form(defaultForm), crud()],
  cruds() {
    return CRUD({
      title: '兑换商品订单',
      url: 'api/redeemOrder',
      sort: 'id,desc',
      crudMethod: { ...crudRedeemOrder }
    })
  },
  data() {
    return {
      permission: {
        add: ['redeemOrder:add'],
        edit: ['admin', 'redeemOrder:edit', 'dept:edit'],
        del: ['admin', 'redeemOrder:del', 'dept:del']
      },
      rules: {
        exchangeableGoodsId: [
          {
            required: true,
            message: '可兑换的商品表id不能为空',
            trigger: 'blur'
          }
        ],
        userName: [
          { required: true, message: '用户名字不能为空', trigger: 'blur' }
        ],
        userId: [
          { required: true, message: '用户id不能为空', trigger: 'blur' }
        ]
      },
      queryTypeOptions: [{ key: 'userName', display_name: '用户名字' }]
    }
  },
  mounted() {
    console.log(this.crud)
  },
  methods: {
    // 钩子：在获取表格数据之前执行，false 则代表不获取数据
    [CRUD.HOOK.beforeRefresh]() {
      return true
    },
    agree(val) {
      const data = {
        id: val
      }
      console.log(data)
      agree(data)
        .then((res) => {
          this.crud.setUrl('api/redeemOrder')
          this.crud.refresh()
        })
        .catch((error) => {
          console.log(error)
        })
    },
    check(val) {
      const data = {
        id: val
      }
      reject(data)
        .then((res) => {
          console.log(res)
          this.crud.setUrl('api/redeemOrder')
          this.crud.refresh()
        })
        .catch((error) => {
          console.log(error)
        })
    }
  }
}
</script>

<style scoped>
</style>
