// DEMO-DATEN: Werte sind grobe Platzhalter (Marktgewicht in Bio. USD bzw. Mrd. USD), keine echten Kurse.
// Später kommen die Live-Daten vom Python-Backend (siehe app.js).
const COUNTRIES = [
  {iso:'USA',name:'USA',index:'S&P 500',cap:50},{iso:'CHN',name:'China',index:'CSI 300',cap:10},
  {iso:'JPN',name:'Japan',index:'Nikkei 225',cap:6},{iso:'IND',name:'Indien',index:'Nifty 50',cap:4.5},
  {iso:'GBR',name:'Großbritannien',index:'FTSE 100',cap:3},{iso:'FRA',name:'Frankreich',index:'CAC 40',cap:3},
  {iso:'DEU',name:'Deutschland',index:'DAX',cap:2.5},{iso:'CAN',name:'Kanada',index:'TSX',cap:3},
  {iso:'CHE',name:'Schweiz',index:'SMI',cap:2},{iso:'KOR',name:'Südkorea',index:'KOSPI',cap:1.8},
  {iso:'AUS',name:'Australien',index:'ASX 200',cap:1.8},{iso:'BRA',name:'Brasilien',index:'Ibovespa',cap:1},
  {iso:'SAU',name:'Saudi-Arabien',index:'Tadawul',cap:2.7},{iso:'TWN',name:'Taiwan',index:'TAIEX',cap:2},
  {iso:'NLD',name:'Niederlande',index:'AEX',cap:1.2},{iso:'ESP',name:'Spanien',index:'IBEX 35',cap:0.9},
  {iso:'ITA',name:'Italien',index:'FTSE MIB',cap:0.8},{iso:'MEX',name:'Mexiko',index:'IPC',cap:0.5},
  {iso:'ZAF',name:'Südafrika',index:'JSE Top 40',cap:0.4},{iso:'DNK',name:'Dänemark',index:'OMXC25',cap:0.6}
];
const COMPANIES = [
  {name:'Apple',iso:'USA',city:'Cupertino',lat:37.33,lng:-122.01,cap:3300},
  {name:'Microsoft',iso:'USA',city:'Redmond',lat:47.64,lng:-122.13,cap:3200},
  {name:'NVIDIA',iso:'USA',city:'Santa Clara',lat:37.37,lng:-121.96,cap:3000},
  {name:'Alphabet',iso:'USA',city:'Mountain View',lat:37.42,lng:-122.08,cap:2000},
  {name:'Amazon',iso:'USA',city:'Seattle',lat:47.62,lng:-122.34,cap:1900},
  {name:'JPMorgan',iso:'USA',city:'New York',lat:40.76,lng:-73.97,cap:600},
  {name:'TSMC',iso:'TWN',city:'Hsinchu',lat:24.78,lng:121.01,cap:900},
  {name:'Samsung',iso:'KOR',city:'Suwon',lat:37.26,lng:127.03,cap:350},
  {name:'Toyota',iso:'JPN',city:'Toyota City',lat:35.08,lng:137.16,cap:250},
  {name:'Sony',iso:'JPN',city:'Tokio',lat:35.63,lng:139.74,cap:120},
  {name:'Tencent',iso:'CHN',city:'Shenzhen',lat:22.54,lng:113.93,cap:450},
  {name:'Alibaba',iso:'CHN',city:'Hangzhou',lat:30.27,lng:120.15,cap:200},
  {name:'Saudi Aramco',iso:'SAU',city:'Dhahran',lat:26.29,lng:50.11,cap:1700},
  {name:'ASML',iso:'NLD',city:'Veldhoven',lat:51.42,lng:5.40,cap:300},
  {name:'SAP',iso:'DEU',city:'Walldorf',lat:49.29,lng:8.64,cap:300},
  {name:'Siemens',iso:'DEU',city:'München',lat:48.14,lng:11.58,cap:160},
  {name:'LVMH',iso:'FRA',city:'Paris',lat:48.87,lng:2.30,cap:350},
  {name:'Nestlé',iso:'CHE',city:'Vevey',lat:46.46,lng:6.84,cap:250},
  {name:'Novo Nordisk',iso:'DNK',city:'Bagsværd',lat:55.76,lng:12.45,cap:400},
  {name:'Shell',iso:'GBR',city:'London',lat:51.51,lng:-0.13,cap:210},
  {name:'Reliance',iso:'IND',city:'Mumbai',lat:19.07,lng:72.87,cap:220},
  {name:'BHP',iso:'AUS',city:'Melbourne',lat:-37.81,lng:144.96,cap:140},
  {name:'Petrobras',iso:'BRA',city:'Rio de Janeiro',lat:-22.91,lng:-43.17,cap:90},
  {name:'Shopify',iso:'CAN',city:'Ottawa',lat:45.42,lng:-75.70,cap:130},
  {name:'Meta',iso:'USA',city:'Menlo Park',lat:37.48,lng:-122.15,cap:1400},
  {name:'Tesla',iso:'USA',city:'Austin',lat:30.22,lng:-97.62,cap:800},
  {name:'Berkshire Hathaway',iso:'USA',city:'Omaha',lat:41.26,lng:-95.94,cap:950},
  {name:'Walmart',iso:'USA',city:'Bentonville',lat:36.37,lng:-94.21,cap:700},
  {name:'Eli Lilly',iso:'USA',city:'Indianapolis',lat:39.77,lng:-86.16,cap:750},
  {name:'Visa',iso:'USA',city:'San Francisco',lat:37.77,lng:-122.42,cap:550},
  {name:'ICBC',iso:'CHN',city:'Peking',lat:39.91,lng:116.40,cap:280},
  {name:'Moutai',iso:'CHN',city:'Renhuai',lat:27.80,lng:106.40,cap:250},
  {name:'SK Hynix',iso:'KOR',city:'Icheon',lat:37.28,lng:127.44,cap:100},
  {name:'Nintendo',iso:'JPN',city:'Kyoto',lat:34.99,lng:135.76,cap:70},
  {name:'Infosys',iso:'IND',city:'Bengaluru',lat:12.97,lng:77.59,cap:80},
  {name:'AstraZeneca',iso:'GBR',city:'Cambridge',lat:52.20,lng:0.12,cap:220},
  {name:'HSBC',iso:'GBR',city:'London',lat:51.50,lng:-0.02,cap:170},
  {name:'TotalEnergies',iso:'FRA',city:'Courbevoie',lat:48.90,lng:2.26,cap:140},
  {name:'Roche',iso:'CHE',city:'Basel',lat:47.56,lng:7.59,cap:220},
  {name:'Inditex',iso:'ESP',city:'Arteixo',lat:43.32,lng:-8.51,cap:170},
  {name:'Ferrari',iso:'ITA',city:'Maranello',lat:44.53,lng:10.86,cap:85},
  {name:'Enel',iso:'ITA',city:'Rom',lat:41.90,lng:12.50,cap:70},
  {name:'Commonwealth Bank',iso:'AUS',city:'Sydney',lat:-33.87,lng:151.21,cap:130},
  {name:'Royal Bank of Canada',iso:'CAN',city:'Toronto',lat:43.65,lng:-79.38,cap:160},
  {name:'Al Rajhi Bank',iso:'SAU',city:'Riad',lat:24.71,lng:46.68,cap:100},
  {name:'Prosus',iso:'ZAF',city:'Kapstadt',lat:-33.92,lng:18.42,cap:110},
  {name:'América Móvil',iso:'MEX',city:'Mexiko-Stadt',lat:19.43,lng:-99.13,cap:55}
];

