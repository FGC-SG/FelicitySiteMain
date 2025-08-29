// GICS (Global Industry Classification Standard) data structure
// Generated from GICS Mappings - March 2023 Update
// This file contains all 163 sub-industries across 11 sectors

export interface GICSSubIndustry {
  value: string;
  label: string;
}

export interface GICSIndustry {
  label: string;
  subIndustries: GICSSubIndustry[];
}

export interface GICSIndustryGroup {
  label: string;
  industries: { [key: string]: GICSIndustry };
}

export interface GICSSector {
  label: string;
  industryGroups: { [key: string]: GICSIndustryGroup };
}

export interface GICSData {
  [key: string]: GICSSector;
}

export const gicsData: GICSData = {
  "10": {
    "label": "Energy",
    "industryGroups": {
      "1010": {
        "label": "Energy",
        "industries": {
          "101010": {
            "label": "Energy Equipment & Services",
            "subIndustries": [
              {
                "value": "10101010",
                "label": "Oil & Gas Drilling"
              },
              {
                "value": "10101020",
                "label": "Oil & Gas Equipment & Services"
              }
            ]
          },
          "101020": {
            "label": "Oil, Gas & Consumable Fuels",
            "subIndustries": [
              {
                "value": "10102010",
                "label": "Integrated Oil & Gas"
              },
              {
                "value": "10102020",
                "label": "Oil & Gas Exploration & Production"
              },
              {
                "value": "10102030",
                "label": "Oil & Gas Refining & Marketing"
              },
              {
                "value": "10102040",
                "label": "Oil & Gas Storage & Transportation"
              },
              {
                "value": "10102050",
                "label": "Coal & Consumable Fuels"
              }
            ]
          }
        }
      }
    }
  },
  "15": {
    "label": "Materials",
    "industryGroups": {
      "1510": {
        "label": "Materials",
        "industries": {
          "151010": {
            "label": "Chemicals",
            "subIndustries": [
              {
                "value": "15101010",
                "label": "Commodity Chemicals"
              },
              {
                "value": "15101020",
                "label": "Diversified Chemicals"
              },
              {
                "value": "15101030",
                "label": "Fertilizers & Agricultural Chemicals"
              },
              {
                "value": "15101040",
                "label": "Industrial Gases"
              },
              {
                "value": "15101050",
                "label": "Specialty Chemicals"
              }
            ]
          },
          "151020": {
            "label": "Construction Materials",
            "subIndustries": [
              {
                "value": "15102010",
                "label": "Construction Materials"
              }
            ]
          },
          "151030": {
            "label": "Containers & Packaging",
            "subIndustries": [
              {
                "value": "15103010",
                "label": "Metal, Glass & Plastic Containers"
              },
              {
                "value": "15103020",
                "label": "Paper & Plastic Packaging Products & Materials"
              }
            ]
          },
          "151040": {
            "label": "Metals & Mining",
            "subIndustries": [
              {
                "value": "15104010",
                "label": "Aluminum"
              },
              {
                "value": "15104020",
                "label": "Diversified Metals & Mining"
              },
              {
                "value": "15104025",
                "label": "Copper"
              },
              {
                "value": "15104030",
                "label": "Gold"
              },
              {
                "value": "15104040",
                "label": "Precious Metals & Minerals"
              },
              {
                "value": "15104045",
                "label": "Silver"
              },
              {
                "value": "15104050",
                "label": "Steel"
              }
            ]
          },
          "151050": {
            "label": "Paper & Forest Products",
            "subIndustries": [
              {
                "value": "15105010",
                "label": "Forest Products"
              },
              {
                "value": "15105020",
                "label": "Paper Products"
              }
            ]
          }
        }
      }
    }
  },
  "20": {
    "label": "Industrials",
    "industryGroups": {
      "2010": {
        "label": "Capital Goods",
        "industries": {
          "201010": {
            "label": "Aerospace & Defense",
            "subIndustries": [
              {
                "value": "20101010",
                "label": "Aerospace & Defense"
              }
            ]
          },
          "201020": {
            "label": "Building Products",
            "subIndustries": [
              {
                "value": "20102010",
                "label": "Building Products"
              }
            ]
          },
          "201030": {
            "label": "Construction & Engineering",
            "subIndustries": [
              {
                "value": "20103010",
                "label": "Construction & Engineering"
              }
            ]
          },
          "201040": {
            "label": "Electrical Equipment",
            "subIndustries": [
              {
                "value": "20104010",
                "label": "Electrical Components & Equipment"
              },
              {
                "value": "20104020",
                "label": "Heavy Electrical Equipment"
              }
            ]
          },
          "201050": {
            "label": "Industrial Conglomerates",
            "subIndustries": [
              {
                "value": "20105010",
                "label": "Industrial Conglomerates"
              }
            ]
          },
          "201060": {
            "label": "Machinery",
            "subIndustries": [
              {
                "value": "20106010",
                "label": "Construction Machinery & Heavy Transportation Equipment"
              },
              {
                "value": "20106015",
                "label": "Agricultural & Farm Machinery"
              },
              {
                "value": "20106020",
                "label": "Industrial Machinery & Supplies & Components"
              }
            ]
          },
          "201070": {
            "label": "Trading Companies & Distributors",
            "subIndustries": [
              {
                "value": "20107010",
                "label": "Trading Companies & Distributors"
              }
            ]
          }
        }
      },
      "2020": {
        "label": "Commercial  & Professional Services",
        "industries": {
          "202010": {
            "label": "Commercial Services & Supplies",
            "subIndustries": [
              {
                "value": "20201010",
                "label": "Commercial Printing"
              },
              {
                "value": "20201050",
                "label": "Environmental & Facilities Services"
              },
              {
                "value": "20201060",
                "label": "Office Services & Supplies"
              },
              {
                "value": "20201070",
                "label": "Diversified Support Services"
              },
              {
                "value": "20201080",
                "label": "Security & Alarm Services"
              }
            ]
          },
          "202020": {
            "label": "Professional Services",
            "subIndustries": [
              {
                "value": "20202010",
                "label": "Human Resource & Employment Services"
              },
              {
                "value": "20202020",
                "label": "Research & Consulting Services"
              },
              {
                "value": "20202030",
                "label": "Data Processing & Outsourced Services"
              }
            ]
          }
        }
      },
      "2030": {
        "label": "Transportation",
        "industries": {
          "203010": {
            "label": "Air Freight & Logistics",
            "subIndustries": [
              {
                "value": "20301010",
                "label": "Air Freight & Logistics"
              }
            ]
          },
          "203020": {
            "label": "Passenger Airlines",
            "subIndustries": [
              {
                "value": "20302010",
                "label": "Passenger Airlines"
              }
            ]
          },
          "203030": {
            "label": "Marine Transportation",
            "subIndustries": [
              {
                "value": "20303010",
                "label": "Marine Transportation"
              }
            ]
          },
          "203040": {
            "label": "Ground Transportation",
            "subIndustries": [
              {
                "value": "20304010",
                "label": "Rail Transportation"
              },
              {
                "value": "20304030",
                "label": "Cargo Ground Transportation"
              },
              {
                "value": "20304040",
                "label": "Passenger Ground Transportation"
              }
            ]
          },
          "203050": {
            "label": "Transportation Infrastructure",
            "subIndustries": [
              {
                "value": "20305010",
                "label": "Airport Services"
              },
              {
                "value": "20305020",
                "label": "Highways & Railtracks"
              },
              {
                "value": "20305030",
                "label": "Marine Ports & Services"
              }
            ]
          }
        }
      }
    }
  },
  "25": {
    "label": "Consumer Discretionary",
    "industryGroups": {
      "2510": {
        "label": "Automobiles & Components",
        "industries": {
          "251010": {
            "label": "Automobile Components",
            "subIndustries": [
              {
                "value": "25101010",
                "label": "Automotive Parts & Equipment"
              },
              {
                "value": "25101020",
                "label": "Tires & Rubber"
              }
            ]
          },
          "251020": {
            "label": "Automobiles",
            "subIndustries": [
              {
                "value": "25102010",
                "label": "Automobile Manufacturers"
              },
              {
                "value": "25102020",
                "label": "Motorcycle Manufacturers"
              }
            ]
          }
        }
      },
      "2520": {
        "label": "Consumer Durables & Apparel",
        "industries": {
          "252010": {
            "label": "Household Durables",
            "subIndustries": [
              {
                "value": "25201010",
                "label": "Consumer Electronics"
              },
              {
                "value": "25201020",
                "label": "Home Furnishings"
              },
              {
                "value": "25201030",
                "label": "Homebuilding"
              },
              {
                "value": "25201040",
                "label": "Household Appliances"
              },
              {
                "value": "25201050",
                "label": "Housewares & Specialties"
              }
            ]
          },
          "252020": {
            "label": "Leisure Products",
            "subIndustries": [
              {
                "value": "25202010",
                "label": "Leisure Products"
              }
            ]
          },
          "252030": {
            "label": "Textiles, Apparel & Luxury Goods",
            "subIndustries": [
              {
                "value": "25203010",
                "label": "Apparel, Accessories & Luxury Goods"
              },
              {
                "value": "25203020",
                "label": "Footwear"
              },
              {
                "value": "25203030",
                "label": "Textiles"
              }
            ]
          }
        }
      },
      "2530": {
        "label": "Consumer Services",
        "industries": {
          "253010": {
            "label": "Hotels, Restaurants & Leisure",
            "subIndustries": [
              {
                "value": "25301010",
                "label": "Casinos & Gaming"
              },
              {
                "value": "25301020",
                "label": "Hotels, Resorts & Cruise Lines"
              },
              {
                "value": "25301030",
                "label": "Leisure Facilities"
              },
              {
                "value": "25301040",
                "label": "Restaurants"
              }
            ]
          },
          "253020": {
            "label": "Diversified Consumer Services",
            "subIndustries": [
              {
                "value": "25302010",
                "label": "Education Services"
              },
              {
                "value": "25302020",
                "label": "Specialized Consumer Services"
              }
            ]
          }
        }
      },
      "2550": {
        "label": "Consumer Discretionary Distribution & Retail",
        "industries": {
          "255010": {
            "label": "Distributors",
            "subIndustries": [
              {
                "value": "25501010",
                "label": "Distributors"
              }
            ]
          },
          "255030": {
            "label": "Broadline Retail",
            "subIndustries": [
              {
                "value": "25503030",
                "label": "Broadline Retail"
              }
            ]
          },
          "255040": {
            "label": "Specialty Retail",
            "subIndustries": [
              {
                "value": "25504010",
                "label": "Apparel Retail"
              },
              {
                "value": "25504020",
                "label": "Computer & Electronics Retail"
              },
              {
                "value": "25504030",
                "label": "Home Improvement Retail"
              },
              {
                "value": "25504040",
                "label": "Other Specialty Retail"
              },
              {
                "value": "25504050",
                "label": "Automotive Retail"
              },
              {
                "value": "25504060",
                "label": "Homefurnishing Retail"
              }
            ]
          }
        }
      }
    }
  },
  "30": {
    "label": "Consumer Staples",
    "industryGroups": {
      "3010": {
        "label": "Consumer Staples Distribution & Retail",
        "industries": {
          "301010": {
            "label": "Consumer Staples Distribution & Retail",
            "subIndustries": [
              {
                "value": "30101010",
                "label": "Drug Retail"
              },
              {
                "value": "30101020",
                "label": "Food Distributors"
              },
              {
                "value": "30101030",
                "label": "Food Retail"
              },
              {
                "value": "30101040",
                "label": "Consumer Staples Merchandise Retail"
              }
            ]
          }
        }
      },
      "3020": {
        "label": "Food, Beverage & Tobacco",
        "industries": {
          "302010": {
            "label": "Beverages",
            "subIndustries": [
              {
                "value": "30201010",
                "label": "Brewers"
              },
              {
                "value": "30201020",
                "label": "Distillers & Vintners"
              },
              {
                "value": "30201030",
                "label": "Soft Drinks & Non-alcoholic Beverages"
              }
            ]
          },
          "302020": {
            "label": "Food Products",
            "subIndustries": [
              {
                "value": "30202010",
                "label": "Agricultural Products & Services"
              },
              {
                "value": "30202030",
                "label": "Packaged Foods & Meats"
              }
            ]
          },
          "302030": {
            "label": "Tobacco",
            "subIndustries": [
              {
                "value": "30203010",
                "label": "Tobacco"
              }
            ]
          }
        }
      },
      "3030": {
        "label": "Household & Personal Products",
        "industries": {
          "303010": {
            "label": "Household Products",
            "subIndustries": [
              {
                "value": "30301010",
                "label": "Household Products"
              }
            ]
          },
          "303020": {
            "label": "Personal Care Products",
            "subIndustries": [
              {
                "value": "30302010",
                "label": "Personal Care Products"
              }
            ]
          }
        }
      }
    }
  },
  "35": {
    "label": "Health Care",
    "industryGroups": {
      "3510": {
        "label": "Health Care Equipment & Services",
        "industries": {
          "351010": {
            "label": "Health Care Equipment & Supplies",
            "subIndustries": [
              {
                "value": "35101010",
                "label": "Health Care Equipment"
              },
              {
                "value": "35101020",
                "label": "Health Care Supplies"
              }
            ]
          },
          "351020": {
            "label": "Health Care Providers & Services",
            "subIndustries": [
              {
                "value": "35102010",
                "label": "Health Care Distributors"
              },
              {
                "value": "35102015",
                "label": "Health Care Services"
              },
              {
                "value": "35102020",
                "label": "Health Care Facilities"
              },
              {
                "value": "35102030",
                "label": "Managed Health Care"
              }
            ]
          },
          "351030": {
            "label": "Health Care Technology",
            "subIndustries": [
              {
                "value": "35103010",
                "label": "Health Care Technology"
              }
            ]
          }
        }
      },
      "3520": {
        "label": "Pharmaceuticals, Biotechnology & Life Sciences",
        "industries": {
          "352010": {
            "label": "Biotechnology",
            "subIndustries": [
              {
                "value": "35201010",
                "label": "Biotechnology"
              }
            ]
          },
          "352020": {
            "label": "Pharmaceuticals",
            "subIndustries": [
              {
                "value": "35202010",
                "label": "Pharmaceuticals"
              }
            ]
          },
          "352030": {
            "label": "Life Sciences Tools & Services",
            "subIndustries": [
              {
                "value": "35203010",
                "label": "Life Sciences Tools & Services"
              }
            ]
          }
        }
      }
    }
  },
  "40": {
    "label": "Financials",
    "industryGroups": {
      "4010": {
        "label": "Banks",
        "industries": {
          "401010": {
            "label": "Banks",
            "subIndustries": [
              {
                "value": "40101010",
                "label": "Diversified Banks"
              },
              {
                "value": "40101015",
                "label": "Regional Banks"
              }
            ]
          }
        }
      },
      "4020": {
        "label": "Financial Services",
        "industries": {
          "402010": {
            "label": "Financial Services",
            "subIndustries": [
              {
                "value": "40201020",
                "label": "Diversified Financial Services"
              },
              {
                "value": "40201030",
                "label": "Multi-Sector Holdings"
              },
              {
                "value": "40201040",
                "label": "Specialized Finance"
              },
              {
                "value": "40201050",
                "label": "Commercial & Residential Mortgage Finance"
              },
              {
                "value": "40201060",
                "label": "Transaction & Payment Processing Services"
              }
            ]
          },
          "402020": {
            "label": "Consumer Finance",
            "subIndustries": [
              {
                "value": "40202010",
                "label": "Consumer Finance"
              }
            ]
          },
          "402030": {
            "label": "Capital Markets",
            "subIndustries": [
              {
                "value": "40203010",
                "label": "Asset Management & Custody Banks"
              },
              {
                "value": "40203020",
                "label": "Investment Banking & Brokerage"
              },
              {
                "value": "40203030",
                "label": "Diversified Capital Markets"
              },
              {
                "value": "40203040",
                "label": "Financial Exchanges & Data"
              }
            ]
          },
          "402040": {
            "label": "Mortgage Real Estate Investment\nTrusts (REITs)",
            "subIndustries": [
              {
                "value": "40204010",
                "label": "Mortgage REITs*"
              }
            ]
          }
        }
      },
      "4030": {
        "label": "Insurance",
        "industries": {
          "403010": {
            "label": "Insurance",
            "subIndustries": [
              {
                "value": "40301010",
                "label": "Insurance Brokers"
              },
              {
                "value": "40301020",
                "label": "Life & Health Insurance"
              },
              {
                "value": "40301030",
                "label": "Multi-line Insurance"
              },
              {
                "value": "40301040",
                "label": "Property & Casualty Insurance"
              },
              {
                "value": "40301050",
                "label": "Reinsurance"
              }
            ]
          }
        }
      }
    }
  },
  "45": {
    "label": "Information Technology",
    "industryGroups": {
      "4510": {
        "label": "Software & Services",
        "industries": {
          "451020": {
            "label": "IT Services",
            "subIndustries": [
              {
                "value": "45102010",
                "label": "IT Consulting & Other Services"
              },
              {
                "value": "45102030",
                "label": "Internet Services & Infrastructure"
              }
            ]
          },
          "451030": {
            "label": "Software",
            "subIndustries": [
              {
                "value": "45103010",
                "label": "Application Software"
              },
              {
                "value": "45103020",
                "label": "Systems Software"
              }
            ]
          }
        }
      },
      "4520": {
        "label": "Technology Hardware & Equipment",
        "industries": {
          "452010": {
            "label": "Communications Equipment",
            "subIndustries": [
              {
                "value": "45201020",
                "label": "Communications Equipment"
              }
            ]
          },
          "452020": {
            "label": "Technology Hardware, Storage & Peripherals",
            "subIndustries": [
              {
                "value": "45202030",
                "label": "Technology Hardware, Storage & Peripherals"
              }
            ]
          },
          "452030": {
            "label": "Electronic Equipment, Instruments & Components",
            "subIndustries": [
              {
                "value": "45203010",
                "label": "Electronic Equipment & Instruments"
              },
              {
                "value": "45203015",
                "label": "Electronic Components"
              },
              {
                "value": "45203020",
                "label": "Electronic Manufacturing Services"
              },
              {
                "value": "45203030",
                "label": "Technology Distributors"
              }
            ]
          }
        }
      },
      "4530": {
        "label": "Semiconductors & Semiconductor Equipment",
        "industries": {
          "453010": {
            "label": "Semiconductors & Semiconductor Equipment",
            "subIndustries": [
              {
                "value": "45301010",
                "label": "Semiconductor Materials & Equipment"
              },
              {
                "value": "45301020",
                "label": "Semiconductors"
              }
            ]
          }
        }
      }
    }
  },
  "50": {
    "label": "Communication Services",
    "industryGroups": {
      "5010": {
        "label": "Telecommunication Services",
        "industries": {
          "501010": {
            "label": "Diversified Telecommunication Services",
            "subIndustries": [
              {
                "value": "50101010",
                "label": "Alternative Carriers"
              },
              {
                "value": "50101020",
                "label": "Integrated Telecommunication Services"
              }
            ]
          },
          "501020": {
            "label": "Wireless Telecommunication Services",
            "subIndustries": [
              {
                "value": "50102010",
                "label": "Wireless Telecommunication Services"
              }
            ]
          }
        }
      },
      "5020": {
        "label": "Media & Entertainment",
        "industries": {
          "502010": {
            "label": "Media",
            "subIndustries": [
              {
                "value": "50201010",
                "label": "Advertising"
              },
              {
                "value": "50201020",
                "label": "Broadcasting"
              },
              {
                "value": "50201030",
                "label": "Cable & Satellite"
              },
              {
                "value": "50201040",
                "label": "Publishing"
              }
            ]
          },
          "502020": {
            "label": "Entertainment",
            "subIndustries": [
              {
                "value": "50202010",
                "label": "Movies & Entertainment"
              },
              {
                "value": "50202020",
                "label": "Interactive Home Entertainment"
              }
            ]
          },
          "502030": {
            "label": "Interactive Media & Services",
            "subIndustries": [
              {
                "value": "50203010",
                "label": "Interactive Media & Services"
              }
            ]
          }
        }
      }
    }
  },
  "55": {
    "label": "Utilities",
    "industryGroups": {
      "5510": {
        "label": "Utilities",
        "industries": {
          "551010": {
            "label": "Electric Utilities",
            "subIndustries": [
              {
                "value": "55101010",
                "label": "Electric Utilities"
              }
            ]
          },
          "551020": {
            "label": "Gas Utilities",
            "subIndustries": [
              {
                "value": "55102010",
                "label": "Gas Utilities"
              }
            ]
          },
          "551030": {
            "label": "Multi-Utilities",
            "subIndustries": [
              {
                "value": "55103010",
                "label": "Multi-Utilities"
              }
            ]
          },
          "551040": {
            "label": "Water Utilities",
            "subIndustries": [
              {
                "value": "55104010",
                "label": "Water Utilities"
              }
            ]
          },
          "551050": {
            "label": "Independent Power and Renewable Electricity Producers",
            "subIndustries": [
              {
                "value": "55105010",
                "label": "Independent Power Producers & Energy Traders"
              },
              {
                "value": "55105020",
                "label": "Renewable Electricity"
              }
            ]
          }
        }
      }
    }
  },
  "60": {
    "label": "Real Estate",
    "industryGroups": {
      "6010": {
        "label": "Equity Real Estate Investment Trusts (REITs)",
        "industries": {
          "601010": {
            "label": "Diversified REITs",
            "subIndustries": [
              {
                "value": "60101010",
                "label": "Diversified REITs*"
              }
            ]
          },
          "601025": {
            "label": "Industrial REITs",
            "subIndustries": [
              {
                "value": "60102510",
                "label": "Industrial REITs*"
              }
            ]
          },
          "601030": {
            "label": "Hotel & Resort REITs",
            "subIndustries": [
              {
                "value": "60103010",
                "label": "Hotel & Resort REITs*"
              }
            ]
          },
          "601040": {
            "label": "Office REITs",
            "subIndustries": [
              {
                "value": "60104010",
                "label": "Office REITs*"
              }
            ]
          },
          "601050": {
            "label": "Health Care REITs",
            "subIndustries": [
              {
                "value": "60105010",
                "label": "Health Care REITs*"
              }
            ]
          },
          "601060": {
            "label": "Residential REITs",
            "subIndustries": [
              {
                "value": "60106010",
                "label": "Multi-Family Residential REITs*"
              },
              {
                "value": "60106020",
                "label": "Single-Family Residential REITs*"
              }
            ]
          },
          "601070": {
            "label": "Retail REITs",
            "subIndustries": [
              {
                "value": "60107010",
                "label": "Retail REITs*"
              }
            ]
          },
          "601080": {
            "label": "Specialized REITs",
            "subIndustries": [
              {
                "value": "60108010",
                "label": "Other Specialized REITs*"
              },
              {
                "value": "60108020",
                "label": "Self-Storage REITs*"
              },
              {
                "value": "60108030",
                "label": "Telecom Tower REITs*"
              },
              {
                "value": "60108040",
                "label": "Timber REITs*"
              },
              {
                "value": "60108050",
                "label": "Data Center REITs*"
              }
            ]
          }
        }
      },
      "6020": {
        "label": "Real Estate Management & Development",
        "industries": {
          "602010": {
            "label": "Real Estate Management & Development",
            "subIndustries": [
              {
                "value": "60201010",
                "label": "Diversified Real Estate Activities"
              },
              {
                "value": "60201020",
                "label": "Real Estate Operating Companies"
              },
              {
                "value": "60201030",
                "label": "Real Estate Development"
              },
              {
                "value": "60201040",
                "label": "Real Estate Services"
              }
            ]
          }
        }
      }
    }
  }
};
