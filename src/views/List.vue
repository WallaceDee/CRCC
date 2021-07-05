<template>
  <div>
    <SectionCard title="故障查询">
      <Form ref="searchForm" :model="searchForm" inline>
        <FormItem prop="trainCode">
          <Select
            clearable
            v-model="searchForm.trainCode"
            filterable
            :remote-method="getFaultTrainList"
            :loading="trainCodeLoading"
            @on-open-change="onTrainCodeSelectOpen"
            placeholder="列车号"
          >
            <Option
              v-for="(option, index) in trainCodeOptions"
              :value="option"
              :key="index"
              >{{ option }}</Option
            >
          </Select>
        </FormItem>
        <FormItem prop="devType">
          <Select
            clearable
            v-model="searchForm.devType"
            filterable
            :remote-method="getDevTypeList"
            :loading="devTypeLoading"
            @on-open-change="onDevTypeSelectOpen"
            placeholder="设备类型"
          >
            <Option
              v-for="(option, index) in devTypeOptions"
              :value="DevTypeMap.get(option)"
              :key="index"
              >{{ option }}</Option
            >
          </Select>
        </FormItem>
        <FormItem prop="faultLevel">
          <Select
            clearable
            v-model="searchForm.faultLevel"
            placeholder="故障等级"
          >
            <Option
              v-for="(option, index) in Array.from(FaultLevelMap)"
              :value="option[0]"
              :key="index"
              >{{ option[1] }}</Option
            >
          </Select>
        </FormItem>
        <FormItem prop="datetimerange">
          <DatePicker
            clearable
            type="datetimerange"
            format="yyyy-MM-dd HH:mm"
            placeholder="请选择开始时间和结束时间"
            style="width: 300px"
            @on-change="onDateTimeRangeChange"
          ></DatePicker>
        </FormItem>
        <FormItem>
          <Checkbox v-model="searchForm.isHidRepair">隐藏已恢复故障</Checkbox>
          <Checkbox v-model="searchForm.isHidConfirm">隐藏已确认故障</Checkbox>
        </FormItem>
        <FormItem>
          <Button
            size="small"
            type="primary"
            icon="ios-refresh"
            @click="handelReset"
            style="margin-right:5px"
          >
            重置
          </Button>
          <Button
            size="small"
            type="primary"
            :loading="tableLoading"
            icon="ios-search"
            @click="handleSearch"
          >
            <span v-if="!tableLoading">查询</span>
            <span v-else>查询中...</span>
          </Button>
        </FormItem>
      </Form>
      <Table
        disabled-hover
        size="small"
        :columns="columns"
        :data="tableData"
        :loading="tableLoading"
      ></Table>
      <br />
      <Page
        :page-size="PAGE_SIZE"
        :total="pageTotal"
        show-elevator
        @on-change="onPageChage"
      />
    </SectionCard>
  </div>
