export async function delay(seconds) {
  return new Promise(function (resolve) {
    setTimeout(resolve, seconds * 1000);
  });
}

export function formatText(linkText) {
  linkText = linkText.replace(/\r\n|\r/g, "");
  linkText = linkText.replace(/\ +/g, "");
  linkText = linkText.replace(" ", "");

  var nbspPattern = new RegExp(String.fromCharCode(160), "g");
  return linkText.replace(nbspPattern, "");
}
