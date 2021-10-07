const uuid = require('uuid/v4')
const { validationResult } = require('express-validator')
const HttpError = require('../models/http-error')

// const getCoordsForAddress = require('../util/location')
const Place = require('../models/place')

let DUMMY_PLACES = [
    {
        id: 'p1',
        title: 'Empire State Building',
        description: 'One of the most famous sky scrapers in the world!',
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/NYC_Empire_State_Building.jpg/640px-NYC_Empire_State_Building.jpg',
        address: '20 W 34th St, New York, NY 10001',
        location: {
          lat: 40.7484405,
          lng: -73.9878584
        },
        creator: 'u1'
    }
]

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
    
    let places
    try {
        places = await Place.find({ creator: userId })
    } catch (err) {
        const error = new HttpError('Could not find places with that user.', 500)
        return next(error)
    }

    if (!places || places.length === 0) {
        // return res.status(404).json({ message: 'Could not find a place for the provided user id.' })
        // const error = new Error('Could not find a place for the provided user id.')
        // error.code = 404
        return next(new HttpError('Could not find a places for the provided user id.', 404))
    }

    res.json({ places: places.map(place => place.toObject({ getters: true })) })
}

const createPlace = async (req, res, next) => {
    const errors = validationResult(req)
    console.log(errors);
    if (!errors.isEmpty()) {
        throw new HttpError('Invalid input passed.', 422)
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

    // DUMMY_PLACES.push(createdPlace) // unshift(createdPlace)
    try {
        console.log(createdPlace);
        await createdPlace.save()
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
        throw new HttpError('Invalid input passed.', 422)
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

const deletePlace = (req, res, next) => {
    const placeId = req.params.placeId
    if (!DUMMY_PLACES.find(place => place.id === placeId)) {
        throw new HttpError('Could not find a place for that id.', 404)
    }
    
    DUMMY_PLACES = DUMMY_PLACES.filter(place => place.id !== placeId)
    res.status(200).json({ message: 'Deleted place.' })
}

exports.getPlaceById = getPlaceById
exports.getPlacesByUserId = getPlacesByUserId
exports.createPlace = createPlace
exports.updatePlace = updatePlace
exports.deletePlace = deletePlace