</template>
<script>
import {
  getTrainFault,
  confirmFault,
  getFaultTrainList,
  getDevTypeList
} from '../api'
import { HttpStatus, FaultLevelMap, DevTypeMap } from '../libs/constant'
const PAGE_SIZE = 15
export default {
  name: 'List',
  data() {
    return {
      tableLoading: false,
      FaultLevelMap,
      DevTypeMap,
      pageTotal: 0,
      PAGE_SIZE,
      columns: [
        {
          type: 'index',
          width: 60,
          align: 'center'
        },
        {
          align: 'center',
          title: '列车号',
          key: 'trainCode',
          minWidth: 70
        },
        {
          align: 'center',
          title: '车厢号',
          key: 'coachNo',
          minWidth: 30
        },
        {
          align: 'center',
          title: '设备',
          key: 'devCode',
          minWidth: 50
        },
        {
          title: '故障描述',
          key: 'description',
          minWidth: 90
        },
        {
          align: 'center',
          title: '故障等级',
          key: 'faultLevel',
          minWidth: 60,
          render: (h, { row: { faultLevel } }) => {
            return h('span', FaultLevelMap.get(faultLevel))
          }
        },
        {
          align: 'center',
          title: '发生时间',
          key: 'accessTime',
          minWidth: 120
        },
        {
          align: 'center',
          title: '恢复时间',
          key: 'fixTime',
          minWidth: 120
        },
        {
          align: 'center',
          title: '确认状态',
          key: 'checkTime',
          minWidth: 40,
          render: (h, { row: { id, checkTime } }) => {
            return checkTime
              ? h('span', '已确认')
              : h(
                  'Poptip',
                  {
                    props: {
                      transfer: true,
                      title: '您是否确认此故障？',
                      confirm: true
                    },
                    on: {
                      'on-ok': () => {
                        this.confirmFault(id)
                      }
                    }
                  },
                  [h('a', '未确认')]
                )
          }
        },
        {
          align: 'center',
          title: '操作指导',
          key: 'checkTime',
          minWidth: 40,
          render: (h, { row: { residualRemark } }) => {
            return h(
              'a',
              {
                on: {
                  click: () => {
                    this.$Modal.info({
                      title: '操作指导',
                      content: `<pre>${residualRemark}</pre>`
                    })
                  }
                }
              },
              '查看'
            )
          }
        }
      ],
      tableData: [],
      trainCodeOptions: [],
      trainCodeLoading: false,
      devTypeOptions: [],
      devTypeLoading: false,
      searchForm: {
        trainCode: null,
        devType: null,
        isHidRepair: false,
        isHidConfirm: false,
        startTime: null,
        endTime: null
      }
    }
  },
  methods: {
    onPageChage(pageNum) {
      this.getTableData(pageNum)
    },
    getTableData(pageNum = 1) {
      this.tableLoading = true
      getTrainFault({
        pageNum,
        pageSize: PAGE_SIZE,
        ...this.$refs['searchForm'].model
      })
        .then((res) => {
          if (res.code === HttpStatus.SUCCESS) {
            this.tableData = res.data.records
            this.pageTotal = res.data.total
          }
          this.tableLoading = false
        })
        .catch((err) => {
          this.tableLoading = false
          console.error(err)
        })
    },
    confirmFault(id) {
      confirmFault({ id })
        .then((res) => {
          if (res.code === HttpStatus.SUCCESS) {
            this.$Notice[res.data ? 'success' : 'error']({
              title: res.data ? '确认成功' : '确认失败'
            })
            this.tableData.map((item) => {
              if (item.id === id) {
                item.checkTime = 1
              }
              return item
            })
          }
        })
        .catch((err) => {
          console.error(err)
        })
    },
    onTrainCodeSelectOpen(status) {
      if (status) {
        this.getFaultTrainList()
      }
    },
    getFaultTrainList() {
      if (this.trainCodeOptions.length) {
        return false
      }
      this.trainCodeLoading = true
      getFaultTrainList()
        .then((res) => {
          if (res.code === HttpStatus.SUCCESS) {
            this.trainCodeOptions = res.data
          }
          this.trainCodeLoading = false
        })
        .catch((err) => {
          console.error(err)
          this.trainCodeLoading = false
        })
    },
    onDevTypeSelectOpen(status) {
      if (status) {
        this.getDevTypeList()
      }
    },
    getDevTypeList() {
      if (this.devTypeOptions.length) {
        return false
      }
      this.devTypeLoading = true
      getDevTypeList()
        .then((res) => {
          if (res.code === HttpStatus.SUCCESS) {
            this.devTypeOptions = res.data
          }
          this.devTypeLoading = false
        })
        .catch((err) => {
          console.error(err)
          this.devTypeLoading = false
        })
    },
    handelReset() {
      this.$refs['searchForm'].resetFields()
      this.getTableData()
    },
    handleSearch() {
      this.getTableData()
    },
    onDateTimeRangeChange(value) {
      if (value[0]) {
        this.searchForm.startTime = value[0] + ':00'
        this.searchForm.endTime = value[1] + ':00'
      } else {
        this.searchForm.startTime = null
        this.searchForm.endTime = null
      }
    }
  },
  mounted() {
    this.getTableData()
  }
}
</script>
<style lang="less" scoped></style>
