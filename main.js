const rp = require('request-promise');
const cheerio = require('cheerio');
const program = require('commander');

const Database = require('./lib/db');
const db = new Database();


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
    


  const petsCompareHtml = await rp("https://www.tradeskillmaster.com/pets/compare");
  // console.log("petsCompareHtml", petsCompareHtml);

  const petsCompare = cheerio.load(petsCompareHtml);

  petsCompare("select#realmSelect option").each(async (i, e) => {
    e = petsCompare(e);

    const value = e.val();

    if (value === null || value === undefined || value === "")
      return;

    const realmId = parseInt(value);
    const name = e.text();

    // Aggra (Português) (EU)
    // Aggramar (US)
    const nameGroups = /^(.*?) (\((.*?)\) )?\((.*?)\)$/g.exec(name);

    try {
      await db.insertRealm(realmId, nameGroups[1], nameGroups[4], nameGroups[3]);
    } catch (e) {
      console.log("error while inserting", realmId, name, e);
    }
    
  })
})();



