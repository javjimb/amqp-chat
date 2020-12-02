const amqp = require('amqplib');

// RabbitMQ connection string
const messageQueueConnectionString = process.env.AMQP_URL;

const shutdown = async (channel, connection) => {
  await channel.close()
  await connection.close()
  console.info('💥 Process terminated!')
}

;(async () => {
  try {
    const connection = await amqp.connect(messageQueueConnectionString)
    const channel = await connection.createChannel()
    const exchange = 'chatroom'
    channel.assertExchange(exchange, 'fanout', { durable: false })

    const q = await channel.assertQueue('', { exclusive: true })
    console.log(" 🕑 Waiting for messages in %s. To exit press CTRL+C", q.queue);

    channel.bindQueue(q.queue, exchange, '')

    await channel.consume(q.queue, msg => {
      if (msg.content) {
        console.log(msg.content.toString())
        channel.ack(msg)
      }
    })

    process.on('SIGINT', () => shutdown(channel, connection))
    process.on('SIGQUIT', () => shutdown(channel, connection))
    process.on('SIGTERM', () => shutdown(channel, connection))

  } catch (error) {
    console.error(error)
  }
})()
