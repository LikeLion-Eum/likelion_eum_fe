import { differenceInCalendarDays, isAfter, parseISO } from "date-fns";
export const dDay = (deadlineIso) => {
    if (!deadlineIso)
        return null;
    return differenceInCalendarDays(parseISO(deadlineIso), new Date());
};
export const isClosedByDeadline = (deadlineIso) => deadlineIso ? isAfter(new Date(), parseISO(deadlineIso)) : false;
export const buildQuery = (obj = {}) => Object.entries(obj)
    .filter(([, v]) => v !== undefined && v !== null && v !== "" && !(Array.isArray(v) && v.length === 0))
    .map(([k, v]) => Array.isArray(v)
    ? v.map((vv) => `${encodeURIComponent(k)}=${encodeURIComponent(vv)}`).join("&")
    : `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join("&");
