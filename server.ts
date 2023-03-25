import express from 'express'
import cors from 'cors'
import { engine } from 'express-handlebars'
// +
import sqlite3 from 'sqlite3'

const server = express()
// +
const db = new sqlite3.Database('./posts.db')

server.use(cors())
server.use(express.json())
server.use(express.urlencoded({ extended: true }))

server.engine('.hbs', engine({ extname: ".hbs" }))
server.set('view engine', '.hbs')
server.set('views', './pages')

server.get('/add-post', (request, response) => {
    response.render('add-post')
})

server.get('/', (request, response) => {
    db.all('SELECT * FROM post;', (error, rows) => {
        console.log(error)
        response.render('index', {
            posts: rows
        })
    })
})

server.post('/new-post', (request, response) => {
    const sql = 'INSERT INTO post (nickname, content, date) VALUES (?, ?, ?);'
    const params = [
        request.body.nickname,
        request.body.content,
        new Date().toLocaleString()
    ]
    db.run(sql, params, (error) => {
        console.log(error)
        response.redirect('/')
    })
})

server.get('/delete/:id', (request, response) => {
    db.run('DELETE FROM post WHERE id = ?', [request.params.id], (error) => {
        console.log(error)
        response.redirect('/')
    })
})

server.listen(8080, () => console.log("Server is running on port 8080"))