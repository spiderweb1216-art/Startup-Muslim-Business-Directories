// Country centroids used only to position backend-provided company countries on the SVG atlas.
// Company/country counts themselves come from the Startup Muslim backend, not from this file.

const COUNTRY_DATA = [
  ["Afghanistan",33.0,65.0,["AF","Afġānistān"]],
  ["Albania",41.0,20.0,["AL","Shqipëri","Shqipëria","Shqipnia"]],
  ["Algeria",28.0,3.0,["DZ","Dzayer","Algérie"]],
  ["American Samoa",-14.33333333,-170.0,["AS","Amerika Sāmoa","Amelika Sāmoa","Sāmoa Amelika"]],
  ["Angola",-12.5,18.5,["AO","República de Angola","ʁɛpublika de an'ɡɔla"]],
  ["Anguilla",18.25,-63.16666666,["AI"]],
  ["Antigua and Barbuda",17.05,-61.8,["AG"]],
  ["Argentina",-34.0,-64.0,["AR","Argentine Republic","República Argentina"]],
  ["Armenia",40.0,45.0,["AM","Hayastan","Republic of Armenia","Հայաստանի Հանրապետություն"]],
  ["Aruba",12.5,-69.96666666,["AW"]],
  ["Australia",-27.0,133.0,["AU"]],
  ["Austria",47.33333333,13.33333333,["AT","Österreich","Osterreich","Oesterreich"]],
  ["Azerbaijan",40.5,47.5,["AZ","Republic of Azerbaijan","Azərbaycan Respublikası"]],
  ["Bahrain",26.0,50.55,["BH","Kingdom of Bahrain","Mamlakat al-Baḥrayn"]],
  ["Bangladesh",24.0,90.0,["BD","People's Republic of Bangladesh","Gônôprôjatôntri Bangladesh"]],
  ["Barbados",13.16666666,-59.53333333,["BB"]],
  ["Belarus",53.0,28.0,["BY","Bielaruś","Republic of Belarus","Белоруссия","Республика Беларусь","Belorussiya","Respublika Belarus’"]],
  ["Belgium",50.83333333,4.0,["BE","België","Belgie","Belgien","Belgique","Kingdom of Belgium","Koninkrijk België","Royaume de Belgique","Königreich Belgien"]],
  ["Belize",17.25,-88.75,["BZ"]],
  ["Benin",9.5,2.25,["BJ","Republic of Benin","République du Bénin"]],
  ["Bermuda",32.33333333,-64.75,["BM","The Islands of Bermuda","The Bermudas","Somers Isles"]],
  ["Bhutan",27.5,90.5,["BT","Kingdom of Bhutan"]],
  ["Bolivia",-17.0,-65.0,["BO","Buliwya","Wuliwya","Plurinational State of Bolivia","Estado Plurinacional de Bolivia","Buliwya Mamallaqta","Wuliwya Suyu","Tetã Volívia"]],
  ["Bosnia and Herzegovina",44.0,18.0,["BA","Bosnia-Herzegovina","Босна и Херцеговина"]],
  ["Botswana",-22.0,24.0,["BW","Republic of Botswana","Lefatshe la Botswana"]],
  ["Brazil",-10.0,-55.0,["BR","Brasil","Federative Republic of Brazil","República Federativa do Brasil"]],
  ["British Indian Ocean Territory",-6.0,71.5,["IO"]],
  ["Brunei",4.5,114.66666666,["BN","Nation of Brunei","the Abode of Peace"]],
  ["Bulgaria",43.0,25.0,["BG","Republic of Bulgaria","Република България"]],
  ["Burkina Faso",13.0,-2.0,["BF"]],
  ["Burundi",-3.5,30.0,["BI","Republic of Burundi","Republika y'Uburundi","République du Burundi"]],
  ["Cambodia",13.0,105.0,["KH","Kingdom of Cambodia"]],
  ["Cameroon",6.0,12.0,["CM","Republic of Cameroon","République du Cameroun"]],
  ["Canada",60.0,-95.0,["CA"]],
  ["Cape Verde",16.0,-24.0,["CV","Republic of Cabo Verde","República de Cabo Verde"]],
  ["Cayman Islands",19.5,-80.5,["KY"]],
  ["Central African Republic",7.0,21.0,["CF","République centrafricaine"]],
  ["Chad",15.0,19.0,["TD","Tchad","Republic of Chad","République du Tchad"]],
  ["Chile",-30.0,-71.0,["CL","Republic of Chile","República de Chile"]],
  ["China",35.0,105.0,["CN","Zhōngguó","Zhongguo","Zhonghua","People's Republic of China","中华人民共和国","Zhōnghuá Rénmín Gònghéguó"]],
  ["Christmas Island",-10.5,105.66666666,["CX","Territory of Christmas Island"]],
  ["Cocos (Keeling) Islands",-12.5,96.83333333,["CC","Territory of the Cocos (Keeling) Islands","Keeling Islands"]],
  ["Colombia",4.0,-72.0,["CO","Republic of Colombia","República de Colombia"]],
  ["Comoros",-12.16666666,44.25,["KM","Union of the Comoros","Union des Comores","Udzima wa Komori","al-Ittiḥād al-Qumurī"]],
  ["Cook Islands",-21.23333333,-159.76666666,["CK","Kūki 'Āirani"]],
  ["Costa Rica",10.0,-84.0,["CR","Republic of Costa Rica","República de Costa Rica"]],
  ["Croatia",45.16666666,15.5,["HR","Hrvatska","Republic of Croatia","Republika Hrvatska"]],
  ["Cuba",21.5,-80.0,["CU","Republic of Cuba","República de Cuba"]],
  ["Cyprus",35.0,33.0,["CY","Kýpros","Kıbrıs","Republic of Cyprus","Κυπριακή Δημοκρατία","Kıbrıs Cumhuriyeti"]],
  ["Czech Republic",49.75,15.5,["CZ","Česká republika","Česko"]],
  ["Democratic Republic of the Congo",0.0,25.0,["CD","DR Congo","Congo-Kinshasa","DRC"]],
  ["Denmark",56.0,10.0,["DK","Danmark","Kingdom of Denmark","Kongeriget Danmark"]],
  ["Djibouti",11.5,43.0,["DJ","Jabuuti","Gabuuti","Republic of Djibouti","République de Djibouti","Gabuutih Ummuuno","Jamhuuriyadda Jabuuti"]],
  ["Dominica",15.41666666,-61.33333333,["DM","Dominique","Wai‘tu kubuli","Commonwealth of Dominica"]],
  ["Dominican Republic",19.0,-70.66666666,["DO"]],
  ["East Timor",-8.83333333,125.91666666,["TL","Democratic Republic of Timor-Leste","República Democrática de Timor-Leste","Repúblika Demokrátika Timór-Leste"]],
  ["Ecuador",-2.0,-77.5,["EC","Republic of Ecuador","República del Ecuador"]],
  ["Egypt",27.0,30.0,["EG","Arab Republic of Egypt"]],
  ["El Salvador",13.83333333,-88.91666666,["SV","Republic of El Salvador","República de El Salvador"]],
  ["Equatorial Guinea",2.0,10.0,["GQ","Republic of Equatorial Guinea","República de Guinea Ecuatorial","République de Guinée équatoriale","República da Guiné Equatorial"]],
  ["Eritrea",15.0,39.0,["ER","State of Eritrea","ሃገረ ኤርትራ","Dawlat Iritriyá","ʾErtrā","Iritriyā"]],
  ["Estonia",59.0,26.0,["EE","Eesti","Republic of Estonia","Eesti Vabariik"]],
  ["Ethiopia",8.0,38.0,["ET","ʾĪtyōṗṗyā","Federal Democratic Republic of Ethiopia","የኢትዮጵያ ፌዴራላዊ ዲሞክራሲያዊ ሪፐብሊክ"]],
  ["Falkland Islands",-51.75,-59.0,["FK","Islas Malvinas"]],
  ["Faroe Islands",62.0,-7.0,["FO","Føroyar","Færøerne"]],
  ["Federated States of Micronesia",6.91666666,158.25,["FM"]],
  ["Fiji",-18.0,175.0,["FJ","Viti","Republic of Fiji","Matanitu ko Viti","Fijī Gaṇarājya"]],
  ["Finland",64.0,26.0,["FI","Suomi","Republic of Finland","Suomen tasavalta","Republiken Finland"]],
  ["France",46.0,2.0,["FR","French Republic","République française"]],
  ["French Guiana",4.0,-53.0,["GF","Guiana","Guyane"]],
  ["French Polynesia",-15.0,-140.0,["PF","Polynésie française","Pōrīnetia Farāni"]],
  ["French Southern and Antarctic Lands",-49.25,69.167,["TF"]],
  ["Gabon",-1.0,11.75,["GA","Gabonese Republic","République Gabonaise"]],
  ["Georgia",42.0,43.5,["GE","Sakartvelo"]],
  ["Germany",51.0,9.0,["DE","Federal Republic of Germany","Bundesrepublik Deutschland"]],
  ["Ghana",8.0,-2.0,["GH"]],
  ["Gibraltar",36.13333333,-5.35,["GI"]],
  ["Greece",39.0,22.0,["GR","Elláda","Hellenic Republic","Ελληνική Δημοκρατία"]],
  ["Greenland",72.0,-40.0,["GL","Grønland"]],
  ["Grenada",12.11666666,-61.66666666,["GD"]],
  ["Guadeloupe",16.25,-61.583333,["GP","Gwadloup"]],
  ["Guam",13.46666666,144.78333333,["GU","Guåhån"]],
  ["Guatemala",15.5,-90.25,["GT"]],
  ["Guernsey",49.46666666,-2.58333333,["GG","Bailiwick of Guernsey","Bailliage de Guernesey"]],
  ["Guinea",11.0,-10.0,["GN","Republic of Guinea","République de Guinée"]],
  ["Guinea-Bissau",12.0,-15.0,["GW","Republic of Guinea-Bissau","República da Guiné-Bissau"]],
  ["Guyana",5.0,-59.0,["GY","Co-operative Republic of Guyana"]],
  ["Haiti",19.0,-72.41666666,["HT","Republic of Haiti","République d'Haïti","Repiblik Ayiti"]],
  ["Heard Island and McDonald Islands",-53.1,72.51666666,["HM"]],
  ["Honduras",15.0,-86.5,["HN","Republic of Honduras","República de Honduras"]],
  ["Hong Kong",22.25,114.16666666,["HK","香港"]],
  ["Hungary",47.0,20.0,["HU"]],
  ["Iceland",65.0,-18.0,["IS","Island","Republic of Iceland","Lýðveldið Ísland"]],
  ["India",20.0,77.0,["IN","Bhārat","Republic of India","Bharat Ganrajya"]],
  ["Indonesia",-5.0,120.0,["ID","Republic of Indonesia","Republik Indonesia"]],
  ["Iran",32.0,53.0,["IR","Islamic Republic of Iran","Jomhuri-ye Eslāmi-ye Irān"]],
  ["Iraq",33.0,44.0,["IQ","Republic of Iraq","Jumhūriyyat al-‘Irāq"]],
  ["Ireland",53.0,-8.0,["IE","Éire","Republic of Ireland","Poblacht na hÉireann"]],
  ["Isle of Man",54.25,-4.5,["IM","Ellan Vannin","Mann","Mannin"]],
  ["Israel",31.5,34.75,["IL","State of Israel","Medīnat Yisrā'el"]],
  ["Italy",42.83333333,12.83333333,["IT","Italian Republic","Repubblica italiana"]],
  ["Ivory Coast",8.0,-5.0,["CI","Republic of Côte d'Ivoire","République de Côte d'Ivoire"]],
  ["Jamaica",18.25,-77.5,["JM"]],
  ["Japan",36.0,138.0,["JP","Nippon","Nihon"]],
  ["Jersey",49.25,-2.16666666,["JE","Bailiwick of Jersey","Bailliage de Jersey","Bailliage dé Jèrri"]],
  ["Jordan",31.0,36.0,["JO","Hashemite Kingdom of Jordan","al-Mamlakah al-Urdunīyah al-Hāshimīyah"]],
  ["Kazakhstan",48.0,68.0,["KZ","Qazaqstan","Казахстан","Republic of Kazakhstan","Қазақстан Республикасы","Qazaqstan Respublïkası","Республика Казахстан","Respublika Kazakhstan"]],
  ["Kenya",1.0,38.0,["KE","Republic of Kenya","Jamhuri ya Kenya"]],
  ["Kiribati",1.41666666,173.0,["KI","Republic of Kiribati","Ribaberiki Kiribati"]],
  ["Kosovo",42.6026,20.903,["Republic of Kosovo","XK","XKX"]],
  ["Kuwait",29.5,45.75,["KW","State of Kuwait","Dawlat al-Kuwait"]],
  ["Kyrgyzstan",41.0,75.0,["KG","Киргизия","Kyrgyz Republic","Кыргыз Республикасы","Kyrgyz Respublikasy"]],
  ["Laos",18.0,105.0,["LA","Lao","Lao People's Democratic Republic","Sathalanalat Paxathipatai Paxaxon Lao"]],
  ["Latvia",57.0,25.0,["LV","Republic of Latvia","Latvijas Republika"]],
  ["Lebanon",33.83333333,35.83333333,["LB","Lebanese Republic","Al-Jumhūrīyah Al-Libnānīyah"]],
  ["Lesotho",-29.5,28.5,["LS","Kingdom of Lesotho","Muso oa Lesotho"]],
  ["Liberia",6.5,-9.5,["LR","Republic of Liberia"]],
  ["Libya",25.0,17.0,["LY","State of Libya","Dawlat Libya"]],
  ["Liechtenstein",47.26666666,9.53333333,["LI","Principality of Liechtenstein","Fürstentum Liechtenstein"]],
  ["Lithuania",56.0,24.0,["LT","Republic of Lithuania","Lietuvos Respublika"]],
  ["Luxembourg",49.75,6.16666666,["LU","Grand Duchy of Luxembourg","Grand-Duché de Luxembourg","Großherzogtum Luxemburg","Groussherzogtum Lëtzebuerg"]],
  ["Macau",22.16666666,113.55,["MO","澳门","Macao Special Administrative Region of the People's Republic of China","中華人民共和國澳門特別行政區","Região Administrativa Especial de Macau da República Popular da China"]],
  ["Madagascar",-20.0,47.0,["MG","Republic of Madagascar","Repoblikan'i Madagasikara","République de Madagascar"]],
  ["Malawi",-13.5,34.0,["MW","Republic of Malawi"]],
  ["Malaysia",2.5,112.5,["MY"]],
  ["Maldives",3.25,73.0,["MV","Maldive Islands","Republic of the Maldives","Dhivehi Raajjeyge Jumhooriyya"]],
  ["Mali",17.0,-4.0,["ML","Republic of Mali","République du Mali"]],
  ["Malta",35.83333333,14.58333333,["MT","Republic of Malta","Repubblika ta' Malta"]],
  ["Marshall Islands",9.0,168.0,["MH","Republic of the Marshall Islands","Aolepān Aorōkin M̧ajeļ"]],
  ["Martinique",14.666667,-61.0,["MQ"]],
  ["Mauritania",20.0,-12.0,["MR","Islamic Republic of Mauritania","al-Jumhūriyyah al-ʾIslāmiyyah al-Mūrītāniyyah"]],
  ["Mauritius",-20.28333333,57.55,["MU","Republic of Mauritius","République de Maurice"]],
  ["Mayotte",-12.83333333,45.16666666,["YT","Department of Mayotte","Département de Mayotte"]],
  ["Mexico",23.0,-102.0,["MX","Mexicanos","United Mexican States","Estados Unidos Mexicanos"]],
  ["Moldova",47.0,29.0,["MD","Republic of Moldova","Republica Moldova"]],
  ["Monaco",43.73333333,7.4,["MC","Principality of Monaco","Principauté de Monaco"]],
  ["Mongolia",46.0,105.0,["MN"]],
  ["Montserrat",16.75,-62.2,["MS"]],
  ["Morocco",32.0,-5.0,["MA","Kingdom of Morocco","Al-Mamlakah al-Maġribiyah"]],
  ["Mozambique",-18.25,35.0,["MZ","Republic of Mozambique","República de Moçambique"]],
  ["Namibia",-22.0,17.0,["NA","Namibië","Republic of Namibia"]],
  ["Nauru",-0.53333333,166.91666666,["NR","Naoero","Pleasant Island","Republic of Nauru","Ripublik Naoero"]],
  ["Nepal",28.0,84.0,["NP","Federal Democratic Republic of Nepal","Loktāntrik Ganatantra Nepāl"]],
  ["Netherlands",52.5,5.75,["NL","Holland","Nederland"]],
  ["New Caledonia",-21.5,165.5,["NC"]],
  ["New Zealand",-41.0,174.0,["NZ","Aotearoa"]],
  ["Nicaragua",13.0,-85.0,["NI","Republic of Nicaragua","República de Nicaragua"]],
  ["Niger",16.0,8.0,["NE","Nijar","Republic of Niger","République du Niger"]],
  ["Nigeria",10.0,8.0,["NG","Nijeriya","Naíjíríà","Federal Republic of Nigeria"]],
  ["Niue",-19.03333333,-169.86666666,["NU"]],
  ["Norfolk Island",-29.03333333,167.95,["NF","Territory of Norfolk Island","Teratri of Norf'k Ailen"]],
  ["North Korea",40.0,127.0,["KP","Democratic People's Republic of Korea","조선민주주의인민공화국","Chosŏn Minjujuŭi Inmin Konghwaguk"]],
  ["Northern Mariana Islands",15.2,145.75,["MP","Commonwealth of the Northern Mariana Islands","Sankattan Siha Na Islas Mariånas"]],
  ["Norway",62.0,10.0,["NO","Norge","Noreg","Kingdom of Norway","Kongeriket Norge","Kongeriket Noreg"]],
  ["Oman",21.0,57.0,["OM","Sultanate of Oman","Salṭanat ʻUmān"]],
  ["Pakistan",30.0,70.0,["PK","Pākistān","Islamic Republic of Pakistan","Islāmī Jumhūriya'eh Pākistān"]],
  ["Palau",7.5,134.5,["PW","Republic of Palau","Beluu er a Belau"]],
  ["Palestine",31.9522,35.2332,["PS","State of Palestine","Palestinian Territories","Palestinian Territory"]],
  ["Panama",9.0,-80.0,["PA","Republic of Panama","República de Panamá"]],
  ["Papua New Guinea",-6.0,147.0,["PG","Independent State of Papua New Guinea","Independen Stet bilong Papua Niugini"]],
  ["Paraguay",-23.0,-58.0,["PY","Republic of Paraguay","República del Paraguay","Tetã Paraguái"]],
  ["Peru",-10.0,-76.0,["PE","Republic of Peru","República del Perú"]],
  ["Philippines",13.0,122.0,["PH","Republic of the Philippines","Repúblika ng Pilipinas"]],
  ["Pitcairn Islands",-25.06666666,-130.1,["PN","Pitcairn Henderson Ducie and Oeno Islands"]],
  ["Poland",52.0,20.0,["PL","Republic of Poland","Rzeczpospolita Polska"]],
  ["Portugal",39.5,-8.0,["PT","Portuguesa","Portuguese Republic","República Portuguesa"]],
  ["Puerto Rico",18.25,-66.5,["PR","Commonwealth of Puerto Rico","Estado Libre Asociado de Puerto Rico"]],
  ["Qatar",25.5,51.25,["QA","State of Qatar","Dawlat Qaṭar"]],
  ["Republic of Macedonia",41.83333333,22.0,["MK","Република Македонија"]],
  ["Republic of the Congo",-1.0,15.0,["CG","Congo-Brazzaville"]],
  ["Romania",46.0,25.0,["RO","Rumania","Roumania","România"]],
  ["Russia",60.0,100.0,["RU","Rossiya","Russian Federation","Российская Федерация","Rossiyskaya Federatsiya"]],
  ["Rwanda",-2.0,30.0,["RW","Republic of Rwanda","Repubulika y'u Rwanda","République du Rwanda"]],
  ["Réunion",-21.15,55.5,["RE","Reunion"]],
  ["Saint Helena",-15.95,-5.7,["SH"]],
  ["Saint Kitts and Nevis",17.33333333,-62.75,["KN","Federation of Saint Christopher and Nevis"]],
  ["Saint Lucia",13.88333333,-60.96666666,["LC"]],
  ["Saint Pierre and Miquelon",46.83333333,-56.33333333,["PM","Collectivité territoriale de Saint-Pierre-et-Miquelon"]],
  ["Saint Vincent and the Grenadines",13.25,-61.2,["VC"]],
  ["Samoa",-13.58333333,-172.33333333,["WS","Independent State of Samoa","Malo Saʻoloto Tutoʻatasi o Sāmoa"]],
  ["San Marino",43.76666666,12.41666666,["SM","Republic of San Marino","Repubblica di San Marino"]],
  ["Saudi Arabia",25.0,45.0,["SA","Kingdom of Saudi Arabia","Al-Mamlakah al-‘Arabiyyah as-Su‘ūdiyyah"]],
  ["Senegal",14.0,-14.0,["SN","Republic of Senegal","République du Sénégal"]],
  ["Serbia",44.1305021,16.4284181,["RS","Srbija","Republic of Serbia","Republika Srbija"]],
  ["Seychelles",-4.58333333,55.66666666,["SC","Republic of Seychelles","Repiblik Sesel","République des Seychelles"]],
  ["Sierra Leone",8.5,-11.5,["SL","Republic of Sierra Leone"]],
  ["Singapore",1.36666666,103.8,["SG","Singapura","Republik Singapura","新加坡共和国"]],
  ["Slovakia",48.66666666,19.5,["SK","Slovak Republic","Slovenská republika"]],
  ["Slovenia",46.11666666,14.81666666,["SI","Republic of Slovenia","Republika Slovenija"]],
  ["Solomon Islands",-8.0,159.0,["SB"]],
  ["Somalia",10.0,49.0,["SO","aṣ-Ṣūmāl","Federal Republic of Somalia","Jamhuuriyadda Federaalka Soomaaliya","Jumhūriyyat aṣ-Ṣūmāl al-Fiderāliyya"]],
  ["South Africa",-29.0,24.0,["ZA","RSA","Suid-Afrika","Republic of South Africa"]],
  ["South Georgia",-54.5,-37.0,["GS","South Georgia and the South Sandwich Islands"]],
  ["South Korea",37.0,127.5,["KR","Republic of Korea"]],
  ["South Sudan",7.0,30.0,["SS"]],
  ["Spain",40.0,-4.0,["ES","Kingdom of Spain","Reino de España"]],
  ["Sri Lanka",7.0,81.0,["LK","ilaṅkai","Democratic Socialist Republic of Sri Lanka"]],
  ["Sudan",15.0,30.0,["SD","Republic of the Sudan","Jumhūrīyat as-Sūdān"]],
  ["Suriname",4.0,-56.0,["SR","Sarnam","Sranangron","Republic of Suriname","Republiek Suriname"]],
  ["Svalbard and Jan Mayen",78.0,20.0,["SJ","Svalbard and Jan Mayen Islands"]],
  ["Swaziland",-26.5,31.5,["SZ","weSwatini","Swatini","Ngwane","Kingdom of Swaziland","Umbuso waseSwatini"]],
  ["Sweden",62.0,15.0,["SE","Kingdom of Sweden","Konungariket Sverige"]],
  ["Switzerland",47.0,8.0,["CH","Swiss Confederation","Schweiz","Suisse","Svizzera","Svizra"]],
  ["Syria",35.0,38.0,["SY","Syrian Arab Republic","Al-Jumhūrīyah Al-ʻArabīyah As-Sūrīyah"]],
  ["São Tomé and Príncipe",1.0,7.0,["ST","Democratic Republic of São Tomé and Príncipe","República Democrática de São Tomé e Príncipe"]],
  ["Taiwan",23.5,121.0,["TW","Táiwān","Republic of China","中華民國","Zhōnghuá Mínguó"]],
  ["Tajikistan",39.0,71.0,["TJ","Toçikiston","Republic of Tajikistan","Ҷумҳурии Тоҷикистон","Çumhuriyi Toçikiston"]],
  ["Tanzania",-6.0,35.0,["TZ","United Republic of Tanzania","Jamhuri ya Muungano wa Tanzania"]],
  ["Thailand",15.0,100.0,["TH","Prathet","Thai","Kingdom of Thailand","ราชอาณาจักรไทย","Ratcha Anachak Thai"]],
  ["The Bahamas",24.25,-76.0,["BS","Commonwealth of the Bahamas"]],
  ["The Gambia",13.46666666,-16.56666666,["GM","Republic of the Gambia"]],
  ["Togo",8.0,1.16666666,["TG","Togolese","Togolese Republic","République Togolaise"]],
  ["Tokelau",-9.0,-172.0,["TK"]],
  ["Tonga",-20.0,-175.0,["TO"]],
  ["Trinidad and Tobago",11.0,-61.0,["TT","Republic of Trinidad and Tobago"]],
  ["Tunisia",34.0,9.0,["TN","Republic of Tunisia","al-Jumhūriyyah at-Tūnisiyyah"]],
  ["Turkey",39.0,35.0,["TR","Turkiye","Republic of Turkey","Türkiye Cumhuriyeti"]],
  ["Turkmenistan",40.0,60.0,["TM"]],
  ["Tuvalu",-8.0,178.0,["TV"]],
  ["Uganda",1.0,32.0,["UG","Republic of Uganda","Jamhuri ya Uganda"]],
  ["Ukraine",49.0,32.0,["UA","Ukrayina"]],
  ["United Arab Emirates",24.0,54.0,["AE","UAE"]],
  ["United Kingdom",54.0,-2.0,["GB","UK","Great Britain"]],
  ["United States",38.0,-97.0,["US","USA","United States of America"]],
  ["Uruguay",-33.0,-56.0,["UY","Oriental Republic of Uruguay","República Oriental del Uruguay"]],
  ["Uzbekistan",41.0,64.0,["UZ","Republic of Uzbekistan","O‘zbekiston Respublikasi","Ўзбекистон Республикаси"]],
  ["Vanuatu",-16.0,167.0,["VU","Republic of Vanuatu","Ripablik blong Vanuatu","République de Vanuatu"]],
  ["Venezuela",8.0,-66.0,["VE","Bolivarian Republic of Venezuela","República Bolivariana de Venezuela"]],
  ["Vietnam",16.16666666,107.83333333,["VN","Socialist Republic of Vietnam","Cộng hòa Xã hội chủ nghĩa Việt Nam"]],
  ["Wallis and Futuna",-13.3,-176.2,["WF","Territory of the Wallis and Futuna Islands","Territoire des îles Wallis et Futuna"]],
  ["Western Sahara",24.5,-13.0,["EH","Taneẓroft Tutrimt"]],
  ["Yemen",15.0,48.0,["YE","Yemeni Republic","al-Jumhūriyyah al-Yamaniyyah"]],
  ["Zambia",-15.0,30.0,["ZM","Republic of Zambia"]],
  ["Zimbabwe",-20.0,30.0,["ZW","Republic of Zimbabwe"]],
];

