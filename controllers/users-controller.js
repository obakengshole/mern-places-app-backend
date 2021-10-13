const uuid = require('uuid/v4')

const HttpError = require('../models/http-error')
const { validationResult } = require('express-validator')

const User = require('../models/user')

const DUMMY_USERS = [
    {
        id: 'u1',
        name: 'Obakeng Shole',
        email: 'test@test.com',
        password: 'tester'
    }
]

const getUsers = async (req, res, next) => {
    let users
    try {
        users = await User.find({}, '-password')
    } catch (err) {
        return next(
            new HttpError('Failed to fetch users, please try again later.', 500)
        )
    }
    res.json({ users: users.map(user => user.toObject({ getters: true })) })
}

const signup = async (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return next(
            new HttpError('Invalid input passed.', 422)
        )
    }

    const { name, email, password } = req.body

    let existingUser
    try {
        // find one document matching the criteria in the argument of our method
        existingUser = await User.findOne({ email: email })
    } catch (err) {
        const error = new HttpError('Signup failed, please try again later.', 500)
        return next(error)
    }

    if (existingUser) {
        const error = new HttpError('User already exists. Please login instead', 422)
        return next(error)
    }

    const createdUser = new User({
        name,
        email,
        image: 'https://live.staticflickr.com/7631/26849088292_36fc52ee90_b.jpg',
        password,
        places: []
    })

    try {
        await createdUser.save()
    } catch (err) {
        const error = new HttpError('Signup failed, please try again later.', 500)
        return next(error)
    } 

    res.status(201).json({ user: createdUser.toObject({ getters: true }) })
}

const login = async (req, res, next) => {
    const { email, password } = req.body

    let existingUser
    try {
        // find one document matching the criteria in the argument of our method
        existingUser = await User.findOne({ email: email })
    } catch (err) {
        const error = new HttpError('Login failed, please try again later.', 500)
        return next(error)
    }

    if (!existingUser || existingUser.password !== password) {
        return next(
            new HttpError('Login failed, invalid credentials.', 401)
        )
    }

    res.json({ message: 'Logged in'})
}

exports.getUsers = getUsers
exports.signup = signup
exports.login = login