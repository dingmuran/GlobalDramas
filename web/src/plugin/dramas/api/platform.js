import request from '@/utils/request'
export const schema = () => request({ url: '/dramas/schema', method: 'get' })
export const overview = () => request({ url: '/dramas/overview', method: 'get' })
export const records = (resource, params = {}) => request({ url: `/dramas/records/${resource}`, method: 'get', params })
export const saveRecord = (resource, data, id) => request({ url: `/dramas/records/${resource}${id ? `/${id}` : ''}`, method: id ? 'put' : 'post', data })
export const deleteRecord = (resource, id) => request({ url: `/dramas/records/${resource}/${id}`, method: 'delete' })
export const action = (resource, id, data) => request({ url: `/dramas/actions/${resource}/${id}`, method: 'post', data })
export const playback = (id) => request({ url: `/dramas/playback/${id}`, method: 'get' })
export const trackEvent = (data) => request({ url: '/dramas/events', method: 'post', data, donNotShowLoading: true })
export const preview = (params) => request({ url: '/dramas/preview', method: 'get', params })
export const accounts = () => request({ url: '/dramas/accounts', method: 'get' })
export const createAccount = (data) => request({ url: '/dramas/accounts', method: 'post', data })
export const importBills = (file) => { const data = new FormData(); data.append('file', file); return request({ url: '/dramas/bills/import', method: 'post', data }) }
