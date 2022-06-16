import fs from "fs";
import path from "path";
import { Item } from "./items";

export interface Order extends Item {
    orderId: string;
    payed: boolean;
    firstName?: string;
    surname?: string;
    email?: string;
}

export class Orders {
    private static orderFile = path.join(process.cwd(), "orders.json");
    private orders: Order[] = [];

    private _updateFile() {
        fs.writeFileSync(Orders.orderFile, JSON.stringify(this.orders), {
            encoding: "utf-8"
        });
    }

    constructor() {
        if (!fs.existsSync(Orders.orderFile)) {
            this._updateFile();
        }

        try {
            this.orders = JSON.parse(
                fs.readFileSync(Orders.orderFile, { encoding: "utf-8" })
            );
        } catch (err) {
            console.error("Error while reading orders file", err);
            this._updateFile();
        }
    }

    public createOrder(order: Order) {
        this.orders.push(order);
        this._updateFile();
    }

    public findOrder(orderId: string) {
        return this.orders.find(o => o.orderId === orderId);
    }

    public setPayed(
        orderId: string,
        firstName: string,
        surname: string,
        email: string
    ) {
        const i = this.orders.findIndex(o => o.orderId === orderId);
        if (i === -1) {
            console.error(
                "Error while finding orderId",
                orderId,
                "in orders",
                this.orders
            );
            return false;
        }

        this.orders[i].payed = true;
        this.orders[i].firstName = firstName;
        this.orders[i].surname = surname;
        this.orders[i].email = email;
        this._updateFile();
    }
}
