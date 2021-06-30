<template>
  <div>
    <div class="status">
      <Poptip placement="bottom" width="300" transfer>
        <div
          class="ivu-tag ivu-tag-size-default ivu-tag-success ivu-tag-checked"
        >
          <span class="ivu-tag-text ivu-tag-color-white">
            <p>当前列车</p>
            <h1>
              <span>{{ trainCode }}</span>
              <Icon type="md-arrow-dropdown" />
            </h1>
          </span>
        </div>
        <div slot="content" style="height:35px">
          <Select
            filterable
            :remote-method="getAllTrainList"
            :loading="trainCodeLoading"
            @on-open-change="onTrainCodeSelectOpen"
            @on-change="onTrainCodeChange"
            placeholder="列车号"
          >
            <Option
              v-for="({ trainCode }, index) in trainCodeOptions"
              :value="trainCode"
              :key="index"
              >{{ trainCode }}</Option
            >
          </Select>
        </div>
      </Poptip>
      <Tag color="warning">
        <p>当天运营时间</p>
        <h1>> {{ info.todayDurationHours || 0 }} 小时</h1>
      </Tag>
      <Tag color="error">
        <p>无故障运营时间</p>
        <h1>> {{ info.failureFreeDurationDay || 0 }} 天</h1>
      </Tag>
    </div>
    <Row style="margin-top:20px;margin-bottom:20px;">
      <Col span="24">
        <SectionCard title="列车运行设备状态图">
          <div class="equipment-list">
            <h3
              class="item-wrapper"
              v-for="item in equipmentList"
              :key="item.section"
            >
              {{ item.section }}
            </h3>
          </div>
          <div class="equipment-list">
            <div
              class="item-wrapper"
              v-for="(item, index) in equipmentList"
              :key="item.section"
            >
              <Spin fix v-if="equipmentLoading"></Spin>
              <div class="sub-item left" v-if="index === 0">
                <Tag
                  :color="getItemColorByStatus(item.curStatus)"
                  v-for="item in getItemsByName('ACSU', item.children)"
                  :key="item.devCode"
                  >{{ item.devCode }}</Tag
                >
                <Tag
                  :color="getItemColorByStatus(item.curStatus)"
                  v-for="item in getItemsByName('DACU', item.children)"
                  :key="item.devCode"
                  >{{ item.devCode }}</Tag
                >
              </div>
              <div class="item">
                <Tag
                  :color="getItemColorByStatus(item.curStatus)"
                  v-for="item in getItemsByName('PACU', item.children)"
                  :key="item.devCode"
                  >{{ item.devCode }}</Tag
                >
                <Tag
                  :color="getItemColorByStatus(item.curStatus)"
                  v-for="item in getItemsByName('PECU', item.children)"
                  :key="item.devCode"
                  >{{ item.devCode }}</Tag
                >
              </div>
              <div
                class="sub-item right"
                v-if="index === equipmentList.length - 1"
              >
                <Tag
                  :color="getItemColorByStatus(item.curStatus)"
                  v-for="item in getItemsByName('ACSU', item.children)"
                  :key="item.devCode"
                  >{{ item.devCode }}</Tag
                >
                <Tag
                  :color="getItemColorByStatus(item.curStatus)"
                  v-for="item in getItemsByName('DACU', item.children)"
                  :key="item.devCode"
                  >{{ item.devCode }}</Tag
                >
              </div>
            </div>
          </div>
        </SectionCard>
      </Col>
    </Row>
    <Row>
      <Col span="15">
        <SectionCard title="故障记录">
          <Table
            disabled-hover
            size="small"
            :columns="columns"
            :data="tableData"
            :loading="tableLoading"
          ></Table>
          <br />
          <Page
            size="small"
            :page-size="PAGE_SIZE"
            :total="pageTotal"
            show-elevator
            @on-change="onPageChage"
          />
        </SectionCard>
      </Col>
      <Col span="5">
        <SectionCard
          title="历史故障数"
          style="margin-left:10px;max-height:350px;height:100%;"
        >
          <Spin fix v-if="chartLoading"></Spin>
          <v-chart
            v-if="barChartData.length"
            :forceFit="true"
            :height="height"
            :data="barChartData"
            :scale="{
              dataKey: 'sales',
              tickInterval: 1
            }"
            :padding="[20, 30, 50, 30]"
          >
            <v-tooltip title="devType" />
            <v-axis />
            <v-bar position="devType*故障数" />
          </v-chart>
          <span v-else>暂无数据</span>
        </SectionCard>
      </Col>
      <Col span="4">
        <SectionCard
          title="历史故障分布"
          style="margin-left:10px;max-height:350px;height:100%;"
        >
          <Spin fix v-if="chartLoading"></Spin>
          <v-chart
            v-if="pieChartData.length"
            :forceFit="true"
            :height="height"
            :data="pieChartData"
            :scale="[
              {
                dataKey: 'percent',
                min: 0,
                formatter: '.0%'
              }
            ]"
            :padding="[20, 30, 60, 30]"
          >
            <v-tooltip :showTitle="false" data-key="devType*percent" />
            <v-axis />
            <v-legend data-key="devType" />
            <v-pie
              position="percent"
              color="devType"
              :v-style="pieStyle"
              :label="labelConfig"
            />
            <v-coord type="theta" />
          </v-chart>
          <span v-else>暂无数据</span>
        </SectionCard>
      </Col>
    </Row>
  </div>
