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
})();

async function connexion(page) {
    console.log("Loading connexion page");
    await page.screenshot({ path: "screenshots/connexionPage.jpg" });
    await page.type("#Email", config.email);
    await page.type("#Password", config.password);
    await page.click('input[type="submit"]');
    await page.screenshot({ path: "screenshots/connectedPage.jpg" });
    console.log("Connected");
}

async function datePage(page) {
    console.log("Loading date page");
    await page.click("a[href='/rtpeps/Reservation']")
    await page.waitForNavigation();
    await page.screenshot({ path: "screenshots/datePage.jpg" });
    try {
        await page.click(`a[href='/rtpeps/Reservation/Sport?selectedDate=${config.date.month}%2F${config.date.day}2F${config.date.year}%2000%3A00%3A00']`);
    } catch (e) {
        console.log("Invalid date, the format of the date should be: month: 03, day: 20 and year: 2024 and should be at a 3 day interval of the current date");
        process.exit(1);
    }
    await page.screenshot({ path: "screenshots/SportsPage.jpg" });
    try {
        await page.click(`a[href='/rtpeps/Reservation/Disponibilites?selectedActivite=Tennis']`);
    } catch (e) {
        console.log("The specified sport is not available for that specific date");
        process.exit(1);
    }
}

async function sportsPage(page) {
    console.log("Loading sports page");
    await page.screenshot({ path: "screenshots/SportsPage.jpg" });
    try {
        await page.click(`a[href='/rtpeps/Reservation/Disponibilites?selectedActivite=Tennis']`);
    } catch (e) {
        console.log("The specified sport is not available for that specific date");
        process.exit(1);
    }
    await page.screenshot({ path: "screenshots/SportsPage.jpg" });
}