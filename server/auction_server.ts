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

export class Comment {
    constructor(
        public id: number,
        public productId: number,
        public timestamp: string,
        public user: string,
        public rating: number,
        public content: string
    ) { }

}

const comments: Comment[] = [
    new Comment(1, 1, '2018-10-31 22:22:22', 'zh', 1, '东西不错'),
    new Comment(1, 1, '2018-10-31 22:22:22', 'zh2', 2, '东西不错'),
    new Comment(1, 1, '2018-10-31 22:22:22', 'zh', 3, '东西不错'),
    new Comment(1, 2, '2018-10-31 22:22:22', 'zh2', 4, '东西不错'),
    new Comment(1, 3, '2018-10-31 22:22:22', 'zh', 5, '东西不错'),
    new Comment(1, 4, '2018-10-31 22:22:22', 'zh', 1.5, '东西不错'),
    new Comment(1, 5, '2018-10-31 22:22:22', 'zh2', 2.5, '东西不错'),
    new Comment(1, 1, '2018-10-31 22:22:22', 'zh', 3, '东西不错'),
];


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
    let result = products;
    let params = req.query;
    console.log(params);
    if (params.title) {
        result = result.filter((p) => p.title.indexOf(params.title) !== -1);
    }
    if (params.price && result.length > 0) {
        result = result.filter((p) => p.price <= parseInt(params.price));
    }
    if (params.category != -1 && result.length > 0) {
        result = result.filter((p) => p.categories.indexOf(params.category) !== -1);
    }

    res.json(result);
});

app.get('/api/products/:id', (req, res) => {
    res.json(products.find((product) => product.id == req.params.id));
});

app.get('/api/products/:id/comments', (req, res) => {
    res.json(comments.filter((comment) => comment.productId == req.params.id));
});

const server = app.listen(8000, 'localhost', () => {
    console.log('服务器已启动');
});

const subscription = new Map<any, number[]>();

const currentBids = new Map<number, number>();

const wsServer = new Server({ port: 8085 });
wsServer.on('connection', websocket => {
    websocket.on('message', (msg: string) => {
        console.log(`接收到消息${msg}`);
        let msgObj = JSON.parse(msg);
        let productIds = subscription.get(websocket) || [];
        subscription.set(websocket, [...productIds, msgObj.productId]);
    });
});

setInterval(() => {
    products.forEach(p => {
        let currentBid = currentBids.get(p.id) || p.price;
        let newBid = currentBid + Math.random() * 5;
        currentBids.set(p.id, newBid);
    });

    subscription.forEach((productIds: number[], ws) => {
        if (ws.readyState === 1) {
            let newBids = productIds.map(id => ({
                productId: id,
                bid: currentBids.get(id)
            }));
            ws.send(JSON.stringify(newBids));
        } else {
            subscription.delete(ws);
        }
    });
}, 2000);