// Weitere Länder und Firmen (Platzhalterwerte, Börsenwert in Mrd. USD)
[['SWE','Schweden','OMXS30',0.9],['NOR','Norwegen','OBX',0.4],['IDN','Indonesien','IDX Composite',0.8],['TUR','Türkei','BIST 100',0.3]]
  .forEach(a => COUNTRIES.push({iso:a[0], name:a[1], index:a[2], cap:a[3]}));
[['Oracle','USA','Austin',30.22,-97.78,500],['Netflix','USA','Los Gatos',37.23,-121.97,400],['Salesforce','USA','San Francisco',37.79,-122.40,280],
 ['Adobe','USA','San Jose',37.33,-121.89,220],['Qualcomm','USA','San Diego',32.90,-117.20,190],['Costco','USA','Issaquah',47.53,-122.03,400],
 ['Coca-Cola','USA','Atlanta',33.77,-84.39,280],['Johnson & Johnson','USA','New Brunswick',40.49,-74.45,380],['Exxon Mobil','USA','Spring',30.08,-95.42,480],
 ['Boeing','USA','Arlington',38.88,-77.10,120],['Disney','USA','Burbank',34.16,-118.33,200],['Caterpillar','USA','Irving',32.81,-96.95,170],
 ['Procter & Gamble','USA','Cincinnati',39.10,-84.51,380],['UnitedHealth','USA','Minnetonka',44.93,-93.47,480],['Chevron','USA','Houston',29.76,-95.37,280],
 ['Honeywell','USA','Charlotte',35.23,-80.84,130],['Enbridge','CAN','Calgary',51.05,-114.07,100],['Nutrien','CAN','Saskatoon',52.13,-106.67,25],
 ['FEMSA','MEX','Monterrey',25.69,-100.32,30],['Itaú Unibanco','BRA','São Paulo',-23.55,-46.63,70],['Rolls-Royce','GBR','Derby',52.92,-1.48,60],
 ['Unilever','GBR','London',51.51,-0.12,150],['Mercedes-Benz','DEU','Stuttgart',48.78,9.18,60],['Volkswagen','DEU','Wolfsburg',52.43,10.79,55],
 ['Deutsche Telekom','DEU','Bonn',50.73,7.10,140],['Adidas','DEU','Herzogenaurach',49.57,10.89,35],['Deutsche Bank','DEU','Frankfurt',50.11,8.68,45],
 ['Airbus','FRA','Toulouse',43.63,1.37,160],['L\'Oréal','FRA','Clichy',48.90,2.31,230],['Michelin','FRA','Clermont-Ferrand',45.78,3.09,25],
 ['Santander','ESP','Santander',43.46,-3.81,85],['Telefónica','ESP','Madrid',40.42,-3.70,25],['Iberdrola','ESP','Bilbao',43.26,-2.93,90],
 ['Intesa Sanpaolo','ITA','Turin',45.07,7.69,70],['Generali','ITA','Triest',45.65,13.78,50],['Heineken','NLD','Amsterdam',52.37,4.90,50],
 ['UBS','CHE','Zürich',47.37,8.54,100],['Richemont','CHE','Genf',46.25,6.15,90],['Vestas','DNK','Aarhus',56.16,10.20,12],
 ['Spotify','SWE','Stockholm',59.33,18.07,100],['Volvo','SWE','Göteborg',57.71,11.97,55],['Equinor','NOR','Stavanger',58.97,5.73,60],
 ['DNB','NOR','Oslo',59.91,10.75,40],['CATL','CHN','Ningde',26.66,119.55,170],['PDD','CHN','Shanghai',31.23,121.47,160],
 ['Xiaomi','CHN','Peking',40.05,116.30,110],['BYD','CHN','Shenzhen',22.62,114.07,110],['Keyence','JPN','Osaka',34.73,135.50,100],
 ['Fast Retailing','JPN','Yamaguchi',34.18,131.47,90],['Hyundai','KOR','Seoul',37.57,126.98,40],['Foxconn','TWN','Neu-Taipeh',25.01,121.45,55],
 ['ITC','IND','Kolkata',22.57,88.36,65],['Maruti Suzuki','IND','Neu-Delhi',28.61,77.21,50],['Bank Central Asia','IDN','Jakarta',-6.21,106.82,70],
 ['Koç Holding','TUR','Istanbul',41.01,28.98,10],['MTN','ZAF','Johannesburg',-26.20,28.04,12],['Woodside','AUS','Perth',-31.95,115.86,30]]
  .forEach(a => COMPANIES.push({name:a[0], iso:a[1], city:a[2], lat:a[3], lng:a[4], cap:a[5]}));

