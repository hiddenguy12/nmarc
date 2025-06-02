import { CertificateType, EducationLevel } from "../types/userEducation.types"

const getEducationCertificates = (level: EducationLevel): CertificateType[] => {
    switch (level) {
        case EducationLevel.PRIMARY_EDUCATION:
            return [
                CertificateType.PSC,
                CertificateType.EBT
            ];

        case EducationLevel.JUNIOR_SECONDARY:
            return [
                CertificateType.JSC,
                CertificateType.JDC,
                CertificateType.JVC
            ];

        case EducationLevel.SSC:
            return [
                CertificateType.SSC_SCIENCE,
                CertificateType.SSC_HUMANITIES,
                CertificateType.SSC_COMMERCE,
                CertificateType.SSC_VOCATIONAL,
                CertificateType.SSC_AGRICULTURE,
                CertificateType.SSC_BUSINESS,
                CertificateType.DAKHIL,
                CertificateType.O_LEVEL,
                CertificateType.BOU_SSC
            ];

        case EducationLevel.HSC:
            return [
                CertificateType.HSC_SCIENCE,
                CertificateType.HSC_HUMANITIES,
                CertificateType.HSC_COMMERCE,
                CertificateType.HSC_VOCATIONAL,
                CertificateType.HSC_AGRICULTURE,
                CertificateType.HSC_BUSINESS,
                CertificateType.HSC_BM,
                CertificateType.HSC_TRADE,
                CertificateType.ALIM,
                CertificateType.A_LEVEL,
                CertificateType.BOU_HSC
            ];

        case EducationLevel.DIPLOMA:
            return [
                CertificateType.DIPLOMA_ENGINEERING,
                CertificateType.DIPLOMA_NURSING,
                CertificateType.DIPLOMA_MEDICAL,
                CertificateType.DIPLOMA_MARINE,
                CertificateType.DIPLOMA_AGRICULTURE,
                CertificateType.DIPLOMA_TEXTILE,
                CertificateType.DIPLOMA_COMPUTER,
                CertificateType.DIPLOMA_ELECTRICAL,
                CertificateType.DIPLOMA_MECHANICAL,
                CertificateType.DIPLOMA_ARCHITECTURE,
                CertificateType.DIPLOMA_SURVEYING,
                CertificateType.DIPLOMA_FISHERIES,
                CertificateType.DIPLOMA_FORESTRY,
                CertificateType.DIPLOMA_LIVESTOCK,
                CertificateType.DIPLOMA_TOURISM,
                CertificateType.DIPLOMA_COMMERCE,
                CertificateType.DIPLOMA_MIDWIFERY,
                CertificateType.DIPLOMA_DENTAL,
                CertificateType.DIPLOMA_LAB
            ];

        case EducationLevel.BACHELORS_DEGREE:
            return [
                CertificateType.BSC,
                CertificateType.BA,
                CertificateType.BCOM,
                CertificateType.BBA,
                CertificateType.MBBS,
                CertificateType.BDS,
                CertificateType.BSC_ENGINEERING,
                CertificateType.CSE,
                CertificateType.EEE,
                CertificateType.CIVIL,
                CertificateType.MECHANICAL,
                CertificateType.ARCHITECTURE,
                CertificateType.PHARMACY,
                CertificateType.BSC_AGRICULTURE,
                CertificateType.LLB,
                CertificateType.BFA,
                CertificateType.BSS,
                CertificateType.BSC_TEXTILE,
                CertificateType.BSC_IT,
                CertificateType.BSC_NURSING,
                CertificateType.BSC_FISHERIES,
                CertificateType.BSC_FORESTRY,
                CertificateType.BSC_HOME_ECONOMICS,
                CertificateType.BSC_STATISTICS,
                CertificateType.BSC_MATHEMATICS,
                CertificateType.BSC_PHYSICS,
                CertificateType.BSC_CHEMISTRY,
                CertificateType.BSC_BOTANY,
                CertificateType.BSC_ZOOLOGY,
                CertificateType.BAMS,
                CertificateType.BUMS,
                CertificateType.BHMS,
                CertificateType.BOU_BBA,
                CertificateType.FAZIL
            ];

        case EducationLevel.MASTERS_DEGREE:
            return [
                CertificateType.MSC,
                CertificateType.MA,
                CertificateType.MCOM,
                CertificateType.MBA,
                CertificateType.MCA,
                CertificateType.MED,
                CertificateType.LLM,
                CertificateType.MSS,
                CertificateType.MSC_ENGINEERING,
                CertificateType.MSC_TEXTILE,
                CertificateType.MSC_IT,
                CertificateType.MSC_NURSING,
                CertificateType.MSC_AGRICULTURE,
                CertificateType.MSC_FISHERIES,
                CertificateType.MSC_FORESTRY,
                CertificateType.MSC_HOME_ECONOMICS,
                CertificateType.MPHARM,
                CertificateType.MPH,
                CertificateType.BOU_MBA,
                CertificateType.KAMIL
            ];

        case EducationLevel.DOCTORATE:
            return [
                CertificateType.PHD_SCIENCE,
                CertificateType.PHD_ARTS,
                CertificateType.PHD_ENGINEERING,
                CertificateType.PHD_MEDICAL,
                CertificateType.PHD_BUSINESS,
                CertificateType.PHD_LAW,
                CertificateType.PHD_EDUCATION,
                CertificateType.PHD_SOCIAL_SCIENCE
            ];

        case EducationLevel.CERTIFICATE_COURSE:
            return [
                CertificateType.CA,
                CertificateType.CMA,
                CertificateType.ACCA,
                CertificateType.FCPS,
                CertificateType.MCPS,
                CertificateType.FRCS,
                CertificateType.MRCP,
                CertificateType.PMP,
                CertificateType.CCNA,
                CertificateType.CCNP,
                CertificateType.OCP,
                CertificateType.PROFESSIONAL_COURSE,
                CertificateType.VOCATIONAL_TRAINING
            ];
        
        case EducationLevel.RELIGIOUS:
            return [
                CertificateType.HAFEZ,
                CertificateType.QARI,
                CertificateType.TAFSIR,
                CertificateType.HADITH,
                CertificateType.MOKTABI,
                CertificateType.MUTAWASSITAH,
                CertificateType.SANAWIA_AMMA,
                CertificateType.SANAWIA_KHASSA,
                CertificateType.TAKMIL,
            ];
        
        case EducationLevel.TECHNICAL :
            return [
                CertificateType.NTVQF_1,
                CertificateType.NTVQF_2,
                CertificateType.NTVQF_3,
                CertificateType.NTVQF_4,
                CertificateType.CERTIFICATE_COMPUTER,
                CertificateType.CERTIFICATE_DRAFTING,
                CertificateType.CERTIFICATE_REFRIGERATION,
            ];

        case EducationLevel.OTHER:
            return [CertificateType.OTHER];
        default:
            return [];
    }
}

export default getEducationCertificates;