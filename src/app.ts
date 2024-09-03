import { app, BrowserWindow, ipcMain } from 'electron';
import path from "node:path";
import {fileURLToPath} from "url";
import {executeScript, stopScript} from "./script.js";
const __filename : string = fileURLToPath(import.meta.url);
const __dirname : string = path.dirname(__filename);

let mainWindow: Electron.BrowserWindow | null;

async function createWindow () {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    });

    await mainWindow.loadFile('./src/public/index.html');

    ipcMain.on('startScript', executeScript);
    ipcMain.on('stopScript', stopScript);

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}


app.on('ready', createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', async () => {
    if (mainWindow === null) {
        await createWindow();
    }
});
