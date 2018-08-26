// Connects to a custom AMQP Server and shows every message received on the console
const AMQPReceiver = require('../index');

// Defining variables
const exchange = "me";
const queue = "message";
const routing_key = "hello";

// Defining the custom AMQP Connection
const user = 'user';
const password = 'password';
const host = '192.168.1.50';
const port = '5672';
const connection_attempts = '5';
const heartbeat_interval = '5400';

// Defining the AMQP Server URL
const amqp_server = AMQPReceiver.obtain_url(user, password, host, port,
    connection_attempts, heartbeat_interval);

// Defining the receiver
const receiver = new AMQPReceiver(exchange, queue, routing_key, amqp_server);

// Starting to listen

// This is going to fail because the defined server does not exists and the receiver
// it's going to try to reconnect eternally.

// Be careful about defining incorrect AMQP Servers
receiver.start((message) => {
    console.log(message);
});
