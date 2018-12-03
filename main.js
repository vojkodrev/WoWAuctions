const program = require('commander');
const Database = require('./lib/db');
const db = new Database();
const tsmLib = require('./lib/tsm');
const tsm = new tsmLib.TSM();

program
  .version("0.0.1")
  .option("-r --reset", "Resets data")
  .parse(process.argv);

(async () => {

  if (program.reset) {
    console.log("reset parameter enabled");
    await db.remove();
    await db.open();  
    await db.createTables();
  } else {
    await db.open();
  }
    
  (await tsm.getRealms()).forEach(async (e) => {
    try {
      await db.insertRealm(e.id, e.name, e.region1, e.region2);
    } catch (ex) {
      console.log("error while inserting", e.id, e.name, ex);
    }
  });

  
  
  
  const realm = await (await db.getRealms()).get();
  console.log("realm", realm);
  await tsm.getPrices(realm.id, realm.id, realm.region1, tsmLib.TSM_PRICE_SOURCE_HISTORICAL);


})();



