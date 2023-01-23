// password="HghxhZXHZ6MJjd0A"
//importing
import cors from "cors";
import express from "express";
import mongoose from "mongoose";
import Messages from "./dbMessages.js";
//app config
const app = express();
const port = process.env.PORT || 9000;
import Pusher from "pusher";
const pusher = new Pusher({
  appId: "1538598",
  key: "a0d387ef40392a297459",
  secret: "b04be430e6af6993024f",
  cluster: "eu",
  useTLS: true,
});
//midlwares
app.use(express.json());
app.use(cors());
//DB config
const connection_url =
  "mongodb+srv://admin:HghxhZXHZ6MJjd0A@cluster0.8zx68rq.mongodb.net/?retryWrites=true&w=majority";
mongoose.connect(connection_url);
const db = mongoose.connection;
db.once("open", () => {
  console.log("DB Connected");
  const msgCollection = db.collection("messagecontents");
  const changeStream = msgCollection.watch();
  // console.log(changeStream);
  changeStream.on("change", (change) => {
    if (change.operationType === "insert") {
      const messageDetails = change.fullDocument;
      pusher.trigger("messages", "inserted", {
        //inserted is an event and messages a channel
        name: messageDetails.name,
        message: messageDetails.message,
        timestamp: messageDetails.timestamp,
        received: messageDetails.received,
      });
    } else {
      console.log("pusher triggering error");
    }
  });
});
//??
//
//api routes
app.get("/", (req, res) => res.status(200).send("hwllo woeld"));
app.get("/messages/sync", (req, res) => {
  Messages.find((err, data) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(200).send(data);
    }
  });
});
app.post("/messages/new", (req, res) => {
  const dbMessage = req.body;
  Messages.create(dbMessage, (err, data) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(201).send(data);
    }
  });
});
//listener
app.listen(port, () => console.log(`listening on localhost: ${port}`));
