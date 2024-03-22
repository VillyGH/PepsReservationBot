export async function click(page, selector) {
    await page.evaluate((selector) => {
        document.querySelector(selector).click();
    }, selector);
}

export function timeToMs(timeString) {
    const date = new Date(`1970-01-01T${timeString}Z`);
    return date.getTime();
}