const { chromium } = require('playwright');
const axios = require('axios');

const webhookURL = 'INSERT DISCORD WEBHOOK URL';
const ping = "🟢-----------------------INSERT DISCORD USER PING-----------------------🟢";
const MESSAGE_NO_STOCK = "No more stock!!";
var lastMessage = MESSAGE_NO_STOCK;
 
const ccAvailabilityStore = async () => {
  // list of item you want to check
  const urls = [
    {
      "targetURL": "https://www.canadacomputers.com/en/powered-by-nvidia/268153/zotac-gaming-geforce-rtx-5080-solid-oc-16gb-gddr7-zt-b50800j-10p.html",
      "sku": "ZOTAC GAMING GeForce RTX 5080 SOLID OC"
    },
    {
      "targetURL": "https://www.canadacomputers.com/en/powered-by-nvidia/268152/zotac-gaming-geforce-rtx-5080-solid-16gb-gddr7-zt-b50800d-10p.html",
      "sku": "ZOTAC GAMING GeForce RTX 5080 SOLID"
    },
    {
      "targetURL": "https://www.canadacomputers.com/en/powered-by-nvidia/268141/gigabyte-geforce-rtx-5080-windforce-oc-sff-16g-graphics-card-geforce-rtx-5080-windforce-oc-sff-16g.html",
      "sku": "GIGABYTE GeForce RTX 5080 WINDFORCE OC SFF"
    },
    {
      "targetURL": "https://www.canadacomputers.com/en/powered-by-nvidia/268138/gigabyte-geforce-rtx-5080-gaming-oc-ai-gaming-graphics-card-gv-n5080gaming-oc-16gd.html",
      "sku": "GIGABYTE GeForce RTX 5080 GAMING OC"
    },
    {
      "targetURL": "https://www.canadacomputers.com/en/powered-by-nvidia/268144/gigabyte-aorus-geforce-rtx-5080-master-16g-gddr7-gv-n5080aorus-m-16gd.html",
      "sku": "GIGABYTE AORUS GeForce RTX 5080 MASTER"
    },
    {
      "targetURL": "https://www.canadacomputers.com/en/powered-by-nvidia/268143/gigabyte-aorus-geforce-rtx-5080-master-ice-16gb-gv-n5080aorusm-ice-16gd.html",
      "sku": "GIGABYTE AORUS GeForce RTX 5080 MASTER ICE"
    },
    {
      "targetURL": "https://www.canadacomputers.com/en/powered-by-nvidia/268148/msi-geforce-rtx-5080-16g-ventus-3x-oc-plus-rtx-5080-16g-ventus-3x-oc-plus.html",
      "sku": "MSI GeForce RTX 5080 16G VENTUS 3X OC PLUS"
    },
    // {
    //   "targetURL": "https://www.canadacomputers.com/en/powered-by-nvidia/268147/msi-geforce-rtx-5080-16g-gaming-trio-oc-rtx-5080-16g-gaming-trio-oc.html",
    //   "sku": "MSI GeForce RTX 5080 16G GAMING TRIO OC"
    // },
    // {
    //   "targetURL": "https://www.canadacomputers.com/en/powered-by-nvidia/268146/msi-geforce-rtx-5080-16g-gaming-trio-oc-white-rtx-5080-16g-gaming-trio-oc-white.html",
    //   "sku": "MSI GeForce RTX 5080 16G GAMING TRIO OC WHITE"
    // },
    // {
    //   "targetURL": "https://www.canadacomputers.com/en/powered-by-nvidia/267621/msi-geforce-rtx-5080-16g-vanguard-soc-launch-edition-rtx-5080-16g-vanguard-soc-launch-editio.html",
    //   "sku": "MSI GeForce RTX 5080 16G VANGUARD SOC LAUNCH EDITION"
    // },
    // {
    //   "targetURL": "https://www.canadacomputers.com/en/powered-by-nvidia/267620/msi-geforce-rtx-5080-16g-suprim-soc-gddr7-16gb-rtx-5080-16g-suprim-soc.html",
    //   "sku": "MSI GeForce RTX 5080 16G SUPRIM SOC"
    // },
    {
      "targetURL": "https://www.canadacomputers.com/en/powered-by-nvidia/268151/asus-prime-geforce-rtx-5080-16gb-gddr7-prime-rtx5080-16g.html",
      "sku": "ASUS PRIME GeForce RTX 5080"
    },
    {
      "targetURL": "https://www.canadacomputers.com/en/powered-by-nvidia/267147/asus-prime-geforce-rtx-5080-16gb-gddr7-oc-edition-sff-prime-rtx5080-o16g.html",
      "sku": "ASUS PRIME GeForce RTX 5080 OC"
    },
    {
      "targetURL": "https://www.canadacomputers.com/en/powered-by-nvidia/267146/asus-tuf-gaming-geforce-rtx-5080-16gb-gddr7-oc-edition-tuf-rtx5080-o16g-gaming.html",
      "sku": "ASUS TUF Gaming GeForce RTX 5080"
    }
  ];
 
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const availableInStore = [];
 
  const SELECTORS = {
    outerDiv: '#checkothertores', //not a typo
    innerDiv: '.modal-content #collapseON', // you can change this to specify a province : #collapseQC etc.. (collapse is a prefix)
    item: '.row',
  };
 
  try {
    for (const { targetURL, sku } of urls) {
      console.log(`Parsing: ${targetURL}`);
      await page.goto(targetURL, { waitUntil: 'domcontentloaded' });
 
      const outerDivExists = await page.$(SELECTORS.outerDiv) !== null;
      if (!outerDivExists) {
        console.log(`No matches found on ${targetURL}`);
        continue;
      }
 
      console.log(`ON Shop found: ${targetURL}`);
      const outerDiv = page.locator(SELECTORS.outerDiv);
 
      if (await outerDiv.locator(SELECTORS.innerDiv).count() === 0) {
        console.log('Inner div not found inside the outer div.');
        continue;
      }
 
      const items = await outerDiv.locator(SELECTORS.innerDiv).locator(SELECTORS.item);
      const results = await items.evaluateAll((elements) => {
        // , "Toronto Down Town 284", "Mississauga", "Etobicoke", "Brampton", "Oakville"
        const locationsNearby = new Set(["Richmond Hill", "Markham Unionville", "North York", "Vaughan", "Newmarket"]);
        return elements
          .map((item) => {
            const spans = item.querySelectorAll(':scope > span');
            if (spans.length >= 2) {
              const location = spans[0]?.innerText.trim();
              const quantity = parseInt(spans[1]?.innerText.trim(), 10);
              return quantity > 0 && locationsNearby.has(location) ? { location, quantity } : null;
            }
            return null;
          })
          .filter((item) => item !== null)
      });
 
      availableInStore.push({ sku, availability: results });
    }
  } catch (error) {
    console.error('An error occurred:', error);
  } finally {
    await browser.close();
  }
 
  console.log('Matching results:', );
  console.dir(availableInStore, { depth: null });
 
  const convertToString = (arr) => {
    return arr
      .map(({ sku, availability }) => {
        const skuLine = `${sku} :`;
        const availabilityLines = availability
          .sort((a, b) => a.location.localeCompare(b.location))
          .map(({ location, quantity }) => `- ${location.toLowerCase()} : ${quantity}`)
          .join("\n");
        return `${skuLine}\n${availabilityLines}`;
      })
      .join("\n\n");
  };
 
  const filteredResults = availableInStore.filter(item => item.availability.length > 0);
  const text = filteredResults.length > 0 ? convertToString(filteredResults) : MESSAGE_NO_STOCK;

  if (lastMessage !== text) {
    let n = new Date().toLocaleString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    const messageContent = {
      content: text + "\n" + ping + n
    };
    try {
      const response = await axios.post(webhookURL, messageContent);
      console.log('Message sent to Discord:', response.data, n);
    } catch (error) {
      console.error('Error sending message:', error);
    }
    lastMessage = text;
  } else {
    console.log('Skip sending same message');
  }
 
  return filteredResults;
};
 
async function runTasks() {
  try {
    console.log("------------- Running tasks ----------------");
    await Promise.all([
      ccAvailabilityStore(),
    ]);
    console.log("------------- End of batch ----------------");
  } catch (err) {
    console.error("An error occurred while running the script:", err);
  }
}

// await runTasks();
let minutes = 0.30;
// setInterval(runTasks, minutes * 60 * 1000);
(function loop() {
  setTimeout(async () => {
    await runTasks();

    loop();
  }, minutes * 60 * 1000);
})();
