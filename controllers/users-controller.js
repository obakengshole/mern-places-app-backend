// const uuid = require('uuid/v4')

const HttpError = require('../models/http-error')

const DUMMY_USERS = [
    {
        id: 'u1',
        name: 'Obakeng Shole',
        email: 'test@test.com',
        password: 'tester'
    }
]

const getUsers = (req, res, next) => {
    res.json({ users: DUMMY_USERS })
}

const signup = (req, res, next) => {
    const { name, email, password } = req.body

    const hasUser = DUMMY_USERS.find(user => user.email === email)
    if (hasUser) {
        throw new HttpError('Could not create user, email already exists.', 422)
    }

    const createdUser = {
        id: 123,
        name,
        email,
        password
    }

    DUMMY_USERS.push(createdUser)

    res.status(201).json({ user: createdUser })
}
const login = (req, res, next) => {
    const { email, password } = req.body

    const identifiedUser = DUMMY_USERS.find(user => user.email === email)
    if (!identifiedUser) {
        throw new HttpError('Could not identify user. Check credentials.', 401)
    }

    res.json({ message: 'Logged in'})
}

exports.getUsers = getUsers
exports.signup = signup
exports.login = login