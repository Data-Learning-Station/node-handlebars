import express from 'express'
import cors from 'cors'
import { engine } from 'express-handlebars'
import { v4 } from 'uuid'

import sqlite3 from 'sqlite3'

const server = express()

const db = new sqlite3.Database('./database.db')

server.use(cors())
server.use(express.json())
server.use(express.urlencoded({ extended: true }))

server.engine('.hbs', engine({ extname: ".hbs" }))
server.set('view engine', '.hbs')
server.set('views', './pages')

server.get('/', (request, response) => {

    db.all('SELECT * FROM users;', (error, rows) => {
        console.log(error)
        console.log(rows)

        response.render('index', { 
            users: rows, 
            totalUsers: rows.length 
        })
    })
})

server.post('/', (request, response) => {
    
    const params = [
        v4(),
        request.body.name,
        request.body.surname,
        request.body.age
    ]

    db.run('INSERT INTO users(id, name, surname, age) VALUES(?, ?, ?, ?);', params, (error) => {
        console.log(error)
        response.redirect('/')
    })
})

server.get('/:id/delete', (request, response) => {
    const id = request.params.id

    db.run('DELETE FROM users WHERE id = ?', [id], (error) => {
        console.log(error)
        response.redirect('/')
    })
})

server.listen(8080, () => console.log("Server is running on port 8080"))