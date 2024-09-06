const express = require('express')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')

const app = express()
app.use(express.json())
const dbPath = path.join(__dirname, 'todoApplication.db')
let db = null

const startServerAndDb = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })

    app.listen(3000, () => {
      console.log('Server Running at http://localhost:3000/')
    })
  } catch (error) {
    console.log(`DB Error: ${error.message}`)
  }
}

startServerAndDb()

//API1
app.get('/todos/', async (request, response) => {
  const {search_q = '', priority = '', status = ''} = request.query
  const getTodosQuery = `
  select * from todo
  where todo like '%${search_q}%' and priority like '%${priority}%' and status like '%${status}%'

  `
  const data = await db.all(getTodosQuery)
  console.log(data)
  response.send(data)
})

//API2
app.get('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const getQuery = `
    select * from todo
    where id=${todoId};
    `
  const dbResponse = await db.get(getQuery)
  response.send(dbResponse)
})

//API3
app.post('/todos/', async (request, response) => {
  const {id, todo, priority, status} = request.body
  const postQuery = `
    insert into todo(id,todo,priority,status)
    values(
      ${id},'${todo}','${priority}','${status}'
    )
    `
  await db.run(postQuery)
  response.send('Todo Successfully Added')
})

//API4 !
app.put('/todos/:todoId/', async (request, response) => {
  const getPreviousTodo = `
  select * from todo`
  const previousTodo = await db.get(getPreviousTodo)
  const {
    todo = previousTodo.todo,
    status = previousTodo.status,
    priority = previousTodo.priority,
  } = request.body

  const {todoId} = request.params
  const putQuery = `
    update todo
    set
      id=${todoId},todo ='${todo}' ,priority='${priority}',status='${status}'
    where id = ${todoId};
    `
  await db.run(putQuery)
  console.log(Object.keys(request.body)[0])
  if (Object.keys(request.body)[0] === 'status') {
    response.send('Status Updated')
  } else if (Object.keys(request.body)[0] === 'priority') {
    response.send('Priority Updated')
  } else {
    response.send('Todo Updated')
  }
})

//API5
app.delete('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const deleteQuery = `
    delete from todo
    where id = ${todoId};
    `
  await db.run(deleteQuery)
  response.send('Todo Deleted')
})

module.exports = app
