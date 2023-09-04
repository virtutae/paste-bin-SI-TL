import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { Client } from "pg";
import { getEnvVarOrFail } from "./support/envVarUtils";
import { setupDBClientConfig } from "./support/setupDBClientConfig";

dotenv.config(); 

const dbClientConfig = setupDBClientConfig();
const client = new Client(dbClientConfig);

const app = express();

app.use(express.json()); 
app.use(cors()); 

app.get("/", async (_req, res) => {
    try {
        const allHistory = await client.query("SELECT * FROM pastes;");
        res.status(200).json(allHistory.rows);
    } catch (error) {
        console.error(error);
        res.status(500).send("An error has occured!");
    }
});

app.post("/", async (req, res) => {
    try {
        const { title, text } = req.body;
        await client.query(
            `INSERT INTO pastes (title, text_body) VALUES ($1, $2);`,
            [title, text]
        );
        res.status(201).json({ status: "It worked" });
    } catch (error) {
        console.error(error);
        res.status(500).send("An error has occured!");
    }
});

app.get("/health-check", async (_req, res) => {
    try {
        await client.query("select now()");
        res.status(200).send("system ok");
    } catch (error) {
        console.error(error);
        res.status(500).send("An error occurred. Check server logs.");
    }
});

connectToDBAndStartListening();

async function connectToDBAndStartListening() {
    console.log("Attempting to connect to db");
    await client.connect();
    console.log("Connected to db!");

    const port = getEnvVarOrFail("PORT");
    app.listen(port, () => {
        console.log(
            `Server started listening for HTTP requests on port ${port}.  Let's go!`
        );
    });
}
