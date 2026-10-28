import { useState, useEffect, useMemo, Fragment } from "react";
import PageMeta from "../../components/common/PageMeta";
import { AdminPageContainer } from "../../components/common/AdminPageContainer";
import { getDelegates, BASE_URL } from "../../api/ApiPath";

export interface Delegate {
  id: number;
  registration_id: string;
  salutation?: string | null;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  city: string;
  state?: string | null;
  country: string;
  reg_category?: string | null;
  total_amount?: number | null;
  transaction_id?: string | null;
  mci_no?: string | null;
  registration_date?: string | null;
  payment_date?: string | null;
  payment_mode?: string | null;
  remarks?: string | null;
  from_link?: string | null;
  qr_code_url?: string | null;

  // Compatibility / legacy fields
  institution?: string;
  designation?: string;
  speciality?: string;
  registration_status?: string;
  consent_given?: boolean;
  is_deleted?: boolean;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

// Fallback seed data matching the real API response
const fallbackDelegates: Delegate[] = [
  {
    id: 85,
    registration_id: "OKAI0178",
    salutation: "Dr.",
    first_name: "Harsh",
    last_name: "Shah",
    email: "harshshah1@gmail.com",
    phone: "9811030790",
    city: "Ahmedabad",
    state: "Gujarat",
    country: "India",
    reg_category: "Organizing Committee",
    total_amount: 0,
    transaction_id: null,
    mci_no: null,
    registration_date: "2026-10-24T18:13:13",
    payment_date: null,
    payment_mode: null,
    remarks: "as per sanjiv sir",
    from_link: null,
    qr_code_url: "/api/delegates/OKAI0178/qr",
  },
  {
    id: 84,
    registration_id: "OKAI0177",
    salutation: "Dr.",
    first_name: "Zaheer",
    last_name: "Nabi",
    email: "846@kaizen.com",
    phone: "846",
    city: "Hyderabad",
    state: "",
    country: "India",
    reg_category: "FACULTY",
    total_amount: 0,
    transaction_id: null,
    mci_no: null,
    registration_date: "2026-10-24T17:57:19",
    payment_date: null,
    payment_mode: null,
    remarks: "as per sanjiv sir",
    from_link: null,
    qr_code_url: "/api/delegates/OKAI0177/qr",
  },
  {
    id: 83,
    registration_id: "OKAI0176",
    salutation: "Dr.",
    first_name: "Vivek",
    last_name: "Bindal",
    email: "845@kaizen.com",
    phone: "845",
    city: "New Delhi",
    state: "",
    country: "India",
    reg_category: "FACULTY",
    total_amount: 0,
    transaction_id: null,
    mci_no: null,
    registration_date: "2026-10-24T17:57:19",
    payment_date: null,
    payment_mode: null,
    remarks: "as per sanjiv sir",
    from_link: null,
    qr_code_url: "/api/delegates/OKAI0176/qr",
  },
  {
    id: 82,
    registration_id: "OKAI0175",
    salutation: "Dr.",
    first_name: "Vinayak S.",
    last_name: "Rengan",
    email: "844@kaizen.com",
    phone: "844",
    city: "Chennai",
    state: "",
    country: "India",
    reg_category: "FACULTY",
    total_amount: 0,
    transaction_id: null,
    mci_no: null,
    registration_date: "2026-10-24T17:57:19",
    payment_date: null,
    payment_mode: null,
    remarks: "as per sanjiv sir",
    from_link: null,
    qr_code_url: "/api/delegates/OKAI0175/qr",
  },
  {
    id: 81,
    registration_id: "OKAI0174",
    salutation: "Dr.",
    first_name: "Vikram",
    last_name: "Lotwala",
    email: "843@kaizen.com",
    phone: "843",
    city: "Surat",
    state: "",
    country: "India",
    reg_category: "FACULTY",
    total_amount: 0,
    transaction_id: null,
    mci_no: null,
    registration_date: "2026-10-24T17:57:19",
    payment_date: null,
    payment_mode: null,
    remarks: "as per sanjiv sir",
    from_link: null,
    qr_code_url: "/api/delegates/OKAI0174/qr",
  },
  {
    id: 80,
    registration_id: "OKAI0173",
    salutation: "Dr.",
    first_name: "Vikram",
    last_name: "Chaudhary",
    email: "842@kaizen.com",
    phone: "842",
    city: "Mumbai",
    state: "",
    country: "India",
    reg_category: "FACULTY",
    total_amount: 0,
    transaction_id: null,
    mci_no: null,
    registration_date: "2026-10-24T17:57:19",
    payment_date: null,
    payment_mode: null,
    remarks: "as per sanjiv sir",
    from_link: null,
    qr_code_url: "/api/delegates/OKAI0173/qr",
  },
  {
    id: 79,
    registration_id: "OKAI0172",
    salutation: "Dr.",
    first_name: "Vedant",
    last_name: "Wankhede",
    email: "841@kaizen.com",
    phone: "841",
    city: "Surat",
    state: "",
    country: "India",
    reg_category: "FACULTY",
    total_amount: 0,
    transaction_id: null,
    mci_no: null,
    registration_date: "2026-10-24T17:57:19",
    payment_date: null,
    payment_mode: null,
    remarks: "as per sanjiv sir",
    from_link: null,
    qr_code_url: "/api/delegates/OKAI0172/qr",
  },
  {
    id: 78,
    registration_id: "OKAI0171",
    salutation: "Dr.",
    first_name: "Subhash",
    last_name: "Khanna",
    email: "840@kaizen.com",
    phone: "840",
    city: "Guwahati",
    state: "",
    country: "India",
    reg_category: "FACULTY",
    total_amount: 0,
    transaction_id: null,
    mci_no: null,
    registration_date: "2026-10-24T17:57:19",
    payment_date: null,
    payment_mode: null,
    remarks: "as per sanjiv sir",
    from_link: null,
    qr_code_url: "/api/delegates/OKAI0171/qr",
  },
  {
    id: 77,
    registration_id: "OKAI0170",
    salutation: "Dr.",
    first_name: "Sharad",
    last_name: "Desai",
    email: "839@kaizen.com",
    phone: "839",
    city: "Miraj",
    state: "",
    country: "India",
    reg_category: "FACULTY",
    total_amount: 0,
    transaction_id: null,
    mci_no: null,
    registration_date: "2026-10-24T17:57:19",
    payment_date: null,
    payment_mode: null,
    remarks: "as per sanjiv sir",
    from_link: null,
    qr_code_url: "/api/delegates/OKAI0170/qr",
  },
  {
    id: 76,
    registration_id: "OKAI0169",
    salutation: "Dr.",
    first_name: "Saumitra",
    last_name: "Rawat",
    email: "838@kaizen.com",
    phone: "838",
    city: "New Delhi",
    state: "",
    country: "India",
    reg_category: "FACULTY",
    total_amount: 0,
    transaction_id: null,
    mci_no: null,
    registration_date: "2026-10-24T17:57:19",
    payment_date: null,
    payment_mode: null,
    remarks: "as per sanjiv sir",
    from_link: null,
    qr_code_url: "/api/delegates/OKAI0169/qr",
  },
  {
    id: 75,
    registration_id: "OKAI0168",
    salutation: "Dr.",
    first_name: "Sadiq S.",
    last_name: "Sikora",
    email: "837@kaizen.com",
    phone: "837",
    city: "Bengaluru",
    state: "",
    country: "India",
    reg_category: "FACULTY",
    total_amount: 0,
    transaction_id: null,
    mci_no: null,
    registration_date: "2026-10-24T17:57:19",
    payment_date: null,
    payment_mode: null,
    remarks: "as per sanjiv sir",
    from_link: null,
    qr_code_url: "/api/delegates/OKAI0168/qr",
  },
  {
    id: 74,
    registration_id: "OKAI0167",
    salutation: "Dr.",
    first_name: "S. P.",
    last_name: "Somashekhar",
    email: "836@kaizen.com",
    phone: "836",
    city: "Bengaluru",
    state: "",
    country: "India",
    reg_category: "FACULTY",
    total_amount: 0,
    transaction_id: null,
    mci_no: null,
    registration_date: "2026-10-24T17:57:19",
    payment_date: null,
    payment_mode: null,
    remarks: "as per sanjiv sir",
    from_link: null,
    qr_code_url: "/api/delegates/OKAI0167/qr",
  },
  {
    id: 73,
    registration_id: "OKAI0166",
    salutation: "Dr.",
    first_name: "Rajiv",
    last_name: "Mehta",
    email: "835@kaizen.com",
    phone: "835",
    city: "Surat",
    state: "",
    country: "India",
    reg_category: "FACULTY",
    total_amount: 0,
    transaction_id: null,
    mci_no: null,
    registration_date: "2026-10-24T17:57:19",
    payment_date: null,
    payment_mode: null,
    remarks: "as per sanjiv sir",
    from_link: null,
    qr_code_url: "/api/delegates/OKAI0166/qr",
  },
  {
    id: 72,
    registration_id: "OKAI0165",
    salutation: "Dr.",
    first_name: "Rajesh",
    last_name: "Shrivastava",
    email: "834@kaizen.com",
    phone: "834",
    city: "Vapi",
    state: "",
    country: "India",
    reg_category: "FACULTY",
    total_amount: 0,
    transaction_id: null,
    mci_no: null,
    registration_date: "2026-10-24T17:57:19",
    payment_date: null,
    payment_mode: null,
    remarks: "as per sanjiv sir",
    from_link: null,
    qr_code_url: "/api/delegates/OKAI0165/qr",
  },
  {
    id: 71,
    registration_id: "OKAI0164",
    salutation: "Dr.",
    first_name: "Rajesh",
    last_name: "Bhojwani",
    email: "833@kaizen.com",
    phone: "833",
    city: "Jaipur",
    state: "",
    country: "India",
    reg_category: "FACULTY",
    total_amount: 0,
    transaction_id: null,
    mci_no: null,
    registration_date: "2026-10-24T17:57:19",
    payment_date: null,
    payment_mode: null,
    remarks: "as per sanjiv sir",
    from_link: null,
    qr_code_url: "/api/delegates/OKAI0164/qr",
  },
  {
    id: 70,
    registration_id: "OKAI0163",
    salutation: "Dr.",
    first_name: "Pramod",
    last_name: "Shinde",
    email: "832@kaizen.com",
    phone: "832",
    city: "Nashik",
    state: "",
    country: "India",
    reg_category: "FACULTY",
    total_amount: 0,
    transaction_id: null,
    mci_no: null,
    registration_date: "2026-10-24T17:57:19",
    payment_date: null,
    payment_mode: null,
    remarks: "as per sanjiv sir",
    from_link: null,
    qr_code_url: "/api/delegates/OKAI0163/qr",
  },
  {
    id: 69,
    registration_id: "OKAI0162",
    salutation: "Dr.",
    first_name: "Pawanindra",
    last_name: "Lal",
    email: "831@kaizen.com",
    phone: "831",
    city: "New Delhi",
    state: "",
    country: "India",
    reg_category: "FACULTY",
    total_amount: 0,
    transaction_id: null,
    mci_no: null,
    registration_date: "2026-10-24T17:57:19",
    payment_date: null,
    payment_mode: null,
    remarks: "as per sanjiv sir",
    from_link: null,
    qr_code_url: "/api/delegates/OKAI0162/qr",
  },
  {
    id: 68,
    registration_id: "OKAI0161",
    salutation: "Dr.",
    first_name: "Parveen",
    last_name: "Bhatia",
    email: "830@kaizen.com",
    phone: "830",
    city: "New Delhi",
    state: "",
    country: "India",
    reg_category: "FACULTY",
    total_amount: 0,
    transaction_id: null,
    mci_no: null,
    registration_date: "2026-10-24T17:57:19",
    payment_date: null,
    payment_mode: null,
    remarks: "as per sanjiv sir",
    from_link: null,
    qr_code_url: "/api/delegates/OKAI0161/qr",
  },
  {
    id: 67,
    registration_id: "OKAI0160",
    salutation: "Dr.",
    first_name: "Radhakrishna",
    last_name: "P.",
    email: "829@kaizen.com",
    phone: "829",
    city: "Chennai",
    state: "",
    country: "India",
    reg_category: "FACULTY",
    total_amount: 0,
    transaction_id: null,
    mci_no: null,
    registration_date: "2026-10-24T17:57:19",
    payment_date: null,
    payment_mode: null,
    remarks: "as per sanjiv sir",
    from_link: null,
    qr_code_url: "/api/delegates/OKAI0160/qr",
  },
  {
    id: 66,
    registration_id: "OKAI0159",
    salutation: "Dr.",
    first_name: "Mohit Bhandari",
    last_name: "Bhandari",
    email: "828@kaizen.com",
    phone: "828",
    city: "Indore",
    state: "",
    country: "India",
    reg_category: "FACULTY",
    total_amount: 0,
    transaction_id: null,
    mci_no: null,
    registration_date: "2026-10-24T17:57:19",
    payment_date: null,
    payment_mode: null,
    remarks: "as per sanjiv sir",
    from_link: null,
    qr_code_url: "/api/delegates/OKAI0159/qr",
  },
  {
    id: 65,
    registration_id: "OKAI0158",
    salutation: "Dr.",
    first_name: "Mahesh",
    last_name: "Goel",
    email: "827@kaizen.com",
    phone: "827",
    city: "Mumbai",
    state: "",
    country: "India",
    reg_category: "FACULTY",
    total_amount: 0,
    transaction_id: null,
    mci_no: null,
    registration_date: "2026-10-24T17:57:19",
    payment_date: null,
    payment_mode: null,
    remarks: "as per sanjiv sir",
    from_link: null,
    qr_code_url: "/api/delegates/OKAI0158/qr",
  },
  {
    id: 64,
    registration_id: "OKAI0157",
    salutation: "Dr.",
    first_name: "Mahendra",
    last_name: "Narwaria",
    email: "826@kaizen.com",
    phone: "826",
    city: "Ahmedabad",
    state: "",
    country: "India",
    reg_category: "FACULTY",
    total_amount: 0,
    transaction_id: null,
    mci_no: null,
    registration_date: "2026-10-24T17:57:19",
    payment_date: null,
    payment_mode: null,
    remarks: "as per sanjiv sir",
    from_link: null,
    qr_code_url: "/api/delegates/OKAI0157/qr",
  },
  {
    id: 63,
    registration_id: "OKAI0156",
    salutation: "Dr.",
    first_name: "Kiran",
    last_name: "Kothari",
    email: "825@kaizen.com",
    phone: "825",
    city: "Ahmedabad",
    state: "",
    country: "India",
    reg_category: "FACULTY",
    total_amount: 0,
    transaction_id: null,
    mci_no: null,
    registration_date: "2026-10-24T17:57:19",
    payment_date: null,
    payment_mode: null,
    remarks: "as per sanjiv sir",
    from_link: null,
    qr_code_url: "/api/delegates/OKAI0156/qr",
  },
  {
    id: 62,
    registration_id: "OKAI0155",
    salutation: "Dr.",
    first_name: "Kaushal",
    last_name: "Anand",
    email: "824@kaizen.com",
    phone: "824",
    city: "Ahmedabad",
    state: "",
    country: "India",
    reg_category: "FACULTY",
    total_amount: 0,
    transaction_id: null,
    mci_no: null,
    registration_date: "2026-10-24T17:57:19",
    payment_date: null,
    payment_mode: null,
    remarks: "as per sanjiv sir",
    from_link: null,
    qr_code_url: "/api/delegates/OKAI0155/qr",
  },
  {
    id: 61,
    registration_id: "OKAI0154",
    salutation: "Dr.",
    first_name: "Kartik",
    last_name: "Sutariya",
    email: "823@kaizen.com",
    phone: "823",
    city: "Rajkot",
    state: "",
    country: "India",
    reg_category: "FACULTY",
    total_amount: 0,
    transaction_id: null,
    mci_no: null,
    registration_date: "2026-10-24T17:57:19",
    payment_date: null,
    payment_mode: null,
    remarks: "as per sanjiv sir",
    from_link: null,
    qr_code_url: "/api/delegates/OKAI0154/qr",
  },
  {
    id: 60,
    registration_id: "OKAI0153",
    salutation: "Dr.",
    first_name: "Kalayarasan",
    last_name: "Raja",
    email: "822@kaizen.com",
    phone: "822",
    city: "Chennai",
    state: "",
    country: "India",
    reg_category: "FACULTY",
    total_amount: 0,
    transaction_id: null,
    mci_no: null,
    registration_date: "2026-10-24T17:57:19",
    payment_date: null,
    payment_mode: null,
    remarks: "as per sanjiv sir",
    from_link: null,
    qr_code_url: "/api/delegates/OKAI0153/qr",
  },
  {
    id: 59,
    registration_id: "OKAI0152",
    salutation: "Dr.",
    first_name: "G. V.",
    last_name: "Rao",
    email: "821@kaizen.com",
    phone: "821",
    city: "Hyderabad",
    state: "",
    country: "India",
    reg_category: "FACULTY",
    total_amount: 0,
    transaction_id: null,
    mci_no: null,
    registration_date: "2026-10-24T17:57:19",
    payment_date: null,
    payment_mode: null,
    remarks: "as per sanjiv sir",
    from_link: null,
    qr_code_url: "/api/delegates/OKAI0152/qr",
  },
  {
    id: 58,
    registration_id: "OKAI0151",
    salutation: "Dr.",
    first_name: "Deepak",
    last_name: "Govil",
    email: "820@kaizen.com",
    phone: "820",
    city: "New Delhi",
    state: "",
    country: "India",
    reg_category: "FACULTY",
    total_amount: 0,
    transaction_id: null,
    mci_no: null,
    registration_date: "2026-10-24T17:57:19",
    payment_date: null,
    payment_mode: null,
    remarks: "as per sanjiv sir",
    from_link: null,
    qr_code_url: "/api/delegates/OKAI0151/qr",
  },
  {
    id: 57,
    registration_id: "OKAI0150",
    salutation: "Dr.",
    first_name: "Chirag J.",
    last_name: "Desai",
    email: "819@kaizen.com",
    phone: "819",
    city: "Ahmedabad",
    state: "",
    country: "India",
    reg_category: "FACULTY",
    total_amount: 0,
    transaction_id: null,
    mci_no: null,
    registration_date: "2026-10-24T17:57:19",
    payment_date: null,
    payment_mode: null,
    remarks: "as per sanjiv sir",
    from_link: null,
    qr_code_url: "/api/delegates/OKAI0150/qr",
  },
  {
    id: 56,
    registration_id: "OKAI0149",
    salutation: "Prof.",
    first_name: "C.",
    last_name: "Palanivelu",
    email: "818@kaizen.com",
    phone: "818",
    city: "Coimbatore",
    state: "",
    country: "India",
    reg_category: "FACULTY",
    total_amount: 0,
    transaction_id: null,
    mci_no: null,
    registration_date: "2026-10-24T17:57:19",
    payment_date: null,
    payment_mode: null,
    remarks: "as per sanjiv sir",
    from_link: null,
    qr_code_url: "/api/delegates/OKAI0149/qr",
  },
  {
    id: 55,
    registration_id: "OKAI0148",
    salutation: "Dr.",
    first_name: "Avinash",
    last_name: "Supe",
    email: "817@kaizen.com",
    phone: "817",
    city: "Mumbai",
    state: "",
    country: "India",
    reg_category: "FACULTY",
    total_amount: 0,
    transaction_id: null,
    mci_no: null,
    registration_date: "2026-10-24T17:57:19",
    payment_date: null,
    payment_mode: null,
    remarks: "as per sanjiv sir",
    from_link: null,
    qr_code_url: "/api/delegates/OKAI0148/qr",
  },
  {
    id: 54,
    registration_id: "OKAI0147",
    salutation: "Dr.",
    first_name: "Avanish",
    last_name: "Saklani",
    email: "816@kaizen.com",
    phone: "816",
    city: "Mumbai",
    state: "",
    country: "India",
    reg_category: "FACULTY",
    total_amount: 0,
    transaction_id: null,
    mci_no: null,
    registration_date: "2026-10-24T17:57:19",
    payment_date: null,
    payment_mode: null,
    remarks: "as per sanjiv sir",
    from_link: null,
    qr_code_url: "/api/delegates/OKAI0147/qr",
  },
  {
    id: 53,
    registration_id: "OKAI0146",
    salutation: "Dr.",
    first_name: "Anu",
    last_name: "Behari",
    email: "815@kaizen.com",
    phone: "815",
    city: "Lucknow",
    state: "",
    country: "India",
    reg_category: "FACULTY",
    total_amount: 0,
    transaction_id: null,
    mci_no: null,
    registration_date: "2026-10-24T17:57:19",
    payment_date: null,
    payment_mode: null,
    remarks: "as per sanjiv sir",
    from_link: null,
    qr_code_url: "/api/delegates/OKAI0146/qr",
  },
  {
    id: 52,
    registration_id: "OKAI0145",
    salutation: "Dr.",
    first_name: "Anil Kumar",
    last_name: "Agarwal",
    email: "814@kaizen.com",
    phone: "814",
    city: "New Delhi",
    state: "",
    country: "India",
    reg_category: "FACULTY",
    total_amount: 0,
    transaction_id: null,
    mci_no: null,
    registration_date: "2026-10-24T17:57:19",
    payment_date: null,
    payment_mode: null,
    remarks: "as per sanjiv sir",
    from_link: null,
    qr_code_url: "/api/delegates/OKAI0145/qr",
  },
  {
    id: 51,
    registration_id: "OKAI0144",
    salutation: "Dr.",
    first_name: "Amol",
    last_name: "Bharadwaj",
    email: "813@kaizen.com",
    phone: "813",
    city: "Ahmedabad",
    state: "",
    country: "India",
    reg_category: "FACULTY",
    total_amount: 0,
    transaction_id: null,
    mci_no: null,
    registration_date: "2026-10-24T17:57:19",
    payment_date: null,
    payment_mode: null,
    remarks: "as per sanjiv sir",
    from_link: null,
    qr_code_url: "/api/delegates/OKAI0144/qr",
  },
  {
    id: 50,
    registration_id: "OKAI0143",
    salutation: "Dr.",
    first_name: "Ajit",
    last_name: "Kukreja",
    email: "812@kaizen.com",
    phone: "812",
    city: "Ahmedabad",
    state: "",
    country: "India",
    reg_category: "FACULTY",
    total_amount: 0,
    transaction_id: null,
    mci_no: null,
    registration_date: "2026-10-24T17:57:19",
    payment_date: null,
    payment_mode: null,
    remarks: "as per sanjiv sir",
    from_link: null,
    qr_code_url: "/api/delegates/OKAI0143/qr",
  },
  {
    id: 49,
    registration_id: "OKAI0142",
    salutation: "Dr.",
    first_name: "Adarsh",
    last_name: "Chaudhary",
    email: "811@kaizen.com",
    phone: "811",
    city: "Gurugram",
    state: "",
    country: "India",
    reg_category: "FACULTY",
    total_amount: 0,
    transaction_id: null,
    mci_no: null,
    registration_date: "2026-10-24T17:57:19",
    payment_date: null,
    payment_mode: null,
    remarks: "as per sanjiv sir",
    from_link: null,
    qr_code_url: "/api/delegates/OKAI0142/qr",
  },
  {
    id: 48,
    registration_id: "OKAI0141",
    salutation: "Dr.",
    first_name: "Abhijit",
    last_name: "Chandra",
    email: "810@kaizen.com",
    phone: "810",
    city: "Lucknow",
    state: "",
    country: "India",
    reg_category: "FACULTY",
    total_amount: 0,
    transaction_id: null,
    mci_no: null,
    registration_date: "2026-10-24T17:57:19",
    payment_date: null,
    payment_mode: null,
    remarks: "as per sanjiv sir",
    from_link: null,
    qr_code_url: "/api/delegates/OKAI0141/qr",
  },
  {
    id: 47,
    registration_id: "OKAI0140",
    salutation: "Dr.",
    first_name: "Utsav",
    last_name: "Saxena",
    email: "noemail35@kaizencon.com",
    phone: "931",
    city: "Ahmedabad",
    state: "Gujarat",
    country: "India",
    reg_category: "Organizing Committee",
    total_amount: 0,
    transaction_id: null,
    mci_no: null,
    registration_date: "2026-10-24T12:49:30",
    payment_date: null,
    payment_mode: null,
    remarks: "register as per oc",
    from_link: null,
    qr_code_url: "/api/delegates/OKAI0140/qr",
  },
  {
    id: 46,
    registration_id: "OKAI0138",
    salutation: "Dr.",
    first_name: "Hamik",
    last_name: "Patel",
    email: "noemail33@kaizencon.com",
    phone: "929",
    city: "Ahmedabad",
    state: "Gujarat",
    country: "India",
    reg_category: "Organizing Committee",
    total_amount: 0,
    transaction_id: null,
    mci_no: null,
    registration_date: "2026-10-24T12:49:30",
    payment_date: null,
    payment_mode: null,
    remarks: "register as per oc",
    from_link: null,
    qr_code_url: "/api/delegates/OKAI0138/qr",
  },
  {
    id: 45,
    registration_id: "OKAI0137",
    salutation: "Dr.",
    first_name: "Navdeep",
    last_name: "Singla",
    email: "noemail32@kaizencon.com",
    phone: "928",
    city: "Ahmedabad",
    state: "Gujarat",
    country: "India",
    reg_category: "Organizing Committee",
    total_amount: 0,
    transaction_id: null,
    mci_no: null,
    registration_date: "2026-10-24T12:49:30",
    payment_date: null,
    payment_mode: null,
    remarks: "register as per oc",
    from_link: null,
    qr_code_url: "/api/delegates/OKAI0137/qr",
  },
  {
    id: 44,
    registration_id: "OKAI0134",
    salutation: "Dr.",
    first_name: "Romi",
    last_name: "Gaudani",
    email: "noemail29@kaizencon.com",
    phone: "925",
    city: "Ahmedabad",
    state: "Gujarat",
    country: "India",
    reg_category: "Organizing Committee",
    total_amount: 0,
    transaction_id: null,
    mci_no: null,
    registration_date: "2026-10-24T12:49:30",
    payment_date: null,
    payment_mode: null,
    remarks: "register as per oc",
    from_link: null,
    qr_code_url: "/api/delegates/OKAI0134/qr",
  },
  {
    id: 43,
    registration_id: "OKAI0132",
    salutation: "Dr.",
    first_name: "Alankar",
    last_name: ".",
    email: "noemail27@kaizencon.com",
    phone: "923",
    city: "Ahmedabad",
    state: "Gujarat",
    country: "India",
    reg_category: "Organizing Committee",
    total_amount: 0,
    transaction_id: null,
    mci_no: null,
    registration_date: "2026-10-24T12:49:30",
    payment_date: null,
    payment_mode: null,
    remarks: "register as per oc",
    from_link: null,
    qr_code_url: "/api/delegates/OKAI0132/qr",
  },
  {
    id: 42,
    registration_id: "OKAI0131",
    salutation: "Dr.",
    first_name: "Chirag",
    last_name: "Thakkar",
    email: "noemail26@kaizencon.com",
    phone: "922",
    city: "Ahmedabad",
    state: "Gujarat",
    country: "India",
    reg_category: "Organizing Committee",
    total_amount: 0,
    transaction_id: null,
    mci_no: null,
    registration_date: "2026-10-24T12:49:30",
    payment_date: null,
    payment_mode: null,
    remarks: "register as per oc",
    from_link: null,
    qr_code_url: "/api/delegates/OKAI0131/qr",
  },
  {
    id: 41,
    registration_id: "OKAI0130",
    salutation: "Dr.",
    first_name: "Anish",
    last_name: "Nagpal",
    email: "noemail25@kaizencon.com",
    phone: "921",
    city: "Ahmedabad",
    state: "Gujarat",
    country: "India",
    reg_category: "Organizing Committee",
    total_amount: 0,
    transaction_id: null,
    mci_no: null,
    registration_date: "2026-10-24T12:49:30",
    payment_date: null,
    payment_mode: null,
    remarks: "register as per oc",
    from_link: null,
    qr_code_url: "/api/delegates/OKAI0130/qr",
  },
  {
    id: 40,
    registration_id: "OKAI0129",
    salutation: "Dr.",
    first_name: "Vismit",
    last_name: "Joshipura",
    email: "noemail24@kaizencon.com",
    phone: "920",
    city: "Ahmedabad",
    state: "Gujarat",
    country: "India",
    reg_category: "Organizing Committee",
    total_amount: 0,
    transaction_id: null,
    mci_no: null,
    registration_date: "2026-10-24T12:49:30",
    payment_date: null,
    payment_mode: null,
    remarks: "register as per oc",
    from_link: null,
    qr_code_url: "/api/delegates/OKAI0129/qr",
  },
  {
    id: 39,
    registration_id: "OKAI0128",
    salutation: "Dr.",
    first_name: "Balram",
    last_name: "Behera",
    email: "noemail23@kaizencon.com",
    phone: "919",
    city: "Ahmedabad",
    state: "Gujarat",
    country: "India",
    reg_category: "Organizing Committee",
    total_amount: 0,
    transaction_id: null,
    mci_no: null,
    registration_date: "2026-10-24T12:49:30",
    payment_date: null,
    payment_mode: null,
    remarks: "register as per oc",
    from_link: null,
    qr_code_url: "/api/delegates/OKAI0128/qr",
  },
  {
    id: 38,
    registration_id: "OKAI0127",
    salutation: "Dr.",
    first_name: "Vinayak",
    last_name: "Rengan",
    email: "noemail22@kaizencon.com",
    phone: "918",
    city: "Ahmedabad",
    state: "Gujarat",
    country: "India",
    reg_category: "Organizing Committee",
    total_amount: 0,
    transaction_id: null,
    mci_no: null,
    registration_date: "2026-10-24T12:49:30",
    payment_date: null,
    payment_mode: null,
    remarks: "register as per oc",
    from_link: null,
    qr_code_url: "/api/delegates/OKAI0127/qr",
  },
  {
    id: 37,
    registration_id: "OKAI0126",
    salutation: "Dr.",
    first_name: "Rajiv",
    last_name: "Mehta",
    email: "noemail21@kaizencon.com",
    phone: "917",
    city: "Ahmedabad",
    state: "Gujarat",
    country: "India",
    reg_category: "Organizing Committee",
    total_amount: 0,
    transaction_id: null,
    mci_no: null,
    registration_date: "2026-10-24T12:49:30",
    payment_date: null,
    payment_mode: null,
    remarks: "register as per oc",
    from_link: null,
    qr_code_url: "/api/delegates/OKAI0126/qr",
  },
  {
    id: 36,
    registration_id: "OKAI0125",
    salutation: "Dr.",
    first_name: "Kaushal",
    last_name: "Anand",
    email: "noemail20@kaizencon.com",
    phone: "916",
    city: "Ahmedabad",
    state: "Gujarat",
    country: "India",
    reg_category: "Organizing Committee",
    total_amount: 0,
    transaction_id: null,
    mci_no: null,
    registration_date: "2026-10-24T12:49:30",
    payment_date: null,
    payment_mode: null,
    remarks: "register as per oc",
    from_link: null,
    qr_code_url: "/api/delegates/OKAI0125/qr",
  },
  {
    id: 35,
    registration_id: "OKAI0124",
    salutation: "Dr.",
    first_name: "Panth",
    last_name: "Gheewala",
    email: "noemail19@kaizencon.com",
    phone: "915",
    city: "Ahmedabad",
    state: "Gujarat",
    country: "India",
    reg_category: "Organizing Committee",
    total_amount: 0,
    transaction_id: null,
    mci_no: null,
    registration_date: "2026-10-24T12:49:30",
    payment_date: null,
    payment_mode: null,
    remarks: "register as per oc",
    from_link: null,
    qr_code_url: "/api/delegates/OKAI0124/qr",
  },
  {
    id: 34,
    registration_id: "OKAI0123",
    salutation: "Dr.",
    first_name: "Vedant",
    last_name: "Wankhede",
    email: "noemail18@kaizencon.com",
    phone: "914",
    city: "Ahmedabad",
    state: "Gujarat",
    country: "India",
    reg_category: "Organizing Committee",
    total_amount: 0,
    transaction_id: null,
    mci_no: null,
    registration_date: "2026-10-24T12:49:30",
    payment_date: null,
    payment_mode: null,
    remarks: "register as per oc",
    from_link: null,
    qr_code_url: "/api/delegates/OKAI0123/qr",
  },
  {
    id: 33,
    registration_id: "OKAI0122",
    salutation: "Dr.",
    first_name: "Amol",
    last_name: "Bharadwaj",
    email: "noemail17@kaizencon.com",
    phone: "913",
    city: "Ahmedabad",
    state: "Gujarat",
    country: "India",
    reg_category: "Organizing Committee",
    total_amount: 0,
    transaction_id: null,
    mci_no: null,
    registration_date: "2026-10-24T12:49:30",
    payment_date: null,
    payment_mode: null,
    remarks: "register as per oc",
    from_link: null,
    qr_code_url: "/api/delegates/OKAI0122/qr",
  },
  {
    id: 32,
    registration_id: "OKAI0121",
    salutation: "Mr.",
    first_name: "Kishan",
    last_name: "Panchal",
    email: "noemail16@kaizencon.com",
    phone: "912",
    city: "Ahmedabad",
    state: "Gujarat",
    country: "India",
    reg_category: "Organizing Committee",
    total_amount: 0,
    transaction_id: null,
    mci_no: null,
    registration_date: "2026-10-24T12:49:30",
    payment_date: null,
    payment_mode: null,
    remarks: "register as per oc",
    from_link: null,
    qr_code_url: "/api/delegates/OKAI0121/qr",
  },
  {
    id: 31,
    registration_id: "OKAI0120",
    salutation: "Ms.",
    first_name: "Ronnie",
    last_name: "Stephen",
    email: "noemail15@kaizencon.com",
    phone: "9624359275",
    city: "Ahmedabad",
    state: "Gujarat",
    country: "India",
    reg_category: "Organizing Committee",
    total_amount: 0,
    transaction_id: null,
    mci_no: null,
    registration_date: "2026-10-24T12:49:30",
    payment_date: null,
    payment_mode: null,
    remarks: "register as per oc",
    from_link: null,
    qr_code_url: "/api/delegates/OKAI0120/qr",
  },
  {
    id: 30,
    registration_id: "OKAI0119",
    salutation: "Mr.",
    first_name: "Sandip",
    last_name: "Bhatia",
    email: "noemail14@kaizencon.com",
    phone: "9033693113",
    city: "Ahmedabad",
    state: "Gujarat",
    country: "India",
    reg_category: "Organizing Committee",
    total_amount: 0,
    transaction_id: null,
    mci_no: null,
    registration_date: "2026-10-24T12:49:30",
    payment_date: null,
    payment_mode: null,
    remarks: "register as per oc",
    from_link: null,
    qr_code_url: "/api/delegates/OKAI0119/qr",
  },
  {
    id: 29,
    registration_id: "OKAI0118",
    salutation: "Dr.",
    first_name: "Dilip",
    last_name: "Modi",
    email: "noemail13@kaizencon.com",
    phone: "9016340044",
    city: "Ahmedabad",
    state: "Gujarat",
    country: "India",
    reg_category: "Organizing Committee",
    total_amount: 0,
    transaction_id: null,
    mci_no: null,
    registration_date: "2026-10-24T12:49:30",
    payment_date: null,
    payment_mode: null,
    remarks: "register as per oc",
    from_link: null,
    qr_code_url: "/api/delegates/OKAI0118/qr",
  },
  {
    id: 28,
    registration_id: "OKAI0117",
    salutation: "Mr.",
    first_name: "Hiren",
    last_name: "Bhatia",
    email: "noemail12@kaizencon.com",
    phone: "9714933441",
    city: "Ahmedabad",
    state: "Gujarat",
    country: "India",
    reg_category: "Organizing Committee",
    total_amount: 0,
    transaction_id: null,
    mci_no: null,
    registration_date: "2026-10-24T12:49:30",
    payment_date: null,
    payment_mode: null,
    remarks: "register as per oc",
    from_link: null,
    qr_code_url: "/api/delegates/OKAI0117/qr",
  },
  {
    id: 27,
    registration_id: "OKAI0116",
    salutation: "Dr.",
    first_name: "Raxesh",
    last_name: "Desai",
    email: "noemail11@kaizencon.com",
    phone: "911",
    city: "Ahmedabad",
    state: "Gujarat",
    country: "India",
    reg_category: "Organizing Committee",
    total_amount: 0,
    transaction_id: null,
    mci_no: null,
    registration_date: "2026-10-24T12:49:30",
    payment_date: null,
    payment_mode: null,
    remarks: "register as per oc",
    from_link: null,
    qr_code_url: "/api/delegates/OKAI0116/qr",
  },
  {
    id: 26,
    registration_id: "OKAI0115",
    salutation: "Dr.",
    first_name: "Vidish",
    last_name: "Sheth",
    email: "noemail10@kaizencon.com",
    phone: "910",
    city: "Ahmedabad",
    state: "Gujarat",
    country: "India",
    reg_category: "Organizing Committee",
    total_amount: 0,
    transaction_id: null,
    mci_no: null,
    registration_date: "2026-10-24T12:49:30",
    payment_date: null,
    payment_mode: null,
    remarks: "register as per oc",
    from_link: null,
    qr_code_url: "/api/delegates/OKAI0115/qr",
  },
  {
    id: 25,
    registration_id: "OKAI0114",
    salutation: "Dr.",
    first_name: "Jayant",
    last_name: "Jhala",
    email: "noemail9@kaizencon.com",
    phone: "909",
    city: "Ahmedabad",
    state: "Gujarat",
    country: "India",
    reg_category: "Organizing Committee",
    total_amount: 0,
    transaction_id: null,
    mci_no: null,
    registration_date: "2026-10-24T12:49:30",
    payment_date: null,
    payment_mode: null,
    remarks: "register as per oc",
    from_link: null,
    qr_code_url: "/api/delegates/OKAI0114/qr",
  },
  {
    id: 24,
    registration_id: "OKAI0113",
    salutation: "Dr.",
    first_name: "Avadh",
    last_name: "Patel",
    email: "noemail8@kaizencon.com",
    phone: "908",
    city: "Ahmedabad",
    state: "Gujarat",
    country: "India",
    reg_category: "Organizing Committee",
    total_amount: 0,
    transaction_id: null,
    mci_no: null,
    registration_date: "2026-10-24T12:49:30",
    payment_date: null,
    payment_mode: null,
    remarks: "register as per oc",
    from_link: null,
    qr_code_url: "/api/delegates/OKAI0113/qr",
  },
  {
    id: 23,
    registration_id: "OKAI0112",
    salutation: "Dr.",
    first_name: "Harshad",
    last_name: "Soni",
    email: "noemail7@kaizencon.com",
    phone: "907",
    city: "Ahmedabad",
    state: "Gujarat",
    country: "India",
    reg_category: "Organizing Committee",
    total_amount: 0,
    transaction_id: null,
    mci_no: null,
    registration_date: "2026-10-24T12:49:30",
    payment_date: null,
    payment_mode: null,
    remarks: "register as per oc",
    from_link: null,
    qr_code_url: "/api/delegates/OKAI0112/qr",
  },
  {
    id: 22,
    registration_id: "OKAI0111",
    salutation: "Dr.",
    first_name: "Atul",
    last_name: "Shah",
    email: "noemail6@kaizencon.com",
    phone: "906",
    city: "Ahmedabad",
    state: "Gujarat",
    country: "India",
    reg_category: "Organizing Committee",
    total_amount: 0,
    transaction_id: null,
    mci_no: null,
    registration_date: "2026-10-24T12:49:30",
    payment_date: null,
    payment_mode: null,
    remarks: "register as per oc",
    from_link: null,
    qr_code_url: "/api/delegates/OKAI0111/qr",
  },
  {
    id: 21,
    registration_id: "OKAI0110",
    salutation: "Dr.",
    first_name: "K.S.",
    last_name: "Patel",
    email: "noemail5@kaizencon.com",
    phone: "905",
    city: "Ahmedabad",
    state: "Gujarat",
    country: "India",
    reg_category: "Organizing Committee",
    total_amount: 0,
    transaction_id: null,
    mci_no: null,
    registration_date: "2026-10-24T12:49:30",
    payment_date: null,
    payment_mode: null,
    remarks: "register as per oc",
    from_link: null,
    qr_code_url: "/api/delegates/OKAI0110/qr",
  },
  {
    id: 20,
    registration_id: "OKAI0109",
    salutation: "Dr.",
    first_name: "Vasant",
    last_name: "Valu",
    email: "noemail4@kaizencon.com",
    phone: "904",
    city: "Ahmedabad",
    state: "Gujarat",
    country: "India",
    reg_category: "Organizing Committee",
    total_amount: 0,
    transaction_id: null,
    mci_no: null,
    registration_date: "2026-10-24T12:49:30",
    payment_date: null,
    payment_mode: null,
    remarks: "register as per oc",
    from_link: null,
    qr_code_url: "/api/delegates/OKAI0109/qr",
  },
  {
    id: 19,
    registration_id: "OKAI0108",
    salutation: "Dr.",
    first_name: "A.V.",
    last_name: "Shah",
    email: "noemail3@kaizencon.com",
    phone: "903",
    city: "Ahmedabad",
    state: "Gujarat",
    country: "India",
    reg_category: "Organizing Committee",
    total_amount: 0,
    transaction_id: null,
    mci_no: null,
    registration_date: "2026-10-24T12:49:30",
    payment_date: null,
    payment_mode: null,
    remarks: "register as per oc",
    from_link: null,
    qr_code_url: "/api/delegates/OKAI0108/qr",
  },
  {
    id: 18,
    registration_id: "OKAI0107",
    salutation: "Dr.",
    first_name: "Mahesh",
    last_name: "Desai",
    email: "noemail2@kaizencon.com",
    phone: "902",
    city: "Ahmedabad",
    state: "Gujarat",
    country: "India",
    reg_category: "Organizing Committee",
    total_amount: 0,
    transaction_id: null,
    mci_no: null,
    registration_date: "2026-10-24T12:49:30",
    payment_date: null,
    payment_mode: null,
    remarks: "register as per oc",
    from_link: null,
    qr_code_url: "/api/delegates/OKAI0107/qr",
  },
  {
    id: 17,
    registration_id: "OKAI0106",
    salutation: "Dr.",
    first_name: "D. G.",
    last_name: "Yajnik",
    email: "noemail1@kaizencon.com",
    phone: "901",
    city: "Ahmedabad",
    state: "Gujarat",
    country: "India",
    reg_category: "Organizing Committee",
    total_amount: 0,
    transaction_id: null,
    mci_no: null,
    registration_date: "2026-10-24T12:49:30",
    payment_date: null,
    payment_mode: null,
    remarks: "register as per oc",
    from_link: null,
    qr_code_url: "/api/delegates/OKAI0106/qr",
  },
  {
    id: 16,
    registration_id: "KAI179",
    salutation: "Dr.",
    first_name: "Mahavir",
    last_name: "Tadaiya",
    email: "mahavir.tadaiya@gmail.com",
    phone: "9909927664",
    city: "Ahmedabad",
    state: "GUJARAT",
    country: "India",
    reg_category: "DELEGATE",
    total_amount: 7080,
    transaction_id: "114940860432",
    mci_no: "G-24332",
    registration_date: "2026-10-26T20:33:41",
    payment_date: "2026-10-26T20:33:41",
    payment_mode: "Online",
    remarks: null,
    from_link: null,
    qr_code_url: "/api/delegates/KAI179/qr",
  },
  {
    id: 15,
    registration_id: "KAI0105",
    salutation: "Dr.",
    first_name: "Pratik",
    last_name: "Katariwala",
    email: "katariwalapratik@gmail.com",
    phone: "7069102018",
    city: "Surat",
    state: "GUJARAT",
    country: "India",
    reg_category: "DELEGATE",
    total_amount: 6018,
    transaction_id: "114932870094",
    mci_no: "G-22323",
    registration_date: "2026-10-23T16:19:26",
    payment_date: "2026-10-23T16:19:26",
    payment_mode: "Online",
    remarks: null,
    from_link: null,
    qr_code_url: "/api/delegates/KAI0105/qr",
  },
  {
    id: 14,
    registration_id: "KAI0104",
    salutation: "Dr.",
    first_name: "Ajmeri",
    last_name: "Mohammad Isaad",
    email: "drisaadajmeri@gmail.com",
    phone: "9427105026",
    city: "ANKLESHWAR",
    state: "GUJARAT",
    country: "India",
    reg_category: "DELEGATE",
    total_amount: 6018,
    transaction_id: "114925647971",
    mci_no: "G-24700",
    registration_date: "2026-10-21T07:57:06",
    payment_date: "2026-10-21T07:57:06",
    payment_mode: "Online",
    remarks: null,
    from_link: null,
    qr_code_url: "/api/delegates/KAI0104/qr",
  },
  {
    id: 13,
    registration_id: "KAI0103",
    salutation: "Dr.",
    first_name: "Dr. Prabhakar",
    last_name: "Shukla",
    email: "prabhakarshukla@yahoo.com",
    phone: "6354413507",
    city: "Ahmedabad",
    state: "GUJARAT",
    country: "India",
    reg_category: "DELEGATE",
    total_amount: 6018,
    transaction_id: "114925143284",
    mci_no: "G5259",
    registration_date: "2026-10-20T19:02:11",
    payment_date: "2026-10-20T19:02:11",
    payment_mode: "Online",
    remarks: null,
    from_link: null,
    qr_code_url: "/api/delegates/KAI0103/qr",
  },
  {
    id: 12,
    registration_id: "KAI0102",
    salutation: "Dr.",
    first_name: "Mayank",
    last_name: "Raval",
    email: "ravalmayankv@gmail.com",
    phone: "9824032545",
    city: "AHMEDABAD",
    state: "GUJARAT",
    country: "India",
    reg_category: "DELEGATE",
    total_amount: 7080,
    transaction_id: "114922650443",
    mci_no: "G 4935",
    registration_date: "2026-10-19T15:27:05",
    payment_date: "2026-10-19T15:27:05",
    payment_mode: "Online",
    remarks: null,
    from_link: null,
    qr_code_url: "/api/delegates/KAI0102/qr",
  },
  {
    id: 11,
    registration_id: "KAI0101",
    salutation: "Dr.",
    first_name: "Sanjiv",
    last_name: "Haribhakti",
    email: "sharibhakti@gmail.com",
    phone: "9824047457",
    city: "Ahmedabad",
    state: "GUJARAT",
    country: "India",
    reg_category: "Organizing Committee",
    total_amount: 7080,
    transaction_id: "114859875015",
    mci_no: "G17720",
    registration_date: "2026-10-21T14:01:43",
    payment_date: "2026-10-21T14:01:43",
    payment_mode: "Online",
    remarks: null,
    from_link: null,
    qr_code_url: "/api/delegates/KAI0101/qr",
  },
  {
    id: 10,
    registration_id: "b57c948e-c9de-493b-b863-c9e0e5c8cacd",
    salutation: null,
    first_name: "ayushi",
    last_name: "trivedi",
    email: "ayushi.hackberrysoftech@gmail.com",
    phone: "1234567898",
    city: "Ahmedabad",
    state: "Gujarat",
    country: "India",
    reg_category: null,
    total_amount: null,
    transaction_id: null,
    mci_no: null,
    registration_date: null,
    payment_date: null,
    payment_mode: null,
    remarks: null,
    from_link: null,
    qr_code_url: "/api/delegates/b57c948e-c9de-493b-b863-c9e0e5c8cacd/qr",
  },
  {
    id: 9,
    registration_id: "deeb2b14-045a-4195-b4ee-99f721b3b715",
    salutation: null,
    first_name: "ankit",
    last_name: "panchal",
    email: "ankit@gmail.com",
    phone: "6746868456",
    city: "himmatnagar",
    state: "gujarat",
    country: "india",
    reg_category: null,
    total_amount: null,
    transaction_id: null,
    mci_no: null,
    registration_date: null,
    payment_date: null,
    payment_mode: null,
    remarks: null,
    from_link: null,
    qr_code_url: "/api/delegates/deeb2b14-045a-4195-b4ee-99f721b3b715/qr",
  },
  {
    id: 8,
    registration_id: "c4f5d88b-17a2-42fa-b6da-4e219ea8c707",
    salutation: null,
    first_name: "ankita",
    last_name: "panchal",
    email: "pritmeghapara2516@gmail.com",
    phone: "8200348934",
    city: "Ahmedabad",
    state: "gujarat",
    country: "india",
    reg_category: null,
    total_amount: null,
    transaction_id: null,
    mci_no: null,
    registration_date: null,
    payment_date: null,
    payment_mode: null,
    remarks: null,
    from_link: null,
    qr_code_url: "/api/delegates/c4f5d88b-17a2-42fa-b6da-4e219ea8c707/qr",
  },
  {
    id: 7,
    registration_id: "faf96265-2fed-4f83-bcfd-2c704ed3444e",
    salutation: null,
    first_name: "ankita",
    last_name: "panchal",
    email: "ankitapanchal@gmail.com",
    phone: "8200348934",
    city: "Ahmedabad",
    state: "gujarat",
    country: "india",
    reg_category: null,
    total_amount: null,
    transaction_id: null,
    mci_no: null,
    registration_date: null,
    payment_date: null,
    payment_mode: null,
    remarks: null,
    from_link: null,
    qr_code_url: "/api/delegates/faf96265-2fed-4f83-bcfd-2c704ed3444e/qr",
  },
  {
    id: 6,
    registration_id: "41d50b60-674f-40fe-832f-825d4922cd32",
    salutation: null,
    first_name: "Meera",
    last_name: "Iyer",
    email: "demo.delegate06@example.com",
    phone: "+919810000006",
    city: "Chennai",
    state: "Tamil Nadu",
    country: "India",
    reg_category: null,
    total_amount: null,
    transaction_id: null,
    mci_no: null,
    registration_date: null,
    payment_date: null,
    payment_mode: null,
    remarks: null,
    from_link: null,
    qr_code_url: "/api/delegates/41d50b60-674f-40fe-832f-825d4922cd32/qr",
  },
  {
    id: 5,
    registration_id: "572bc989-97f8-4357-9a69-7f576f1b009b",
    salutation: null,
    first_name: "Dev",
    last_name: "Chatterjee",
    email: "demo.delegate05@example.com",
    phone: "+919810000005",
    city: "Kolkata",
    state: "West Bengal",
    country: "India",
    reg_category: null,
    total_amount: null,
    transaction_id: null,
    mci_no: null,
    registration_date: null,
    payment_date: null,
    payment_mode: null,
    remarks: null,
    from_link: null,
    qr_code_url: "/api/delegates/572bc989-97f8-4357-9a69-7f576f1b009b/qr",
  },
  {
    id: 4,
    registration_id: "56df2c27-83d7-4efc-9c10-75f96d08432b",
    salutation: null,
    first_name: "Kavya",
    last_name: "Joshi",
    email: "demo.delegate04@example.com",
    phone: "+919810000004",
    city: "Pune",
    state: "Maharashtra",
    country: "India",
    reg_category: null,
    total_amount: null,
    transaction_id: null,
    mci_no: null,
    registration_date: null,
    payment_date: null,
    payment_mode: null,
    remarks: null,
    from_link: null,
    qr_code_url: "/api/delegates/56df2c27-83d7-4efc-9c10-75f96d08432b/qr",
  },
  {
    id: 3,
    registration_id: "cd9c812e-53cd-4f95-a30a-3934ad2d0333",
    salutation: null,
    first_name: "Arjun",
    last_name: "Nair",
    email: "demo.delegate03@example.com",
    phone: "+919810000003",
    city: "Kochi",
    state: "Kerala",
    country: "India",
    reg_category: null,
    total_amount: null,
    transaction_id: null,
    mci_no: null,
    registration_date: null,
    payment_date: null,
    payment_mode: null,
    remarks: null,
    from_link: null,
    qr_code_url: "/api/delegates/cd9c812e-53cd-4f95-a30a-3934ad2d0333/qr",
  },
  {
    id: 2,
    registration_id: "05530aa7-a5d0-499d-923c-a5b5b67c536c",
    salutation: null,
    first_name: "Isha",
    last_name: "Reddy",
    email: "demo.delegate02@example.com",
    phone: "+919810000002",
    city: "Hyderabad",
    state: "Telangana",
    country: "India",
    reg_category: null,
    total_amount: null,
    transaction_id: null,
    mci_no: null,
    registration_date: null,
    payment_date: null,
    payment_mode: null,
    remarks: null,
    from_link: null,
    qr_code_url: "/api/delegates/05530aa7-a5d0-499d-923c-a5b5b67c536c/qr",
  },
  {
    id: 1,
    registration_id: "07b6d578-3a28-4179-b96d-43bc42fc0ab8",
    salutation: null,
    first_name: "prit",
    last_name: "patel",
    email: "prit.hackberrysoftech@gmail.com",
    phone: "9714047908",
    city: "ahemadabad",
    state: "gujarat",
    country: "india",
    reg_category: null,
    total_amount: null,
    transaction_id: null,
    mci_no: null,
    registration_date: null,
    payment_date: null,
    payment_mode: null,
    remarks: null,
    from_link: null,
    qr_code_url: "/api/delegates/07b6d578-3a28-4179-b96d-43bc42fc0ab8/qr",
  },
];

export default function DelegatesPage() {
  const [delegates, setDelegates] = useState<Delegate[]>(fallbackDelegates);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [_isLiveApi, setIsLiveApi] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Filters & Search
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [cityFilter, setCityFilter] = useState<string>("All");

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Selected Delegate for View Modal & QR Preview
  const [selectedDelegate, setSelectedDelegate] = useState<Delegate | null>(null);
  const [qrModalDelegate, setQrModalDelegate] = useState<Delegate | null>(null);

  // Fetch from Live API
  const fetchDelegatesData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getDelegates();
      if (data && Array.isArray(data.results)) {
        setDelegates(data.results);
        setIsLiveApi(true);
      } else {
        setDelegates(fallbackDelegates);
        setIsLiveApi(false);
      }
    } catch (err: any) {
      console.warn("Could not fetch delegates from live API, using fallback data:", err);
      setError(err?.message || "Live API not reachable. Showing cached data.");
      setDelegates(fallbackDelegates);
      setIsLiveApi(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDelegatesData();
  }, []);

