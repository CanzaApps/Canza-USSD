const mongoose = require("mongoose");

async function mongoDB() {

  const uri = "mongodb+srv://canza:canza@canzacluster.z6h5s.mongodb.net/CanzaCluster?retryWrites=true&w=majority";

  try {
    // Connect to the MongoDB cluster
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true
    });

    console.log(" Database Connected ")
  } catch (e) {
    console.error(e);
  } finally {
    // await client.close();
  }
}

mongoDB();

