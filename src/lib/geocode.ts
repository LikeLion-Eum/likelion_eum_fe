import { loadKakao } from "./kakaoLoader";

/** 주소 → 위/경도 */
export async function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
  const kakao = await loadKakao();
  return new Promise((resolve) => {
    const geocoder = new kakao.maps.services.Geocoder();
    geocoder.addressSearch(address, (result: any[], status: string) => {
      if (status === kakao.maps.services.Status.OK && result?.[0]) {
        const { y, x } = result[0];
        resolve({ lat: parseFloat(y), lng: parseFloat(x) });
      } else {
        resolve(null);
      }
    });
  });
}
