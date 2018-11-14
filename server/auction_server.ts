import express = require('express');
import { Server } from 'ws';

const app = express();

export class Product {
    constructor(
        public id: number,
        public title: string,
        public price: number,
        public rating: number,
        public desc: string,
        public categories: Array<string>
    ) {

    }
}

const products: Product[] = [
    new Product(1, 'title1', 100, 1, 'desc1', ['书']),
    new Product(2, 'title2', 100, 2.5, 'desc2', ['电子产品']),
    new Product(3, 'title3', 100, 3, 'desc3', ['书']),
    new Product(4, 'title4', 100, 4, 'desc4', ['电子产品']),
    new Product(5, 'title5', 100, 5, 'desc5', ['书'])
];

app.get('/', (req, res) => {
    res.send('hello express!!!');
});

app.get('/api/products', (req, res) => {
    res.json(products);
});

app.get('/api/products/:id', (req, res) => {
    res.json(products.find((product) => product.id == req.params.id));
});

const server = app.listen(8000, 'localhost', () => {
    console.log('服务器已启动');
});

const wsServer = new Server({ port: 8085 });
wsServer.on('connection', websocket => {
    websocket.send('这个消息是服务器主动推送的');
    websocket.on('message', msg => {
        console.log(`接收到消息${msg}`);
    });
});

setInterval(() => {
    if (wsServer.clients) {
        wsServer.clients.forEach(client => {
            client.send('这是定时推送');
        })
    }
}, 2000);