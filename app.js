const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')

const placesRoutes = require('./routes/places-routes')
const usersRoutes = require('./routes/users-routes')
const HttpError = require('./models/http-error')

const app = express()

app.use(bodyParser.json())

app.use('/api/places', placesRoutes)
app.use('/api/users', usersRoutes)

// this middle is only reached of we have some request that did not recieve a response before, a res we dont want to handle
app.use((req, res, next) => {
    const error = new HttpError('Could not find this route.', 404)
    throw error
})

app.use((error, req, res, next) => {
    // cjeck if response header has already been sent 
    if (res.headerSent) {
        return next(error)
    }
    res.status(error.code || 500)
    res.json({ message: error.message || 'An unknown error occurred!'})
})

mongoose
  .connect('mongodb+srv://obakeng:uFHfBBJTxSdv640L@cluster0.k5oiv.mongodb.net/places?retryWrites=true&w=majority')
  .then(() => {
    app.listen(5000)
  })
  .catch(err => {
    console.log(err);
  }) 