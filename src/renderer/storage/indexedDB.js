import Dexie from 'dexie'

const DB_TASKER = 'tasker'
const COL_ID = '++id'
const COL_TASK_NAME = 'taskName'
const COL_DISPLAY_ORDER = 'displayOrder'
const db = new Dexie(DB_TASKER)
db.version(1).stores({tasks: [COL_ID, COL_TASK_NAME, COL_DISPLAY_ORDER].join(',')})

export default db
