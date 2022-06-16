import nodemailer from "nodemailer";
import Mail from "nodemailer/lib/mailer";
import "dotenv/config";

const { MAIL_SERVER, MAIL_USERNAME, MAIL_PASSWORD, SEND_EMAIL_FROM } =
    process.env;
if (!MAIL_SERVER || !MAIL_USERNAME || !MAIL_PASSWORD || !SEND_EMAIL_FROM) {
    console.log("Mail envs not loaded");
    process.exit(1);
}

export class Email {
    private static transporter: nodemailer.Transporter | null = null;

    private static _initialize(): Promise<void> {
        return new Promise((resolve, reject) => {
            Email.transporter = nodemailer.createTransport({
                host: MAIL_SERVER,
                auth: {
                    user: MAIL_USERNAME,
                    pass: MAIL_PASSWORD
                },
                tls: {
                    rejectUnauthorized: false
                }
            });

            Email.transporter.verify((err, success): void => {
                if (err) {
                    console.error("Email transporter error", err);
                    return reject(err);
                }
                console.log("Email ready: " + success);
                return resolve();
            });
        });
    }

    public static async sendMail(message: Mail.Options): Promise<void> {
        if (!Email.transporter) {
            await Email._initialize();
        }
        return new Promise((resolve, reject) => {
            if (!Email.transporter) {
                console.error("Email.transporter null in sendMail");
                return reject("Email.transporter null");
            }
            Email.transporter.sendMail(message, err => {
                if (err) {
                    console.error("Error while sending email", err);
                    return reject(err);
                }
                return resolve();
            });
        });
    }
}
