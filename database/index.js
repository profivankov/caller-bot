import { MongoClient, ServerApiVersion } from 'mongodb'

const uri =
  'mongodb+srv://callerbot:realniggapassword@cluster0.mc0sjeq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'
// Create a MongoClient with a MongoClientOptions object to set the Stable API version

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true
  }
})

let db

const connectDB = async () => {
  try {
    await client.connect()
    console.log('Connected to MongoDB')
    db = client.db('mydatabase')
  } catch (error) {
    console.error('Error connecting to MongoDB:', error)
  }
}

const getDB = () => db

connectDB()
export { connectDB, getDB }

// callerbot realniggapassword
