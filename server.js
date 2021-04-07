const express = require('express') // always a first step. 
const app = express() //to avoid having express() with every coming line of code
const MongoClient = require('mongodb').MongoClient // to connect to the database. 
const PORT = 2121
require('dotenv').config()

let db, //holds the entire db and will be used in all the routes. 
  dbConnectionStr = process.env.DB_STRING, // string from mongoatlas
  dbName = "todo" 

MongoClient.connect(dbConnectionStr, {useUnifiedTopolgy: true}) //takes 2 things a string and object that handles the errors. 
  .then(client => {
    console.log(`Hey, connected to ${dbName} database`)
    db = client.db(dbName)
  })
  .catch(err => {
    console.log(err)
  })

app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(express.urlencoded({extended:true})) //enabkles us to view our applications. 
app.use(express.json())

app.get('/', async (req,res) => {
  const todoItems = await db.collection('todos').find().toArray()
  const itemsLeft = await db.collection('todos').countDocuments({completed: false})
  res.render('index.ejs', {zebra: todoItems, left: itemsLeft})
  // db.collection('todos').find().toArray()
  // .then(data => {
  //   db.collection('todos').countDocuments({completed: false})
  //   .then(itemLeft => {
  //     res.render('index.ejs', {zebra: data, left: itemLeft})
  //   })
  // })
  
})

app.post('/createTodo', (req,res) => {
  db.collection('todos').insertOne({todo: req.body.todoItem, completed: false}) //now send it to mongo by inserting a doc.
  .then(result => {
    console.log('Todo has been added!')
    res.redirect('/')
  })
})

app.put('/markComplete', (req,res) => {
  db.collection('todos').updateOne({todo: req.body.rainbowUnicorn}, {
    $set: {
      completed: true
    }
  })
  .then(result => {
    console.log('marked complete')
    res.json('marked complete')
  })
})

app.put('/undo', (req,res) => {
  db.collection('todos').updateOne({todo: req.body.rainbowUnicorn}, {
    $set: {
      completed: false
    }
  })
  .then(result => {
    console.log('marked complete')
    res.json('marked complete')
  })
})

app.delete('/deleteTodo', (req, res) => {
  console.log(req.body.rainbowUnicorn)
  db.collection('todos').deleteOne({todo: req.body.rainbowUnicorn})
  .then(result => {
    console.log('Deleted Todo')
    res.json('Deleted it')
  })
  
})

//to start server
app.listen(process.env.PORT || PORT, () => {
  console.log('Server is running, better catch it')
})