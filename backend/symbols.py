"""Zuordnung: Land bzw. Firma (wie in data.js) -> Börsenkürzel bei Yahoo Finance.
Falls ein Kürzel nicht stimmt, steht es nach dem Start unter http://127.0.0.1:8000/api/status bei "missing"
und kann hier einfach korrigiert werden (Suche nach dem Wertpapier auf finance.yahoo.com)."""

# Länder: ISO-Code -> Leitindex
COUNTRY_SYMBOLS = {
    "USA": "^GSPC", "CHN": "000300.SS", "JPN": "^N225", "IND": "^NSEI", "GBR": "^FTSE", "FRA": "^FCHI",
    "DEU": "^GDAXI", "CAN": "^GSPTSE", "CHE": "^SSMI", "KOR": "^KS11", "AUS": "^AXJO", "BRA": "^BVSP",
    "SAU": "^TASI.SR", "TWN": "^TWII", "NLD": "^AEX", "ESP": "^IBEX", "ITA": "FTSEMIB.MI", "MEX": "^MXX",
    "ZAF": "^J200.JO", "DNK": "^OMXC25", "SWE": "^OMX", "NOR": "OBX.OL", "IDN": "^JKSE", "TUR": "XU100.IS",
}

# Firmen: Name (genau wie in data.js) -> Aktie
COMPANY_SYMBOLS = {
    "Apple": "AAPL", "Microsoft": "MSFT", "NVIDIA": "NVDA", "Alphabet": "GOOGL", "Amazon": "AMZN", "JPMorgan": "JPM",
    "TSMC": "2330.TW", "Samsung": "005930.KS", "Toyota": "7203.T", "Sony": "6758.T", "Tencent": "0700.HK",
    "Alibaba": "9988.HK", "Saudi Aramco": "2222.SR", "ASML": "ASML.AS", "SAP": "SAP.DE", "Siemens": "SIE.DE",
    "LVMH": "MC.PA", "Nestlé": "NESN.SW", "Novo Nordisk": "NOVO-B.CO", "Shell": "SHEL.L", "Reliance": "RELIANCE.NS",
    "BHP": "BHP.AX", "Petrobras": "PETR4.SA", "Shopify": "SHOP.TO", "Meta": "META", "Tesla": "TSLA",
    "Berkshire Hathaway": "BRK-B", "Walmart": "WMT", "Eli Lilly": "LLY", "Visa": "V", "ICBC": "1398.HK",
    "Moutai": "600519.SS", "SK Hynix": "000660.KS", "Nintendo": "7974.T", "Infosys": "INFY.NS", "AstraZeneca": "AZN.L",
    "HSBC": "HSBA.L", "TotalEnergies": "TTE.PA", "Roche": "ROG.SW", "Inditex": "ITX.MC", "Ferrari": "RACE.MI",
    "Enel": "ENEL.MI", "Commonwealth Bank": "CBA.AX", "Royal Bank of Canada": "RY.TO", "Al Rajhi Bank": "1120.SR",
    "Prosus": "PRX.AS", "América Móvil": "AMXB.MX", "Oracle": "ORCL", "Netflix": "NFLX", "Salesforce": "CRM",
    "Adobe": "ADBE", "Qualcomm": "QCOM", "Costco": "COST", "Coca-Cola": "KO", "Johnson & Johnson": "JNJ",
    "Exxon Mobil": "XOM", "Boeing": "BA", "Disney": "DIS", "Caterpillar": "CAT", "Procter & Gamble": "PG",
    "UnitedHealth": "UNH", "Chevron": "CVX", "Honeywell": "HON", "Enbridge": "ENB.TO", "Nutrien": "NTR.TO",
    "FEMSA": "FEMSAUBD.MX", "Itaú Unibanco": "ITUB4.SA", "Rolls-Royce": "RR.L", "Unilever": "ULVR.L",
    "Mercedes-Benz": "MBG.DE", "Volkswagen": "VOW3.DE", "Deutsche Telekom": "DTE.DE", "Adidas": "ADS.DE",
    "Deutsche Bank": "DBK.DE", "Airbus": "AIR.PA", "L'Oréal": "OR.PA", "Michelin": "ML.PA", "Santander": "SAN.MC",
    "Telefónica": "TEF.MC", "Iberdrola": "IBE.MC", "Intesa Sanpaolo": "ISP.MI", "Generali": "G.MI",
    "Heineken": "HEIA.AS", "UBS": "UBSG.SW", "Richemont": "CFR.SW", "Vestas": "VWS.CO", "Spotify": "SPOT",
    "Volvo": "VOLV-B.ST", "Equinor": "EQNR.OL", "DNB": "DNB.OL", "CATL": "300750.SZ", "PDD": "PDD",
    "Xiaomi": "1810.HK", "BYD": "1211.HK", "Keyence": "6861.T", "Fast Retailing": "9983.T", "Hyundai": "005380.KS",
    "Foxconn": "2317.TW", "ITC": "ITC.NS", "Maruti Suzuki": "MARUTI.NS", "Bank Central Asia": "BBCA.JK",
    "Koç Holding": "KCHOL.IS", "MTN": "MTN.JO", "Woodside": "WDS.AX",
}

