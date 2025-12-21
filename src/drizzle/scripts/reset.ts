import 'dotenv/config';
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "../schema";
import { reset } from "drizzle-seed";
async function main() {
    try {

        const db = drizzle(process.env.DATABASE_URL!);
        await reset(db, schema);
    } catch(e) {
        console.log(e)
    }
}
main();