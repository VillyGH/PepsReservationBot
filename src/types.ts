export type OptionElement = {
    text: string | null;
    value: string | null;
}

export type ScheduleRows = {
    location: string | null,
    time: string | null,
    terrain: string | null,
    dataCountdown: any,
    btnHref: string | null | undefined
}

export type AppConfig = {
    email: string,
    password: string,
    sport: string,
    partner_ni1: string,
    partner_ni2: string | null,
    partner_ni3: string | null,
    affichage: boolean,
    date: {
        time: string,
        day: string,
        month: string,
        year: string
    }
}
