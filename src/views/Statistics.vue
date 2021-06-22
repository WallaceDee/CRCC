<template>
  <Row style="height:700px">
    <Col span="12" style="height:100%">
      <SectionCard
        title="各列车故障统计"
        style="margin-right:10px;height:100%;"
      >
        <Spin fix v-if="trainChartLoading"></Spin>
        <Form ref="trainForm" :model="trainForm">
          <FormItem>
            <Checkbox
              :indeterminate="trainIndeterminate"
              :value="trainCheckAll"
              @click.prevent.native="handleTrainCheckAll"
              >全选</Checkbox
            >
            <CheckboxGroup
              v-model="trainForm.codes"
              @on-change="checkCarAllGroupChange"
            >
              <Checkbox
                v-for="(item, index) in trainCodeOptions"
                :key="index"
                :label="item"
                >{{ item }}</Checkbox
              >
            </CheckboxGroup>
          </FormItem>
          <FormItem label="统计周期">
            <RadioGroup v-model="trainForm.timeType">
              <Radio label="day">日</Radio>
              <Radio label="week">周</Radio>
              <Radio label="month">月</Radio>
            </RadioGroup>
          </FormItem>
        </Form>
        <v-chart
          :force-fit="true"
          :height="height"
          :data="trainFilter(this.trainForm.codes)"
          :scale="scale"
          :padding="[20, 30, 110, 30]"
        >
          <v-tooltip />
          <v-axis />
          <v-legend />
          <v-smooth-line
            position="date*faultNum"
            color="train"
            shape="smooth"
          />
        </v-chart>
      </SectionCard>
    </Col>
    <Col span="12" style="height:100%">
      <SectionCard
        :title="`${itemForm.trainCode} 车各设备故障统计`"
        style="margin-left:10px;height:100%;"
      >
        <Spin fix v-if="itemChartLoading"></Spin>
        <Form ref="itemForm" :model="itemForm">
          <FormItem label="列车号" prop="trainCode">
            <!-- :remote-method="getAllTrainList" -->
            <!-- :loading="trainCodeLoading" -->
            <!-- @on-open-change="onTrainCodeSelectOpen" -->
            <Select
              style="width:300px;"
              clearable
              v-model="itemForm.trainCode"
              filterable
              placeholder="列车号"
            >
              <Option
                v-for="(trainCode, index) in trainCodeOptions"
                :value="trainCode"
                :key="index"
                >{{ trainCode }}</Option
              >
            </Select>
          </FormItem>
          <FormItem>
            <div slot="label">
              设备类型
              <Checkbox
                :indeterminate="itemIndeterminate"
                :value="itemCheckAll"
                @click.prevent.native="handleItemCheckAll"
                >全选</Checkbox
              >
            </div>
            <CheckboxGroup
              v-model="itemForm.devType"
              @on-change="checkItemAllGroupChange"
            >
              <Checkbox
                :label="item"
                v-for="item in devTypeOptions"
                :key="item"
              ></Checkbox>
            </CheckboxGroup>
          </FormItem>
          <FormItem label="统计周期">
            <RadioGroup v-model="itemForm.timeType">
              <Radio label="day">日</Radio>
              <Radio label="week">周</Radio>
              <Radio label="month">月</Radio>
            </RadioGroup>
          </FormItem>
        </Form>
        <v-chart
          :force-fit="true"
          :height="height"
          :data="itemFilter(this.itemForm.devType)"
          :scale="scale"
          :padding="[20, 30, 80, 30]"
        >
          <v-tooltip />
          <v-axis />
          <v-legend />
          <v-smooth-line position="date*faultNum" color="item" shape="smooth" />
        </v-chart>
      </SectionCard>
    </Col>
  </Row>
