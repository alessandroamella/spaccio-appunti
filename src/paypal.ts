import axios from "axios";
import "dotenv/config";
import { Item } from "./items";

const { CLIENT_ID, APP_SECRET } = process.env;
const base = "https://api-m.sandbox.paypal.com";

if (!CLIENT_ID || !APP_SECRET) {
    console.error("PayPal envs not loaded");
    process.exit(1);
}

export async function createOrder(item: Item) {
    const accessToken = await generateAccessToken();
    const url = `${base}/v2/checkout/orders`;
    const res = await axios.post(
        url,
        {
            intent: "CAPTURE",
            purchase_units: [
                {
                    amount: {
                        currency_code: "EUR",
                        value: item.value,
                        breakdown: {
                            item_total: {
                                currency_code: "EUR",
                                value: item.value
                            }
                        }
                    },
                    items: [
                        {
                            name: item.name,
                            unit_amount: {
                                currency_code: "EUR",
                                value: item.value
                            },
                            quantity: "1"
                        }
                    ]
                }
            ]
        },
        {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`
            }
        }
    );
    return res.data;
}

export async function capturePayment(orderId: string) {
    const accessToken = await generateAccessToken();
    const url = `${base}/v2/checkout/orders/${orderId}/capture`;
    const res = await axios.post(
        url,
        {},
        {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`
            }
        }
    );
    return res.data;
}

export async function generateAccessToken() {
    const auth = Buffer.from(CLIENT_ID + ":" + APP_SECRET).toString("base64");
    const res = await axios.post(
        `${base}/v1/oauth2/token`,
        "grant_type=client_credentials",
        {
            headers: {
                Authorization: `Basic ${auth}`
            }
        }
    );
    return res.data.access_token;
}
