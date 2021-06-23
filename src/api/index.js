import axios from '@/libs/api.request'

export const getTokenByCode = (params) => {
  return axios.request({
    params,
    url: '/oauth2/token',
    method: 'post'
  })
}

export const getUserInfoByToken = (params) => {
  return axios.request({
    params,
    url: '/oauth2/user',
    method: 'post'
  })
}

export const getTrainPage = (params) => {
  return axios.request({
    params,
    url: '/train/page',
    method: 'get'
  })
}

export const getTodayFault = (params) => {
  return axios.request({
    params,
    url: '/train/today/fault',
    method: 'get'
  })
}

export const getTodayFaultSortByType = (params) => {
  return axios.request({
    params,
    url: '/train/today/fault/type',
    method: 'get'
  })
}

export const getTrainInfo = ({ trainCode }) => {
  return axios.request({
    url: `/train/info/${trainCode}`,
    method: 'get'
  })
}

export const getTrainFault = (params) => {
  return axios.request({
    params,
    url: '/fault/page',
    method: 'get'
  })
}

export const confirmFault = (params) => {
  return axios.request({
    params,
    url: '/fault/confirm',
    method: 'post'
  })
}

export const getTrainTodayFault = ({ trainCode }) => {
  return axios.request({
    url: '/fault/today/count/' + trainCode,
    method: 'get'
  })
}

export const getFaultTrainList = () => {
  return axios.request({
    url: '/fault/list',
    method: 'get'
  })
}

export const getDevTypeList = () => {
  return axios.request({
    url: '/pis/dev/type/list',
    method: 'get'
  })
}

export const getAllTrainList = (params) => {
  return axios.request({
    params,
    url: '/train/page/list',
    method: 'get'
  })
}

export const getChartData = (params) => {
  return axios.request({
    params,
    url: '/fault/fault/chart',
    method: 'get'
  })
}

export const getTrainLineList = () => {
  return axios.request({
    url: '/train/line/list',
    method: 'get'
  })
}
