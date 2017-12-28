<template>
<div>
    <div>
        <div class="float-left"><q-btn small icon-right="view_column" color="primary" @click="openChangeFilterModal()">Columns</q-btn></div>
        <q-search v-model="searchGantt" />
    </div>
    <div class="gantt-layout">
        <table class="gantt-left">
            <thead>
            <tr style="height:40px;">
                <th><q-btn small color="secondary" icon="settings" @click="changeCalendarOptions()"></q-btn></th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="(item, index) in computed_task_calendar" :style="'height:' + gridHeight + 'px;'">
                <td class="gantt-calendar-label">{{item|formatLocaleDateString}}</td>
            </tr>
            </tbody>
        </table>
        <table class="gantt" cellpadding="0" cellspacing="0">
            <thead>
            <tr style="height:40px;">
                <th style="width:120px;color:blue;background:orange;">Milestones</th>
                <th class="gantt-task-header" v-for="(task, taskIndex) in computed_tasks" v-bind:style="'background:' + getTaskColor(taskIndex) + ';'" :key="taskIndex">
                    <span class="task-title">{{task.TaskName}}</span>
                    <q-tooltip>
                        <p><span class="text-info">{{task.TaskName}}: </span><p>
                        <p> From: <span class="text-yellow">{{task.StartDate|formatLocaleDateString}}</span></p> 
                        <p> To: <span class="text-yellow">{{task.EndDate|formatLocaleDateString}}</span></p>
                        <p> Progress: <span class="text-warning">{{task.PercentageDone}}%</span></p>
                    </q-tooltip>
                </th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="(item, index) in computed_task_calendar" :style="'height:' + gridHeight + 'px;'" ref="ganttCells">
                <td class="gantt-task-item" v-if="index == 0" v-bind:rowspan="computed_task_calendar.length" :style="'min-width: 120px;' + computed_gridline_styles">
                    <div style="float:left;" v-for="(milestone, milestoneIndex) in computed_milestones" :key="milestoneIndex">
                        <svg :width="Math.floor(120/computed_milestones.length)-1" :height="milestone.GANTT_BAR_HEIGHT + 1" :style="'margin-top:' + milestone.GANTT_BAR_AUCHOR + 'px;'" >
                          <rect class="task-bar" x="0" y="0" 
                          rx="0" ry="0" :width="Math.floor(120/computed_milestones.length)-1" :height="milestone.GANTT_BAR_HEIGHT" v-bind:style="'fill:'+ getTaskColor(milestoneIndex) +';'" />
                          <text x="0" y="10" fill="red" style="font-size:12px">{{milestone.PercentageDone}}%</text>
                          Sorry, your browser does not support inline SVG.
                          <q-tooltip>
                              <span class="text-info">{{milestone.MilestoneName}}</span>: From 
                              <span class="text-yellow">{{milestone.StartDate|formatLocaleDateString}}</span> To 
                              <span class="text-yellow">{{milestone.EndDate|formatLocaleDateString}}</span>
                          </q-tooltip>
                        </svg>
                    </div>
                </td>
                <td class="gantt-task-item" v-for="(task, taskIndex) in computed_tasks" v-if="index == 0" v-bind:rowspan="computed_task_calendar.length" 
                    :style="computed_gridline_styles" :key="taskIndex">
                    <div style="float:left;">
                    <svg width="50" :height="task.GANTT_BAR_HEIGHT + 1" :style="'margin-top:' + task.GANTT_BAR_AUCHOR + 'px;'" >
                      <rect class="task-bar" x="5" y="0" 
                      rx="12" ry="30" width="40" :height="task.GANTT_BAR_HEIGHT" v-bind:style="'fill:'+ getTaskColor(taskIndex) +';'" />
                      <text x="9" y="10" fill="red" style="font-size:12px">{{task.PercentageDone}}%</text>
                      Sorry, your browser does not support inline SVG.
                      <q-tooltip>
                          <span class="text-info">{{task.TaskName}}</span>: From 
                          <span class="text-yellow">{{task.StartDate|formatLocaleDateString}}</span> To 
                          <span class="text-yellow">{{task.EndDate|formatLocaleDateString}}</span>
                      </q-tooltip>
                    </svg>
                    </div>
                </td>
            </tr>
            </tbody>
        </table>
        <q-modal ref="columnsFilterModal" position="left" :content-css="{padding: '50px', minWidth: '20vw'}">
            <div>
            <h5>Display Below Columns:</h5>
            <q-option-group
              type="toggle"
              v-model="availbleColumns"
              :options="computed_columns_options"
            />
            <q-btn color="secondary" @click="$refs.columnsFilterModal.close()">Close</q-btn>
            </div>
        </q-modal>
    </div>
</div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import { Toast, Dialog, QBtn, QTooltip, QSearch, QModal, QOptionGroup, date } from 'quasar'

