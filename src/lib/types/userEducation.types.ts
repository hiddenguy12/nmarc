/* بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ ﷺ InshaAllah */


export enum EducationLevel {
    PRIMARY_EDUCATION = 'Primary Education (PSC)',
    JUNIOR_SECONDARY = 'Junior Secondary (JSC)',
    SSC = 'Secondary School Certificate (SSC)',
    HSC = 'Higher Secondary Certificate (HSC)',
    DIPLOMA = 'Diploma (Technical/Vocational)',
    BACHELORS_DEGREE = `Bachelor's Degree`,
    MASTERS_DEGREE = `Master's Degree`,
    DOCTORATE = 'Doctorate (PhD)',
    RELIGIOUS = 'Religious Education',
    CERTIFICATE_COURSE = 'Certificate Course',
    TECHNICAL = 'Technical/Vocational',
    OTHER = 'Other'
}

export enum CertificateType {
    // Primary Education (Level 1)
    PSC = 'Primary School Certificate (PSC)',
    EBT = 'Ebtedayee Certificate (EBT)',

    // Junior Secondary (Level 2)
    JSC = 'Junior School Certificate',
    JDC = 'Junior Dakhil Certificate',
    JVC = 'Junior Vocational Certificate',

    // Secondary (Level 3)
    SSC_SCIENCE = 'SSC (Science)',
    SSC_HUMANITIES = 'SSC (Humanities)',
    SSC_COMMERCE = 'SSC (Commerce)',
    SSC_VOCATIONAL = 'SSC (Vocational)',
    SSC_AGRICULTURE = 'SSC (Agriculture)',
    SSC_BUSINESS = 'SSC (Business Studies)',
    DAKHIL = 'Dakhil',
    O_LEVEL = 'O Level',
    BOU_SSC = 'SSC (Bangladesh Open University)',

    // Higher Secondary (Level 4)
    HSC_SCIENCE = 'HSC (Science)',
    HSC_HUMANITIES = 'HSC (Humanities)',
    HSC_COMMERCE = 'HSC (Commerce)',
    HSC_VOCATIONAL = 'HSC (Vocational)',
    HSC_AGRICULTURE = 'HSC (Agriculture)',
    HSC_BUSINESS = 'HSC (Business Studies)',
    HSC_BM = 'HSC (Business Management)',
    HSC_TRADE = 'HSC (Trade)',
    ALIM = 'Alim',
    A_LEVEL = 'A Level',
    BOU_HSC = 'HSC (Bangladesh Open University)',

    // Diploma (Level 5)
    DIPLOMA_ENGINEERING = 'Diploma in Engineering',
    DIPLOMA_NURSING = 'Diploma in Nursing',
    DIPLOMA_MEDICAL = 'Diploma in Medical Technology',
    DIPLOMA_MARINE = 'Diploma in Marine Technology',
    DIPLOMA_AGRICULTURE = 'Diploma in Agriculture',
    DIPLOMA_TEXTILE = 'Diploma in Textile Engineering',
    DIPLOMA_COMPUTER = 'Diploma in Computer Science',
    DIPLOMA_ELECTRICAL = 'Diploma in Electrical Engineering',
    DIPLOMA_MECHANICAL = 'Diploma in Mechanical Engineering',
    DIPLOMA_ARCHITECTURE = 'Diploma in Architecture',
    DIPLOMA_SURVEYING = 'Diploma in Surveying',
    DIPLOMA_FISHERIES = 'Diploma in Fisheries',
    DIPLOMA_FORESTRY = 'Diploma in Forestry',
    DIPLOMA_LIVESTOCK = 'Diploma in Livestock',
    DIPLOMA_TOURISM = 'Diploma in Tourism and Hospitality Management',
    DIPLOMA_COMMERCE = 'Diploma in Commerce',
    DIPLOMA_MIDWIFERY = 'Diploma in Midwifery',
    DIPLOMA_DENTAL = 'Diploma in Dental Technology',
    DIPLOMA_LAB = 'Diploma in Laboratory Medicine',

