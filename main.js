const program = require('commander');
const Database = require('./lib/db');
const db = new Database();
const tsmLib = require('./lib/tsm');
const tsm = new tsmLib.TSM();
const from = require('rxjs').from;
const take = require('rxjs/operators').take;
const map = require('rxjs/operators').map;
const bufferCount = require('rxjs/operators').bufferCount;
// const delay = require('rxjs/operators').delay;
const of = require('rxjs').of;
const delay = require('delay');

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
      console.error("error while inserting realm", e.id, e.name, ex);
    }
  });

  // let petId = await db.insertPet("moo");
  // console.log("petId", petId);

  // petId = await db.insertPet("moo");
  // console.log("petId", petId);  

  let splitRelams = [];
  from(await (await db.getRealms("EU")).all()).pipe(
    bufferCount(5),
  ).subscribe(i => splitRelams.push(i));

  for (let i = 0; i < splitRelams.length; i++) {
    const group = splitRelams[i];
    
    group.forEach(async realm => {
      let priceSource = tsmLib.TSM_PRICE_SOURCE_HISTORICAL;
      const prices = await tsm.getPrices(realm.id, realm.id, realm.region1, priceSource);
      prices.forEach(async price => {
        try {
          await db.insertPrice(price.price, priceSource, price.petName, realm.id);
        } catch (ex) {
          console.error("error while inserting price", price.price, priceSource, price.petName, realm.id, ex);
        }
      });
    });

    await delay(5000);
  }

  // Observable.create(o => {
  //   (await db.getRealms("EU")).each(async (e, realm) => {
  //     o.next(realm);
  //   });

  //   o.complete();
  // })
  // .pipe(
  //   take(5),
  //   map(r => {
  //     console.log(r);
  //   }));
  
  // let counter = 0;
  // (await db.getRealms("EU")).each(async (e, realm) => {
  //   if (counter > 1)
  //     return;

  //   let priceSource = tsmLib.TSM_PRICE_SOURCE_HISTORICAL;
  //   counter++;  
  //   // console.log("realm", realm);
  //   const prices = await tsm.getPrices(realm.id, realm.id, realm.region1, priceSource);
  //   prices.forEach(async price => {
  //     try {
  //       await db.insertPrice(price.price, priceSource, price.petName, realm.id);
  //     } catch (ex) {
  //       console.error("error while inserting price", price.price, priceSource, price.petName, realm.id, ex);
  //     }
      
  //   })
  //   console.log(prices);
  // });
  



})();