# Weitere Länder und Firmen aus aller Welt
COUNTRY_SYMBOLS.update({"ARG": "ARGT", "CHL": "ECH", "COL": "ICOL", "PER": "EPU", "EGY": "^CASE30", "ISR": "^TA125.TA", "ARE": "UAE", "QAT": "QAT", "KWT": "KWT", "POL": "EPOL", "THA": "THD", "VNM": "VNM", "PHL": "EPHE", "MYS": "EWM", "NZL": "ENZL", "BEL": "EWK", "AUT": "EWO", "IRL": "EIRL", "FIN": "EFNL", "GRC": "GREK", "PRT": "PGAL", "SGP": "^STI", "HKG": "^HSI", "RUS": "IMOEX.ME"})
COMPANY_SYMBOLS.update({"Sasol": "SOL.JO", "Standard Bank": "SBK.JO", "Capitec": "CPI.JO", "Shoprite": "SHP.JO", "Commercial Intl. Bank": "COMI.CA", "YPF": "YPF", "Banco Galicia": "GGAL", "SQM": "SQM", "Falabella": "FALABELLA.SN", "Bancolombia": "CIB", "Ecopetrol": "EC", "Credicorp": "BAP", "Vale": "VALE3.SA", "Ambev": "ABEV3.SA", "WEG": "WEGE3.SA", "Walmart de México": "WALMEX.MX", "Grupo México": "GMEXICOB.MX", "Cemex": "CEMEXCPO.MX", "Teva": "TEVA", "Check Point": "CHKP", "First Abu Dhabi Bank": "FAB.AD", "Emirates NBD": "EMIRATESNBD.DU", "Qatar National Bank": "QNBK.QA", "Turkish Airlines": "THYAO.IS", "Garanti BBVA": "GARAN.IS", "SABIC": "2010.SR", "stc": "7010.SR", "Kaspi.kz": "KSPI", "DBS": "D05.SI", "Sea": "SE", "Singtel": "Z74.SI", "AIA": "1299.HK", "HKEX": "0388.HK", "PTT": "PTT.BK", "CP All": "CPALL.BK", "Airports of Thailand": "AOT.BK", "SM Investments": "SM.PS", "BDO Unibank": "BDO.PS", "Maybank": "1155.KL", "Tenaga Nasional": "5347.KL", "Bank Rakyat Indonesia": "BBRI.JK", "Bank Mandiri": "BMRI.JK", "HDFC Bank": "HDFCBANK.NS", "TCS": "TCS.NS", "ICICI Bank": "ICICIBANK.NS", "Bharti Airtel": "BHARTIARTL.NS", "Adani Enterprises": "ADANIENT.NS", "Tata Steel": "TATASTEEL.NS", "CSL": "CSL.AX", "Woolworths": "WOW.AX", "Fortescue": "FMG.AX", "Fisher & Paykel Healthcare": "FPH.NZ", "Xero": "XRO.AX", "MUFG": "8306.T", "SoftBank Group": "9984.T", "Honda": "7267.T", "MediaTek": "2454.TW", "Delta Electronics": "2308.TW", "PetroChina": "0857.HK", "China Mobile": "0941.HK", "Ping An": "2318.HK", "Meituan": "3690.HK", "Changan Automobile": "000625.SZ", "Tongwei": "600438.SS", "LG Energy Solution": "373220.KS", "Naver": "035420.KS", "PKO Bank Polski": "PKO.WA", "Orlen": "PKN.WA", "ČEZ": "CEZ.PR", "OTP Bank": "OTP.BD", "National Bank of Greece": "ETE.AT", "OPAP": "OPAP.AT", "EDP": "EDP.LS", "Galp": "GALP.LS", "Nokia": "NOKIA.HE", "Nordea": "NDA-FI.HE", "Ericsson": "ERIC-B.ST", "Atlas Copco": "ATCO-A.ST", "AB InBev": "ABI.BR", "KBC": "KBC.BR", "Erste Group": "EBS.VI", "OMV": "OMV.VI", "CRH": "CRH", "Ryanair": "RYA.IR", "BP": "BP.L", "GSK": "GSK.L", "Rio Tinto": "RIO.L", "Allianz": "ALV.DE", "BMW": "BMW.DE", "BASF": "BAS.DE", "Sanofi": "SAN.PA", "Schneider Electric": "SU.PA", "BNP Paribas": "BNP.PA", "Eni": "ENI.MI", "UniCredit": "UCG.MI", "BBVA": "BBVA.MC", "Repsol": "REP.MC", "Novartis": "NOVN.SW", "ABB": "ABBN.SW", "Adyen": "ADYEN.AS", "ING": "INGA.AS", "Maersk": "MAERSK-B.CO", "DSV": "DSV.CO", "Brookfield": "BN.TO", "Canadian National Railway": "CNR.TO", "Suncor": "SU.TO", "Teck": "TECK-B.TO", "Nike": "NKE", "McDonald's": "MCD", "Newmont": "NEM", "General Motors": "GM", "Thermo Fisher": "TMO", "PNC": "PNC"})

