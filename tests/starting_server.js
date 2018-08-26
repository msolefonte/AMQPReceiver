// Connects to the default AMQP Server and shows every message received on the console
const AMQPReceiver = require('../index');

// Defining variables
const exchange = "me";
const queue = "message";
const routing_key = "hello";

// Creating the receiver and starting to listen
new AMQPReceiver(exchange, queue, routing_key).start((message) => {
   console.log(message);
});