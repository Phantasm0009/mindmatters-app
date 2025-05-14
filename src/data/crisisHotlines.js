/**
 * Crisis hotlines data by country
 * Source: Compiled from Wikipedia and various national mental health resources
 */

const crisisHotlines = [
  {
    country: "Algeria",
    countryCode: "DZ",
    hotlines: [
      {
        name: "National Police",
        phone: "17",
        description: "National police emergency number in Algeria"
      },
      {
        name: "National Ambulance",
        phone: "43",
        description: "National ambulance emergency number in Algeria"
      },
      {
        name: "Fire Brigade",
        phone: "14",
        description: "National fire brigade number in Algeria"
      },
      {
        name: "National Gendarmerie",
        phone: "1055",
        description: "National gendarmerie number in Algeria"
      },
      {
        name: "Suicide Hotline Algeria",
        phone: "0021 3983 2000 58",
        description: "Crisis support service in Algeria"
      }
    ]
  },
  {
    country: "Argentina",
    countryCode: "AR",
    hotlines: [
      {
        name: "National Emergency Number",
        phone: "911",
        description: "National emergency number in Argentina"
      },
      {
        name: "Centro de Asistencia al Suicida",
        phone: "135",
        altPhone: "5275-1135",
        description: "Crisis support for Greater Buenos Aires and rest of the country",
        website: "https://www.asistencialsuicida.org.ar/"
      },
      {
        name: "SOS Un Amigo Anonimo",
        phone: "5263-0583",
        description: "Available Monday to Friday from 10am to 7pm and Saturdays from 10am to 4pm"
      }
    ]
  },
  {
    country: "Armenia",
    countryCode: "AM",
    hotlines: [
      {
        name: "National Emergency Number",
        phone: "112",
        altPhone: "911",
        description: "National emergency numbers in Armenia"
      },
      {
        name: "Trust Social Work and Sociological Research Centre",
        phone: "(2) 538194",
        altPhone: "(2) 538197",
        description: "Crisis support service in Armenia"
      }
    ]
  },
  {
    country: "Australia",
    countryCode: "AU",
    hotlines: [
      {
        name: "National Emergency Number",
        phone: "000",
        altPhone: "112",
        description: "National emergency numbers in Australia"
      },
      {
        name: "Lifeline",
        phone: "13 11 14",
        description: "24-hour nationwide service for crisis support, suicide prevention and mental health support",
        website: "https://www.lifeline.org.au/"
      },
      {
        name: "Kids Helpline",
        phone: "1800 55 1800",
        description: "24-hour support for Australians aged 5-25",
        website: "https://kidshelpphone.ca/"
      },
      {
        name: "Beyond Blue",
        phone: "1300 224 636",
        description: "24/7 information and support for anxiety, depression, and suicide",
        website: "https://www.beyondblue.org.au/"
      },
      {
        name: "Suicide Call Back Service",
        phone: "1300 659 467",
        description: "Professional 24/7 telephone and online counselling",
        website: "https://www.suicidecallbackservice.org.au/"
      }
    ]
  },
  {
    country: "Austria",
    countryCode: "AT",
    hotlines: [
      {
        name: "National Emergency Number",
        phone: "112",
        description: "National emergency number in Austria"
      },
      {
        name: "Telefonseelsorge",
        phone: "142",
        description: "Free of charge emotional support, operating 24 hours a day",
        website: "https://www.telefonseelsorge.at/"
      },
      {
        name: "Rat auf Draht",
        phone: "147",
        description: "Crisis support for children, juveniles and their attachment figures, 24/7",
        website: "https://www.rataufdraht.at/"
      }
    ]
  },
  {
    country: "Bangladesh",
    countryCode: "BD",
    hotlines: [
      {
        name: "National Emergency Number",
        phone: "999",
        description: "National emergency number in Bangladesh"
      },
      {
        name: "Kaan Pete Roi",
        phone: "+88 09612 119911",
        description: "Emotional support helpline for people with feelings of despair, isolation, distress or suicidal feelings",
        website: "https://shuni.org/"
      }
    ]
  },
  {
    country: "Brazil",
    countryCode: "BR",
    hotlines: [
      {
        name: "National Emergency Number",
        phone: "190",
        description: "National emergency number in Brazil"
      },
      {
        name: "National Suicide Hotline",
        phone: "188",
        description: "National suicide prevention hotline in Brazil"
      },
      {
        name: "Centro de Valorização da Vida",
        phone: "188",
        description: "Emotional and suicidal prevention support, 24/7",
        website: "https://www.cvv.org.br/"
      },
      {
        name: "TouchPeace",
        description: "Free emotional support via video call, available 24/7",
        website: "https://www.touchpeace.org/"
      }
    ]
  },
  {
    country: "Canada",
    countryCode: "CA",
    hotlines: [
      {
        name: "National Emergency Number",
        phone: "911",
        description: "National emergency number in Canada"
      },
      {
        name: "Suicide Crisis Helpline",
        phone: "988",
        description: "24/7 suicide crisis helpline in both English and French",
        website: "https://www.canada.ca/en/public-health/services/suicide-prevention/warning-signs.html"
      },
      {
        name: "Kids Help Phone",
        phone: "1-800-668-6868",
        altPhone: "Text CONNECT to 686868",
        description: "24/7 national support service for youth in English and French",
        website: "https://kidshelpphone.ca/"
      },
      {
        name: "Talk Suicide Canada",
        phone: "1-833-456-4566",
        altPhone: "Text 45645",
        description: "Nationwide suicide prevention service, 24/7",
        website: "https://talksuicide.ca/"
      },
      {
        name: "Trans Lifeline",
        phone: "1-877-330-6366",
        description: "Crisis hotline for transgender people, staffed by transgender individuals",
        website: "http://www.translifeline.org/"
      }
    ]
  },
  {
    country: "China",
    countryCode: "CN",
    hotlines: [
      {
        name: "Police Emergency",
        phone: "110",
        description: "National police emergency number in China"
      },
      {
        name: "Ambulance Emergency",
        phone: "120",
        description: "National ambulance emergency number in China"
      },
      {
        name: "Beijing Suicide Research and Prevention Center",
        phone: "800-810-1117",
        altPhone: "010-8295-1332",
        description: "24/7 suicide prevention service",
        website: "http://www.crisis.org.cn"
      },
      {
        name: "Lifeline China",
        phone: "400 821 1215",
        description: "Available 10am to 10pm every day",
        website: "https://www.lifelinechina.org/"
      }
    ]
  },
  {
    country: "France",
    countryCode: "FR",
    hotlines: [
      {
        name: "National Emergency Number",
        phone: "112",
        description: "National emergency number in France"
      },
      {
        name: "Suicide Prevention Hotline",
        phone: "3114",
        description: "National suicide prevention hotline, 24/7",
        website: "https://3114.fr/"
      },
      {
        name: "SOS Amitié",
        phone: "09 72 39 40 50",
        description: "Distress listening service on multimedia platform: phone, email, chat",
        website: "https://www.sos-amitie.com/"
      }
    ]
  },
  {
    country: "Germany",
    countryCode: "DE",
    hotlines: [
      {
        name: "National Emergency Number",
        phone: "112",
        description: "National emergency number for fire and ambulance in Germany"
      },
      {
        name: "Police Emergency",
        phone: "110",
        description: "National emergency number for police in Germany"
      },
      {
        name: "Telefonseelsorge",
        phone: "0800 111 0 111",
        altPhone: "0800 111 0 222",
        description: "24/7 telephone counseling service",
        website: "http://www.telefonseelsorge.de/"
      }
    ]
  },
  {
    country: "India",
    countryCode: "IN",
    hotlines: [
      {
        name: "National Emergency Number",
        phone: "112",
        description: "National emergency number in India"
      },
      {
        name: "Kiran Mental Health Helpline",
        phone: "1800-599-0019",
        description: "24/7 toll-free helpline for suicidal thoughts, depression and mental health issues"
      },
      {
        name: "AASRA",
        phone: "+91-22-27546669",
        description: "24/7 voluntary, professional and confidential services",
        website: "http://www.aasra.info/"
      },
      {
        name: "Vandrevala Foundation",
        phone: "+91 9999666555",
        description: "24/7 helpline for psychological counselling and crisis intervention",
        website: "http://www.vandrevalafoundation.com"
      }
    ]
  },
  {
    country: "Ireland",
    countryCode: "IE",
    hotlines: [
      {
        name: "National Emergency Number",
        phone: "112",
        altPhone: "999",
        description: "National emergency numbers in Ireland"
      },
      {
        name: "Samaritans",
        phone: "116 123",
        description: "Free emotional support to anyone in distress or at risk of suicide",
        website: "http://www.samaritans.org/"
      },
      {
        name: "Text Crisis Service",
        phone: "Text HELLO to 50808",
        description: "Free, confidential 24/7 national crisis-intervention text-message service",
        website: "https://text50808.ie/"
      }
    ]
  },
  {
    country: "Japan",
    countryCode: "JP",
    hotlines: [
      {
        name: "National Emergency Number",
        phone: "110",
        altPhone: "119",
        description: "National emergency numbers in Japan"
      },
      {
        name: "TELL Lifeline",
        phone: "03-5774-0992",
        description: "English-language counseling service",
        website: "http://telljp.com/lifeline/"
      },
      {
        name: "Federation of Inochi No Denwa",
        phone: "0120-783-556",
        description: "Japanese-language suicide prevention hotline",
        website: "https://www.inochinodenwa.org/"
      }
    ]
  },
  {
    country: "South Africa",
    countryCode: "ZA",
    hotlines: [
      {
        name: "National Emergency Number (Police)",
        phone: "10111",
        description: "National police emergency number in South Africa"
      },
      {
        name: "National Emergency Number (Ambulance)",
        phone: "10177",
        description: "National ambulance emergency number in South Africa"
      },
      {
        name: "Suicide Crisis Line",
        phone: "0800 567 567",
        altPhone: "SMS 31393",
        description: "Crisis support for suicidal individuals"
      },
      {
        name: "South African Depression and Anxiety Group",
        phone: "0800 456 789",
        altPhone: "0800 567 567",
        description: "Suicide crisis helpline, 8am-8pm daily",
        website: "https://www.sadag.org/"
      }
    ]
  },
  {
    country: "United Kingdom",
    countryCode: "GB",
    hotlines: [
      {
        name: "National Emergency Number",
        phone: "999",
        altPhone: "112",
        description: "National emergency numbers in the United Kingdom"
      },
      {
        name: "Samaritans",
        phone: "116 123",
        description: "24/7 support for anyone in distress or at risk of suicide",
        website: "http://www.samaritans.org/"
      },
      {
        name: "CALM (Campaign Against Living Miserably)",
        phone: "0800 58 58 58",
        description: "Helpline for men, open 5pm-midnight every day",
        website: "https://www.thecalmzone.net/"
      },
      {
        name: "SHOUT",
        phone: "Text SHOUT to 85258",
        description: "UK's free 24/7 text service for anyone in crisis",
        website: "https://www.giveusashout.org/"
      },
      {
        name: "PAPYRUS Prevention of Young Suicide",
        phone: "0800 068 4141",
        altPhone: "Text 07860039967",
        description: "Support for young people struggling with suicidal thoughts",
        website: "https://www.papyrus-uk.org/"
      }
    ]
  },
  {
    country: "United States",
    countryCode: "US",
    hotlines: [
      {
        name: "National Emergency Number",
        phone: "911",
        description: "National emergency number in the United States"
      },
      {
        name: "988 Suicide & Crisis Lifeline",
        phone: "988",
        altPhone: "1-800-273-8255",
        description: "24/7 free support for people in suicidal crisis or emotional distress",
        website: "https://988lifeline.org/"
      },
      {
        name: "Crisis Text Line",
        phone: "Text HOME to 741741",
        description: "24/7 crisis-intervention text-message service",
        website: "https://www.crisistextline.org/"
      },
      {
        name: "Veterans Crisis Line",
        phone: "988, then Press 1",
        altPhone: "1-800-273-8255, Press 1",
        description: "Crisis support for military veterans and their families",
        website: "https://www.veteranscrisisline.net/"
      },
      {
        name: "The Trevor Project",
        phone: "1-866-488-7386",
        altPhone: "Text START to 678-678",
        description: "Crisis support for LGBTQ+ youth",
        website: "http://www.thetrevorproject.org/"
      },
      {
        name: "Trans Lifeline",
        phone: "1-877-565-8860",
        description: "Crisis hotline for transgender people, staffed by transgender individuals",
        website: "https://www.translifeline.org/"
      }
    ]
  },
  {
    country: "International",
    countryCode: "INTL",
    hotlines: [
      {
        name: "International Association for Suicide Prevention",
        description: "Find crisis centers around the world",
        website: "https://www.iasp.info/resources/Crisis_Centres/"
      },
      {
        name: "Befrienders Worldwide",
        description: "Global network of helplines providing emotional support",
        website: "https://www.befrienders.org/"
      }
    ]
  }
];

export default crisisHotlines;

/**
 * Find hotlines for a specific country code
 * @param {string} countryCode - Two-letter country code
 * @returns {Object|null} Country hotlines or null if not found
 */
export const getHotlinesForCountry = (countryCode) => {
  if (!countryCode) return null;
  
  // Normalize country code to uppercase
  const normalizedCode = countryCode.toUpperCase();
  
  // Find matching country
  const country = crisisHotlines.find(c => c.countryCode === normalizedCode);
  
  // Return country data or international as fallback
  return country || crisisHotlines.find(c => c.countryCode === "INTL");
};

/**
 * Get all available countries with hotlines
 * @returns {Array} List of countries with their codes
 */
export const getAvailableCountries = () => {
  return crisisHotlines.map(country => ({
    name: country.country,
    code: country.countryCode
  }));
};