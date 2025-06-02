"use strict";
/* بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ ﷺ InshaAllah */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MembershipRequestStatus = exports.PaymentMethod = exports.MembershipDuration = exports.MembershipTier = void 0;
// Enum for membership types
var MembershipTier;
(function (MembershipTier) {
    MembershipTier["GOLD"] = "GOLD";
    MembershipTier["DIAMOND"] = "DIAMOND";
    MembershipTier["PLATINUM"] = "PLATINUM";
})(MembershipTier || (exports.MembershipTier = MembershipTier = {}));
// Enum for membership durations
var MembershipDuration;
(function (MembershipDuration) {
    MembershipDuration[MembershipDuration["THREE_MONTHS"] = 3] = "THREE_MONTHS";
    MembershipDuration[MembershipDuration["SIX_MONTHS"] = 6] = "SIX_MONTHS";
    MembershipDuration[MembershipDuration["TWELVE_MONTHS"] = 12] = "TWELVE_MONTHS";
})(MembershipDuration || (exports.MembershipDuration = MembershipDuration = {}));
var PaymentMethod;
(function (PaymentMethod) {
    PaymentMethod["BKASH"] = "Bkash";
    PaymentMethod["NAGAD"] = "Nagad";
    PaymentMethod["ROCKET"] = "Rocket";
})(PaymentMethod || (exports.PaymentMethod = PaymentMethod = {}));
var MembershipRequestStatus;
(function (MembershipRequestStatus) {
    MembershipRequestStatus["PENDING"] = "pending";
    MembershipRequestStatus["APPROVED"] = "approved";
    MembershipRequestStatus["REJECTED"] = "rejected";
    MembershipRequestStatus["CANCELLED"] = "cancelled";
})(MembershipRequestStatus || (exports.MembershipRequestStatus = MembershipRequestStatus = {}));
