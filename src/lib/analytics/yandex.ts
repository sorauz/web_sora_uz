// Yandex Metrika Goal & E-Commerce Helper
const DEFAULT_COUNTER_ID = 113797561;

/**
 * Yandex Metrikaga maqsad (Goal) yuborish
 * @param target Maqsad identifikatori (masalan: 'ADD_TO_CART', 'ONE_CLICK_SUBMIT')
 * @param params Qo'shimcha parametrlar
 */
export function reachGoal(target: string, params?: Record<string, any>) {
  if (typeof window !== "undefined" && typeof (window as any).ym === "function") {
    const counterId = Number(process.env.NEXT_PUBLIC_YA_METRIKA_ID || DEFAULT_COUNTER_ID);
    (window as any).ym(counterId, "reachGoal", target, params);
  }
}

/**
 * Yandex Metrika E-commerce ma'lumotlarini dataLayer'ga yuborish
 */
export function sendEcommerceEvent(
  action: "detail" | "add" | "remove" | "purchase",
  data: Record<string, any>
) {
  if (typeof window !== "undefined") {
    (window as any).dataLayer = (window as any).dataLayer || [];
    (window as any).dataLayer.push({
      ecommerce: {
        [action]: data,
      },
    });
  }
}
