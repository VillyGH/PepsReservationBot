import puppeteer, {Browser, ElementHandle, Page} from "puppeteer";
import { readFileSync } from 'fs';
import {click, timeToMs, findRowIndexWithTime} from "./utils.js";
import { setTimeout } from "timers/promises";
import {OptionElement, ScheduleRows} from "./types";

const config = JSON.parse(readFileSync(new URL('../config.json', import.meta.url), 'utf-8'));

(async () : Promise<void> => {
    console.log("Starting");
    const browser : Browser = await puppeteer.launch({
        userDataDir: "./user_data",
        headless: !config.affichage,
        args: ["--no-sandbox"],
    });

    const page : Page = await browser.newPage();
    await page.goto("https://secure.sas.ulaval.ca/rtpeps/Account/Login");
    page.setDefaultTimeout(2000);
    await connexion(page);
    await datePage(page);
    await sportsPage(page);
    await schedulePage(page);
    await reservationPage(page);
})();

async function connexion(page : Page) : Promise<void> {
    console.log("Loading connexion page");
    await page.type("#Email", config.email);
    await page.type("#Password", config.password);
    let selector : string = `input[type="submit"]`;
    await click(page, selector);
    console.log("Connected");
}

async function datePage(page : Page) : Promise<void> {
    console.log("Loading date page");
    let selector : string = "a[href='/rtpeps/Reservation']";
    await click(page, selector);
    selector = `a[href="/rtpeps/Reservation/Sport?selectedDate=${config.date.month}%2F${config.date.day}%2F${config.date.year}%2000%3A00%3A00"]`;
    try {
        await click(page, selector);
        console.log(`Date found: ${config.date.day}/${config.date.month}/${config.date.year}`);
    } catch (e) {
        console.log("Invalid date, referer to example.json for exact format. The reservation date should be after the current time");
        process.exit(1);
    }
}

async function sportsPage(page : Page) : Promise<void> {
    console.log("Loading sports page");
    let selector : string = `a[href='/rtpeps/Reservation/Disponibilites?selectedActivite=${config.sport}']`;
    try {
        await click(page, selector);
    } catch (e) {
        console.log("The specified sport is not available for that specific date");
        process.exit(1);
    }
}

async function schedulePage(page : Page) : Promise<void> {
    console.log("Loading schedule page");
    let selector : string = 'tr:not(tr[style="display:none;"]):not(.strong)';
    await page.waitForSelector(selector);
    let data : ScheduleRows[];
    try {
        data = await page.$$eval(selector, (rows: Element[]) => {
            return Array.from(rows, (row : Element) : ScheduleRows => {
                const columns : NodeListOf<HTMLTableCellElement> = row.querySelectorAll('td');
                if(columns[4] === undefined) {
                    throw new Error("reservation non available");
                }
                let dataCountdown : Element | null =  columns[4].querySelector('.dataCountdown');
                return {
                    location: columns[0].innerText,
                    time: columns[1].innerText,
                    terrain: columns[3].innerText,
                    dataCountdown: dataCountdown ? dataCountdown.innerHTML : null,
                    btnHref: dataCountdown != null
                    ? columns[4].querySelector('.linkReserverHide > a')?.getAttribute("href")
                    : columns[4].querySelector('a')?.getAttribute("href")
                }
            });
        });
    } catch (e) {
        console.log("No reservation is available for this day or you already reserved that day");
        process.exit(1);
    }
    let index : number = findRowIndexWithTime(config.date.time, data);
    if(data[index].dataCountdown != undefined) {
        console.log(`Waiting for the reservation to open in ${data[index].dataCountdown}`);
        await setTimeout(timeToMs(data[index].dataCountdown) - 220);
    }
    let url : string = `https://secure.sas.ulaval.ca/${data[index].btnHref}`;
    await page.goto(url);
}

async function reservationPage(page : Page) : Promise<void> {
    console.log("Loading reservation page");
    let selector : string = '#radioRaquette2';
    await page.waitForSelector(selector);
    await selectPartner(page, 0, config.partner_ni1);
    if (config.partner_ni2 && config.partner_ni3) {
        await page.click(selector);
        await selectPartner(page, 1, config.partner_ni2);
        await selectPartner(page, 2, config.partner_ni3);
    }
    selector = `input:enabled[type="submit"]`;
    await click(page, selector);
    await page.waitForSelector(".alert-success");
    console.log(`Site reserved ! Confirmation has been sent to the address ${config.email}`);
    process.exit(0);
}

async function selectPartner(page : Page, partnerId : number, partnerNI : string) : Promise<void> {
    let selector : string = `select[name="ddlPartenaire${partnerId}"]`;
    const selectElement : ElementHandle | null = await page.waitForSelector(selector);
    if(selectElement) {
        const options : Array<OptionElement> = await selectElement.$$eval('option', (options: HTMLOptionElement[]) => {
            return Array.from(options, (option: HTMLOptionElement) : OptionElement => {
                return {
                    text: option.textContent,
                    value: option.getAttribute('value'),
                };
            });
        });
        const option : OptionElement | undefined = options.find((option : OptionElement) : boolean | undefined => option.text ? option.text.includes(partnerNI) : undefined);
        if(option) {
            if(option.value) {
                await page.select(selector, option.value);
                await page.waitForSelector(`option[selected="selected"][value="${option.value}"]`)
            }
        }
    } else {
        console.log("Partner(s) NI invalid please check the config.json file");
        process.exit(1);
    }
}



