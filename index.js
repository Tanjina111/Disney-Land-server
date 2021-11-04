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

        //Get API
        app.get('/services', async (req, res) => {
            const cursor = serviceCollection.find({});
            const services = await cursor.toArray();
            res.send(services);
        })

        // Get Data By Keys
        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const services = await serviceCollection.findOne(query);
            res.send(services);
        });

        // Get Data By Email
        app.get("/orders", async (req, res) => {
            const mail = req.query.email;
            console.log(mail);
            let query = {};
            if(mail){
                query = { email: mail }
            }
            const orders =  orderCollection.find( query );
            const result = await orders.toArray();
            res.json(result);
        });

        // Orders placed
        app.post('/orders', async(req, res) => {
            const order = req.body;
            const result = await orderCollection.insertOne(order);
            res.json(result);
        })

        // Add Service
        app.post("/services", async (req, res) => {
            const service = req.body;
            const result = await serviceCollection.insertOne(service);
            res.json(result);
        });

        // Manage Orders
        app.get("/manageorders", async (req, res) => {
            const manageOrder = await orderCollection.find({}).toArray();
            res.send(manageOrder);
        });

        // Delete Order
        app.delete("/orders/:id", async (req, res) => {
            const orderId = req.params.id;
            const query = { _id: ObjectId(orderId) };
            const orderDelete = await orderCollection.deleteOne(query);
            res.json(orderDelete);
        });

        // // Update Order
        app.put('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const updateStatus = req.body;
            const filter = { _id: ObjectId(id) }
            const updateDoc = {
                $set: {
                    status: updateStatus.status,
                },
            };
            const result = await orderCollection.updateOne(filter, updateDoc);
            res.json(result)
        })
       
    }
    finally {
        // await client.close();
    }
}

run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Server is running');
});

app.listen(port, () => {
    console.log('Server running at port', port);
})