export default {
  components: {
    QBtn,
    QTooltip,
    QSearch,
    QModal,
    QOptionGroup
  },
  mounted () {
  },
  data () {
    return {
      searchGantt: '',
      taskColors: ['#9ecde2', '#88a0aa', '#b3ddcd', '#9db5ac', '#b5d1ad', '#a3b79d', '#e0d1ba', '#b7afa3'],
      calendarOptions: {
        'intervalLabel': this.dateIntervalType,
        'intervalType': this.dateIntervalType === 'week' ? 'days' : this.dateIntervalType,
        'intervalValue': this.dateIntervalType === 'week' ? 7 : 1,
        'startDate': this.dateRange[0],
        'endDate': this.dateRange[1]
      },
      gridHeight: this.dateLabelHeight,
      gridLine: this.grid,
      ganttTasks: this.tasks,
      availbleColumns: this.tasks.map(item => item.TaskName),
      ganttMilestones: this.milestones
    }
  },
  filters: {
    formatLocaleDateTimeString: function (value) {
      return new Date(value).toLocaleDateString() + ' ' + new Date(value).toLocaleTimeString()
    },
    formatLocaleDateString: function (value) {
      return new Date(value).toLocaleDateString()
    }
  },
  props: {
    'dateRange': {
      type: Array,
      required: true
    },
    'dateIntervalType': {
      type: String,
      default: 'days'
    },
    'dateIntervalValue': {
      type: [String, Number],
      default: 1
    },
    'dateLabelHeight': {
      type: [String, Number],
      default: 24
    },
    'tasks': {
      type: Array,
      required: true
    },
    'milestones': {
      type: Array,
      required: true
    },
    'grid': {
      type: [Boolean],
      default: true
    }
  },
  watch: {
    tasks: function (newTasks) {
      this.ganttTasks = newTasks
      this.availbleColumns = this.ganttTasks.map(item => item.TaskName)
    },
    milestones: function (newMilestones) {
      this.ganttMilestones = newMilestones
    }
  },
  computed: {
    ...mapState({
      validated: state => state.user.validated
    }),
    ...mapGetters({
      current_user: 'currentUser'
    }),
    computed_start_date: function () {
      return this.calendarOptions.startDate
    },
    computed_end_date: function () {
      return this.calendarOptions.endDate
    },
    computed_task_calendar: function () {
      let options = Object()
      options[this.calendarOptions.intervalType] = this.calendarOptions.intervalValue
      return this.getTaskDateItems(this.calendarOptions.startDate, this.calendarOptions.endDate, options)
    },
    computed_milestones: function () {
      for (let milestone of this.ganttMilestones) {
        let barProperties = this.getTaskBarProperties(this.calendarOptions.startDate, milestone.StartDate, milestone.EndDate)
        milestone.GANTT_BAR_AUCHOR = barProperties.ANCHOR
        milestone.GANTT_BAR_HEIGHT = barProperties.HEIGHT
      }
      return this.ganttMilestones
    },
    computed_tasks: function () {
      let newTasks = []
      let availColumnsText = this.availbleColumns.map(item => '\'' + item + '\'').join(',')
      let keywords = this.searchGantt.trim().split(' ')
      let keywordTexts = keywords.join('|')
      if (keywordTexts && keywordTexts.length > 0) {
        let regRule = new RegExp('' + keywordTexts, 'ig')
        for (let task of this.ganttTasks) {
          if (availColumnsText.indexOf(task.TaskName) < 0) {
            continue
          }
          let matches = task.TaskName.match(regRule)
          if (matches && matches.length > 0) {
            let barProperties = this.getTaskBarProperties(this.calendarOptions.startDate, task.StartDate, task.EndDate)
            task.GANTT_BAR_AUCHOR = barProperties.ANCHOR
            task.GANTT_BAR_HEIGHT = barProperties.HEIGHT
            newTasks.push(task)
          }
        }
      }
      else {
        for (let task of this.ganttTasks) {
          if (availColumnsText.indexOf(task.TaskName) < 0) {
            continue
          }
          let barProperties = this.getTaskBarProperties(this.calendarOptions.startDate, task.StartDate, task.EndDate)
          task.GANTT_BAR_AUCHOR = barProperties.ANCHOR
          task.GANTT_BAR_HEIGHT = barProperties.HEIGHT
          newTasks.push(task)
        }
      }
      return newTasks
    },
    computed_gridline_styles: function () {
      return this.gridLine ? 'background-image:url("statics/gridline.svg");background-repeat:repeat;' : ''
    },
    computed_columns_options: function () {
      return this.ganttTasks.map(function (task) {
        return {'label': task.TaskName, 'value': task.TaskName}
      })
    }
  },
  methods: {
    getTaskColor: function (taskIndex) {
      return this.taskColors[taskIndex % this.taskColors.length]
    },
    getTaskDateItems: function (startDate, endDate, intervalOptions) {
      let dateArray = []
      let currentDate = new Date(startDate)
      endDate = new Date(endDate)
      while (currentDate <= endDate) {
        dateArray.push(currentDate)
        currentDate = date.addToDate(currentDate, intervalOptions)
      }
      return dateArray
    },
    getTaskBarProperties: function (calcStartDate, taskStartDate, taskEndDate) {
      let begTimeSpan = date.getDateDiff(taskStartDate, calcStartDate, 'days')
      let taskTimeSpan = date.getDateDiff(taskEndDate, taskStartDate, 'days')
      let taskBarLeftTopPos = Math.round(begTimeSpan * (this.gridHeight + 2) * 1.0 / this.calendarOptions.intervalValue)
      let taskBarHeight = Math.round((taskTimeSpan + 1) * (this.gridHeight + 2) * 1.0 / this.calendarOptions.intervalValue)
      taskBarHeight = (taskBarHeight < this.gridHeight / 2) ? (this.gridHeight / 2) : taskBarHeight
      return {'ANCHOR': taskBarLeftTopPos, 'HEIGHT': taskBarHeight}
    },
    openChangeFilterModal: function () {
      this.$refs.columnsFilterModal.open()
    },
    changeCalendarOptions: function () {
      Dialog.create({
        title: 'Gantt Configuration',
        message: 'Dont forget to save!',
        form: {
          header1: {
            type: 'heading',
            label: '<h5>Calendar Interval:</h5>'
          },
          group1: {
            type: 'radio',
            model: '' + this.calendarOptions.intervalLabel,
            items: [
              {label: 'Days', value: 'days', color: 'primary'},
              {label: 'Weeks', value: 'week', color: 'secondary'},
              {label: 'Months', value: 'month', color: 'amber'},
              {label: 'Years', value: 'year', color: 'brown'}
            ]
          },
          header2: {
            type: 'heading',
            label: '<h5>Grid Properties:</h5>'
          },
          group22: {
            type: 'toggle',
            model: [this.gridLine ? 'grid' : ''],
            items: [
              {label: 'Grid Line', value: 'grid', color: 'amber'}
            ]
          },
          group21: {
            type: 'slider',
            label: 'Grid Height:',
            min: 24,
            max: 60,
            withLabel: true,
            markers: true,
            model: this.gridHeight,
            color: 'secondary'
          }
        },
        buttons: [
          'Cancel',
          {
            label: 'Save',
            handler: (data) => {
              let intervalValue = data.group1
              this.calendarOptions.intervalLabel = intervalValue
              switch (intervalValue) {
                case 'days':
                  this.calendarOptions.intervalType = intervalValue
                  this.calendarOptions.intervalValue = 1
                  break
                case 'week':
                  this.calendarOptions.intervalType = 'days'
                  this.calendarOptions.intervalValue = 7
                  break
                case 'month':
                  this.calendarOptions.intervalType = 'days'
                  this.calendarOptions.intervalValue = 30
                  break
                case 'year':
                  this.calendarOptions.intervalType = 'days'
                  this.calendarOptions.intervalValue = 365
                  break
                default:
                  Toast.create('Failed due to unknown option value!')
                  break
              }
              this.gridHeight = data.group21
              this.gridLine = (data.group22 !== undefined && data.group22.length > 0)
            }
          }
        ]
      })
    }
  }
}
</script>

