
const {register, login} = require('./auth.controller');

const express = require('express');

const Userrouter = express.Router();


Userrouter.post('/register', register)
Userrouter.post('/login', login)


module.exports = Userrouter;