</template>
<script>
import {
  getTrainPage,
  getTrainInfo,
  getTrainFault,
  confirmFault,
  getTrainTodayFault,
  getAllTrainList
} from '../api'
import { HttpStatus, FaultLevelMap } from '../libs/constant'

const PAGE_SIZE = 10
export default {
  name: 'Monitor',
  data() {
    return {
      info: {},
      trainCodeOptions: [],
      chartLoading: false,
      trainCodeLoading: false,
      equipmentLoading: false,
      equipmentList: [
        {
          section: 'MC1',
          children: []
        },
        {
          section: 'TP1',
          children: []
        },
        {
          section: 'M1',
          children: []
        },
        {
          section: 'M2',
          children: []
        },
        {
          section: 'M3',
          children: []
        },
        {
          section: 'M4',
          children: []
        },
        {
          section: 'TP2',
          children: []
        },
        {
          section: 'MC2',
          children: []
        }
      ],
      pieStyle: {
        stroke: '#fff',
        lineWidth: 1
      },
      labelConfig: [
        'percent',
        {
          formatter: (val, item) => {
            return item.point.devType + ': ' + val
          }
        }
      ],
      height: 200,
      barChartData: [],
      pieChartData: [],
      columns: [
        // {
        //   type: 'index',
        //   width: 60,
        //   align: 'center'
        // },
        {
          title: '列车号',
          key: 'trainCode',
          minWidth: 30
        },
        {
          title: '车厢号',
          key: 'coachNo',
          minWidth: 30
        },
        {
          title: '设备',
          key: 'devCode',
          minWidth: 20
        },
        {
          title: '故障描述',
          key: 'description',
          minWidth: 80
        },
        {
          title: '故障等级',
          key: 'faultLevel',
          minWidth: 20,
          render: (h, { row: { faultLevel } }) => {
            return h('span', FaultLevelMap.get(faultLevel))
          }
        },
        {
          title: '发生时间',
          key: 'accessTime',
          minWidth: 100
        },
        {
          title: '确认状态',
          key: 'checkTime',
          minWidth: 20,
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
          title: '指导意见',
          key: 'residualRemark',
          minWidth: 20,
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
              '点击查看'
            )
          }
        }
      ],
      tableData: [],
      pageTotal: 0,
      PAGE_SIZE,
      tableLoading: false
    }
  },
  computed: {
    trainCode() {
      return this.$route.params.trainCode
    }
  },
  methods: {
    getFirstTrainCode() {
      return getTrainPage({
        pageNum: 1,
        pageSize: 1
      })
        .then((res) => {
          if (res.code === HttpStatus.SUCCESS) {
            if (
              res.data.records &&
              res.data.records.length &&
              !localStorage.getItem('currentTrainCode')
            ) {
              localStorage.setItem(
                'currentTrainCode',
                res.data.records[0].trainCode
              )
              this.onTrainCodeChange(res.data.records[0].trainCode)
            }
          }
        })
        .catch((err) => {
          console.error(err)
        })
    },
    onTrainCodeChange(trainCode) {
      console.log(trainCode)
      this.$router.replace({
        name: 'Monitor',
        params: {
          trainCode
        }
      })
    },
    onTrainCodeSelectOpen(status) {
      if (status) {
        this.getAllTrainList()
      }
    },
    getAllTrainList() {
      if (this.trainCodeOptions.length) {
        return false
      }
      this.trainCodeLoading = true
      getAllTrainList({
        pageSize: 99999
      })
        .then((res) => {
          if (res.code === HttpStatus.SUCCESS) {
            this.trainCodeOptions = res.data.records
            console.log(this.trainCodeOptions)
          }
          this.trainCodeLoading = false
        })
        .catch((err) => {
          console.error(err)
          this.trainCodeLoading = false
        })
    },
    getItemColorByStatus(status) {
      return status ? (status === 1 ? 'warning' : 'error') : 'success'
    },
    getItemsByName(name, array) {
      if (!array.length) {
        return []
      }
      let result = array.filter((item) => {
        return item.devCode.indexOf(name) !== -1
      })
      if (result.length) {
        return result
      }
      return []
    },
    getTrainInfo() {
      this.equipmentLoading = true
      getTrainInfo({
        trainCode: this.trainCode
      })
        .then((res) => {
          if (res.code === HttpStatus.SUCCESS) {
            let equipmentList = JSON.parse(JSON.stringify(this.equipmentList))
            this.info = res.data
            res.data.devInfo.forEach((item) => {
              if (item.coachNo > 0 && item.coachNo < 9) {
                equipmentList[item.coachNo - 1].children.push(item)
              }
            })
            this.equipmentList = equipmentList
            console.log(equipmentList)
          }
          this.equipmentLoading = false
        })
        .catch((err) => {
          console.error(err)

          this.equipmentLoading = false
        })
    },
    onPageChage(pageNum) {
      this.getTableData(pageNum)
    },
    getTableData(pageNum = 1) {
      this.tableLoading = true
      getTrainFault({
        trainCode: this.trainCode,
        pageNum,
        pageSize: PAGE_SIZE
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
    getTrainTodayFault() {
      this.chartLoading = true
      getTrainTodayFault({
        trainCode: this.trainCode
      })
        .then((res) => {
          if (res.code === HttpStatus.SUCCESS) {
            res.data.map((item) => {
              item['故障数'] = item.faultNum
              return item
            })
            this.barChartData = res.data
            const DataSet = require('@antv/data-set')
            const dv = new DataSet.View().source(res.data)
            dv.transform({
              type: 'percent',
              field: '故障数',
              dimension: 'devType',
              as: 'percent'
            })
            console.log(dv.rows)
            this.pieChartData = dv.rows
          }
          this.chartLoading = false
        })
        .catch((err) => {
          console.error(err)
          this.chartLoading = false
        })
    }
  },
  mounted() {
    if (this.trainCode) {
      localStorage.setItem('currentTrainCode', this.trainCode)
      this.getTrainInfo()
      this.getTableData()
      this.getTrainTodayFault()
    } else {
      let trainCode = localStorage.getItem('currentTrainCode')
      if (trainCode) {
        this.onTrainCodeChange(trainCode)
      } else {
        this.getFirstTrainCode()
      }
    }
  }
}
</script>
<style lang="less" scoped>
.status {
  .ivu-tag {
    height: initial;
    min-width: 250px;
    padding-top: 15px;
    padding-bottom: 15px;
    padding-left: 15px;
    padding-right: 15px;
    margin-right: 20px;
    p {
      margin-bottom: 10px;
    }
  }
}
.equipment-list {
  position: relative;
  display: flex;

  h3 {
    color: #fff;
    flex: 1;
    justify-content: center;
  }
  .item-wrapper {
    display: flex;
    flex: 1;
    &:first-child,
    &:last-child {
      flex: 1.8;
    }
    .sub-item {
      padding-left: 5px;

      padding-right: 5px;
      background-color: #171c24;
      min-height: 80px;
      padding-bottom: 2px;
      padding-top: 2px;
      width: 74.59%;
      border: 1px solid #fff;
      border-radius: 40% 0 0 40%;
      position: relative;
      display: flex;
      flex-wrap: wrap;
      justify-content: flex-end;
      align-items: center;
      + .item {
        border-left: none;
      }
      &.right {
        justify-content: flex-start;
        border-radius: 0 40% 40% 0;
      }
    }
    .item {
      background-color: #171c24;
      border: 1px solid #fff;
      border-right: none;
      min-height: 80px;
      padding-bottom: 2px;
      padding-top: 2px;
      width: 100%;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: center;
    }
    .ivu-tag {
      font-size: 12px;
      line-height: 14px;
      height: 14px;
      padding-left: 3px;
      padding-right: 3px;
    }
  }
}
</style>
