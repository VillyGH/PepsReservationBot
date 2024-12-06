import {Page} from "puppeteer";
import {ScheduleRows} from "./types.js";
import {infoLogger} from "./loggerTypes.js";


export async function click(page : Page, selector : any) : Promise<void> {
    await page.waitForSelector(selector);
    await page.$eval(selector, (element) => element.click());
}

export function timeToMs(timeString : string) : number {
    const date : Date = new Date(`1970-01-01T${timeString}Z`);
    return date.getTime();
}

export function findRowIndexWithTime(time : string, data : ScheduleRows[]) : number {
    for (let i : number = 0; i < data.length; i++) {
        if (data[i].time === time) {
            infoLogger.success(`Found ${data[i].location} Terrain ${data[i].terrain}`);
            return i;
        }
    }
    infoLogger.error("The specified reservation hour is not available for that specific date");
    process.exit(1);
}
