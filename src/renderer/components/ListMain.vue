<template>
  <div>
    <div>
      タスク:<input type="text" v-model="inputTask"><button type="button" @click="addTask(inputTask)">追加</button>
    </div>
    <draggable v-model="tasks" group="taskList" @start="drag=true" @end="endDrag">
      <div :ref="element.id + '_drag_item'" v-for="(element, index) in tasks" :key="element.id">
        <div class="task__name">
          <span :ref="element.id + '_text'" @dblclick="textDblClick(element.id)">{{element.taskName}}</span>
          <input v-model="element.taskName" @keypress="decideTaskNameByKeypress($event, element.id, index)" @focusout="decideTaskNameByFocusout(element.id, index)" type="text" class="display-none" :ref="element.id + '_input'">
        </div>
        <div class="task__menu">
          <SvgClose v-if="!element.locked" @click="clickIconClose(element.id, index)" ></SvgClose>
          <SvgLock v-if="element.locked" @click="clickIconLock(element.id, index, 0)" ></SvgLock>
          <SvgOpenLock v-else @click="clickIconLock(element.id, index, 1)" ></SvgOpenLock>
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
import {db, COL_ID, COL_TASK_NAME, COL_DISPLAY_ORDER, COL_LOCKED} from '@/storage/indexedDB'
import SvgClose from '@/assets/icons/close-24px.svg'
import SvgOpenLock from '@/assets/icons/lock_open-24px.svg'
import SvgLock from '@/assets/icons/lock-24px.svg'
export default {
  name: 'main-task-list',
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
    clickIconLock (id, index, lockValue) {
      console.debug('id:' + id + ' index:' + index + ' lockValue:' + lockValue)
      this.tasks[index].locked = lockValue
      this.updateLocked(id, lockValue)
    },
    clickIconClose (id, index) {
      this.deleteTask(id, index)
    },
    textDblClick (id) {
      this.offTextOnInput(id)
      this.foucuInput(id)
    },
    decideTaskName (id, index) {
      let taskName = this.tasks[index].taskName
      this.updateTaskName(id, taskName)
      this.offInputOnText(id)
    },
    decideTaskNameByFocusout (id, index) {
      this.decideTaskName(id, index)
    },
    decideTaskNameByKeypress (e, id, index) {
      if (e.keyCode === 13) {
        this.decideTaskName(id, index)
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
        .add({[COL_DISPLAY_ORDER]: displayOrder, [COL_TASK_NAME]: taskName, [COL_LOCKED]: 0})
        .then((id) => {
          db.tasks.get(id)
            .then((data) => {
              this.tasks.push(data)
            })
        })
        .catch((error) => {
          console.error(error)
        })
      this.inputTask = ''
    },
    updateTaskName (id, taskName, locked) {
      db.tasks
        .update(id, {[COL_TASK_NAME]: taskName})
    },
    updateLocked (id, locked) {
      db.tasks
        .update(id, {[COL_LOCKED]: locked})
        .catch((error) => {
          console.error(error)
        })
    },
    updateTasks () {
      db.transaction('rw', db.tasks, async () => {
        db.tasks.bulkPut(this.tasks)
      }).catch(err => {
        console.error(err.stack)
        this.loadTasks()
      })
    },
    deleteTask (id, index) {
      db.tasks
        .where({[COL_ID]: id})
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
        .orderBy(COL_DISPLAY_ORDER)
        .toArray()
        .then((data) => {
          console.debug(data)
          this.tasks = data
        })
        .catch((error) => {
          console.error(error)
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