    // Bachelor's Degree (Level 6)
    BSC = 'Bachelor of Science (BSc)',
    BA = 'Bachelor of Arts (BA)',
    BCOM = 'Bachelor of Commerce (BCom)',
    BBA = 'Bachelor of Business Administration (BBA)',
    MBBS = 'Bachelor of Medicine and Surgery (MBBS)',
    BDS = 'Bachelor of Dental Surgery (BDS)',
    BSC_ENGINEERING = 'Bachelor of Science in Engineering (BSc Engg.)',
    CSE = 'Bachelor of Computer Science & Engineering (CSE)',
    EEE = 'Bachelor of Electrical & Electronic Engineering (EEE)',
    CIVIL = 'Bachelor of Civil Engineering',
    MECHANICAL = 'Bachelor of Mechanical Engineering',
    ARCHITECTURE = 'Bachelor of Architecture',
    PHARMACY = 'Bachelor of Pharmacy',
    BSC_AGRICULTURE = 'Bachelor of Science in Agriculture (BSc Ag.)',
    LLB = 'Bachelor of Laws (LLB)',
    BFA = 'Bachelor of Fine Arts (BFA)',
    BSS = 'Bachelor of Social Science (BSS)',
    BSC_TEXTILE = 'Bachelor of Science in Textile Engineering',
    BSC_IT = 'Bachelor of Science in Information Technology',
    BSC_NURSING = 'Bachelor of Science in Nursing',
    BSC_FISHERIES = 'Bachelor of Science in Fisheries',
    BSC_FORESTRY = 'Bachelor of Science in Forestry',
    BSC_HOME_ECONOMICS = 'Bachelor of Science in Home Economics',
    BSC_STATISTICS = 'Bachelor of Science in Statistics',
    BSC_MATHEMATICS = 'Bachelor of Science in Mathematics',
    BSC_PHYSICS = 'Bachelor of Science in Physics',
    BSC_CHEMISTRY = 'Bachelor of Science in Chemistry',
    BSC_BOTANY = 'Bachelor of Science in Botany',
    BSC_ZOOLOGY = 'Bachelor of Science in Zoology',
    BAMS = 'Bachelor of Ayurvedic Medicine and Surgery',
    BUMS = 'Bachelor of Unani Medicine and Surgery',
    BHMS = 'Bachelor of Homeopathic Medicine and Surgery',
    BOU_BBA = 'BBA (Bangladesh Open University)',
    FAZIL = 'Fazil',

    // Master's Degree (Level 7)
    MSC = 'Master of Science (MSc)',
    MA = 'Master of Arts (MA)',
    MCOM = 'Master of Commerce (MCom)',
    MBA = 'Master of Business Administration (MBA)',
    MCA = 'Master of Computer Applications (MCA)',
    MED = 'Master of Education (MEd)',
    LLM = 'Master of Laws (LLM)',
    MSS = 'Master of Social Science (MSS)',
    MSC_ENGINEERING = 'Master of Science in Engineering',
    MSC_TEXTILE = 'Master of Science in Textile Engineering',
    MSC_IT = 'Master of Science in Information Technology',
    MSC_NURSING = 'Master of Science in Nursing',
    MSC_AGRICULTURE = 'Master of Science in Agriculture',
    MSC_FISHERIES = 'Master of Science in Fisheries',
    MSC_FORESTRY = 'Master of Science in Forestry',
    MSC_HOME_ECONOMICS = 'Master of Science in Home Economics',
    MPHARM = 'Master of Pharmacy',
    MPH = 'Master of Public Health',
    BOU_MBA = 'MBA (Bangladesh Open University)',
    KAMIL = 'Kamil',

    // Doctorate (Level 8)
    PHD_SCIENCE = 'PhD in Science',
    PHD_ARTS = 'PhD in Arts',
    PHD_ENGINEERING = 'PhD in Engineering',
    PHD_MEDICAL = 'PhD in Medical Science',
    PHD_BUSINESS = 'PhD in Business',
    PHD_LAW = 'PhD in Law',
    PHD_EDUCATION = 'PhD in Education',
    PHD_SOCIAL_SCIENCE = 'PhD in Social Science',

    // Professional Certifications
    CA = 'Chartered Accountant (CA)',
    CMA = 'Cost and Management Accountant (CMA)',
    ACCA = 'Association of Chartered Certified Accountants (ACCA)',
    FCPS = 'Fellow of the College of Physicians and Surgeons',
    MCPS = 'Member of the College of Physicians and Surgeons',
    FRCS = 'Fellow of the Royal College of Surgeons',
    MRCP = 'Member of the Royal College of Physicians',
    PMP = 'Project Management Professional',
    CCNA = 'Cisco Certified Network Associate',
    CCNP = 'Cisco Certified Network Professional',
    OCP = 'Oracle Certified Professional',

    // Religious Education
    HAFEZ = 'Hafez (Memorizer of the Quran)',
    QARI = 'Qari (Reciter of the Quran with Tajweed)',
    TAFSIR = 'Tafsir Certificate',
    HADITH = 'Hadith Certificate',
    MOKTABI = 'Moktobi Certificate',
    MUTAWASSITAH = 'Mutawassitah',
    SANAWIA_AMMA = 'Sanawia Amma',
    SANAWIA_KHASSA = 'Sanawia Khassa',
    TAKMIL = 'Takmil',

    // Technical/Vocational
    NTVQF_1 = 'NTVQF Level 1',
    NTVQF_2 = 'NTVQF Level 2',
    NTVQF_3 = 'NTVQF Level 3',
    NTVQF_4 = 'NTVQF Level 4',
    CERTIFICATE_COMPUTER = 'Certificate in Computer Office Application',
    CERTIFICATE_DRAFTING = 'Certificate in Civil Drafting',
    CERTIFICATE_REFRIGERATION = 'Certificate in Refrigeration & Air Conditioning',

    // Others
    PROFESSIONAL_COURSE = 'Professional Course Certificate',
    VOCATIONAL_TRAINING = 'Vocational Training Certificate',
    OTHER = 'Other Certificate'
}

export interface Education {
    level: EducationLevel;
    certificate: string;
    institution: string;
    yearOfCompletion: number;
    grade?: string;
    additionalInfo?: string;
}

export interface EducationPreference {
    level: EducationLevel;
}


