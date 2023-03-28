import express from 'express'
import cors from 'cors'
import { engine } from 'express-handlebars'
import sqlite3 from 'sqlite3'

const server = express()
const db = new sqlite3.Database('./courses.db')

server.use(cors())
server.use(express.json())
server.use(express.urlencoded({ extended: true }))

server.engine('.hbs', engine({ extname: ".hbs" }))
server.set('view engine', '.hbs')
server.set('views', './pages')

server.get('/', (request, response) => {
    db.all('SELECT * FROM courses;', (error, rows) => {
        response.render('courses', {
            courses: rows
        })
    })
})

server.get('/course', (request, response) => {
    response.render('add-course')
})

server.post('/add-course', (request, response) => {
    const sql = 'INSERT INTO courses (name, duration, description) VALUES (?, ?, ?);'
    const params = [
        request.body.name,
        request.body.duration,
        request.body.description
    ]

    db.run(sql, params, (error) => {
        response.redirect('/')
    })
})

server.get('/course/:id/delete', (request, response) => {
    db.run('DELETE FROM courses WHERE id = ?', [request.params.id], (error) => {
        response.redirect('/')
    })
})

server.get('/lessons/:id', (request, response) => {
    db.get('SELECT * FROM courses WHERE id = ?', [request.params.id], (error, row) => {
        response.render('lessons', {
            course: row
        })
    })
    
})

server.listen(8080, () => console.log("Server is running on port 8080"))

// git add .
// git commit -m "posts"

// git push -u origin 2-posts
