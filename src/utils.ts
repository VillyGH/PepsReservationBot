export async function click(page, selector) {
    await page.waitForSelector(selector);
    await page.evaluate((selector) => {
        document.querySelector(selector).click();
    }, selector);
}

export function timeToMs(timeString) : number {
    const date : Date = new Date(`1970-01-01T${timeString}Z`);
    return date.getTime();
}

export function findRowIndexWithTime(time, data) {
    for (let i = 0; i < data.length; i++) {
        if (data[i].time === time) {
            console.log(`Found ${data[i].location} Terrain ${data[i].terrain}`);
            return i;
        }
    }
    console.log("The specified reservation hour is not available for that specific date");
    process.exit(1);
}
