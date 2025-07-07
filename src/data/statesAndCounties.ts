export interface County {
  name: string;
  id: string;
}

export interface State {
  name: string;
  code: string;
  counties: County[];
}

export const statesAndCounties: State[] = [
  {
    name: "California",
    code: "CA",
    counties: [
      { name: "Los Angeles", id: "los-angeles" },
      { name: "Orange", id: "orange" },
      { name: "Riverside", id: "riverside" },
      { name: "San Bernardino", id: "san-bernardino" },
      { name: "Ventura", id: "ventura" },
      { name: "San Diego", id: "san-diego" },
      { name: "Imperial", id: "imperial" },
      { name: "Kern", id: "kern" },
      { name: "Santa Barbara", id: "santa-barbara" },
      { name: "Fresno", id: "fresno" },
    ]
  },
  {
    name: "Texas",
    code: "TX", 
    counties: [
      { name: "Harris", id: "harris" },
      { name: "Dallas", id: "dallas" },
      { name: "Tarrant", id: "tarrant" },
      { name: "Bexar", id: "bexar" },
      { name: "Travis", id: "travis" },
      { name: "Collin", id: "collin" },
      { name: "Denton", id: "denton" },
      { name: "Fort Bend", id: "fort-bend" },
      { name: "Montgomery", id: "montgomery" },
      { name: "Williamson", id: "williamson" },
    ]
  },
  {
    name: "Florida",
    code: "FL",
    counties: [
      { name: "Miami-Dade", id: "miami-dade" },
      { name: "Broward", id: "broward" },
      { name: "Palm Beach", id: "palm-beach" },
      { name: "Hillsborough", id: "hillsborough" },
      { name: "Orange", id: "orange-fl" },
      { name: "Pinellas", id: "pinellas" },
      { name: "Duval", id: "duval" },
      { name: "Lee", id: "lee" },
      { name: "Polk", id: "polk" },
      { name: "Brevard", id: "brevard" },
    ]
  },
  {
    name: "New York",
    code: "NY",
    counties: [
      { name: "New York", id: "new-york" },
      { name: "Kings", id: "kings" },
      { name: "Queens", id: "queens" },
      { name: "Suffolk", id: "suffolk" },
      { name: "Bronx", id: "bronx" },
      { name: "Nassau", id: "nassau" },
      { name: "Westchester", id: "westchester" },
      { name: "Richmond", id: "richmond" },
      { name: "Erie", id: "erie" },
      { name: "Monroe", id: "monroe" },
    ]
  },
  {
    name: "Illinois",
    code: "IL",
    counties: [
      { name: "Cook", id: "cook" },
      { name: "DuPage", id: "dupage" },
      { name: "Lake", id: "lake-il" },
      { name: "Will", id: "will" },
      { name: "Kane", id: "kane" },
      { name: "McHenry", id: "mchenry" },
      { name: "Winnebago", id: "winnebago" },
      { name: "Madison", id: "madison-il" },
      { name: "St. Clair", id: "st-clair" },
      { name: "Sangamon", id: "sangamon" },
    ]
  }
];