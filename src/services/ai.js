// services/ai.ts
import api from "@/lib/api";
/**
 * 모집글 정보를 바탕으로 인재 추천 목록을 반환
 * 서버 기대 스펙: flat body (recruitmentId + 보조 필드들)
 */
export async function recommendTalentsByRecruitment(req) {
    const body = {
        recruitmentId: req.id, // ✅ 핵심: id를 별도 키로 전달
        title: req.title,
        location: req.location,
        position: req.position,
        skills: req.skills,
        career: req.career,
        content: req.content,
    };
    // null/undefined/빈문자 제거
    Object.keys(body).forEach((k) => {
        const v = body[k];
        if (v == null || v === "")
            delete body[k];
    });
    const { data } = await api.post("/api/recommendations/users", body, { headers: { "Content-Type": "application/json" } });
    return data ?? [];
}
function normalizeUrl(raw) {
    if (!raw)
        return null;
    // 1) 공백/제로폭/기본 엔티티 정리
    let s = raw.trim()
        .replace(/[\u200B-\u200D\uFEFF]/g, "") // 제로폭 제거
        .replace(/&amp;/g, "&"); // 기본 디코딩(필요 최소만)
    if (!s)
        return null;
    // 2) k-startup 상대경로 처리: "/web/..." 만 오는 케이스
    if (s.startsWith("/web/")) {
        s = "https://www.k-startup.go.kr" + s;
    }
    // 3) 스킴 붙이기: "www.k-startup.go.kr/..." 처럼 오는 케이스
    if (s.startsWith("www."))
        s = "https://" + s;
    if (!/^https?:\/\//i.test(s))
        s = "https://" + s;
    // 4) URL 객체로 한 번 검증/정리
    try {
        const u = new URL(s);
        // (옵션) seoulstartup 같은 DNS 이슈 도메인 교정
        if (u.host.toLowerCase() === "www.seoulstartup.or.kr") {
            u.host = "seoulstartup.or.kr";
        }
        // 스페이스 등 퍼센트 인코딩
        u.pathname = u.pathname.replace(/ /g, "%20");
        return u.toString();
    }
    catch {
        // 최소한의 보정 문자열 반환
        return s;
    }
}
/** "… ~ 2025-12-31", "2025.12.31", "05/01" 등에서 날짜 뽑아 ISO로 변환 */
function parseEndDate(end) {
    if (!end)
        return { iso: null, date: null };
    const s = end.trim();
    // 상시/수시 → 마감 없음
    if (/(상시|수시|연중|상설)/.test(s))
        return { iso: null, date: null };
    // 문자열 내 날짜 후보(기간이면 뒤쪽 날짜를 종료일로 가정)
    const m = s.match(/\d{4}[.\-/]\d{1,2}[.\-/]\d{1,2}|\d{1,2}[.\-/]\d{1,2}/g);
    if (!m || m.length === 0)
        return { iso: null, date: null };
    const last = m[m.length - 1].replace(/[./]/g, "-");
    const parts = last.split("-").map(v => parseInt(v, 10));
    let y, mo, d;
    if (parts.length === 3) {
        [y, mo, d] = parts;
    }
    else if (parts.length === 2) {
        const now = new Date();
        [mo, d] = parts;
        y = now.getFullYear();
    }
    else {
        return { iso: null, date: null };
    }
    const dt = new Date(y, mo - 1, d, 23, 59, 59); // 종료일은 그날 23:59:59로 간주
    if (isNaN(dt.getTime()))
        return { iso: null, date: null };
    const iso = dt.toISOString().slice(0, 10);
    return { iso, date: dt };
}
function buildStatus(endRaw) {
    if (!endRaw || /(상시|수시|연중|상설)/.test(endRaw)) {
        return { status: "always", text: "상시 모집" };
    }
    const { iso, date } = parseEndDate(endRaw);
    if (!date)
        return { status: "unknown", text: "마감일 정보 없음" };
    const now = new Date();
    if (date >= now) {
        return { status: "ongoing", text: `~ ${iso}` };
    }
    return { status: "closed", text: `마감 ${iso}` };
}
/**
 * 지원사업·대회 추천
 * - 백엔드 응답의 스네이크/문자열 날짜/링크를 프론트 친화적으로 정규화
 * - 카드에서 바로 클릭/표시 가능 (url, status, statusText 제공)
 */
export async function recommendIncubationCenters(req) {
    // 빈 값 제거
    const body = { ...req };
    Object.keys(body).forEach((k) => {
        const v = body[k];
        if (v == null || v === "")
            delete body[k];
    });
    const { data } = await api.post("/api/recommendations/incubation-centers", body, { headers: { "Content-Type": "application/json" } });
    // 배열/페이지 응답 모두 수용
    const list = Array.isArray(data)
        ? data
        : (data?.content ?? data?.items ?? []);
    return list.map((item) => {
        const region = item.region?.trim() || "지역 미상";
        const supportField = (item["support_field"] ?? item.support_field ?? "").toString().trim() || "분야 미상";
        const endRaw = item.end_date;
        const { status, text } = buildStatus(endRaw);
        const { iso } = parseEndDate(endRaw);
        const url = normalizeUrl(item.apply_url);
        return {
            rank: item.rank,
            title: item.title,
            region,
            supportField,
            endDateRaw: endRaw,
            endDateISO: iso ?? null,
            status,
            statusText: text,
            url,
            reason: item.reason?.trim(),
        };
    });
}
/** 유틸(원하면 컴포넌트에서 직접 사용 가능) */
export const incubationUtils = {
    normalizeUrl,
    parseEndDate,
    buildStatus,
};
