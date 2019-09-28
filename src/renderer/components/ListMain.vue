<template>
  <div>
    <div>
      タスク:<input type="text" v-model="inputTask"><button type="button" @click="addTask(inputTask)">追加</button>
    </div>
    <draggable v-model="tasks" group="taskList" @start="drag=true" @end="endDrag">
      <div :ref="element.id + '_drag_item'" v-for="(element, index) in tasks" :key="element.id">
        <div class="task__name">
          <span :ref="element.id + '_text'" @dblclick="textDblClick(element.id)">{{element.taskName}}</span>
          <input v-model="element.taskName" @keypress="decideTaskNameByKeypress($event, element.id)" @focusout="decideTaskNameByFocusout(element.id)" type="text" class="display-none" :ref="element.id + '_input'">
        </div>
        <div class="task__menu">
          <SvgClose @click="clickIconClose(index, element.id)"/>
          <SvgOpenLock @change="clickIconLock(element.id)" />
          <SvgLock @change="clickIconLock(element.id)" />
        </div>
      </div>
    </draggable>  
  </div>
</template>

<style>
  body {
    background-color: white;
    color: black;
  }
  .task__name {
    display: inline-block;
    width: 400px;
  }
  .task__menu {
    display: inline-block;
    width: 100px;
  }
  .display-none {
    display: none;
  }
  .display-inline {
    display: inline;
  }
</style>
<script>
import draggable from 'vuedraggable'
import db from '../storage/indexedDB'
import SvgClose from '@/assets/icons/close-24px.svg'
import SvgOpenLock from '@/assets/icons/lock_open-24px.svg'
import SvgLock from '@/assets/icons/lock-24px.svg'
export default {
  components: {
    draggable,
    SvgClose,
    SvgOpenLock,
    SvgLock
  },
  computed: {
    jsonTasks () {
      return JSON.stringify(this.tasks, null, 2)
    }
  },
  methods: {
    clickIconLock (id) {
      console.debug('checkbox checked' + this.$refs['checkbox_lock_' + id][0].checked)
    },
    clickIconClose (index, id) {
      this.deleteTask(index, id)
    },
    textDblClick (id) {
      this.offTextOnInput(id)
      this.foucuInput(id)
    },
    decideTaskName (id) {
      let taskName = this.$refs[id + '_input'][0].value
      this.updateTask(id, taskName)
      this.offInputOnText(id)
    },
    decideTaskNameByFocusout (id) {
      this.decideTaskName(id)
    },
    decideTaskNameByKeypress (e, id) {
      if (e.keyCode === 13) {
        this.decideTaskName(id)
      }
    },
    foucuInput (id) {
      this.$refs[id + '_input'][0].focus()
    },
    offTextOnInput (id) {
      this.$refs[id + '_text'][0].classList.add('display-none')
      this.$refs[id + '_input'][0].classList.remove('display-none')
    },
    offInputOnText (id) {
      this.$refs[id + '_text'][0].classList.remove('display-none')
      this.$refs[id + '_input'][0].classList.add('display-none')
    },
    addTask (taskName) {
      var displayOrder = this.tasks.length
      db.tasks
        .add({displayOrder, taskName})
        .then((id) => {
          db.tasks.get(id)
            .then((data) => {
              this.tasks.push(data)
            })
        })
      this.inputTask = ''
    },
    updateTask (id, taskName) {
      db.tasks
        .update(id, {'taskName': taskName})
    },
    updateTasks () {
      db.transaction('rw', db.tasks, async () => {
        db.tasks.bulkPut(this.tasks)
      }).catch(err => {
        console.error(err.stack)
        this.loadTasks()
      })
    },
    deleteTask (index, id) {
      db.tasks
        .where({'id': id})
        .delete()
        .then(() => {
          this.tasks.splice(index, 1)
          this.numberingDisplayOrder()
          this.updateTasks()
        })
    },
    endDrag (evt) {
      evt.item.draggable = false
      this.numberingDisplayOrder()
      this.updateTasks()
    },
    loadTasks () {
      db.tasks
        .orderBy('displayOrder')
        .toArray()
        .then((data) => {
          console.debug(data)
          this.tasks = data
        })
    },
    numberingDisplayOrder () {
      for (let i = 0; i < this.tasks.length; i++) {
        this.tasks[i].displayOrder = i
      }
    }
  },
  data () {
    return {
      tasks: [],
      inputTask: ''
    }
  },
  mounted () {
    this.loadTasks()
  }
}
</script>
