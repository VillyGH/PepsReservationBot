import puppeteer from "puppeteer";
import { delay, formatText } from "./util.js";
import config from "./config.json" assert {type: "json"};

(async () => {
    console.log("Starting");
    const browser = await puppeteer.launch({
        userDataDir: "./user_data",
        headless: true,
        args: ["--no-sandbox"],
    });
    
    const page = await browser.newPage();
    await page.goto("https://secure.sas.ulaval.ca/rtpeps/Account/Login");
    await connexion(page);
    await datePage(page);
    await sportsPage(page);
    await schedulePage(page);
})();

async function connexion(page) {
    console.log("Loading connexion page");
    //await page.screenshot({ path: "screenshots/connexionPage.jpg" });
    await page.type("#Email", config.email);
    await page.type("#Password", config.password);
    await page.click('input[type="submit"]');
    
    //await page.screenshot({ path: "screenshots/connectedPage.jpg" });
    console.log("Connected");
}

async function datePage(page) {
    console.log("Loading date page");
    let selector = "a[href='/rtpeps/Reservation']";
    await page.waitForSelector(selector);
    await page.click(selector)
    selector = `a[href="/rtpeps/Reservation/Sport?selectedDate=${config.date.month}%2F${config.date.day}%2F${config.date.year}%2000%3A00%3A00"]`;
    await page.waitForSelector(selector);
    //await page.screenshot({ path: "screenshots/datePage.jpg" });
    try {
        await page.evaluate((selector) => {
            document.querySelector(selector).click();
        }, selector);
    } catch (e) {
        console.log("Invalid date, referer to example.json for exact format. The reservation date should be after the current time");
        process.exit(1);
    }
}

async function sportsPage(page) {
    console.log("Loading sports page");
    let selector = `a[href='/rtpeps/Reservation/Disponibilites?selectedActivite=${config.sport}']`;
    await page.waitForSelector(selector);
    //await page.screenshot({ path: "screenshots/SportsPage.jpg" });
    try {
        await page.click(selector);
    } catch (e) {
        console.log("The specified sport is not available for that specific date");
        process.exit(1);
    }
}

async function schedulePage(page) {
    console.log("Loading schedule page");
    let selector = 'tr:not(tr[style="display:none;"]):not(.strong)';
    await page.waitForSelector(selector);
    await page.screenshot({ path: "screenshots/SchedulePage.jpg" });
    const data = await page.$$eval(selector, rows => {
        return Array.from(rows, row => {
            const columns = row.querySelectorAll('td');
            return {
                time: columns[1].innerText,
                btnHref: columns[4].querySelector('a').getAttribute("href"),
            };
        });
    });
    let found = false;
    for (let i = 0;i < data.length; i++) {
        if (data[i].time === config.date.time) {
            await page.click(`a[href='${data[i].btnHref}']`);
            found = true;
            break;
        }
    }
    if(!found) {
        console.log("The specified reservation hour is not available for that specific date");
        process.exit(1);
    }
    process.exit(0);
}