// Länder und Firmen aus aller Welt (Platzhalterwerte). Länder ohne eigenen Index nutzen einen Regions-Proxy (siehe backend/symbols.py).
[["ARG", "Argentinien", "MSCI Argentina (ARGT)", 0.06], ["CHL", "Chile", "MSCI Chile (ECH)", 0.2], ["COL", "Kolumbien", "MSCI Colombia (ICOL)", 0.1], ["PER", "Peru", "MSCI Peru (EPU)", 0.06], ["EGY", "Ägypten", "EGX 30", 0.04], ["ISR", "Israel", "TA-125", 0.3], ["ARE", "Ver. Arab. Emirate", "MSCI UAE (UAE)", 0.8], ["QAT", "Katar", "MSCI Qatar (QAT)", 0.15], ["KWT", "Kuwait", "MSCI Kuwait (KWT)", 0.15], ["POL", "Polen", "MSCI Poland (EPOL)", 0.2], ["THA", "Thailand", "MSCI Thailand (THD)", 0.5], ["VNM", "Vietnam", "VanEck Vietnam (VNM)", 0.25], ["PHL", "Philippinen", "MSCI Philippines (EPHE)", 0.25], ["MYS", "Malaysia", "MSCI Malaysia (EWM)", 0.4], ["NZL", "Neuseeland", "MSCI New Zealand (ENZL)", 0.1], ["BEL", "Belgien", "MSCI Belgium (EWK)", 0.5], ["AUT", "Österreich", "MSCI Austria (EWO)", 0.15], ["IRL", "Irland", "MSCI Ireland (EIRL)", 0.15], ["FIN", "Finnland", "MSCI Finland (EFNL)", 0.35], ["GRC", "Griechenland", "MSCI Greece (GREK)", 0.1], ["PRT", "Portugal", "MSCI Portugal (PGAL)", 0.08], ["SGP", "Singapur", "STI", 0.7], ["HKG", "Hongkong", "Hang Seng", 4.0], ["RUS", "Russland", "MOEX-Index", 0.6], ["CZE", "Tschechien", "", 0.05], ["HUN", "Ungarn", "", 0.04], ["KAZ", "Kasachstan", "", 0.05]]
  .forEach(a => COUNTRIES.push({iso:a[0], name:a[1], index:a[2], cap:a[3]}));