  // Unique Categories
  const availableCategories = useMemo(() => {
    const list = Array.from(
      new Set(delegates.map((d) => d.reg_category).filter(Boolean))
    ) as string[];
    return list.sort();
  }, [delegates]);

  // Unique Cities
  const availableCities = useMemo(() => {
    const list = Array.from(
      new Set(
        delegates
          .map((d) => (d.city ? d.city.trim() : ""))
          .filter((c) => c.length > 0)
      )
    );
    return list.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
  }, [delegates]);

  // Filtered Delegates
  const filteredDelegates = useMemo(() => {
    return delegates.filter((d) => {
      const fullName = `${d.salutation ? d.salutation + " " : ""}${d.first_name || ""} ${d.last_name || ""}`.toLowerCase();
      const term = search.toLowerCase().trim();

      const matchesSearch =
        !term ||
        fullName.includes(term) ||
        (d.email && d.email.toLowerCase().includes(term)) ||
        (d.phone && d.phone.includes(term)) ||
        (d.city && d.city.toLowerCase().includes(term)) ||
        (d.state && d.state.toLowerCase().includes(term)) ||
        (d.registration_id && d.registration_id.toLowerCase().includes(term)) ||
        (d.reg_category && d.reg_category.toLowerCase().includes(term)) ||
        (d.mci_no && d.mci_no.toLowerCase().includes(term)) ||
        (d.transaction_id && d.transaction_id.toLowerCase().includes(term)) ||
        (d.remarks && d.remarks.toLowerCase().includes(term));

      const matchesCategory =
        categoryFilter === "All" ||
        (categoryFilter === "Uncategorized"
          ? !d.reg_category
          : d.reg_category?.toLowerCase() === categoryFilter.toLowerCase());

      const matchesCity =
        cityFilter === "All" ||
        d.city?.toLowerCase().trim() === cityFilter.toLowerCase().trim();

      return matchesSearch && matchesCategory && matchesCity;
    });
  }, [delegates, search, categoryFilter, cityFilter]);

