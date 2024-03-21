export async function click(page, selector) {
    await page.evaluate((selector) => {
        document.querySelector(selector).click();
    }, selector);
}