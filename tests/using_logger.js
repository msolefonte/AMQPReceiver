// Connects to the default AMQP Server and shows every message received on the console
// Logging is enabled using a Winston logger
// IMPORTANT!! You need to install winston to execute this example.

const AMQPReceiver = require('../index');
const { createLogger, format, transports } = require('winston');

// Defining variables
const exchange = "me";
const queue = "message";
const routing_key = "hello";

// Defining the logger
const logger = createLogger({
    format: format.combine(
        format.timestamp(),
        format.json()
    ),
    transports: [
        new transports.Console({
            level: 'info',
            colorize: true
        })
    ]
});


// Defining the sender setting the logger
const receiver = new AMQPReceiver(exchange, queue, routing_key, queue_path, undefined, logger);

// Sending the message
receiver.start((message) => {
    console.log(message);
});