  // Reset to first page whenever search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, categoryFilter, cityFilter]);

  // Total pages and paginated records
  const totalPages = Math.ceil(filteredDelegates.length / pageSize) || 1;
  const paginatedDelegates = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredDelegates.slice(startIndex, startIndex + pageSize);
  }, [filteredDelegates, currentPage, pageSize]);

  // Metrics calculation
  const metrics = useMemo(() => {
    const total = delegates.length;
    const facultyCount = delegates.filter(
      (d) => d.reg_category?.toUpperCase() === "FACULTY"
    ).length;
    const delegateCount = delegates.filter(
      (d) => d.reg_category?.toUpperCase() === "DELEGATE"
    ).length;
    const ocCount = delegates.filter(
      (d) => d.reg_category?.toLowerCase().includes("organizing")
    ).length;

    const totalCollected = delegates.reduce((sum, d) => {
      return sum + (typeof d.total_amount === "number" ? d.total_amount : 0);
    }, 0);

    const paidCount = delegates.filter(
      (d) => typeof d.total_amount === "number" && d.total_amount > 0
    ).length;

    const uniqueCities = new Set(
      delegates.map((d) => d.city?.toLowerCase().trim()).filter(Boolean)
    ).size;

    return {
      total,
      facultyCount,
      delegateCount,
      ocCount,
      totalCollected,
      paidCount,
      uniqueCities,
    };
  }, [delegates]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatDate = (isoString?: string | null) => {
    if (!isoString) return "-";
    try {
      const date = new Date(isoString);
      if (isNaN(date.getTime())) return isoString;
      return date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return isoString;
    }
  };


  const getCategoryBadge = (cat?: string | null) => {
    if (!cat) {
      return (
        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
          Unassigned
        </span>
      );
    }

    const c = cat.toUpperCase();
    if (c === "DELEGATE") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-sky-50 text-sky-700 border border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800">
          <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
          Delegate
        </span>
      );
    }
    if (c === "FACULTY") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
          Faculty
        </span>
      );
    }
    if (c.includes("ORGANIZING")) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#faedf5] text-[#AA2D7B] border border-[#AA2D7B]/30 dark:bg-[#55355E]/30 dark:text-[#f5d8e9] dark:border-[#AA2D7B]/50">
          <span className="w-1.5 h-1.5 rounded-full bg-[#AA2D7B]" />
          Organizing Committee
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300">
        {cat}
      </span>
    );
  };

  const exportToCSV = () => {
    const headers = [
      "ID",
      "Registration ID",
      "Salutation",
      "First Name",
      "Last Name",
      "Full Name",
      "Email",
      "Phone",
      "City",
      "State",
      "Country",
      "Category",
      "Total Amount (INR)",
      "Payment Mode",
      "Transaction ID",
      "MCI No",
      "Registration Date",
      "Payment Date",
      "Remarks",
      "QR Code URL",
    ];

    const rows = filteredDelegates.map((d) => [
      d.id,
      `"${d.registration_id || ""}"`,
      `"${d.salutation || ""}"`,
      `"${d.first_name || ""}"`,
      `"${d.last_name || ""}"`,
      `"${(d.salutation ? d.salutation + " " : "") + (d.first_name || "") + " " + (d.last_name || "")}".trim()`,
      `"${d.email || ""}"`,
      `"${d.phone || ""}"`,
      `"${d.city || ""}"`,
      `"${d.state || ""}"`,
      `"${d.country || ""}"`,
      `"${d.reg_category || ""}"`,
      d.total_amount ?? "",
      `"${d.payment_mode || ""}"`,
      `"${d.transaction_id || ""}"`,
      `"${d.mci_no || ""}"`,
      `"${d.registration_date || ""}"`,
      `"${d.payment_date || ""}"`,
      `"${d.remarks || ""}"`,
      `"${d.qr_code_url ? `${BASE_URL}${d.qr_code_url}` : ""}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `kaizencon_delegates_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <PageMeta
        title="Delegates Management | Kaizen Con 2027"
        description="View registered delegates, faculty members, organizing committee, MCI numbers, and transactions."
      />

      <AdminPageContainer
        title="Delegates & Faculty Directory"
        subtitle="Manage conference registrations, faculty members, organizing committee, payment records, and delegate QR badges."
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by name, email, phone, reg ID, MCI, transaction, city, remarks..."
        actionButton={
          <div className="flex items-center flex-wrap gap-2">
            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:outline-none focus:border-[#AA2D7B]"
            >
              <option value="All">All Categories ({delegates.length})</option>
              {availableCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
              <option value="Uncategorized">Unassigned</option>
            </select>

            {/* City Filter */}
            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:outline-none focus:border-[#AA2D7B] max-w-[140px] truncate"
            >
              <option value="All">All Cities</option>
              {availableCities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            {/* Export CSV Button */}
            <button
              onClick={exportToCSV}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg shadow-2xs transition-colors cursor-pointer"
              title="Export delegates data to CSV"
            >
              <svg
                className="w-3.5 h-3.5 text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              Export CSV
            </button>

            {/* Refresh Live API */}
            <button
              onClick={fetchDelegatesData}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#AA2D7B] hover:bg-[#D85A9A] rounded-lg shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              title="Refresh from http://192.168.29.201:8000/api/delegates"
            >
              <svg
                className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              {loading ? "Fetching..." : "Refresh API"}
            </button>
          </div>
        }
      >
        {/* API Status Banner */}
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-3.5 py-2 rounded-lg bg-gray-50 dark:bg-gray-800/60 border border-gray-200/80 dark:border-gray-700/80 text-xs">
          <div className="flex items-center gap-2">
            
           
            {error && (
              <span className="text-amber-600 dark:text-amber-400 text-[11px] truncate max-w-xs">
                ({error})
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400 text-[11px]">
            <span>
              Displaying <b>{filteredDelegates.length}</b> of <b>{delegates.length}</b> total delegates
            </span>
          </div>
        </div>

        {/* Top Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
          {/* Total Registrations */}
          <div className="p-3.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800/50 shadow-2xs">
            <div className="text-[11px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Total Registrations
            </div>
            <div className="text-xl font-extrabold text-gray-900 dark:text-white mt-1">
              {metrics.total}
            </div>
            <div className="text-[11px] text-[#AA2D7B] font-medium mt-0.5">
              Across {metrics.uniqueCities} cities
            </div>
          </div>

          {/* Delegates (Paid Attendees) */}
          <div className="p-3.5 rounded-xl border border-sky-100 dark:border-sky-950/40 bg-sky-50/30 dark:bg-sky-950/20 shadow-2xs">
            <div className="text-[11px] font-medium text-sky-700 dark:text-sky-300 uppercase tracking-wider">
              Delegates
            </div>
            <div className="text-xl font-extrabold text-sky-700 dark:text-sky-200 mt-1">
              {metrics.delegateCount}
            </div>
            <div className="text-[11px] text-sky-600 dark:text-sky-400 mt-0.5">
              Conference participants
            </div>
          </div>

          {/* Faculty Members */}
          <div className="p-3.5 rounded-xl border border-purple-100 dark:border-purple-950/40 bg-purple-50/30 dark:bg-purple-950/20 shadow-2xs">
            <div className="text-[11px] font-medium text-purple-700 dark:text-purple-300 uppercase tracking-wider">
              Faculty Experts
            </div>
            <div className="text-xl font-extrabold text-purple-700 dark:text-purple-200 mt-1">
              {metrics.facultyCount}
            </div>
            <div className="text-[11px] text-purple-600 dark:text-purple-400 mt-0.5">
              Guest lecturers & faculty
            </div>
          </div>

          {/* Organizing Committee */}
          <div className="p-3.5 rounded-xl border border-pink-100 dark:border-pink-950/40 bg-[#faedf5]/30 dark:bg-[#55355E]/20 shadow-2xs">
            <div className="text-[11px] font-medium text-[#AA2D7B] dark:text-pink-300 uppercase tracking-wider">
              Org. Committee
            </div>
            <div className="text-xl font-extrabold text-[#AA2D7B] dark:text-pink-200 mt-1">
              {metrics.ocCount}
            </div>
            <div className="text-[11px] text-[#55355E] dark:text-pink-400 mt-0.5">
              Leadership & OC members
            </div>
          </div>
        </div>

        {/* Loading Spinner */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-8 h-8 border-3 border-[#AA2D7B] border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-gray-500">Loading delegates data from API...</span>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredDelegates.length === 0 && (
          <div className="text-center py-16 text-gray-500 text-sm">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400">
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
            <div className="font-semibold text-gray-800 dark:text-gray-200">
              No delegates matched the search criteria
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Try clearing filters or search term to see all conference delegates.
            </p>
            <button
              onClick={() => {
                setSearch("");
                setCategoryFilter("All");
                setCityFilter("All");
              }}
              className="mt-3 px-3 py-1.5 text-xs font-semibold text-[#AA2D7B] hover:underline cursor-pointer"
            >
              Reset all filters
            </button>
          </div>
        )}

        {/* Delegates Table */}
        {!loading && filteredDelegates.length > 0 && (
          <div className="overflow-x-auto border border-gray-200 dark:border-gray-800 rounded-xl shadow-2xs">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-300 font-bold uppercase tracking-wider text-[11px] bg-gray-50/80 dark:bg-gray-800/60">
                  <th className="py-3 px-4">Reg ID & QR</th>
                  <th className="py-3 px-4">Delegate Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Contact Details</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">MCI No.</th>
                  <th className="py-3 px-4">Reg. Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800 bg-white dark:bg-gray-900">
                {paginatedDelegates.map((delegate) => {
                  const salutation = delegate.salutation ? `${delegate.salutation} ` : "";
                  const fullName = `${salutation}${delegate.first_name || ""} ${delegate.last_name || ""}`.trim();
                  const initials = `${(delegate.first_name || "D").charAt(0)}${(delegate.last_name || "C").charAt(0)}`.toUpperCase();
                  const fullQrUrl = delegate.qr_code_url
                    ? `${BASE_URL}${delegate.qr_code_url}`
                    : null;

                  return (
                    <tr
                      key={delegate.id}
                      className="hover:bg-[#faedf5]/25 dark:hover:bg-gray-800/40 transition-colors"
                    >
                      {/* Registration ID & QR Button */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span
                            className="font-mono text-[11px] font-bold text-[#55355E] dark:text-[#f5d8e9] bg-[#faedf5]/80 dark:bg-[#55355E]/40 px-2 py-0.5 rounded border border-[#AA2D7B]/20"
                            title={delegate.registration_id}
                          >
                            {delegate.registration_id}
                          </span>
                          <button
                            onClick={() =>
                              copyToClipboard(delegate.registration_id, delegate.registration_id)
                            }
                            className="text-gray-400 hover:text-[#AA2D7B] transition-colors p-1"
                            title="Copy Registration ID"
                          >
                            {copiedId === delegate.registration_id ? (
                              <span className="text-[10px] font-bold text-emerald-600">Copied</span>
                            ) : (
                              <svg
                                className="w-3.5 h-3.5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth="2"
                              >
                                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                              </svg>
                            )}
                          </button>

                          {/* Quick QR Icon Button */}
                          {fullQrUrl && (
                            <button
                              onClick={() => setQrModalDelegate(delegate)}
                              className="text-gray-400 hover:text-[#55355E] dark:hover:text-[#f5d8e9] p-1 transition-colors"
                              title="View & Print QR Code"
                            >
                              <svg
                                className="w-3.5 h-3.5"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                              >
                                <rect x="3" y="3" width="7" height="7" />
                                <rect x="14" y="3" width="7" height="7" />
                                <rect x="14" y="14" width="7" height="7" />
                                <rect x="3" y="14" width="7" height="7" />
                              </svg>
                            </button>
                          )}
                        </div>
                        <div className="text-[10px] text-gray-400 font-mono mt-0.5">
                          ID: #{delegate.id}
                        </div>
                      </td>

                      {/* Delegate Name & Salutation */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#55355E] to-[#AA2D7B] text-white flex items-center justify-center font-bold text-xs uppercase shadow-xs shrink-0">
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-gray-900 dark:text-gray-100 truncate text-[13px]">
                              {fullName}
                            </div>
                            {delegate.remarks && (
                              <div
                                className="text-[10px] text-amber-700 dark:text-amber-300 font-medium truncate max-w-[180px]"
                                title={delegate.remarks}
                              >
                                ✎ {delegate.remarks}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Category Badge */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {getCategoryBadge(delegate.reg_category)}
                      </td>

                      {/* Contact Details (Email + Phone) */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="text-[11px] text-gray-700 dark:text-gray-300 font-medium">
                          <a
                            href={`mailto:${delegate.email}`}
                            className="hover:text-[#AA2D7B] hover:underline"
                          >
                            {delegate.email}
                          </a>
                        </div>
                        <div className="text-[10px] text-gray-500 font-mono">
                          <a href={`tel:${delegate.phone}`} className="hover:text-gray-800">
                            {delegate.phone}
                          </a>
                        </div>
                      </td>

                      {/* Location (City & State) */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-medium text-gray-800 dark:text-gray-200">
                          {delegate.city || "-"}
                        </div>
                        <div className="text-[10px] text-gray-400">
                          {delegate.state ? `${delegate.state}, ` : ""}
                          {delegate.country}
                        </div>
                      </td>

                      {/* MCI Registration No */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {delegate.mci_no ? (
                          <span className="font-mono text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                            {delegate.mci_no}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-[11px]">-</span>
                        )}
                      </td>

                      {/* Registration Date */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-gray-600 dark:text-gray-400 text-[11px]">
                        {formatDate(delegate.registration_date)}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => setSelectedDelegate(delegate)}
                          className="px-2.5 py-1 text-xs font-semibold text-[#AA2D7B] hover:text-[#55355E] dark:hover:text-[#D85A9A] bg-[#faedf5]/70 hover:bg-[#faedf5] dark:bg-gray-800 rounded transition-colors cursor-pointer"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Pagination Controls Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 bg-gray-50/80 dark:bg-gray-800/60 border-t border-gray-200 dark:border-gray-800 text-xs">
              {/* Left: Showing Range and Page Size */}
              <div className="flex flex-wrap items-center gap-3 text-gray-600 dark:text-gray-400">
                <span>
                  Showing{" "}
                  <span className="font-bold text-gray-900 dark:text-white">
                    {filteredDelegates.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}
                  </span>{" "}
                  to{" "}
                  <span className="font-bold text-gray-900 dark:text-white">
                    {Math.min(currentPage * pageSize, filteredDelegates.length)}
                  </span>{" "}
                  of{" "}
                  <span className="font-bold text-gray-900 dark:text-white">
                    {filteredDelegates.length}
                  </span>{" "}
                  delegates
                </span>

                <div className="flex items-center gap-1.5 ml-2">
                  <span className="text-[11px] text-gray-500">Show:</span>
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="px-2 py-1 text-xs border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:outline-none focus:border-[#AA2D7B] cursor-pointer"
                  >
                    <option value={10}>10 per page</option>
                    <option value={20}>20 per page</option>
                    <option value={50}>50 per page</option>
                    <option value={100}>100 per page</option>
                  </select>
                </div>
              </div>

              {/* Right: Page Navigation Buttons */}
              {totalPages > 1 && (
                <div className="flex items-center gap-1">
                  {/* First Page */}
                  <button
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    className="px-2 py-1 rounded border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    title="First Page"
                  >
                    «
                  </button>

                  {/* Previous Page */}
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-2.5 py-1 rounded border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    title="Previous Page"
                  >
                    ‹ Prev
                  </button>

                  {/* Page Numbers */}
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((page) => {
                      return (
                        page === 1 ||
                        page === totalPages ||
                        Math.abs(page - currentPage) <= 1
                      );
                    })
                    .map((page, idx, arr) => {
                      const prev = arr[idx - 1];
                      const showEllipsis = prev && page - prev > 1;

                      return (
                        <Fragment key={page}>
                          {showEllipsis && (
                            <span className="px-1 text-gray-400">...</span>
                          )}
                          <button
                            onClick={() => setCurrentPage(page)}
                            className={`min-w-[28px] h-7 px-2 rounded font-medium transition-colors cursor-pointer ${
                              currentPage === page
                                ? "bg-[#AA2D7B] text-white font-bold shadow-xs"
                                : "border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                            }`}
                          >
                            {page}
                          </button>
                        </Fragment>
                      );
                    })}

                  {/* Next Page */}
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-2.5 py-1 rounded border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    title="Next Page"
                  >
                    Next ›
                  </button>

                  {/* Last Page */}
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                    className="px-2 py-1 rounded border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    title="Last Page"
                  >
                    »
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </AdminPageContainer>

      {/* Comprehensive Delegate Profile & Badge Modal */}
      {selectedDelegate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-[#faedf5]/30 dark:bg-gray-800/40">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-[#55355E] to-[#AA2D7B] text-white flex items-center justify-center font-bold text-base uppercase shadow-xs">
                  {(selectedDelegate.first_name || "D").charAt(0)}
                  {(selectedDelegate.last_name || "C").charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-gray-900 dark:text-white">
                      {selectedDelegate.salutation ? `${selectedDelegate.salutation} ` : ""}
                      {selectedDelegate.first_name} {selectedDelegate.last_name}
                    </h3>
                    {getCategoryBadge(selectedDelegate.reg_category)}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Registration ID:{" "}
                    <span className="font-mono font-bold text-[#AA2D7B]">
                      {selectedDelegate.registration_id}
                    </span>{" "}
                    • Database ID: #{selectedDelegate.id}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedDelegate(null)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-base"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Top Banner: QR Code & Key Highlights */}
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700/80 flex flex-col sm:flex-row items-center gap-5">
                {/* QR Code Preview */}
                <div className="flex flex-col items-center justify-center p-2.5 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-2xs shrink-0">
                  {selectedDelegate.qr_code_url ? (
                    <img
                      src={`${BASE_URL}${selectedDelegate.qr_code_url}`}
                      alt={`QR Code for ${selectedDelegate.registration_id}`}
                      className="w-28 h-28 object-contain"
                      onError={(e) => {
                        // Fallback placeholder if backend QR image isn't live
                        (e.currentTarget as HTMLElement).style.display = "none";
                        const parent = (e.currentTarget as HTMLElement).parentElement;
                        if (parent) {
                          const fallbackDiv = document.createElement("div");
                          fallbackDiv.className =
                            "w-28 h-28 flex flex-col items-center justify-center text-center p-2 text-gray-400 text-[10px]";
                          fallbackDiv.innerHTML = `<span>[QR Code]</span><span class="font-mono font-bold mt-1 text-[#AA2D7B]">${selectedDelegate.registration_id}</span>`;
                          parent.appendChild(fallbackDiv);
                        }
                      }}
                    />
                  ) : (
                    <div className="w-28 h-28 flex items-center justify-center text-gray-400 text-xs">
                      No QR
                    </div>
                  )}
                  <span className="text-[10px] font-mono text-gray-500 font-semibold mt-1">
                    {selectedDelegate.registration_id}
                  </span>
                </div>

                {/* Registration Details */}
                <div className="flex-1 space-y-2 text-xs w-full">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400 text-[11px] block">
                        Category
                      </span>
                      <span className="font-semibold text-gray-900 dark:text-white mt-0.5 block">
                        {selectedDelegate.reg_category || "Unassigned"}
                      </span>
                    </div>

                    <div>
                      <span className="text-gray-500 dark:text-gray-400 text-[11px] block">
                        MCI Registration No.
                      </span>
                      <span className="font-mono font-semibold text-emerald-700 dark:text-emerald-400 mt-0.5 block">
                        {selectedDelegate.mci_no || "Not Provided"}
                      </span>
                    </div>



                    <div>
                      <span className="text-gray-500 dark:text-gray-400 text-[11px] block">
                        Registration Date
                      </span>
                      <span className="text-gray-800 dark:text-gray-200 mt-0.5 block">
                        {formatDate(selectedDelegate.registration_date)}
                      </span>
                    </div>

                   
                  </div>

                  {selectedDelegate.remarks && (
                    <div className="mt-2 p-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-[11px]">
                      <b>Remarks:</b> {selectedDelegate.remarks}
                    </div>
                  )}
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h4 className="text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider mb-2">
                  Contact Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-lg border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
                    <span className="text-[11px] text-gray-500 dark:text-gray-400 block">
                      Email Address
                    </span>
                    <a
                      href={`mailto:${selectedDelegate.email}`}
                      className="font-medium text-[#AA2D7B] hover:underline break-all mt-0.5 block"
                    >
                      {selectedDelegate.email}
                    </a>
                  </div>

                  <div className="p-3 rounded-lg border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
                    <span className="text-[11px] text-gray-500 dark:text-gray-400 block">
                      Phone Number
                    </span>
                    <a
                      href={`tel:${selectedDelegate.phone}`}
                      className="font-medium text-gray-900 dark:text-gray-100 font-mono mt-0.5 block"
                    >
                      {selectedDelegate.phone}
                    </a>
                  </div>
                </div>
              </div>

              {/* Geographic Location */}
              <div>
                <h4 className="text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider mb-2">
                  Location
                </h4>
                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-lg border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
                    <span className="text-[11px] text-gray-500 dark:text-gray-400 block">City</span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100 mt-0.5 block">
                      {selectedDelegate.city || "-"}
                    </span>
                  </div>

                  <div className="p-3 rounded-lg border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
                    <span className="text-[11px] text-gray-500 dark:text-gray-400 block">State</span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100 mt-0.5 block">
                      {selectedDelegate.state || "-"}
                    </span>
                  </div>

                  <div className="p-3 rounded-lg border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
                    <span className="text-[11px] text-gray-500 dark:text-gray-400 block">Country</span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100 mt-0.5 block">
                      {selectedDelegate.country || "India"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Transaction & Payment Audit */}
              {selectedDelegate.transaction_id && (
                <div>
                  <h4 className="text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider mb-2">
                    Payment & Transaction Audit
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-lg border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
                      <span className="text-[11px] text-gray-500 dark:text-gray-400 block">
                        Transaction ID
                      </span>
                      <span className="font-mono font-semibold text-gray-900 dark:text-gray-100 mt-0.5 block">
                        {selectedDelegate.transaction_id}
                      </span>
                    </div>

                    <div className="p-3 rounded-lg border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
                      <span className="text-[11px] text-gray-500 dark:text-gray-400 block">
                        Payment Timestamp
                      </span>
                      <span className="text-gray-800 dark:text-gray-200 mt-0.5 block">
                        {formatDate(selectedDelegate.payment_date)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between px-6 py-3.5 border-t border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/40">
              <button
                onClick={() =>
                  copyToClipboard(
                    `${selectedDelegate.salutation ? selectedDelegate.salutation + " " : ""}${
                      selectedDelegate.first_name
                    } ${selectedDelegate.last_name} | Reg ID: ${
                      selectedDelegate.registration_id
                    } | Phone: ${selectedDelegate.phone}`,
                    "modal-copy"
                  )
                }
                className="text-xs text-gray-600 dark:text-gray-400 hover:text-[#AA2D7B] flex items-center gap-1.5"
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
                {copiedId === "modal-copy" ? "Copied Info!" : "Copy Details"}
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedDelegate(null)}
                  className="px-4 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors cursor-pointer"
                >
                  Close
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#55355E] hover:bg-[#6e4679] rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1.5"
                >
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polyline points="6 9 6 2 18 2 18 9" />
                    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                    <rect x="6" y="14" width="12" height="8" />
                  </svg>
                  Print Badge
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick QR Code Preview Modal */}
      {qrModalDelegate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden text-center p-6 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-gray-100 dark:border-gray-800">
              <span className="text-xs font-bold text-gray-800 dark:text-white uppercase tracking-wider">
                Delegate Pass QR
              </span>
              <button
                onClick={() => setQrModalDelegate(null)}
                className="text-gray-400 hover:text-gray-600 text-sm"
              >
                ✕
              </button>
            </div>

            <div>
              <div className="font-bold text-gray-900 dark:text-white text-base">
                {qrModalDelegate.salutation ? `${qrModalDelegate.salutation} ` : ""}
                {qrModalDelegate.first_name} {qrModalDelegate.last_name}
              </div>
              <div className="text-xs text-gray-500 font-mono mt-0.5">
                {qrModalDelegate.registration_id}
              </div>
              <div className="mt-1">{getCategoryBadge(qrModalDelegate.reg_category)}</div>
            </div>

            {/* QR Image */}
            <div className="flex items-center justify-center p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-inner">
              {qrModalDelegate.qr_code_url ? (
                <img
                  src={`${BASE_URL}${qrModalDelegate.qr_code_url}`}
                  alt={`QR for ${qrModalDelegate.registration_id}`}
                  className="w-44 h-44 object-contain"
                />
              ) : (
                <div className="w-44 h-44 flex items-center justify-center text-gray-400 text-xs">
                  No QR URL available
                </div>
              )}
            </div>

            <div className="text-[11px] text-gray-400">
              Present this QR at Kaizen Con 2027 registration desk for badge printing.
            </div>

            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setQrModalDelegate(null)}
                className="px-4 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#AA2D7B] hover:bg-[#D85A9A] rounded-lg transition-colors cursor-pointer"
              >
                Print Pass
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
