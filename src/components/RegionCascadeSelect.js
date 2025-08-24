import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo } from "react";
/** 시/도 -> 구/군(시) 맵 (필요시 계속 추가 가능) */
const REGIONS = {
    전체: [""],
    서울: [
        "강남구", "강동구", "강북구", "강서구", "관악구", "광진구", "구로구", "금천구", "노원구", "도봉구",
        "동대문구", "동작구", "마포구", "서대문구", "서초구", "성동구", "성북구", "송파구", "양천구", "영등포구",
        "용산구", "은평구", "종로구", "중구", "중랑구",
    ],
    경기: ["수원시", "용인시", "고양시", "성남시", "부천시", "화성시", "남양주시", "안산시", "평택시", "의정부시"],
    인천: ["중구", "동구", "미추홀구", "연수구", "남동구", "부평구", "계양구", "서구"],
    부산: ["해운대구", "수영구", "부산진구", "남구", "동래구", "사상구", "사하구", "영도구", "중구", "동구"],
    대전: ["서구", "중구", "동구", "유성구", "대덕구"],
    대구: ["중구", "동구", "서구", "남구", "북구", "수성구", "달서구", "달성군"],
    광주: ["동구", "서구", "남구", "북구", "광산구"],
    울산: ["중구", "남구", "동구", "북구", "울주군"],
    세종: ["세종시"],
    강원: ["춘천시", "원주시", "강릉시", "동해시", "속초시", "삼척시"],
    충북: ["청주시", "충주시", "제천시", "보은군", "옥천군", "괴산군", "증평군", "진천군", "음성군", "단양군"],
    충남: ["천안시", "아산시", "당진시", "서산시", "태안군", "홍성군", "예산군", "공주시", "보령시", "논산시", "부여군", "서천군", "금산군"],
    전북: ["전주시", "군산시", "익산시", "정읍시", "남원시", "김제시"],
    전남: ["목포시", "여수시", "순천시", "나주시", "광양시"],
    경북: ["포항시", "경주시", "김천시", "안동시", "구미시", "영주시", "영천시", "상주시", "문경시", "경산시"],
    경남: ["창원시", "김해시", "진주시", "양산시", "거제시", "통영시", "사천시", "밀양시"],
    제주: ["제주시", "서귀포시"],
};
/** "서울 강남구" / "충남 아산시" / "" 로 합치기 */
export function joinLocation({ si, gu }) {
    if (si && gu)
        return `${si} ${gu}`;
    return si || "";
}
export default function RegionCascadeSelect({ value, onChange, label = "지역", className }) {
    const { si, gu } = value;
    const guOptions = useMemo(() => REGIONS[si || "전체"] ?? [""], [si]);
    return (_jsxs("div", { className: `flex items-center gap-2 ${className || ""}`, children: [_jsx("span", { className: "text-sm whitespace-nowrap", children: label }), _jsx("select", { value: si, onChange: (e) => onChange({ si: e.target.value, gu: "" }), className: "h-10 rounded-lg border border-[var(--c-card-border)] bg-white px-3 text-sm", children: Object.keys(REGIONS).map((s) => (_jsx("option", { value: s === "전체" ? "" : s, children: s }, s))) }), _jsxs("select", { value: gu, onChange: (e) => onChange({ si, gu: e.target.value }), className: "h-10 rounded-lg border border-[var(--c-card-border)] bg-white px-3 text-sm", disabled: !si, children: [_jsx("option", { value: "", children: si ? "전체" : "시/도를 먼저 선택" }), guOptions
                        .filter((g) => !!g)
                        .map((g) => (_jsx("option", { value: g, children: g }, g)))] })] }));
}
