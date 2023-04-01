import express from 'express'
import cors from 'cors'
import { engine } from 'express-handlebars'
import sqlite3 from 'sqlite3'
import cookieParser from 'cookie-parser'

const server = express()
const db = new sqlite3.Database('./database.db')

server.use(cors())
server.use(cookieParser())
server.use(express.json())
server.use(express.urlencoded({ extended: true }))

server.engine('.hbs', engine({ extname: ".hbs" }))
server.set('view engine', '.hbs')
server.set('views', './pages')

// ?e=Password Doesnt match
server.get('/login', (request, response) => {
    response.render('login', {
        error: request.query.e
    })
})

server.post('/login', (request, response) => {
    const username = request.body.username
    const password = request.body.password

    db.get('SELECT * FROM users WHERE username = ?;', [username], (error, row: any) => {
        if (row) {
            if (row.password != password) {
                response.redirect('/login?e=Passwords doesn`t match')
                // response.send('Passwords doesn`t match')
            }
            else {
                response
                    .cookie('username', username)
                    .redirect('/chat')
            }
        }
        else {
            db.run('INSERT INTO users (username, password) VALUES(?, ?)', [username, password], (error) => {
                response
                    .cookie('username', username)
                    .redirect('/chat')
            })
        }
    })
})

server.get('/chat', (request, response) => {

    if (!request.cookies.username) {
        response.redirect('/login')
        return
    }

    db.all('SELECT * FROM messages', (error, rows) => {

        const messages = rows.map((row: any) => ({
            id: row.id,
            username: row.username,
            message: row.message,
            own: row.username == request.cookies.username
        }))

        response.render('chat', {
            username: request.cookies.username,
            messages
        })
    })
})

server.post('/message', (request, response) => {
    if (!request.cookies.username) {
        response.redirect('/login')
        return
    }

    const message = request.body.message
    const username = request.cookies.username

    db.run('INSERT INTO messages(username, message) VALUES (?, ?)', [username, message], (error) => {
        response.redirect('/chat')
    })
})

server.listen(8080, () => console.log("Server is running on port 8080"))