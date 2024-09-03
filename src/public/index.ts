let startBtn : HTMLButtonElement | null = document.getElementById('start-button') as HTMLButtonElement | null;
let stopBtn : HTMLButtonElement | null = document.getElementById('stop-button') as HTMLButtonElement | null;

export function addButtonEvents() : void {
    if(startBtn && stopBtn) {
        startBtn.addEventListener('click', async () : Promise<void> => {
            await window.electronAPI.startScript();
            startBtn.setAttribute('disabled', 'true');
            stopBtn.setAttribute('disabled', 'false');
        });

        stopBtn.addEventListener('click', async () : Promise<void> => {
            await window.electronAPI.stopScript();
            startBtn.setAttribute('disabled', 'false');
            stopBtn.setAttribute('disabled', 'true');
        });
    }
}

addButtonEvents();
