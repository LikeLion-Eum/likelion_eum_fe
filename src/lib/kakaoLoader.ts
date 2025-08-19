let kakaoReadyPromise: Promise<typeof window.kakao> | null = null;

export function loadKakao(): Promise<typeof window.kakao> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("window not available"));
  }
  if ((window as any).kakao?.maps) return Promise.resolve((window as any).kakao);

  if (!kakaoReadyPromise) {
    kakaoReadyPromise = new Promise((resolve, reject) => {
      const appkey = import.meta.env.VITE_KAKAO_API_KEY;
      if (!appkey) {
        reject(new Error("[Kakao] VITE_KAKAO_API_KEY is missing in .env"));
        return;
      }

      // 중복 로드 방지
      const existing = document.querySelector<HTMLScriptElement>('script[data-kakao="true"]');
      if (existing) {
        existing.addEventListener("load", () => {
          if ((window as any).kakao?.maps) (window as any).kakao.maps.load(() => resolve((window as any).kakao));
          else reject(new Error("[Kakao] SDK loaded but kakao.maps missing"));
        });
        existing.addEventListener("error", () => reject(new Error("[Kakao] SDK script onerror")));
        return;
      }

      const script = document.createElement("script");
      script.dataset.kakao = "true";
      script.async = true;
      // https 강제 + 필요한 라이브러리 포함
      script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${appkey}&autoload=false&libraries=services,clusterer,drawing`;
      script.onload = () => {
        const w = window as any;
        if (!w.kakao) {
          reject(new Error("[Kakao] SDK loaded but window.kakao undefined"));
          return;
        }
        w.kakao.maps.load(() => resolve(w.kakao));
      };
      script.onerror = () => reject(new Error("[Kakao] SDK script onerror (네트워크/도메인/키 확인)"));
      document.head.appendChild(script);
    });
  }
  return kakaoReadyPromise;
}
