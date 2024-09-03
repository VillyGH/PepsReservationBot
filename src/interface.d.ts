export interface IElectronAPI {
    startScript: () => Promise<void>,
    stopScript: () => Promise<void>,
}

declare global {
    interface Window {
        electronAPI: IElectronAPI
    }
}