const normalize = (value = '') => String(value || '').trim().toLowerCase().replace(/\s+/g, ' ');

const COUNTRY_LOOKUP = new Map();
COUNTRY_DATA.forEach(([name, lat, lng, aliases]) => {
  const code = (aliases || []).find((alias) => /^[A-Za-z]{2}$/.test(String(alias || '').trim()))?.toUpperCase() || '';
  const record = { name, lat, lng, code };
  COUNTRY_LOOKUP.set(normalize(name), record);
  (aliases || []).forEach((alias) => COUNTRY_LOOKUP.set(normalize(alias), record));
});

const EXTRA_ALIASES = {
  "uae": "United Arab Emirates",
  "u.a.e.": "United Arab Emirates",
  "uk": "United Kingdom",
  "u.k.": "United Kingdom",
  "britain": "United Kingdom",
  "usa": "United States",
  "u.s.a.": "United States",
  "us": "United States",
  "u.s.": "United States",
  "turkiye": "Turkey",
  "türkiye": "Turkey",
  "republic of türkiye": "Turkey",
  "czechia": "Czech Republic",
  "bosnia & herzegovina": "Bosnia and Herzegovina",
  "south korea": "South Korea",
  "republic of korea": "South Korea",
  "palestinian territories": "Palestine",
  "state of palestine": "Palestine",
};
Object.entries(EXTRA_ALIASES).forEach(([alias, target]) => {
  const record = COUNTRY_LOOKUP.get(normalize(target));
  if (record) COUNTRY_LOOKUP.set(normalize(alias), record);
});

