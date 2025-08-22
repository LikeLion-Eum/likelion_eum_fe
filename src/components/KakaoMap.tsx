import { useEffect, useRef } from "react";
import { loadKakao } from "../lib/kakaoLoader";

type LatLng = { lat: number; lng: number };
type Marker = LatLng & { title?: string };

type Props = {
  center: LatLng;
  level?: number;
  className?: string;
  markers?: Marker[];
  onReady?: (map: any, kakao: any) => void;
};

export default function KakaoMap({ center, level = 3, className, markers = [], onReady }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const markerKey = markers.map(m => `${m.lat},${m.lng},${m.title ?? ""}`).join("|");

  useEffect(() => {
    let map: any;
    let markerObjs: any[] = [];

    loadKakao()
      .then((kakao) => {
        if (!ref.current) return;
        const options = { center: new kakao.maps.LatLng(center.lat, center.lng), level };
        map = new kakao.maps.Map(ref.current, options);

        markerObjs = markers.map((m) => {
          const marker = new kakao.maps.Marker({
            position: new kakao.maps.LatLng(m.lat, m.lng),
            title: m.title,
          });
          marker.setMap(map);
          return marker;
        });

        if (markers.length > 1) {
          const bounds = new kakao.maps.LatLngBounds();
          markers.forEach((m) => bounds.extend(new kakao.maps.LatLng(m.lat, m.lng)));
          map.setBounds(bounds, 32, 32, 32, 32);
        }

        onReady?.(map, kakao);
      })
      .catch((e) => console.error("[KakaoMap] load error:", e));

    return () => {
      markerObjs.forEach((mk) => mk.setMap(null));
    };
  }, [center.lat, center.lng, level, markerKey]);

  return <div ref={ref} className={className ?? "h-64 w-full rounded-xl border border-[var(--c-card-border)]"} />;
}
