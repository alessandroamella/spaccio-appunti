import express from "express";
import path from "path";
import bodyParser from "body-parser";
import "dotenv/config";

import * as paypal from "./paypal";
import { items } from "./items";
import { Orders } from "./orders";
import { Files } from "./files";
import Mail from "nodemailer/lib/mailer";
import { downloadEmail } from "./downloadEmail";
import { Email } from "./email";

const orders = new Orders();
const files = new Files();

const app = express();

app.use(express.static("public"));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

const indexPath = path.join(__dirname, "../index.html");

app.get("/", (req, res) => {
    res.sendFile(indexPath);
});

app.post("/api/order", async (req, res) => {
    try {
        if (!req.body.id) {
            return res.status(400).send("ID non inserito");
        }

        const item = items.find(i => i.id === req.body.id);
        if (!item) {
            return res.status(400).send("Oggetto non trovato");
        }
        const order = await paypal.createOrder(item);
        console.log("Nuovo ordine", order);
        orders.createOrder({
            id: item.id,
            name: item.name,
            orderId: order.id,
            payed: false,
            value: item.value
        });
        res.json(order);
    } catch (err) {
        console.error("Error while creating order", err);
        res.sendStatus(500);
    }
});

app.post("/api/capture", async (req, res) => {
    try {
        const { id } = req.body;
        const captureData = await paypal.capturePayment(id);
        console.log("Nuovo capture", captureData);
        orders.setPayed(
            captureData.id,
            captureData.payer.name.given_name,
            captureData.payer.name.surname,
            captureData.payer.email_address
        );
        const order = orders.findOrder(captureData.id);
        if (!order) {
            console.error("Error while finding order after capture", {
                captureData
            });
            return res
                .status(500)
                .send(
                    "Si è verificato un errore, scrivimi il codice: " +
                        captureData.id
                );
        }
        res.json({ id: order.orderId });

        const email: Mail.Options = {
            from: `"spaccio appunti" ${process.env.SEND_EMAIL_FROM}`,
            to: order.email,
            subject: `codice per scaricare "${order.name}"`,
            html: downloadEmail(order)
        };

        try {
            await Email.sendMail(email);
            // send a copy to me
            await Email.sendMail({ ...email, to: process.env.SEND_EMAIL_FROM });
            console.log("Sent new email");
        } catch (err) {
            console.error("Error while sending email", err);
        }
    } catch (err) {
        console.error("Error while capturing payment", err);
        res.sendStatus(500);
    }
});

app.post("/api/file", (req, res) => {
    if (!req.body.orderId) {
        console.log("Get file no orderId");
        return res.status(400).send("Codice non inserito");
    }

    const order = orders.findOrder(req.body.orderId);
    if (!order) {
        return res.status(400).send("Ordine non trovato");
    } else if (!order.payed) {
        return res.status(400).send("Ordine non pagato");
    }

    res.download(files.getFilePath(order.id - 1));
});

const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, () => {
    console.log("Started on port", PORT);
});
