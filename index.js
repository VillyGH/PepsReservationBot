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
    page.on('console', msg => {
        for (let i = 0; i < msg.args().length; i++) {
            console.log(msg.args()[i]);
        }
    });
    await page.goto("https://secure.sas.ulaval.ca/rtpeps/Account/Login");
    await connexion(page);
    await datePage(page);
    await sportsPage(page);
    await reservationPage(page);
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

async function reservationPage(page) {
    console.log("Loading reservation page");
    let selector = 'tr:not(tr[style="display:none;"]):not(.strong)>td:nth-child(2)';
    await page.waitForSelector(selector);
    await page.screenshot({ path: "screenshots/TimePage.jpg" });
    const tds = await page.$$(selector);
    let found = false;
    for (let i = 0;i < tds.length; i++) {
        const time = await (await tds[i].getProperty('innerText')).jsonValue();
        if (time === config.date.time) {
            const bookBtn = await page.$((selector) => {
                document.querySelector(selector).click();
            }, selector);
            await page.click(bookBtn);
            found = true;
            await page.screenshot({ path: "screenshots/ReservationPage.jpg" });
            break;
        }
    }
    if(!found) {
        console.log("The specified reservation hour is not available for that specific date");
        process.exit(1);
    }
    await page.screenshot({ path: "screenshots/ReservationPage.jpg" });
}