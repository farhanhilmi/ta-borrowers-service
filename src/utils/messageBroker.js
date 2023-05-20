import amqplib from 'amqplib';
import config from '../config/index.js';

//Message Broker
// export const CreateChannel = async () => {
//     try {
//         const connection = await amqplib.connect(config.RABBITMQ.URL);
//         connection.on('error', function (err) {
//             console.log('amqp connection error');
//             return setTimeout(() => {
//                 console.log('reconnecting from error');
//                 CreateChannel();
//             }, 1000);
//             throw new Error(err);
//         });
//         connection.on('close', function (err) {
//             console.log('amqp connection close');
//             return setTimeout(() => {
//                 console.log('reconnecting from close');
//                 CreateChannel();
//             }, 1000);
//             throw new Error(err);
//         });
//         const channel = await connection.createChannel();
//         await channel.assertQueue(config.RABBITMQ.EXCHANGE_NAME, 'direct', {
//             durable: true,
//         });
//         return channel;
//     } catch (error) {
//         throw error;
//     }
// };

export const PublishMessage = async (data, event, queueName) => {
    try {
        const connection = await amqplib.connect(config.RABBITMQ.URL);
        const channel = await connection.createChannel();

        await channel.assertQueue(queueName, { durable: true });
        const msg = {
            data,
            event,
        };
        channel.sendToQueue(queueName, Buffer.from(JSON.stringify(msg)));

        console.log(`Sent message: ${JSON.stringify(msg)}`);
        await channel.close();
        await connection.close();
    } catch (error) {
        throw error;
    }
};

export const SubscribeMessage = async (subscribeEvents, queueName) => {
    try {
        const connection = await amqplib.connect(config.RABBITMQ.URL);
        const channel = await connection.createChannel();

        const q = await channel.assertQueue(queueName, { durable: true });
        console.log(`Waiting for messages in queue: ${q.queue}`);

        const consumeMessage = (msg) => {
            if (msg.content) {
                console.log('Received message:', msg.content.toString());
                subscribeEvents(msg.content.toString());
            }
            console.log('[X] Acknowledged');
            channel.ack(msg);
        };

        channel.consume(queueName, consumeMessage);

        // Graceful shutdown
        process.on('SIGINT', async () => {
            try {
                console.log('Stopping message consumption...');
                channel.cancel(consumeMessage);
                await channel.close();
                await connection.close();
                console.log('Message consumption stopped gracefully');
                // process.exit(0);
            } catch (error) {
                console.error('Error occurred during shutdown:', error);
                // process.exit(1);
            }
        });
    } catch (error) {
        console.error('Failed to consume:', error);
        // setTimeout(() => SubscribeMessage(subscribeEvents, routingKey), 5000);
    }
};

// export const PublishMessage = (channel, service, msg) => {
//     try {
//         channel.publish(
//             config.RABBITMQ.EXCHANGE_NAME,
//             service,
//             Buffer.from(msg),
//         );
//         console.log('Sent: ', msg);
//     } catch (error) {
//         throw error;
//     }
// };

// export const SubscribeMessage = async (channel, subscribeEvents) => {
//     try {
//         await channel.assertExchange(config.RABBITMQ.EXCHANGE_NAME, 'direct', {
//             durable: true,
//         });
//         const q = await channel.assertQueue('', { exclusive: true });
//         console.log(`Waiting for messages in queue: ${q.queue}`);

//         channel.bindQueue(
//             q.queue,
//             config.RABBITMQ.EXCHANGE_NAME,
//             config.RABBITMQ.CHANNEL.AUTH_SERVICE,
//         );

//         channel.consume(
//             q.queue,
//             (msg) => {
//                 if (msg.content) {
//                     console.log('the message is:', msg.content.toString());
//                     subscribeEvents(msg.content.toString());
//                 }
//                 console.log('[X] received');
//             },
//             {
//                 noAck: true,
//             },
//         );
//     } catch (error) {
//         throw error;
//     }
// };
