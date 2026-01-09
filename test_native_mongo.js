const { MongoClient, ServerApiVersion } = require('mongodb');

// Using the credentials I know are correct from your .env
const uri = "mongodb+srv://abinaufal901_db_user:NpQA4XBBPszoKYl0@cluster0.vnsifd8.mongodb.net/?appName=Cluster0";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
    // Add timeouts to fail fast if blocked
    connectTimeoutMS: 10000,
    socketTimeoutMS: 10000,
});

async function run() {
    try {
        console.log("Attempting to connect with native driver...");
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } catch (error) {
        console.error("Connection failed:", error);
    } finally {
        // Ensures that the client will close when you finish/error
        await client.close();
    }
}
run().catch(console.dir);
