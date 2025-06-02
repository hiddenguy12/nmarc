/* بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ ﷺ InshaAllah */

export enum CurrencyCode {
    AED = "AED", // United Arab Emirates Dirham
    AFN = "AFN", // Afghan Afghani
    ALL = "ALL", // Albanian Lek
    AMD = "AMD", // Armenian Dram
    ANG = "ANG", // Netherlands Antillean Guilder
    AOA = "AOA", // Angolan Kwanza
    ARS = "ARS", // Argentine Peso
    AUD = "AUD", // Australian Dollar
    AWG = "AWG", // Aruban Florin
    AZN = "AZN", // Azerbaijani Manat
    BAM = "BAM", // Bosnia and Herzegovina Convertible Mark
    BBD = "BBD", // Barbadian Dollar
    BDT = "BDT", // Bangladeshi Taka
    BGN = "BGN", // Bulgarian Lev
    BHD = "BHD", // Bahraini Dinar
    BIF = "BIF", // Burundian Franc
    BMD = "BMD", // Bermudian Dollar
    BND = "BND", // Brunei Dollar
    BOB = "BOB", // Bolivian Boliviano
    BRL = "BRL", // Brazilian Real
    BSD = "BSD", // Bahamian Dollar
    BTN = "BTN", // Bhutanese Ngultrum
    BWP = "BWP", // Botswanan Pula
    BYN = "BYN", // Belarusian Ruble
    BZD = "BZD", // Belize Dollar
    CAD = "CAD", // Canadian Dollar
    CDF = "CDF", // Congolese Franc
    CHF = "CHF", // Swiss Franc
    CLP = "CLP", // Chilean Peso
    CNY = "CNY", // Chinese Yuan Renminbi
    COP = "COP", // Colombian Peso
    CRC = "CRC", // Costa Rican Colón
    CUP = "CUP", // Cuban Peso
    CVE = "CVE", // Cape Verdean Escudo
    CZK = "CZK", // Czech Koruna
    DJF = "DJF", // Djiboutian Franc
    DKK = "DKK", // Danish Krone
    DOP = "DOP", // Dominican Peso
    DZD = "DZD", // Algerian Dinar
    EGP = "EGP", // Egyptian Pound
    ERN = "ERN", // Eritrean Nakfa
    ETB = "ETB", // Ethiopian Birr
    EUR = "EUR", // Euro
    FJD = "FJD", // Fijian Dollar
    GBP = "GBP", // British Pound Sterling
    GEL = "GEL", // Georgian Lari
    GHS = "GHS", // Ghanaian Cedi
    GIP = "GIP", // Gibraltar Pound
    GMD = "GMD", // Gambian Dalasi
    GNF = "GNF", // Guinean Franc
}

interface ICountryAndCurrency {
    name: string;
    currency: CurrencyCode;
}

export const countryAndCurrency: ICountryAndCurrency[] = [
    {
        name: 'Bangladesh',
        currency: CurrencyCode.BDT
    },
    {
        name: 'United Arab Emirates',
        currency: CurrencyCode.AED
    },
    {
        name: 'Afghanistan',
        currency: CurrencyCode.AFN
    },
    {
        name: 'Albania',
        currency: CurrencyCode.ALL
    },
    {
        name: 'Armenia',
        currency: CurrencyCode.AMD
    },
    {
        name: 'Netherlands Antilles',
        currency: CurrencyCode.ANG
    },
    {
        name: 'Angola',
        currency: CurrencyCode.AOA
    },
    {
        name: 'Argentina',
        currency: CurrencyCode.ARS
    },
    {
        name: 'Australia',
        currency: CurrencyCode.AUD
    },
    {
        name: 'Aruba',
        currency: CurrencyCode.AWG
    },
    {
        name: 'Azerbaijan',
        currency: CurrencyCode.AZN
    },
    {
        name: 'Bosnia and Herzegovina',
        currency: CurrencyCode.BAM
    },
    {
        name: 'Barbados',
        currency: CurrencyCode.BBD
    },
    {
        name: 'Bulgaria',
        currency: CurrencyCode.BGN
    },
    {
        name: 'Bahrain',
        currency: CurrencyCode.BHD
    },
    {
        name: 'Burundi',
        currency: CurrencyCode.BIF
    },
    {
        name: 'Bermuda',
        currency: CurrencyCode.BMD
    },
    {
        name: 'Brunei',
        currency: CurrencyCode.BND
    },
    {
        name: 'Bolivia',
        currency: CurrencyCode.BOB
    },
    {
        name: 'Brazil',
        currency: CurrencyCode.BRL
    },
    {
        name: 'Bahamas',
        currency: CurrencyCode.BSD
    },
    {
        name: 'Bhutan',
        currency: CurrencyCode.BTN
    },
    {
        name: 'Botswana',
        currency: CurrencyCode.BWP
    },
    {
        name: 'Belarus',
        currency: CurrencyCode.BYN
    },
    {
        name: 'Belize',
        currency: CurrencyCode.BZD
    },
    {
        name: 'Canada',
        currency: CurrencyCode.CAD
    },
    {
        name: 'Congo, Democratic Republic of the',
        currency: CurrencyCode.CDF
    },
    {
        name: 'Switzerland',
        currency: CurrencyCode.CHF
    },
    {
        name: 'Chile',
        currency: CurrencyCode.CLP
    },
    {
        name: 'China',
        currency: CurrencyCode.CNY
    },
    {
        name: 'Colombia',
        currency: CurrencyCode.COP
    },
    {
        name: 'Costa Rica',
        currency: CurrencyCode.CRC
    },
    {
        name: 'Cuba',
        currency: CurrencyCode.CUP
    },
    {
        name: 'Cape Verde',
        currency: CurrencyCode.CVE
    },
    {
        name: 'Czechia',
        currency: CurrencyCode.CZK
    },
    {
        name: 'Djibouti',
        currency: CurrencyCode.DJF
    },
    {
        name: 'Denmark',
        currency: CurrencyCode.DKK
    },
    {
        name: 'Dominican Republic',
        currency: CurrencyCode.DOP
    },
    {
        name: 'Algeria',
        currency: CurrencyCode.DZD
    },
    {
        name: 'Egypt',
        currency: CurrencyCode.EGP
    },
    {
        name: 'Eritrea',
        currency: CurrencyCode.ERN
    },
    {
        name: 'Ethiopia',
        currency: CurrencyCode.ETB
    },
    {
        name: 'Eurozone',
        currency: CurrencyCode.EUR
    },
    {
        name: 'Fiji',
        currency: CurrencyCode.FJD
    },
    {
        name: 'United Kingdom',
        currency: CurrencyCode.GBP
    },
    {
        name: 'Georgia',
        currency: CurrencyCode.GEL
    },
    {
        name: 'Ghana',
        currency: CurrencyCode.GHS
    },
    {
        name: 'Gibraltar',
        currency: CurrencyCode.GIP
    },
    {
        name: 'Gambia',
        currency: CurrencyCode.GMD
    },
    {
        name: 'Guinea',
        currency: CurrencyCode.GNF
    },
];