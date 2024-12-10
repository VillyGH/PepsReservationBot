import puppeteer, {Browser, ElementHandle, Page} from "puppeteer";
import {click, timeToMs, findRowIndexWithTime} from "./utils.js";
import { setTimeout } from "timers/promises";
import {AppConfig, OptionElement, ScheduleRows} from "./types.js";
import {infoLogger} from "./loggerTypes.js";
import {readFileSync} from "fs";
import path from 'path';


export async function run() : Promise<void> {
    const configPath : string = path.resolve(process.cwd(), 'config.json');
    const config : AppConfig = JSON.parse(readFileSync(configPath, 'utf-8'));
    infoLogger.info("Starting");
    const browser : Browser = await puppeteer.launch({
        userDataDir: "./user_data",
        headless: !config.affichage,
        args: ["--no-sandbox"],
    });

    const page : Page = await browser.newPage();
    infoLogger.info("Connection to https://secure.sas.ulaval.ca/rtpeps/");
    await page.goto("https://secure.sas.ulaval.ca/rtpeps/Account/Login");
    page.setDefaultTimeout(2000);
    await connexion(page, config);
    await datePage(page, config);
    await sportsPage(page, config);
    await schedulePage(page, config);
    await reservationPage(page, config);
}

export async function connexion(page : Page, config : AppConfig) : Promise<void> {
    infoLogger.info("Loading connexion page");
    await page.type("#Email", config.email);
    await page.type("#Password", config.password);
    let selector : string = `input[type="submit"]`;
    await click(page, selector);
    infoLogger.info("Connected");
}

export async function datePage(page : Page, config : AppConfig) : Promise<void> {
    infoLogger.info("Loading date page");
    try {
        let selector : string = "a[href='/rtpeps/Reservation']";
        await click(page, selector);
        selector = `a[href="/rtpeps/Reservation/Sport?selectedDate=${config.date.month}%2F${config.date.day}%2F${config.date.year}%2000%3A00%3A00"]`;
        await click(page, selector);
        infoLogger.success(`Date found: ${config.date.day}/${config.date.month}/${config.date.year}`);
    } catch (e) {
        infoLogger.error("Invalid date, referer to example.json for exact format. The reservation date should be after the current time\n");
        process.exit(1);
    }
}

export async function sportsPage(page : Page, config : AppConfig) : Promise<void> {
    infoLogger.info("Loading sports page");
    let selector : string = `a[href='/rtpeps/Reservation/Disponibilites?selectedActivite=${config.sport}']`;
    try {
        await click(page, selector);
    } catch (e) {
        infoLogger.error("The specified sport is not available for that specific date\n");
        process.exit(1);
    }
}

export async function schedulePage(page : Page, config : AppConfig) : Promise<void> {
    infoLogger.info("Loading schedule page");
    let selector : string = 'tr:not(tr[style="display:none;"]):not(.strong)';
    let data : ScheduleRows[];
    try {
        await page.waitForSelector(selector);
        await page.waitForFunction(
            (selector: string) => {
                const element = document.querySelector(selector);
                return element?.innerHTML.trim() !== '' || element?.innerHTML.trim() === null;
            },
            {},
            '.dataCountdown'
        );
        data = await page.$$eval(selector, (rows: Element[]) => {
            return Array.from(rows, (row : Element) : ScheduleRows => {
                const columns : NodeListOf<HTMLTableCellElement> = row.querySelectorAll('td');
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
        infoLogger.error("No reservation is available for this day or you already reserved that day\n");
        process.exit(1);
    }
    let index : number = findRowIndexWithTime(config.date.time, data);
    if(data[index].dataCountdown != undefined) {
        infoLogger.info(`Waiting for the reservation to open in ${data[index].dataCountdown}`);
        await setTimeout(timeToMs(data[index].dataCountdown) - 1600);
    }
    let url : string = `https://secure.sas.ulaval.ca/${data[index].btnHref}`;
    await page.goto(url);
    selector = ".alert-warning";
    if(await page.$(selector)) {
        infoLogger.error("The reservation is not yet available please try again later\n");
        process.exit(1);
    }
}

export async function reservationPage(page : Page, config : AppConfig) : Promise<void> {
    infoLogger.info("Loading reservation page");
    let selector : string = '#radioRaquette2';
    try {
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
    } catch(e) {
        infoLogger.error("An error has occurred while attempting to make a reservation : " + e + "\n");
        process.exit(1);
    }

    infoLogger.success(`Site reserved ! Confirmation has been sent to the address ${config.email}\n`);
    process.exit(0);
}

export async function selectPartner(page : Page, partnerId : number, partnerNI : string) : Promise<void> {
    infoLogger.info(`Selecting partner ${partnerId}`);
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
        infoLogger.error("Partner(s) NI invalid please check the config.json file\n");
        process.exit(1);
    }
}