</template>
<script>
import {
  getAllTrainList,
  getChartData,
  // getFaultTrainList,
  getDevTypeList
} from '../api'
import { HttpStatus, DevTypeMap } from '../libs/constant'
export default {
  name: 'Statistics',
  data() {
    return {
      itemChartLoading: false,
      itemChartData: [],
      itemChartHistoryData: {},
      devTypeOptions: [],
      trainCodeLoading: false,
      trainCodeOptions: [],
      trainChartData: [],
      trainChartLoading: false,
      trainChartHistoryData: {},
      scale: {
        dataKey: 'faultNum',
        min: 0
      },
      height: 400,
      style: { stroke: '#fff', lineWidth: 1 },
      trainIndeterminate: false,
      trainCheckAll: true,
      trainForm: {
        timeType: 'month',
        codes: []
      },
      itemIndeterminate: false,
      itemCheckAll: true,
      itemForm: {
        timeType: 'month',
        devType: [],
        trainCode: ''
      }
    }
  },
  watch: {
    'trainForm.timeType'(val) {
      if (this.trainChartHistoryData[val]) {
        this.getTrainChartData(this.trainChartHistoryData[val].charData)
        return false
      } else {
        this.getMultiTrainChartData()
      }
    },
    'itemForm.timeType'(val) {
      console.log(this.itemChartHistoryData)
      if (this.itemChartHistoryData[val]) {
        this.getItemChartData(this.itemChartHistoryData[val].charData)
        return false
      } else {
        this.getMultiItemChartData()
      }
    },
    'itemForm.trainCode'(val) {
      this.itemChartHistoryData = {}
      this.getMultiItemChartData()
    },
    trainCodeOptions(val) {
      console.log(val)
    }
  },
  methods: {
    getDevTypeList() {
      if (this.devTypeOptions.length) {
        return false
      }
      this.devTypeLoading = true
      return getDevTypeList()
        .then((res) => {
          if (res.code === HttpStatus.SUCCESS) {
            this.devTypeOptions = res.data
            this.itemForm.devType = this.devTypeOptions
          }
          this.devTypeLoading = false
        })
        .catch((err) => {
          console.error(err)
          this.devTypeLoading = false
        })
    },
    trainFilter(codes) {
      let flag = codes.join(',')
      return this.trainChartData.filter((item) => {
        return flag.indexOf(item.train) !== -1
      })
    },
    itemFilter(codes) {
      let flag = codes.join(',')
      return this.itemChartData.filter((item) => {
        return flag.indexOf(item.item) !== -1
      })
    },
    getItemChartData(rawData) {
      let chartData = []
      Object.keys(rawData).forEach((key) => {
        rawData[key].forEach(({ faultNum, x }) => {
          chartData.push({
            item: key,
            faultNum,
            date: this.itemForm.timeType !== 'week' ? x : x + '周'
          })
        })
      })
      console.log(chartData)
      this.itemChartData = chartData
    },
    getTrainChartData(rawData) {
      let chartData = []
      Object.keys(rawData).forEach((key) => {
        rawData[key].forEach(({ faultNum, x }) => {
          chartData.push({
            train: key,
            faultNum,
            date: this.trainForm.timeType !== 'week' ? x : x + '周'
          })
        })
      })
      this.trainChartData = chartData
    },
    // onTrainCodeSelectOpen(status) {
    // if (status) {
    //   this.getAllTrainList()
    // }
    // },
    // getAllTrainList() {
    //   if (this.trainCodeOptions.length) {
    //     return false
    //   }
    //   this.trainCodeLoading = true
    //   getAllTrainList({
    //     pageSize: 99999
    //   })
    //     .then((res) => {
    //       if (res.code === HttpStatus.SUCCESS) {
    //         this.trainCodeOptions = res.data.records
    //         console.log(this.trainCodeOptions)
    //       }
    //       this.trainCodeLoading = false
    //     })
    //     .catch((err) => {
    //       console.error(err)
    //       this.trainCodeLoading = false
    //     })
    // },
    handleTrainCheckAll() {
      if (this.trainIndeterminate) {
        this.trainCheckAll = false
      } else {
        this.trainCheckAll = !this.trainCheckAll
      }
      this.trainIndeterminate = false

      if (this.trainCheckAll) {
        this.trainForm.codes = this.trainCodeOptions
      } else {
        this.trainForm.codes = []
      }
    },
    checkCarAllGroupChange(data) {
      if (data.length === this.trainCodeOptions.length) {
        this.trainIndeterminate = false
        this.trainCheckAll = true
      } else if (data.length > 0) {
        this.trainIndeterminate = true
        this.trainCheckAll = false
      } else {
        this.trainIndeterminate = false
        this.trainCheckAll = false
      }
    },
    handleItemCheckAll() {
      if (this.itemIndeterminate) {
        this.itemCheckAll = false
      } else {
        this.itemCheckAll = !this.itemCheckAll
      }
      this.itemIndeterminate = false

      if (this.itemCheckAll) {
        this.itemForm.devType = this.devTypeOptions
      } else {
        this.itemForm.devType = []
      }
    },
    checkItemAllGroupChange(data) {
      if (data.length === this.devTypeOptions.length) {
        this.itemIndeterminate = false
        this.itemCheckAll = true
      } else if (data.length > 0) {
        this.itemIndeterminate = true
        this.itemCheckAll = false
      } else {
        this.itemIndeterminate = false
        this.itemCheckAll = false
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
            this.trainCodeOptions = res.data.records.map((item) => {
              return item.trainCode
            })
            this.$set(this.trainForm, 'codes', this.trainCodeOptions)
            this.$set(this.itemForm, 'trainCode', this.trainCodeOptions[0])
            this.getDevTypeList().then(() => {
              this.getMultiItemChartData()
            })
            this.getMultiTrainChartData()
          }
          this.trainCodeLoading = false
        })
        .catch((err) => {
          console.error(err)
          this.trainCodeLoading = false
        })
    },
    getMultiTrainChartData() {
      let { timeType, codes } = this.trainForm
      this.trainChartLoading = true
      getChartData({
        dimension: 'date',
        timeType,
        codes: codes.join(',')
      })
        .then((res) => {
          if (res.code === HttpStatus.SUCCESS) {
            this.trainChartHistoryData[timeType] = res.data
            this.getTrainChartData(res.data.charData)
          }
          this.trainChartLoading = false
        })
        .catch((err) => {
          console.error(err)
          this.trainChartLoading = false
        })
    },
    getMultiItemChartData() {
      let { timeType, trainCode, devType } = this.itemForm
      this.itemChartLoading = true
      getChartData({
        dimension: 'devType',
        timeType,
        codes: trainCode,
        devType: devType
          .map((item) => {
            return DevTypeMap.get(item)
          })
          .join(',')
      })
        .then((res) => {
          if (res.code === HttpStatus.SUCCESS) {
            this.itemChartHistoryData[timeType] = res.data
            this.getItemChartData(res.data.charData)
          }
          this.itemChartLoading = false
        })
        .catch((err) => {
          console.error(err)
          this.itemChartLoading = false
        })
    }
  },
  mounted() {
    this.getAllTrainList()
  }
}
</script>
<style lang="less" scoped></style>
