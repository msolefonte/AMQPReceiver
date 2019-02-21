# AMQPReceiver 1.0.1 library for Node.js

AMQPReceiver is a library that allows developers to receive AMQP messages with persistence transparently

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing 
purposes. See deployment for notes on how to deploy the project on a live system

### Dependences

AMQPReceiver requires the packages:
- [amqplib](https://github.com/squaremo/amqp.node) - To interact with the AMQP Server

[Optional]
- [winston](https://github.com/winstonjs/winston) - To add a log to AMQPReceiver. By default there is no log


### Installing

If you already have `Node.js` and `npm` on your system you can install the library simply by downloading the 
distribution, unpack it and install in the usual fashion:

```
npm install amqp-receiver
```

## Usage

The recommended way to use `amqp-receiver` is to create your own receiver. You have to start the receiver to start 
receiving messages and it is going to reconnect automatically and to execute a callback every time a message is 
received

```js
const AMQPReceiver = require('amqp-receiver');
const receiver = new AMQPReceiver('foo', 'bar', 'foo.bar.*');

receiver.start((message) => {
    console.log(message);
})
```
**__IMPORTANT!!__** Executing the AMQPReceiver creates a persistent queue on the AMQP Server that ensures persistence of
messages. However, persistence can not be ensured if AMQPReceiver has not been executed before, so messages received 
before the initialization can be lost.

## Running the tests

If you want to execute tests to try AMQPReceiver you have the folder `./tests/` which includes two tests:
 * [starting_server.js](https://github.com/msolefonte/AMQPReceiver/blob/master/tests/starting_server.js) - Example of 
 showing on console messages received from a default RabbitMQ Server
 * [stoping_server.js](https://github.com/msolefonte/AMQPReceiver/blob/master/tests/stoping_server.js) - Example of 
 starting and clossing a connection to a default RabbitMQ Server
 * [using_custom_amqp_server.js](https://github.com/msolefonte/AMQPReceiver/blob/master/tests/using_custom_amqp_server.js) - 
 Example of showing on console messages received from a custom AMQP Server
 * [using_logger.js](https://github.com/msolefonte/AMQPReceiver/blob/master/tests/using_logger.js) - Example of logging 
 using a Winston logger
 
**__IMPORTANT!!__** To test `using_logger.js` you have to install Winston which is not a dependence by default

## Authors

* **Marc Solé Fonte** - *Initial work* - [msolefonte](https://github.com/msolefonte/)

## License

This project is licensed under the MIT License - see the 
[LICENSE.md](https://github.com/msolefonte/AMQPReceiver/blob/master/LICENSE.md) file for details

## Acknowledgments

* Thanks to the authors and contributors of [amqplib](https://github.com/squaremo/amqp.node)
* Thanks to all the people that have helped or supported me during this development

## Changelog

- 1.0.0 - 27/08/2018 - Initial release
- 1.0.1 - 27/08/2018 - Solves a minor bug with the logger
