/**
 * @author: ralphlee
 */

/**
 errors: nghiem trong, anh hương den hoat dong
 warnings,
 debug,
 info,
 requestId or traceId
 */
'use strict';


const { createLogger, format, transports } = require('winston');
require('winston-daily-rotate-file')
const {v4: uuid} = require('uuid')


class MyLogger {


    constructor () {

        const formatPrint = format.printf(
            ({ level, message, context, requestId, timestamp, metadata }) => {
                return `${timestamp}:: ${level} :: ${context}:: ${requestId}:: ${message} ::${JSON.stringify(metadata)}`
            }
        )

        this.logger = createLogger({
            format: format.combine(
                format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss ' }),
                formatPrint
            ),
            transports: [
                new transports.Console(),
                new transports.DailyRotateFile({
                    level: 'info',
                    dirname: 'src/logs',
                    filename: 'application-%DATE%.info.log',
                    datePattern: 'YYYY-MM-DD-HH',
                    zippedArchive: true, // backup log zipped archive
                    maxSize: '5m',// dung luong file log
                    maxFiles: '14d',// xoa trong vong 14 ngay
                    format: format.combine(
                        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
                        formatPrint
                    )
                }),
                new transports.DailyRotateFile({
                    level: 'error',
                    dirname: 'src/logs',
                    filename: 'application-%DATE%.error.log',
                    datePattern: 'YYYY-MM-DD-HH',
                    zippedArchive: true, // backup log zipped archive
                    maxSize: '5m',// dung luong file log
                    maxFiles: '14d',// xoa trong vong 14 ngay
                    format: format.combine(
                        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
                        formatPrint
                    )
                }),
            ]
        })
    }


    commonParams(params) {
        let context, req, metadata;
        if (!Array.isArray(params)) {
            context = params
        } else {
            [ context, req, metadata ] = params;
        }

        const requestId = req?.requestId || uuid()

        return {
            requestId,
            context,
            metadata
        }
    }

    log(message, params) {
        const paramLog = this.commonParams(params)
        const logObject = Object.assign({
            message
        }, paramLog);

        this.logger.info(logObject)
    }

    error(message, params) {
        const paramLog = this.commonParams(params)
        const logObject = Object.assign({
            message
        }, paramLog);

        this.logger.error(logObject)
    }

}


module.exports = new MyLogger()