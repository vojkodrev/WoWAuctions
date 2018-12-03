const sqlite = require("sqlite");
const fs = require("fs");
const util = require("util");

const unlinkP = util.promisify(fs.unlink);

const DB_PATH = "./db.sqlite";
const DB_TABLE_REALM = "realm";

module.exports = class Database {

  async remove() {
    try {
      console.log("removing db");
      await unlinkP(DB_PATH);
    } catch(e) { }
  }

  async open() {
    console.log("open");
    this.db = await sqlite.open(DB_PATH);

    console.log("turn on foreign keys");
    await this.db.run("PRAGMA foreign_keys = ON");
  }

  async createTables() {
    console.log("create table");
    
    await this.db.run(`CREATE TABLE ${DB_TABLE_REALM} (
      id INTEGER PRIMARY KEY NOT NULL, 
      name TEXT NOT NULL,
      region1 TEXT NOT NULL,
      region2 TEXT
    )`);
  }

  async insertRealm(id, name, region1, region2) {
    console.log("inserting realm", id, name, region1, region2);

    await this.db.run(
      `INSERT INTO ${DB_TABLE_REALM} VALUES (?, ?, ?, ?)`, 
      id, name, region1, region2);
  }
}
