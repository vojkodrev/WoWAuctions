const URL = require('url').URL;
const cheerio = require('cheerio');
const rp = require('request-promise');

const TSM_URL = "https://www.tradeskillmaster.com";
const TSM_REALMS_URL = `${TSM_URL}/pets/compare`;
const TSM_PRICES_URL = `${TSM_URL}/pets/pet-compare`;

module.exports.TSM_PRICE_SOURCE_HISTORICAL = "DBHistorical";
module.exports.TSM_PRICE_SOURCE_MARKET = "DBMarket";
module.exports.TSM_PRICE_SOURCE_MIN_BUYOUT = "DBMinBuyout";

module.exports.TSM = class TSM {

  async getPrices(realmId1, realmId2, region, priceSource) {
    console.log("requesting prices", realmId1, realmId2, region, priceSource);

    const url = new URL(TSM_PRICES_URL);
    url.searchParams.append("priceSource", priceSource);
    url.searchParams.append("region", region);
    url.searchParams.append("realmId1", realmId1);
    url.searchParams.append("realmId2", realmId2);

    const $ = cheerio.load(await rp(url.toString()));

    let results = [];

    $("table#current_realms tr").each((i, e) => {
      if (i == 0)
        return;

      e = $(e);

      let columns = e.find("td");
      
      let petName = columns.eq(0).find("a").text();
      let priceColumn = columns.eq(1);
      let priceText = priceColumn.text();

      if (priceText == "--")
        return;

      let priceGroups = /(.*?)g/g.exec(priceText);

      let price = null;

      if (priceGroups === null)
        price = 0;
      else
        price = parseInt(priceGroups[1].replace(",", ""));

      results.push({petName, price});
    });

    return results;
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

      if (nameGroups === null)
        return;
  
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