[["Sasol", "ZAF", "Sandton", -26.11, 28.06, 8.0], ["Standard Bank", "ZAF", "Johannesburg", -26.21, 28.04, 25.0], ["Capitec", "ZAF", "Stellenbosch", -33.93, 18.86, 20.0], ["Shoprite", "ZAF", "Brackenfell", -33.88, 18.7, 9.0], ["Commercial Intl. Bank", "EGY", "Kairo", 30.04, 31.24, 6.0], ["YPF", "ARG", "Buenos Aires", -34.6, -58.38, 14.0], ["Banco Galicia", "ARG", "Buenos Aires", -34.61, -58.37, 8.0], ["SQM", "CHL", "Santiago", -33.45, -70.67, 12.0], ["Falabella", "CHL", "Santiago", -33.42, -70.6, 8.0], ["Bancolombia", "COL", "Medellín", 6.25, -75.57, 10.0], ["Ecopetrol", "COL", "Bogotá", 4.71, -74.07, 20.0], ["Credicorp", "PER", "Lima", -12.05, -77.04, 15.0], ["Vale", "BRA", "Rio de Janeiro", -22.9, -43.19, 45.0], ["Ambev", "BRA", "São Paulo", -23.56, -46.65, 35.0], ["WEG", "BRA", "Jaraguá do Sul", -26.49, -49.07, 40.0], ["Walmart de México", "MEX", "Mexiko-Stadt", 19.43, -99.2, 50.0], ["Grupo México", "MEX", "Mexiko-Stadt", 19.41, -99.17, 40.0], ["Cemex", "MEX", "San Pedro Garza García", 25.65, -100.4, 10.0], ["Teva", "ISR", "Tel Aviv", 32.08, 34.78, 20.0], ["Check Point", "ISR", "Tel Aviv", 32.06, 34.8, 25.0], ["First Abu Dhabi Bank", "ARE", "Abu Dhabi", 24.45, 54.37, 45.0], ["Emirates NBD", "ARE", "Dubai", 25.2, 55.27, 30.0], ["Qatar National Bank", "QAT", "Doha", 25.29, 51.53, 50.0], ["Turkish Airlines", "TUR", "Istanbul", 40.98, 28.82, 12.0], ["Garanti BBVA", "TUR", "Istanbul", 41.08, 29.01, 8.0], ["SABIC", "SAU", "Riad", 24.75, 46.62, 55.0], ["stc", "SAU", "Riad", 24.69, 46.73, 55.0], ["Kaspi.kz", "KAZ", "Almaty", 43.24, 76.89, 18.0], ["DBS", "SGP", "Singapur", 1.28, 103.85, 90.0], ["Sea", "SGP", "Singapur", 1.3, 103.79, 80.0], ["Singtel", "SGP", "Singapur", 1.3, 103.85, 40.0], ["AIA", "HKG", "Hongkong", 22.28, 114.16, 90.0], ["HKEX", "HKG", "Hongkong", 22.29, 114.17, 45.0], ["PTT", "THA", "Bangkok", 13.76, 100.5, 30.0], ["CP All", "THA", "Bangkok", 13.75, 100.53, 15.0], ["Airports of Thailand", "THA", "Bangkok", 13.91, 100.6, 20.0], ["SM Investments", "PHL", "Manila", 14.53, 120.98, 20.0], ["BDO Unibank", "PHL", "Manila", 14.55, 121.02, 12.0], ["Maybank", "MYS", "Kuala Lumpur", 3.15, 101.7, 30.0], ["Tenaga Nasional", "MYS", "Kuala Lumpur", 3.1, 101.66, 18.0], ["Bank Rakyat Indonesia", "IDN", "Jakarta", -6.22, 106.8, 40.0], ["Bank Mandiri", "IDN", "Jakarta", -6.23, 106.83, 30.0], ["HDFC Bank", "IND", "Mumbai", 19.0, 72.83, 150.0], ["TCS", "IND", "Mumbai", 18.95, 72.83, 150.0], ["ICICI Bank", "IND", "Mumbai", 19.06, 72.86, 100.0], ["Bharti Airtel", "IND", "Neu-Delhi", 28.55, 77.2, 110.0], ["Adani Enterprises", "IND", "Ahmedabad", 23.02, 72.57, 40.0], ["Tata Steel", "IND", "Jamshedpur", 22.8, 86.2, 20.0], ["CSL", "AUS", "Melbourne", -37.77, 144.95, 90.0], ["Woolworths", "AUS", "Sydney", -33.73, 150.95, 30.0], ["Fortescue", "AUS", "Perth", -31.95, 115.85, 40.0], ["Fisher & Paykel Healthcare", "NZL", "Auckland", -36.93, 174.88, 12.0], ["Xero", "NZL", "Wellington", -41.29, 174.78, 15.0], ["MUFG", "JPN", "Tokio", 35.68, 139.76, 130.0], ["SoftBank Group", "JPN", "Tokio", 35.66, 139.75, 90.0], ["Honda", "JPN", "Tokio", 35.67, 139.73, 45.0], ["MediaTek", "TWN", "Hsinchu", 24.78, 120.99, 80.0], ["Delta Electronics", "TWN", "Taipeh", 25.07, 121.6, 80.0], ["PetroChina", "CHN", "Peking", 39.91, 116.38, 180.0], ["China Mobile", "CHN", "Peking", 39.9, 116.35, 220.0], ["Ping An", "CHN", "Shenzhen", 22.54, 114.06, 130.0], ["Meituan", "CHN", "Peking", 39.99, 116.3, 80.0], ["Changan Automobile", "CHN", "Chongqing", 29.56, 106.55, 15.0], ["Tongwei", "CHN", "Chengdu", 30.57, 104.07, 15.0], ["LG Energy Solution", "KOR", "Seoul", 37.52, 126.93, 60.0], ["Naver", "KOR", "Seongnam", 37.36, 127.11, 25.0], ["PKO Bank Polski", "POL", "Warschau", 52.23, 21.01, 20.0], ["Orlen", "POL", "Płock", 52.55, 19.7, 20.0], ["ČEZ", "CZE", "Prag", 50.08, 14.43, 20.0], ["OTP Bank", "HUN", "Budapest", 47.5, 19.05, 15.0], ["National Bank of Greece", "GRC", "Athen", 37.98, 23.73, 8.0], ["OPAP", "GRC", "Athen", 37.99, 23.78, 7.0], ["EDP", "PRT", "Lissabon", 38.72, -9.14, 14.0], ["Galp", "PRT", "Lissabon", 38.7, -9.16, 12.0], ["Nokia", "FIN", "Espoo", 60.17, 24.74, 30.0], ["Nordea", "FIN", "Helsinki", 60.17, 24.94, 45.0], ["Ericsson", "SWE", "Stockholm", 59.4, 17.95, 28.0], ["Atlas Copco", "SWE", "Nacka", 59.31, 18.16, 70.0], ["AB InBev", "BEL", "Löwen", 50.88, 4.7, 120.0], ["KBC", "BEL", "Brüssel", 50.85, 4.35, 35.0], ["Erste Group", "AUT", "Wien", 48.21, 16.37, 22.0], ["OMV", "AUT", "Wien", 48.19, 16.4, 15.0], ["CRH", "IRL", "Dublin", 53.35, -6.26, 65.0], ["Ryanair", "IRL", "Dublin", 53.43, -6.25, 25.0], ["BP", "GBR", "London", 51.52, -0.09, 80.0], ["GSK", "GBR", "Brentford", 51.49, -0.31, 75.0], ["Rio Tinto", "GBR", "London", 51.53, -0.12, 100.0], ["Allianz", "DEU", "München", 48.15, 11.57, 130.0], ["BMW", "DEU", "München", 48.18, 11.56, 55.0], ["BASF", "DEU", "Ludwigshafen", 49.48, 8.43, 45.0], ["Sanofi", "FRA", "Paris", 48.85, 2.28, 120.0], ["Schneider Electric", "FRA", "Rueil-Malmaison", 48.88, 2.18, 140.0], ["BNP Paribas", "FRA", "Paris", 48.87, 2.33, 80.0], ["Eni", "ITA", "Rom", 41.83, 12.48, 45.0], ["UniCredit", "ITA", "Mailand", 45.46, 9.19, 80.0], ["BBVA", "ESP", "Bilbao", 43.27, -2.94, 70.0], ["Repsol", "ESP", "Madrid", 40.43, -3.69, 15.0], ["Novartis", "CHE", "Basel", 47.56, 7.58, 200.0], ["ABB", "CHE", "Zürich", 47.41, 8.52, 100.0], ["Adyen", "NLD", "Amsterdam", 52.34, 4.88, 50.0], ["ING", "NLD", "Amsterdam", 52.33, 4.92, 60.0], ["Maersk", "DNK", "Kopenhagen", 55.68, 12.57, 25.0], ["DSV", "DNK", "Hedehusene", 55.65, 12.2, 45.0], ["Brookfield", "CAN", "Toronto", 43.64, -79.38, 90.0], ["Canadian National Railway", "CAN", "Montreal", 45.5, -73.57, 70.0], ["Suncor", "CAN", "Calgary", 51.04, -114.07, 50.0], ["Teck", "CAN", "Vancouver", 49.28, -123.12, 25.0], ["Nike", "USA", "Beaverton", 45.51, -122.82, 100.0], ["McDonald's", "USA", "Chicago", 41.88, -87.65, 210.0], ["Newmont", "USA", "Denver", 39.74, -104.99, 50.0], ["General Motors", "USA", "Detroit", 42.33, -83.05, 55.0], ["Thermo Fisher", "USA", "Waltham", 42.37, -71.24, 200.0], ["PNC", "USA", "Pittsburgh", 40.44, -79.99, 75.0]]
  .forEach(a => COMPANIES.push({name:a[0], iso:a[1], city:a[2], lat:a[3], lng:a[4], cap:a[5]}));