<style scoped>
.gantt-layout {
  width: 75vw;
  overflow-x: auto;
  margin-left: 6em;
}
.gantt {
  border-top:1px dotted #ccc;
  border-right:1px solid #ccc;
  table-layout:fixed;
  margin-left:1px;
}
.gantt-left {
  position:absolute;
  left: 0px;
  width: 6em;
}
.gantt-task-header {
  width: 10vw;
  min-width: 120px;
}
.gantt td {
  padding:0px;
  overflow: hidden;
  text-overflow: ellipsis;
}
.gantt-calendar-label {
  padding:0px;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: center;
  font-weight:bold;
  color: #518965;
  border-bottom:1px dotted #ccc;
  border-right:1px solid #ccc;
}
.gantt-task-item {
  border-bottom:1px dotted #ccc;
  border-right:1px solid #a3af8b;
  vertical-align: top;
  text-align: left;
}
.task-title {
  display: inline-block;
  width: 10vw;
  min-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 14px;
  font-weight: bold;
}
.task-bar {
  stroke-width: 2;
  stroke:blue;
  opacity:0.5;
  z-index: 10;
}

.task-bar:hover {
  stroke-width: 2;
  stroke:red;
  opacity:1;
  z-index: 10;
}
.task-bar1 {
  display: inline-block;
  width: 40%;
  height: 100%;
}
</style>