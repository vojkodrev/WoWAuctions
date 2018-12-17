const sqlite = require("sqlite");
const fs = require("fs");
const util = require("util");

const unlinkP = util.promisify(fs.unlink);

const DB_PATH = "./db.sqlite";
const DB_PATH_JOURNAL = "./db.sqlite-journal";

module.exports = class Database {

  async remove() {
    try {
      console.log("removing db");
      await unlinkP(DB_PATH);
    } catch(e) { 
      console.error("unable to remove", DB_PATH);
    }

    try {
      console.log("removing db journal");
      await unlinkP(DB_PATH_JOURNAL);
    } catch(e) { 
      console.error("unable to remove", DB_PATH_JOURNAL);
    }
  }

  async open() {
    console.log("open");
    this.db = await sqlite.open(DB_PATH);

    console.log("turn on foreign keys");
    await this.db.run("PRAGMA foreign_keys = ON");
  }

  async createTables() {
    console.log("create realm table");
    await this.db.run(`CREATE TABLE realm (
      id INTEGER PRIMARY KEY NOT NULL, 
      name TEXT NOT NULL,
      region1 TEXT NOT NULL,
      region2 TEXT
    )`);

    console.log("create price table");
    await this.db.run(`CREATE TABLE price (
      price INTEGER NOT NULL,
      priceSource TEXT NOT NULL,
      pet TEXT NOT NULL,
      realmId INTEGER NOT NULL,
      FOREIGN KEY(realmId) REFERENCES realm(id),
      PRIMARY KEY(pet, realmId, priceSource)
    )`);    
  }

  async insertPrice(price, priceSource, pet, realmId) {
    console.log("inserting price", price, pet, realmId);

    await this.db.run(
      `INSERT INTO price VALUES (?, ?, ?, ?)`, 
      price, priceSource, pet, realmId);
  }

  async insertRealm(id, name, region1, region2) {
    console.log("inserting realm", id, name, region1, region2);

    await this.db.run(
      `INSERT INTO realm VALUES (?, ?, ?, ?)`, 
      id, name, region1, region2);
  }

  getRealms(region1) {
    console.log("read realms", region1);

    return this.db.prepare(
      `SELECT * FROM realm WHERE region1 = ?`, 
      region1);
  }
}
