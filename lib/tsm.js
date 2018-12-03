
const cheerio = require('cheerio');
const rp = require('request-promise');

const TSM_URL = "https://www.tradeskillmaster.com";
const TSM_REALMS_URL = `${TSM_URL}/pets/compare`;
const TSM_PRICES_URL = `${TSM_URL}/pets/pet-compare`;

module.exports.TSM_PRICE_SOURCE_HISTORICAL = "DBHistorical";
module.exports.TSM_PRICE_SOURCE_MARKET = "DBMarket";
module.exports.TSM_PRICE_SOURCE_MIN_BUYOUT = "DBMinBuyout";

module.exports.TSM = class TSM {

  async getPrices(id1, id2, region, priceSource) {
    console.log("requesting prices", id1, id2, region, priceSource);


  }

  async getRealms() {
    console.log("requesting realms");

    const $ = cheerio.load(await rp(TSM_REALMS_URL));

    let result = [];
  
    $("select#realmSelect option").each(async (i, e) => {
      e = $(e);
  
      const value = e.val();
  
      if (value === null || value === undefined || value === "")
        return;
  
      const realmId = parseInt(value);
      const name = e.text();
  
      // Aggra (Português) (EU)
      // Aggramar (US)
      const nameGroups = /^(.*?) (\((.*?)\) )?\((.*?)\)$/g.exec(name);
  
      result.push({
        id: realmId,
        name: nameGroups[1],
        region1: nameGroups[4],
        region2: nameGroups[3]
      })      
    });

    return result;
  }
}
