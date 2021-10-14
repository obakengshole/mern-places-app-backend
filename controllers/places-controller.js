const uuid = require('uuid/v4')
const { validationResult } = require('express-validator')
const HttpError = require('../models/http-error')
const mongoose = require('mongoose')

// const getCoordsForAddress = require('../util/location')
const Place = require('../models/place')
const User = require('../models/user')

const getPlaceById = async (req, res, next) => {
    const placeId = req.params.placeId

    let place
    try {
        place = await Place.findById(placeId)
    } catch (err) {
        const error = new HttpError('Could not find place.', 500)
        return next(error)
    }

    if (!place) {
        // return res.status(404).json({ message: 'Could not find a place for the provided id.' })
        const error = new HttpError('Could not find a place for the provided id.', 404)
        return next(error)
    }

    res.json({ place: place.toObject({ getters: true }) })
}

const getPlacesByUserId = async (req, res, next) => {
    const userId = req.params.userId
    
    // let places
    let userWithPlaces
    try {
        // places = await Place.find({ creator: userId })
        userWithPlaces = await User.findById(userId).populate('places') // access places property
    } catch (err) {
        const error = new HttpError('Could not find places with that user.', 500)
        return next(error)
    }

    // if (!places || places.length === 0)
    if (!userWithPlaces || userWithPlaces.places.length === 0) {
        // return res.status(404).json({ message: 'Could not find a place for the provided user id.' })
        // const error = new Error('Could not find a place for the provided user id.')
        // error.code = 404
        return next(new HttpError('Could not find a places for the provided user id.', 404))
    }

    res.json({ places: userWithPlaces.places.map(place => place.toObject({ getters: true })) })
}

const createPlace = async (req, res, next) => {
    const errors = validationResult(req)
    console.log(errors);
    if (!errors.isEmpty()) {
        return next(
            new HttpError('Invalid input passed.', 422)
        )
    }

    const { title, description, coordinates, address, creator } = req.body
    const createdPlace = new Place({
        title,
        description,
        address,
        location: coordinates,
        image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/NYC_Empire_State_Building.jpg/640px-NYC_Empire_State_Building.jpg',
        creator
    })

    let user
    try {
        user = await User.findById(creator)
    } catch (err) {
        return next(
            new HttpError('Creating place failed, user not found.', 500)
        )
    }

    if (!user) {
        return next(
            new HttpError('Creating place failed, user id not found.', 404)
        )
    }

    // DUMMY_PLACES.push(createdPlace) // unshift(createdPlace)
    try {
        const session = await mongoose.startSession()
        session.startTransaction()
        await createdPlace.save({ session })

        // not the standard push, used by mongoose to establish the connection bt the 2 models
        // mongoose only adds the places id 
        user.places.push(createdPlace)

        await user.save({ session })

        // only at this point are changes saved to database, if anything goes wrong in tasks that are part
        // of the session, all changes will be rolled back by mongodb
        await session.commitTransaction()
    } catch (err) {
        const error = new HttpError('Creating place failed, please try again.', 500)
        console.log(err);
        return next(error)
    }

    res.status(201).json({ place: createdPlace }) // status code setnt if something was created on the server
}

const updatePlace = async (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return next(
            new HttpError('Invalid input passed.', 422)
        )
    }
    
    const { title, description } = req.body
    const placeId = req.params.placeId

    let place
    try {
        place = await Place.findById(placeId)
    } catch (err) {
        const error = new HttpError('Could not update place because place not found, please try again.', 404)
        console.log(err);
        return next(error)
    }

    place.title = title
    place.description = description

    try {
        await place.save()
    } catch (err) {
        const error = new HttpError('Creating place failed, please try again.', 500)
        console.log(err);
        return next(error)
    }

    res.status(200).json({ place: place.toObject({ getters: true }) })
}

const deletePlace = async (req, res, next) => {
    const placeId = req.params.placeId

    let place
    try {
        place = await Place.findById(placeId).populate('creator')
    } catch (err) {
        const error = new HttpError('Could not delete place, place not found.', 500)
        return next(error)
    }

    if (!place) {
        return next(
            new HttpError('Could not find place for this id.', 404)
        )
    }

    try {
        const session = await mongoose.startSession()
        session.startTransaction()
        await place.remove({ session })
        place.creator.places.pull(place) // removes the place from the user
        await place.creator.save({ session }) // save user after deleting place from it
        await session.commitTransaction()
    } catch (err) {
        const error = new HttpError('Could not delete place.', 500)
        return next(error)
    }

    res.status(200).json({ message: 'Deleted place.' })
}

exports.getPlaceById = getPlaceById
exports.getPlacesByUserId = getPlacesByUserId
exports.createPlace = createPlace
exports.updatePlace = updatePlace
exports.deletePlace = deletePlace