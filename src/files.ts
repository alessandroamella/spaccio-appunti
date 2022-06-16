import path from "path";
import fs from "fs";

export class Files {
    private static files = [
        "Italiano.zip",
        "Storia.zip",
        "Sistemi - sicurezza (cifratura e hashing).pdf",
        "Tutto.zip"
    ];

    private static filesPath = path.join(process.cwd(), "./files");

    constructor() {
        if (
            !fs.existsSync(Files.filesPath) ||
            !fs.lstatSync(Files.filesPath).isDirectory()
        ) {
            fs.mkdirSync(Files.filesPath);
        }

        for (const f of Files.files) {
            if (!fs.existsSync(path.join(Files.filesPath, f))) {
                console.log(
                    "File doesn't exist:",
                    path.join(Files.filesPath, f)
                );
                process.exit(1);
            }
        }
    }

    public isValidIndex(index: number) {
        return (
            Number.isInteger(parseInt(index + "")) &&
            index > 0 &&
            index < Files.files.length
        );
    }

    public getFilePath(index: number) {
        return path.join(Files.filesPath, Files.files[index]);
    }
}
