import HGantt from './HGantt'

export default HGantt

if (typeof window !== 'undefined' && window.Vue) {
  window.Vue.component('h-gantt', HGantt)
}