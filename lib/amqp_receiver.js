#!/usr/bin/env node

const amqp = require('amqplib/callback_api');

class AMQPReceiver {
    /**
     * This constructor requires all the basic arguments to connect to an
     * AMQP Server, to set the logger and the exchange, the queue and the
     * routing_key that are declared and bind.
     *
     * The default connection parameters and the ones required to connect
     * to a default RabbitMQ Server in localhost for use in development.
     *
     * @param {String} exchange
     * @param {String} queue
     * @param {String} routing_key
     *
     * @param {String} [url=undefined] - AMQP Server URL to connect to
     * @param {logger} [logger=undefined] - Winston logger to use
     */
    constructor(exchange, queue, routing_key, url = undefined, logger = undefined) {
        this.exchange = exchange;
        this.queue = queue;
        this.routing_key = routing_key;

        this.url = url || AMQPReceiver.obtain_url();

        this.logger = logger;
        this.logger_enabled = typeof(logger) !== 'undefined';

        this.attempt_no = 1;
        this.connection = undefined
    }

    /**
     * Obtains a valid AMQP url using connection parameters.
     *
     * The default connection parameters and the ones required to connect
     * to a default RabbitMQ Server in localhost for use in development.
     *
     * @param {String} [user=guest]
     * @param {String} [password=guest]
     * @param {String} [host=localhost]
     * @param {String} [port=5672]
     * @param {String} [connection_attempts=3]
     * @param {String} [heartbeat_interval=3600]
     * @returns {String} AMQP Server url
     */
    static obtain_url(user = 'guest', password = 'guest', host = 'localhost', port = '5672', connection_attempts = '3',
                      heartbeat_interval = '3600') {
        return 'amqp://' + user + ':' + password + '@' + host + ':' +
            port + '/%2F?connection_attempts=' + connection_attempts +
            '&heartbeat_interval=' + heartbeat_interval;
    }

    /**
     * Sends a message to the logger if it is set.
     *
     * @param {String} level
     * @param {String} message
     * @private
     */
    _log(level, message) {
        if (this.logger_enabled) {
            this.logger.log(level, message)
        }
    }

    /**
     * Connects to an AMQP Server, binds the port and the exchange and executes a callback every time a message is
     * received.
     *
     * Automatically tries to reconnect to AMQP Server if connection attempt fails. Waiting time for reconnection
     * increases each time from one second to thirty seconds and resets when connection works correctly.
     *
     * Created queue is persistent after the receiver stops, but can not handle messages that have arrived previously
     * to the queue creation.
     *
     * @param callback - Function to execute every time a message is received. Message is passed as an argument.
     * @throws If channel creation or queue declaration attempts fail
     */
    start(callback) {
        this._log('info', 'Trying to connect - Attempt NO ' + this.attempt_no);
        this.attempt_no += 1;
        this._log('info', 'Connecting to ' + this.url);
        amqp.connect(this.url, (error, connection) => {
            if (error != null) {
                this._log('warn', 'Connection attempt failed: ' + error.code);
                if (this.attempt_no === 10 || this.attempt_no % 100 === 0) {
                    this._log('error', 'Connection attempt failed more than ' + this.attempt_no +
                        ' times consecutively.')
                }

                // Trying to reconnect, each fail increases waiting time in one second with a max wait of 30 seconds
                let reconnect_time;
                if (this.attempt_no < 30) {
                    reconnect_time = 1000 * this.attempt_no;
                } else {
                    reconnect_time = 30000;
                }
                setTimeout((callback) => (this.start(callback)), reconnect_time, callback)
            } else {
                this.connection = connection;
                this._log('info', 'Connection opened');
                this._log('info', 'Creating a new channel');
                connection.createChannel((error, channel) => {
                    if (error != null) {
                        // Does not try to reconnect after a Channel creation fail because it uses to be a configuration
                        // error
                        this._log('error', 'Channel creation attempt failed: ' + error.code);
                        throw 'Channel creation attempt failed: ' + error.code
                    } else {
                        this._log('info', 'Channel opened');

                        this._log('info', 'Declaring exchange ' + this.exchange);
                        channel.assertExchange(this.exchange, 'direct');
                        this._log('info', 'Exchange declared');

                        this._log('info', 'Declaring queue ' + this.queue);
                        channel.assertQueue(this.queue, {durable: true}, (error, queue) => {
                            if (error != null) {
                                // Does not try to reconnect after a Queue declaration fail because it uses to be a
                                // configuration error
                                this._log('error', 'Queue declaration attempt failed: ' + error.code);
                                throw 'Queue declaration attempt failed: ' + error.code
                            } else {
                                this._log('info', 'Binding ' + this.exchange + ' to ' + this.queue + ' with ' +
                                    this.routing_key);
                                channel.bindQueue(queue.queue, this.exchange, this.routing_key);
                                this._log('info', 'Queue bond');

                                // Attempts are restarted because connection worked correctly
                                this.attempt_no = 1;

                                channel.consume(queue.queue, (message) => {
                                    this._log('info', 'Received message ' + message.fields.deliveryTag +
                                        ' from ' + message.fields.consumerTag);
                                    this._log('info', 'Acknowledging message ' + message.fields.deliveryTag);
                                    channel.ack(message);
                                    callback(message);
                                });
                            }
                        });
                    }
                });
            }
        });
    }

    /**
     * Stops the connection if it is started
     */
    stop() {
        if(typeof (this.connection) !== 'undefined') {
            this._log('info', 'Closing connection');
            this.connection.close();
            this._log('info', 'Connection closed');
        } else {
            this._log('warn', 'There is no connection started');
        }
    }
}

module.exports = AMQPReceiver;
