import textExtractor from '../textExtractor';

describe('textExtractor', () => {
    let docIns;
    let pageIns;
    let lineMock;
    let wordMock;
    let nextWordMock;
    let bBox;
    let extractorToolMock;
    let styleMock;
    let nextLineMock;
    beforeEach(() => {
        global.PDFNet = {
            TextExtractor: {
                create: jest.fn().mockImplementation(() => Promise.resolve(extractorToolMock)),
                ProcessingFlags: {
                    e_remove_hidden_text: 14,
                }
            },
            Rect: jest.fn(),
        };
        extractorToolMock = {
            begin: jest.fn(),
            destroy: jest.fn(),
            getFirstLine: jest.fn().mockImplementation(() => Promise.resolve(lineMock)),
        };
        docIns = {
            getPDFCoordinates: jest.fn().mockImplementation().mockReturnValue({x: 200, y: 200}),
        };
        pageIns = {};
        nextWordMock = {
            isValid: jest.fn().mockImplementation(() => Promise.resolve(false)),
        };
        wordMock = {
            getString: jest.fn().mockImplementation(() => Promise.resolve('nhut')),
            isValid: jest.fn().mockImplementation(() => Promise.resolve(true)),
            getNextWord: jest.fn().mockImplementation(() => Promise.resolve(nextWordMock)),
        };
        bBox = {
            get: jest.fn().mockImplementation(() => Promise.resolve({x1: 100, y1: 100})),
        };
        lineMock = {
            getFirstWord: jest.fn().mockImplementation(() => Promise.resolve(wordMock)),
            getBBox: jest.fn().mockImplementation(() => Promise.resolve(bBox)),
            isValid: jest.fn().mockImplementation(() => Promise.resolve(false)),
            getStyle: jest.fn().mockImplementation(() => Promise.resolve(styleMock)),
        };
        styleMock = {
            getFontSize: jest.fn().mockImplementation(() => Promise.resolve(20)),
            getFontName: jest.fn().mockImplementation(() => Promise.resolve('Arial')),
            getWeight: jest.fn().mockImplementation(() => Promise.resolve(400)),
        };
    });
    describe('checkIsSection', () => {
        it('should return true if text line is satisfied with font weight', () => {
            expect(textExtractor.checkIsSection(400, 14, 'NOT')).toBe(true);
        });
        it('should return true if text line is satisfied with font name', () => {
            expect(textExtractor.checkIsSection(200, 14, 'BOLD')).toBe(true);
        });
    });

    describe('getSectionTitle', () => {
        it('should return string in line', async () => {
            expect(await textExtractor.getSectionTitle(lineMock)).toBe('nhut ');
        });
    });
    
    describe('getCoordinates', () => {
        it('should return corrdinate of line in pdf', async () => {
            expect(await textExtractor.getCoordinates(docIns, 1, lineMock)).toEqual({horizontal: 200, vertical: 200});
        });
    });

    describe('getAllSectionOfPage', () => {
        it('should return empty if page do not have any section', async () => {
            expect(await textExtractor.getAllSectionOfPage(docIns, pageIns, 1)).toEqual([]);
        });
    });

    describe('getAllSectionOfPage', () => {
        it('should return empty if page do not have any section', async () => {
            expect(await textExtractor.getAllSectionOfPage(docIns, pageIns, 1)).toEqual([]);
        });
    });

    describe('extractTextLine', () => {
        it('should return 1 section if page have only 1 section', async () => {
            const sectionsMock = {
                children: [],
                title: 'nhut-heading-1',
                vertical: 200,
                horizontal: 200,
            };
            expect(await textExtractor.extractTextLine(docIns, 1, lineMock, [], [], sectionsMock, false)).toEqual([sectionsMock]);
        });
        it('should return only 1 line if section have multiple line', async () => {
            styleMock = {
                getFontSize: jest.fn().mockImplementation(() => Promise.resolve(10)),
                getFontName: jest.fn().mockImplementation(() => Promise.resolve('Arial')),
                getWeight: jest.fn().mockImplementation(() => Promise.resolve(400)),
            };
            lineMock = {
                getFirstWord: jest.fn().mockImplementation(() => Promise.resolve(wordMock)),
                getBBox: jest.fn().mockImplementation(() => Promise.resolve(bBox)),
                isValid: jest.fn().mockImplementation(() => Promise.resolve(true)),
                getStyle: jest.fn().mockImplementation(() => Promise.resolve(styleMock)),
                getNextLine: jest.fn().mockImplementation(() => Promise.resolve(nextLineMock)),
            };
            nextLineMock = {
                isValid: jest.fn().mockImplementation(() => Promise.resolve(false)),
            };
            const sectionsMock = {
                children: [],
                title: 'nhut-heading-1',
                vertical: 200,
                horizontal: 200,
            };
            expect(await textExtractor.extractTextLine(docIns, 1, lineMock, [], [], sectionsMock, true)).toEqual([sectionsMock]);
        });

        it('should return all section in page', async () => {
            styleMock = {
                getFontSize: jest.fn().mockImplementation(() => Promise.resolve(20)),
                getFontName: jest.fn().mockImplementation(() => Promise.resolve('Arial')),
                getWeight: jest.fn().mockImplementation(() => Promise.resolve(400)),
            };
            let nextLineMock = {
                isValid: jest.fn().mockImplementation(() => Promise.resolve(false)),
            };
            lineMock = {
                getFirstWord: jest.fn().mockImplementation(() => Promise.resolve(wordMock)),
                getBBox: jest.fn().mockImplementation(() => Promise.resolve(bBox)),
                isValid: jest.fn().mockImplementation(() => Promise.resolve(true)),
                getStyle: jest.fn().mockImplementation(() => Promise.resolve(styleMock)),
                getNextLine: jest.fn().mockImplementation(() => Promise.resolve(nextLineMock)),
            };
            const expected = {
                children: [],
                horizontal: 200,
                vertical: 180,
                title: 'nhut ',
            };
            expect(await textExtractor.extractTextLine(docIns, 1, lineMock, [], [], null, false)).toEqual([expected]);
            expect(await textExtractor.extractTextLine(docIns, 1, lineMock, [], [], expected, false)).toEqual([expected, expected]);
        });
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });
});