export function getCountryRecord(value) {
  const raw = String(value || "").trim();
  if (!raw) return null;
  return COUNTRY_LOOKUP.get(normalize(raw)) || null;
}

export function canonicalCountry(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  return getCountryRecord(raw)?.name || raw;
}

export function projectCountry(value) {
  const record = getCountryRecord(value);
  if (!record) return null;
  const x = Math.max(55, Math.min(945, 500 + (record.lng * 2.6)));
  const southShift = record.lat < 10 ? 50 : 0;
  const y = Math.max(45, Math.min(292, 145 - (record.lat * 1.2) + southShift));
  return { x, y, lat: record.lat, lng: record.lng, name: record.name };
}


const emojiFromCode = (code = '') => {
  const normalized = String(code || '').trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(normalized)) return '';
  return String.fromCodePoint(...normalized.split('').map((char) => 127397 + char.charCodeAt(0)));
};

const looksLikeFlagEmoji = (value = '') => {
  const chars = Array.from(String(value || '').trim());
  return chars.length === 2 && chars.every((char) => {
    const cp = char.codePointAt(0);
    return cp >= 0x1F1E6 && cp <= 0x1F1FF;
  });
};

export function countryName(value) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  if (/^(global|worldwide)$/i.test(raw)) return 'Global';
  if (/^remote$/i.test(raw)) return 'Remote';
  return canonicalCountry(raw);
}

