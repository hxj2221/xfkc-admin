<template>
  <div class="app-container">
    <div class="">
      <el-button
        type="primary"
        class="filter-item"
        size="mini"
        icon="el-icon-plus"
        @click="dialogVisible = true"
      >新增</el-button>
    </div>
    <!-- 表格数据 -->
    <el-table
      v-loading="tableLoading"
      :data="tableData"
      style="width: 100%"
    >
      <el-table-column
        prop="id"
        label="ID"
        width="80"
      />
      <el-table-column
        prop="detail"
        label="课程分类名称"
        min-width="140"
      />
      <el-table-column
        prop="category"
        label="所属类别"
        min-width="140"
      >
        <template slot-scope="scope">
          {{ scope.row.category === 1 ? '年级' : scope.row.category === 2 ? '版块' : scope.row.category === 3 ? '课程类目' : '-' }}
        </template>
      </el-table-column>
      <el-table-column
        prop="createTime"
        label="创建时间"
        min-width="140"
      >
        <template slot-scope="scope">
          {{ $comm.dateFormat(scope.row.createTime,'YYYY-MM-DD HH:mm:ss') }}
        </template>
      </el-table-column>
      <el-table-column
        prop="prop"
        label="操作"
        width="180"
      >
        <template slot-scope="scope">
          <el-button
            class="filter-item"
            size="mini"
            icon="el-icon-edit"
            type="primary"
            @click="edit(scope.row)"
          />
          <el-button
            class="filter-item"
            size="mini"
            icon="el-icon-delete"
            type="danger"
            @click="del(scope.row)"
          />
        </template>
      </el-table-column>
    </el-table>
    <!--分页组件-->
    <pagination v-if="total > 0" :total="total" :page="currentPage" :limit="pageSize" @pagination="changePage" />
    <el-dialog
      :title="editForm.id ? '编辑分类' : '新增分类' "
      :visible.sync="dialogVisible"
      width="450px"
      @close="dialogClose"
    >
      <el-form size="mini" :model="editForm">
        <el-form-item label="分类名称" label-width="100px">
          <el-input v-model="editForm.detail" />
        </el-form-item>
        <el-form-item label="分类类型" label-width="100px">
          <el-select
            v-model="editForm.category"
            style="width: 310px"
            placeholder="请选择"
          >
            <el-option
              v-for="item in categoryList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" style="margin-top: 40px;">
        <el-button size="mini" @click="dialogVisible = false">取消</el-button>
        <el-button size="mini" type="primary" @click="save">保存</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
import { getCategoryList, edit, add, del } from '@/api/courseCategory'
import pagination from '@/components/Pagination'
export default {
  name: 'Course',
  components: { pagination },
  data() {
    return {
      currentPage: 1,
      pageSize: 20,
      total: 0,
      tableData: [],
      tableLoading: false,
      editForm: {
        detail: '',
        category: null
      },
      categoryList: [
        {
          id: 1,
          name: '年级'
        },
        {
          id: 2,
          name: '版块'
        },
        {
          id: 3,
          name: '课程类目'
        }
      ],
      dialogVisible: false
    }
  },
  created() {
    this.getTableData()
  },
  methods: {

    getTableData() {
      const req = {
        page: this.currentPage - 1,
        size: this.pageSize
      }
      getCategoryList(req).then(res => {
        this.tableData = res.content
        this.total = res.totalElements
      })
    },
    changePage(val) {
      this.currentPage = val.page
      this.pageSize = val.limit
      this.getTableData()
    },
    edit(item) {
      const { id, detail, category } = item
      this.editForm = { id, detail, category }
      this.dialogVisible = true
      this.currentPage = 1
      this.getTableData()
    },

    del(item) {
      console.log(item)

      this.$confirm('确定删除本条数据吗？', {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        del([item.id]).then(res => {
          this.$message({
            message: '删除成功',
            type: 'success'
          })
          this.currentPage = 1
          this.getTableData()
        })
      })
    },

    save() {
      const req = this.editForm.id ? edit : add
      req(this.editForm).then(res => {
        this.dialogVisible = false
        this.currentPage = 1
        this.getTableData()
      }).catch(() => {
        this.dialogVisible = false
      })
    },

    dialogClose() {
      this.editForm = {
        detail: '',
        category: null
      }
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
