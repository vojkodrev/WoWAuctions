const Database = require('./lib/db');
const db = new Database();
const tsmLib = require('./lib/tsm');
const tsm = new tsmLib.TSM();
const delay = require('delay');

(async () => {

  await db.remove();
  await db.open();  
  await db.createTables();
    
  (await tsm.getRealms()).forEach(async (e) => {
    try {
      await db.insertRealm(e.id, e.name, e.region1, e.region2);
    } catch (ex) {
      console.error("error while inserting realm", e.id, e.name, ex);
    }
  });

  const priceSources = [
    tsmLib.TSM_PRICE_SOURCE_MIN_BUYOUT,
    tsmLib.TSM_PRICE_SOURCE_MARKET,
    tsmLib.TSM_PRICE_SOURCE_HISTORICAL
  ];

  const realms = await (await db.getRealms("EU")).all();

  for (let i = 0; i < realms.length; i++) {
    if (i > 0 && i % 5 == 0)
      await delay(5000);

    const realm = realms[i];
    
    priceSources.forEach(async priceSource => {
      const prices = await tsm.getPrices(realm.id, realm.id, realm.region1, priceSource);
      prices.forEach(async price => {
        try {
          await db.insertPrice(price.price, priceSource, price.petName, realm.id);
        } catch (ex) {
          console.error("error while inserting price", price.price, priceSource, price.petName, realm.id, ex);
        }
      });
    });
  }
})();



