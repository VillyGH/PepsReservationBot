import puppeteer from "puppeteer";
import config from "./config.json" assert {type: "json"};
import {click, timeToMs} from "./utils.js";
import { setTimeout } from "timers/promises";


(async () => {
    console.log("Starting");
    const browser = await puppeteer.launch({
        userDataDir: "./user_data",
        headless: false,
        args: ["--no-sandbox"],
    });
    
    const page = await browser.newPage();
    await page.goto("https://secure.sas.ulaval.ca/rtpeps/Account/Login");
    await page.setDefaultTimeout(2000);
    await connexion(page);
    await datePage(page);
    await sportsPage(page);
    await schedulePage(page);
    await reservationPage(page);
})();

async function connexion(page) {
    console.log("Loading connexion page");
    await page.type("#Email", config.email);
    await page.type("#Password", config.password);
    await page.click('input[type="submit"]');
    console.log("Connected");
}

async function datePage(page) {
    console.log("Loading date page");
    let selector = "a[href='/rtpeps/Reservation']";
    await page.waitForSelector(selector);
    await page.click(selector);
    selector = `a[href="/rtpeps/Reservation/Sport?selectedDate=${config.date.month}%2F${config.date.day}%2F${config.date.year}%2000%3A00%3A00"]`;
    await page.waitForSelector(selector);
    try {
        await click(page, selector);
        console.log(`Date found: ${config.date.day}/${config.date.month}/${config.date.year}`);
    } catch (e) {
        console.log("Invalid date, referer to example.json for exact format. The reservation date should be after the current time");
        process.exit(1);
    }
}

async function sportsPage(page) {
    console.log("Loading sports page");
    let selector = `a[href='/rtpeps/Reservation/Disponibilites?selectedActivite=${config.sport}']`;
    await page.waitForSelector(selector);
    try {
        await click(page, selector);
    } catch (e) {
        console.log("The specified sport is not available for that specific date");
        process.exit(1);
    }
}

async function schedulePage(page) {
    console.log("Loading schedule page");
    let selector = 'tr:not(tr[style="display:none;"]):not(.strong)';
    await page.waitForSelector(selector);
    await setTimeout(50);
    let data = null;
    try {
        data = await page.$$eval(selector, rows => {
            return Array.from(rows, row => {
                const columns = row.querySelectorAll('td');
                return {
                    location: columns[0].innerText,
                    time: columns[1].innerText,
                    terrain: columns[3].innerText,
                    dataCountdown: columns[4].querySelector('.dataCountdown') ? columns[4].querySelector('.dataCountdown').innerText : null,
                    btnHref: columns[4].querySelector('.dataCountdown') ? columns[4].querySelector('.linkReserverHide > a').getAttribute("href") : columns[4].querySelector('a').getAttribute("href")
                };
            });
        });
    } catch (e) {
        console.log("No reservation is available for this day or you already reserved that day");
    }
    let found = false;
    for (let i = 0; i < data.length; i++) {
        if (data[i].time === config.date.time) {
            if(data[i].dataCountdown) {
                console.log(`Waiting for the reservation to open in ${data[i].dataCountdown}`);
                await setTimeout(timeToMs(data[i].dataCountdown) - 250);
            }
            selector = `a[href='${data[i].btnHref}']`;
            console.log(`Found ${data[i].location} Terrain ${data[i].terrain}`);
            await click(page, selector);
            found = true;
            break;
        }
    }
    if (!found) {
        console.log("The specified reservation hour is not available for that specific date");
        process.exit(1);
    }
    
}

async function reservationPage(page) {
    console.log("Loading reservation page");
    let selector = '#radioRaquette2';
    await page.waitForSelector(selector);
    await selectPartner(page, 0, config.partner_ni1);
    if (config.partner_ni2 && config.partner_ni3) {
        await page.click(selector);
        await selectPartner(page, 1, config.partner_ni2);
        await selectPartner(page, 2, config.partner_ni3);
    }
    selector = `input:enabled[type="submit"]`;
    await page.waitForSelector(`input:enabled[type="submit"]`);
    await page.$eval(selector, element => element.click());
    await page.waitForSelector("#bienvenue");
    console.log(`Site reserved ! Confirmation has been sent to the address ${config.email}`);
    process.exit(0);
}

async function selectPartner(page, partnerId, partnerNI) {
    let selector = `select[name="ddlPartenaire${partnerId}"]`;
    const selectElement = await page.waitForSelector(selector);
    const options = await selectElement.$$eval('option', options => {
        return Array.from(options, option => {
            return {
                text: option.textContent,
                value: option.getAttribute('value'),
            };
        });
    });
    const option = options.find(option => option.text.includes(partnerNI));
    if (option) {
        await page.select(selector, option.value);
        await page.waitForSelector(`option[selected="selected"][value="${option.value}"]`)
    } else {
        console.log("Partner(s) NI invalid please check the config.json file");
        process.exit(1);
    }
}



