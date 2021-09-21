const HttpError = require('../models/http-error')

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

const getPlaceById = (req, res, next) => {
    const placeId = req.params.placeId
    const place = DUMMY_PLACES.find(place => {
        return place.id === placeId
    })

    if (!place) {
        // return res.status(404).json({ message: 'Could not find a place for the provided id.' })
        throw new HttpError('Could not find a place for the provided id.', 404)
    }

    res.json({ place })
}

const getPlaceByUserId = (req, res, next) => {
    const userId = req.params.userId
    const place = DUMMY_PLACES.find(place => {
        return place.creator === userId
    })

    if (!place) {
        // return res.status(404).json({ message: 'Could not find a place for the provided user id.' })
        // const error = new Error('Could not find a place for the provided user id.')
        // error.code = 404
        return next(new HttpError('Could not find a place for the provided user id.', 404))
    }

    res.json({ place })
}

const createPlace = (req, res, next) => {
    const { title, description, coordinates, address, creator} = req.body
    const createdPlace = {
        id: 123,
        title,
        description,
        location: coordinates,
        address,
        creator
    }

    DUMMY_PLACES.push(createdPlace) // unshift(createdPlace)

    res.status(201).json({ place: createdPlace }) // status code setnt if something was created on the server
}

const updatePlace = (req, res, next) => {
    const { title, description } = req.body
    const placeId = req.params.placeId

    const updatedPlace = { ...DUMMY_PLACES.find(p => p.id === placeId) }
    const placeIndex = DUMMY_PLACES.findIndex(p => p.id === placeId)
    updatedPlace.title = title
    updatedPlace.description = description

    DUMMY_PLACES[placeIndex] = updatedPlace

    res.status(200).json({ place: updatedPlace })
}

const deletePlace = (req, res, next) => {
    const placeId = req.params.placeId
    DUMMY_PLACES = DUMMY_PLACES.filter(place => place.id !== placeId)
    res.status(200).json({ message: 'Deleted place.' })
}

exports.getPlaceById = getPlaceById
exports.getPlaceByUserId = getPlaceByUserId
exports.createPlace = createPlace
exports.updatePlace = updatePlace
exports.deletePlace = deletePlace