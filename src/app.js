
require('dotenv').config()
const compression = require('compression')
const express = require('express')
const { default: helmet } = require('helmet')
const cors = require('cors')
const morgan = require('morgan')
const app = express()
const { v4: uuid } = require('uuid')

//cors

const corsOptions = {
    origin: 'http://localhost:3000',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    optionsSuccessStatus: 204
}

app.use(cors(corsOptions))

//middleware
app.use(morgan("combined"))
app.use(helmet())
app.use(compression())
app.use(express.json())
app.use(express.urlencoded({
    extended: true
}))

app.use((req, res, next) => {
    const requestId = req.headers[ 'x-request-id' ]
    req.requestId = requestId ? requestId : uuid()
    myloggerLog.log(`input params :: ${req.method}::`, [
        req.path,
        { requestId: req.requestId },
        req.method === 'POST' ? req.body : req.query
    ])

    next()
})


//test pub.sub redis
// require('./test/inventory.test')
// const productTest = require('./test/product.test')
// productTest.purchaseProduct('product:001',10)

//init db
require('./dbs/init.mongodb')
const initRedis = require('./dbs/init.redis')
const myloggerLog = require('./loggers/mylogger.log')
initRedis.initRedis()
// const { checkOverload} = require('./helpers/check.connect')
// checkOverload()
//init routes
app.use('/', require('./routes'))

// handle errors

app.use((req, res, next) => {
    const error = new Error('Not Found')
    error.status = 404
    next(error)
})

app.use((error, req, res, next) => {
    const statusCode = error.status || 500
    const resMessage = `${error.status} - ${Date.now()}ms - response: ${JSON.stringify(error)}`
    myloggerLog.error(resMessage, [
        req.path,
        { requestId: req.requestId },
        {
            message: error.message
        }
    ])

    return res.status(statusCode).json({
        status: 'error',
        code: statusCode,
        stack: error.stack,
        message: error.message || 'Internal Server Error'
    })
})


module.exports = app