const codeFromFlagEmoji = (value = '') => {
  const chars = Array.from(String(value || '').trim());
  if (chars.length !== 2) return '';
  const letters = chars.map((char) => {
    const cp = char.codePointAt(0);
    if (cp < 0x1F1E6 || cp > 0x1F1FF) return '';
    return String.fromCharCode(65 + (cp - 0x1F1E6));
  });
  return letters.every(Boolean) ? letters.join('') : '';
};

export function countryCode(value, explicitFlag = '') {
  const rawFlag = String(explicitFlag || '').trim();
  if (/^[A-Za-z]{2}$/.test(rawFlag)) return rawFlag.toUpperCase();
  if (looksLikeFlagEmoji(rawFlag)) return codeFromFlagEmoji(rawFlag);

  const raw = String(value || '').trim();
  if (/^[A-Za-z]{2}$/.test(raw)) return raw.toUpperCase();
  if (looksLikeFlagEmoji(raw)) return codeFromFlagEmoji(raw);

  const record = getCountryRecord(raw) || getCountryRecord(rawFlag);
  return record?.code || '';
}

export function countryFlag(value, explicitFlag = '') {
  const code = countryCode(value, explicitFlag);
  if (code) return emojiFromCode(code);

  const raw = String(value || '').trim();
  if (!raw) return '🌍';
  if (/^(global|worldwide)$/i.test(raw)) return '🌍';
  if (/^remote$/i.test(raw)) return '🌐';
  return '🌍';
}

// Text-only fallback. Do not include Unicode flag emoji here because Windows can
// render them as two-letter country codes (CA, GB, SA, etc.). For visual UI,
// use <CountryLabel /> which renders a real flag image.
export function countryLabel(value, explicitFlag = '') {
  return countryName(value || explicitFlag);
}