# Länder ohne eigenen Index bekommen den Wert ihrer Weltregion (Natural-Earth-Unterregion, wie im Frontend).
# Pro Region eine Liste von Kandidaten: der erste Eintrag, für den Yahoo Daten liefert, wird genutzt.
_AFRICA = [("AFK", "VanEck Africa ETF"), ("FM", "iShares MSCI Frontier ETF")]
_LATAM = [("ILF", "iShares Latin America 40 ETF")]
_FRONTIER = [("FM", "iShares MSCI Frontier ETF"), ("EEM", "iShares MSCI Emerging Markets ETF")]
_ASIA = [("AAXJ", "iShares MSCI Asia ex Japan ETF")]
_EUROPE = [("VGK", "Vanguard FTSE Europe ETF")]
_OCEANIA = [("EWA", "iShares MSCI Australia ETF")]
REGION_PROXIES = {
    "Northern Africa": _AFRICA, "Western Africa": _AFRICA, "Middle Africa": _AFRICA, "Eastern Africa": _AFRICA,
    "Southern Africa": [("^J200.JO", "JSE Top 40")] + _AFRICA,
    "Northern America": [("SPY", "SPDR S&P 500 ETF")],
    "Central America": _LATAM, "Caribbean": _LATAM, "South America": _LATAM,
    "Central Asia": _FRONTIER, "Western Asia": _FRONTIER, "Southern Asia": _FRONTIER + _ASIA,
    "South-Eastern Asia": _ASIA, "Eastern Asia": _ASIA,
    "Eastern Europe": [("EEM", "iShares MSCI Emerging Markets ETF")] + _FRONTIER,
    "Northern Europe": _EUROPE, "Western Europe": _EUROPE, "Southern Europe": _EUROPE,
    "Australia and New Zealand": _OCEANIA, "Melanesia": _OCEANIA, "Micronesia": _OCEANIA, "Polynesia": _OCEANIA,
}
