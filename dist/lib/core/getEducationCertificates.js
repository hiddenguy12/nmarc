"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const userEducation_types_1 = require("../types/userEducation.types");
const getEducationCertificates = (level) => {
    switch (level) {
        case userEducation_types_1.EducationLevel.PRIMARY_EDUCATION:
            return [
                userEducation_types_1.CertificateType.PSC,
                userEducation_types_1.CertificateType.EBT
            ];
        case userEducation_types_1.EducationLevel.JUNIOR_SECONDARY:
            return [
                userEducation_types_1.CertificateType.JSC,
                userEducation_types_1.CertificateType.JDC,
                userEducation_types_1.CertificateType.JVC
            ];
        case userEducation_types_1.EducationLevel.SSC:
            return [
                userEducation_types_1.CertificateType.SSC_SCIENCE,
                userEducation_types_1.CertificateType.SSC_HUMANITIES,
                userEducation_types_1.CertificateType.SSC_COMMERCE,
                userEducation_types_1.CertificateType.SSC_VOCATIONAL,
                userEducation_types_1.CertificateType.SSC_AGRICULTURE,
                userEducation_types_1.CertificateType.SSC_BUSINESS,
                userEducation_types_1.CertificateType.DAKHIL,
                userEducation_types_1.CertificateType.O_LEVEL,
                userEducation_types_1.CertificateType.BOU_SSC
            ];
        case userEducation_types_1.EducationLevel.HSC:
            return [
                userEducation_types_1.CertificateType.HSC_SCIENCE,
                userEducation_types_1.CertificateType.HSC_HUMANITIES,
                userEducation_types_1.CertificateType.HSC_COMMERCE,
                userEducation_types_1.CertificateType.HSC_VOCATIONAL,
                userEducation_types_1.CertificateType.HSC_AGRICULTURE,
                userEducation_types_1.CertificateType.HSC_BUSINESS,
                userEducation_types_1.CertificateType.HSC_BM,
                userEducation_types_1.CertificateType.HSC_TRADE,
                userEducation_types_1.CertificateType.ALIM,
                userEducation_types_1.CertificateType.A_LEVEL,
                userEducation_types_1.CertificateType.BOU_HSC
            ];
        case userEducation_types_1.EducationLevel.DIPLOMA:
            return [
                userEducation_types_1.CertificateType.DIPLOMA_ENGINEERING,
                userEducation_types_1.CertificateType.DIPLOMA_NURSING,
                userEducation_types_1.CertificateType.DIPLOMA_MEDICAL,
                userEducation_types_1.CertificateType.DIPLOMA_MARINE,
                userEducation_types_1.CertificateType.DIPLOMA_AGRICULTURE,
                userEducation_types_1.CertificateType.DIPLOMA_TEXTILE,
                userEducation_types_1.CertificateType.DIPLOMA_COMPUTER,
                userEducation_types_1.CertificateType.DIPLOMA_ELECTRICAL,
                userEducation_types_1.CertificateType.DIPLOMA_MECHANICAL,
                userEducation_types_1.CertificateType.DIPLOMA_ARCHITECTURE,
                userEducation_types_1.CertificateType.DIPLOMA_SURVEYING,
                userEducation_types_1.CertificateType.DIPLOMA_FISHERIES,
                userEducation_types_1.CertificateType.DIPLOMA_FORESTRY,
                userEducation_types_1.CertificateType.DIPLOMA_LIVESTOCK,
                userEducation_types_1.CertificateType.DIPLOMA_TOURISM,
                userEducation_types_1.CertificateType.DIPLOMA_COMMERCE,
                userEducation_types_1.CertificateType.DIPLOMA_MIDWIFERY,
                userEducation_types_1.CertificateType.DIPLOMA_DENTAL,
                userEducation_types_1.CertificateType.DIPLOMA_LAB
            ];
        case userEducation_types_1.EducationLevel.BACHELORS_DEGREE:
            return [
                userEducation_types_1.CertificateType.BSC,
                userEducation_types_1.CertificateType.BA,
                userEducation_types_1.CertificateType.BCOM,
                userEducation_types_1.CertificateType.BBA,
                userEducation_types_1.CertificateType.MBBS,
                userEducation_types_1.CertificateType.BDS,
                userEducation_types_1.CertificateType.BSC_ENGINEERING,
                userEducation_types_1.CertificateType.CSE,
                userEducation_types_1.CertificateType.EEE,
                userEducation_types_1.CertificateType.CIVIL,
                userEducation_types_1.CertificateType.MECHANICAL,
                userEducation_types_1.CertificateType.ARCHITECTURE,
                userEducation_types_1.CertificateType.PHARMACY,
                userEducation_types_1.CertificateType.BSC_AGRICULTURE,
                userEducation_types_1.CertificateType.LLB,
                userEducation_types_1.CertificateType.BFA,
                userEducation_types_1.CertificateType.BSS,
                userEducation_types_1.CertificateType.BSC_TEXTILE,
                userEducation_types_1.CertificateType.BSC_IT,
                userEducation_types_1.CertificateType.BSC_NURSING,
                userEducation_types_1.CertificateType.BSC_FISHERIES,
                userEducation_types_1.CertificateType.BSC_FORESTRY,
                userEducation_types_1.CertificateType.BSC_HOME_ECONOMICS,
                userEducation_types_1.CertificateType.BSC_STATISTICS,
                userEducation_types_1.CertificateType.BSC_MATHEMATICS,
                userEducation_types_1.CertificateType.BSC_PHYSICS,
                userEducation_types_1.CertificateType.BSC_CHEMISTRY,
                userEducation_types_1.CertificateType.BSC_BOTANY,
                userEducation_types_1.CertificateType.BSC_ZOOLOGY,
                userEducation_types_1.CertificateType.BAMS,
                userEducation_types_1.CertificateType.BUMS,
                userEducation_types_1.CertificateType.BHMS,
                userEducation_types_1.CertificateType.BOU_BBA,
                userEducation_types_1.CertificateType.FAZIL
            ];
        case userEducation_types_1.EducationLevel.MASTERS_DEGREE:
            return [
                userEducation_types_1.CertificateType.MSC,
                userEducation_types_1.CertificateType.MA,
                userEducation_types_1.CertificateType.MCOM,
                userEducation_types_1.CertificateType.MBA,
                userEducation_types_1.CertificateType.MCA,
                userEducation_types_1.CertificateType.MED,
                userEducation_types_1.CertificateType.LLM,
                userEducation_types_1.CertificateType.MSS,
                userEducation_types_1.CertificateType.MSC_ENGINEERING,
                userEducation_types_1.CertificateType.MSC_TEXTILE,
                userEducation_types_1.CertificateType.MSC_IT,
                userEducation_types_1.CertificateType.MSC_NURSING,
                userEducation_types_1.CertificateType.MSC_AGRICULTURE,
                userEducation_types_1.CertificateType.MSC_FISHERIES,
                userEducation_types_1.CertificateType.MSC_FORESTRY,
                userEducation_types_1.CertificateType.MSC_HOME_ECONOMICS,
                userEducation_types_1.CertificateType.MPHARM,
                userEducation_types_1.CertificateType.MPH,
                userEducation_types_1.CertificateType.BOU_MBA,
                userEducation_types_1.CertificateType.KAMIL
            ];
        case userEducation_types_1.EducationLevel.DOCTORATE:
            return [
                userEducation_types_1.CertificateType.PHD_SCIENCE,
                userEducation_types_1.CertificateType.PHD_ARTS,
                userEducation_types_1.CertificateType.PHD_ENGINEERING,
                userEducation_types_1.CertificateType.PHD_MEDICAL,
                userEducation_types_1.CertificateType.PHD_BUSINESS,
                userEducation_types_1.CertificateType.PHD_LAW,
                userEducation_types_1.CertificateType.PHD_EDUCATION,
                userEducation_types_1.CertificateType.PHD_SOCIAL_SCIENCE
            ];
        case userEducation_types_1.EducationLevel.CERTIFICATE_COURSE:
            return [
                userEducation_types_1.CertificateType.CA,
                userEducation_types_1.CertificateType.CMA,
                userEducation_types_1.CertificateType.ACCA,
                userEducation_types_1.CertificateType.FCPS,
                userEducation_types_1.CertificateType.MCPS,
                userEducation_types_1.CertificateType.FRCS,
                userEducation_types_1.CertificateType.MRCP,
                userEducation_types_1.CertificateType.PMP,
                userEducation_types_1.CertificateType.CCNA,
                userEducation_types_1.CertificateType.CCNP,
                userEducation_types_1.CertificateType.OCP,
                userEducation_types_1.CertificateType.PROFESSIONAL_COURSE,
                userEducation_types_1.CertificateType.VOCATIONAL_TRAINING
            ];
        case userEducation_types_1.EducationLevel.RELIGIOUS:
            return [
                userEducation_types_1.CertificateType.HAFEZ,
                userEducation_types_1.CertificateType.QARI,
                userEducation_types_1.CertificateType.TAFSIR,
                userEducation_types_1.CertificateType.HADITH,
                userEducation_types_1.CertificateType.MOKTABI,
                userEducation_types_1.CertificateType.MUTAWASSITAH,
                userEducation_types_1.CertificateType.SANAWIA_AMMA,
                userEducation_types_1.CertificateType.SANAWIA_KHASSA,
                userEducation_types_1.CertificateType.TAKMIL,
            ];
        case userEducation_types_1.EducationLevel.TECHNICAL:
            return [
                userEducation_types_1.CertificateType.NTVQF_1,
                userEducation_types_1.CertificateType.NTVQF_2,
                userEducation_types_1.CertificateType.NTVQF_3,
                userEducation_types_1.CertificateType.NTVQF_4,
                userEducation_types_1.CertificateType.CERTIFICATE_COMPUTER,
                userEducation_types_1.CertificateType.CERTIFICATE_DRAFTING,
                userEducation_types_1.CertificateType.CERTIFICATE_REFRIGERATION,
            ];
        case userEducation_types_1.EducationLevel.OTHER:
            return [userEducation_types_1.CertificateType.OTHER];
        default:
            return [];
    }
};
exports.default = getEducationCertificates;
