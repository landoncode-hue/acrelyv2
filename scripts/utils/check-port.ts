import * as net from 'net';

const port = 54322;
const client = new net.Socket();
client.setTimeout(2000);

client.connect(port, '127.0.0.1', function () {
    console.log('Open');
    client.destroy();
});

client.on('error', function () {
    console.log('Closed');
    client.destroy();
});

client.on('timeout', function () {
    console.log('Timeout');
    client.destroy();
});
