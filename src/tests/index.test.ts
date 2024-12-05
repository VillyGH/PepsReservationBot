import puppeteer, { Browser, Page } from 'puppeteer';
import {
    connexion,
    datePage,
    sportsPage,
    schedulePage,
    reservationPage,
    selectPartner
} from '../index';
import * as utils from '../utils';
import * as loggers from '../logger';
import {AppConfig} from "../types";

const mockConfig : AppConfig = {
    email: 'test@example.com',
    password: 'password123',
    sport: 'Tennis',
    partner_ni1: "999999999",
    partner_ni2: null,
    partner_ni3: null,
    affichage: true,
    date: {
        time: "12:30",
        day: '15',
        month: '05',
        year: '2024'
    }
};

jest.mock('puppeteer');
jest.mock('../utils');
jest.mock('../logger');

describe('Reservation Script', () => {
    let mockBrowser: jest.Mocked<Browser>;
    let mockPage: jest.Mocked<Page>;
    let exitSpy: jest.SpyInstance;


    beforeEach(() => {
        mockBrowser = {
            newPage: jest.fn(),
            close: jest.fn(),
        } as any;
        mockPage = {
            goto: jest.fn(),
            type: jest.fn(),
            click: jest.fn(),
            waitForSelector: jest.fn(),
            select: jest.fn(),
            $$eval: jest.fn(),
        } as any;

        exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {
            throw new Error('process.exit was called');
        });

        (puppeteer.launch as jest.Mock).mockResolvedValue(mockBrowser);
        (mockBrowser.newPage as jest.Mock).mockResolvedValue(mockPage);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('connexion', () => {
        it('should log in successfully', async () => {

            await connexion(mockPage, mockConfig);

            expect(mockPage.type).toHaveBeenCalledWith("#Email", mockConfig.email);
            expect(mockPage.type).toHaveBeenCalledWith("#Password", mockConfig.password);
            expect(utils.click).toHaveBeenCalledWith(mockPage, 'input[type="submit"]');
        });
    });

    describe('datePage', () => {
        it('should navigate to the correct date', async () => {
            await datePage(mockPage, mockConfig);

            expect(utils.click).toHaveBeenCalledWith(
                mockPage,
                `a[href='/rtpeps/Reservation']`
            );
            expect(utils.click).toHaveBeenCalledWith(
                mockPage,
                `a[href="/rtpeps/Reservation/Sport?selectedDate=${mockConfig.date.month}%2F${mockConfig.date.day}%2F${mockConfig.date.year}%2B00%3A00%3A00"]`
            );
        });

        it('should handle invalid date', async () => {
            (utils.click as jest.Mock).mockRejectedValueOnce(new Error('Invalid date'));

            await expect(datePage(mockPage, mockConfig)).rejects.toThrow();
            expect(loggers.logger.error).toHaveBeenCalledWith(
                "Invalid date, referer to example.json for exact format. The reservation date should be after the current time", []
            );
            exitSpy.mockRestore();
        });
    });

    describe('sportsPage', () => {
        it('should navigate to the selected sport', async () => {
            await sportsPage(mockPage, mockConfig);

            expect(utils.click).toHaveBeenCalledWith(
                mockPage,
                `a[href='/rtpeps/Reservation/Disponibilites?selectedActivite=${mockConfig.sport}']`
            );
        });

        it('should handle sport not available', async () => {
            (utils.click as jest.Mock).mockRejectedValueOnce(new Error('Sport not available'));

            await expect(sportsPage(mockPage, mockConfig)).rejects.toThrow();
            expect(exitSpy).toHaveBeenCalledWith(1);
            expect(loggers.logger.error).toHaveBeenCalledWith(
                "The specified sport is not available for that specific date", []
            );
        });
    });

    describe('schedulePage', () => {
        it('should find the correct time slot', async () => {
            const mockScheduleData = [
                {
                    location: 'Court 1',
                    time: '14:00',
                    terrain: 'Indoor',
                    dataCountdown: '00:05:00',
                    btnHref: '/reservation/slot1'
                }
            ];

            // Mock $$eval to return mock data
            (mockPage.$$eval as jest.Mock).mockResolvedValue(mockScheduleData);

            await schedulePage(mockPage, mockConfig);

            expect(mockPage.goto).toHaveBeenCalledWith(
                `https://secure.sas.ulaval.ca/${mockScheduleData[0].btnHref}`
            );
        });

        it('should handle no available reservations', async () => {
            (mockPage.$$eval as jest.Mock).mockRejectedValueOnce(new Error('No reservations'));

            await expect(schedulePage(mockPage, mockConfig)).rejects.toThrow();
            expect(exitSpy).toHaveBeenCalledWith(1);
            expect(loggers.logger.error).toHaveBeenCalledWith(
                "No reservation is available for this day or you already reserved that day", []
            );
        });
    });

    describe('selectPartner', () => {
        it('should select the correct partner', async () => {
            const mockOptions = [
                { text: 'John Doe - NI12345', value: '1' },
                { text: 'Jane Smith - NI67890', value: '2' }
            ];

            // Mock waitForSelector and $$eval
            (mockPage.waitForSelector as jest.Mock).mockResolvedValue(true);
            (mockPage.$$eval as jest.Mock).mockResolvedValue(mockOptions);

            await selectPartner(mockPage, 0, 'NI12345');

            expect(mockPage.select).toHaveBeenCalledWith(
                'select[name="ddlPartenaire0"]',
                '1'
            );
        });

        it('should handle invalid partner', async () => {
            (mockPage.waitForSelector as jest.Mock).mockResolvedValue(null);

            await expect(selectPartner(mockPage, 0, 'InvalidNI')).rejects.toThrow();
            expect(exitSpy).toHaveBeenCalledWith(1);
            expect(loggers.logger.error).toHaveBeenCalledWith(
                "Partner(s) NI invalid please check the config.json file", []
            );
        });
    });
});
