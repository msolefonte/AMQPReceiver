// Connects to the default AMQP Server and shows every message received on the console
const AMQPReceiver = require('../index');

// Defining variables
const exchange = "me";
const queue = "message";
const routing_key = "hello";


// Creating the receiver
const receiver = new AMQPReceiver(exchange, queue, routing_key);


// Stops the server after 10 seconds
setTimeout(function() {
        receiver.stop()
    },
    10000
);

// Starting to listen
receiver.start((message) => {
   console.log(message);
});

