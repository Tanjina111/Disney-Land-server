const express = require('express');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config();
const cors = require('cors');

const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.12a1y.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
console.log(uri);

async function run() {
    try {
        await client.connect();
        const database = client.db('park_services');
        const serviceCollection = database.collection('services');

        const databaseOrder = client.db('orders');
        const orderCollection = databaseOrder.collection('allOrder')
    console.log('connected');
        //GET API
        app.get('/services', async (req, res) => {
            const cursor = serviceCollection.find({});
            const services = await cursor.toArray();
            res.send(services);
        })

        // Get data by keys
        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            console.log('arin',id);
            const query = { _id: ObjectId(id) }
            const services = await serviceCollection.findOne(query);
            res.send(services);
        });

        // Orders placed
        app.post('/orders', async(req, res) => {
            const order = req.body;
            const result = await orderCollection.insertOne(order);
            res.json(result);
        })

        //Single User Orders
        app.get('/orders/:email', async(req, res) => {
            const result = await orderCollection.find({email: req.params.email}).toArray();
            res.send(result);
        })
    }
    finally {
        // await client.close();
    }
}

run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Ema jon server is running');
});

app.listen(port, () => {
    console.log('Server running at port', port);
})