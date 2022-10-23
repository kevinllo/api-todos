import { getDBHandler, initDB } from "./db/index.js";
initDB().then(()=> console.log(`Database created`));