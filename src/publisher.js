const amqp = require('amqplib');

// RabbitMQ connection string
const messageQueueConnectionString = process.env.AMQP_URL;

;(async () => {
  try {
    const connection = await amqp.connect(messageQueueConnectionString)
    const channel = await connection.createChannel()
    const exchange = 'chatroom'
    await channel.assertExchange(exchange, 'fanout', { durable: false })
    const msg = 'ping ' + new Date
    channel.publish(exchange, '', Buffer.from(msg))

    console.log('[x] Sent %s', msg)

    await channel.close()
    await connection.close()
  } catch (error) {
    console.error(error)
  }
})()
