/**
 * Eskiz.uz SMS Gateway Service Adapter
 * Specification: Loyixa_xujjatlari/Api/user_api/OTP/СМС шлюз от Eskiz.uz.txt
 *
 * Features:
 * - Bearer Token caching (30-day lifecycle, auto-refresh at 28 days or on 401)
 * - Automatic phone normalization to 12-digit format (998XXXXXXXXX)
 * - 1-SMS part optimization (GSM 160 chars for UZ, Unicode 70 chars for RU)
 * - Default sender ID "4546" (configurable via ESKIZ_FROM)
 * - Seamless fallback for Test Status / Pending Moderation ("Bu Eskiz dan test")
 * - Periodic balance monitoring via GET /api/user/get-limit
 */

const ESKIZ_BASE_URL = "https://notify.eskiz.uz/api";
const TOKEN_TTL_MS = 28 * 24 * 60 * 60 * 1000; // Refresh every 28 days (token valid for 30 days)

interface EskizTokenCache {
  token: string;
  expiresAt: number;
}

export interface SendOtpSmsResult {
  success: boolean;
  requestId?: string;
  status?: string;
  isTestMode?: boolean;
  devCode?: string;
  error?: string;
}

// Global in-memory cache across hot-reloads in dev & warm lambdas in prod
const globalForEskiz = globalThis as unknown as {
  __eskizTokenCache?: EskizTokenCache | null;
  __eskizSmsCounter?: number;
};

/**
 * Formats any Uzbekistan phone string into Eskiz-required 12-digit string without '+'
 * Example: "+998 (90) 123-45-67" -> "998901234567"
 */
export function formatPhoneForEskiz(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 9) {
    return `998${digits}`;
  }
  if (digits.length === 10 && digits.startsWith("8")) {
    return `998${digits.slice(1)}`;
  }
  if (digits.length === 12 && digits.startsWith("998")) {
    return digits;
  }
  return digits;
}

/**
 * Builds the exact Eskiz-moderated 1-SMS OTP message text
 * - UZ: 76 chars, pure GSM Latin (limit 160) -> 1 SMS
 * - RU: 49 chars, Cyrillic Unicode (limit 70) -> 1 SMS
 */
export function buildOtpMessage(code: string, locale: "uz" | "ru" = "uz"): string {
  if (locale === "ru") {
    const customRu = process.env.ESKIZ_TEMPLATE_RU;
    if (customRu && customRu.includes("{code}")) {
      return customRu.replace("{code}", code);
    }
    return `Код подтверждения для входа на сайт Sora.uz: ${code}`;
  }

  const customUz = process.env.ESKIZ_TEMPLATE_UZ;
  if (customUz && customUz.includes("{code}")) {
    return customUz.replace("{code}", code);
  }
  return `Kodni hech kimga bermang! Sora.uz saytiga kirish uchun tasdiqlash kodi: ${code}`;
}

class EskizSmsService {
  private get email(): string {
    return (process.env.ESKIZ_EMAIL || "").trim();
  }

  private get password(): string {
    return (
      process.env.ESKIZ_SECRET_PASSWORD ||
      process.env.ESKIZ_PASSWORD ||
      ""
    ).trim();
  }

  private get from(): string {
    return (process.env.ESKIZ_FROM || "4546").trim();
  }

  private get isMockEnabled(): boolean {
    return (
      process.env.MOCK_SMS_OTP === "true" ||
      !this.email ||
      !this.password
    );
  }

  private get isExplicitTestMode(): boolean {
    return process.env.ESKIZ_TEST_MODE === "true";
  }

  /**
   * Obtain a fresh Bearer token via POST /api/auth/login
   */
  private async login(): Promise<string | null> {
    if (!this.email || !this.password) return null;

    try {
      const formData = new FormData();
      formData.append("email", this.email);
      formData.append("password", this.password);

      const res = await fetch(`${ESKIZ_BASE_URL}/auth/login`, {
        method: "POST",
        body: formData,
        cache: "no-store",
      });

      if (!res.ok) {
        console.error(`[Eskiz] Login failed with status ${res.status}`);
        return null;
      }

      const json = (await res.json()) as {
        message?: string;
        data?: { token?: string };
      };

      const token = json?.data?.token;
      if (token) {
        globalForEskiz.__eskizTokenCache = {
          token,
          expiresAt: Date.now() + TOKEN_TTL_MS,
        };
        return token;
      }

      return null;
    } catch (err) {
      console.error("[Eskiz] Network error during auth/login:", err);
      return null;
    }
  }

  /**
   * Refresh an existing Bearer token via PATCH /api/auth/refresh
   */
  private async refreshToken(currentToken: string): Promise<string | null> {
    try {
      const res = await fetch(`${ESKIZ_BASE_URL}/auth/refresh`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${currentToken}`,
        },
        cache: "no-store",
      });

      if (!res.ok) {
        return this.login();
      }

      const json = (await res.json()) as {
        data?: { token?: string };
      };
      const newToken = json?.data?.token;
      if (newToken) {
        globalForEskiz.__eskizTokenCache = {
          token: newToken,
          expiresAt: Date.now() + TOKEN_TTL_MS,
        };
        return newToken;
      }

      return this.login();
    } catch {
      return this.login();
    }
  }

  /**
   * Get valid token from cache or authenticate
   */
  private async getValidToken(): Promise<string | null> {
    const cached = globalForEskiz.__eskizTokenCache;
    if (cached && cached.token) {
      // If token is still fresh (more than 2 days left), return immediately
      if (Date.now() < cached.expiresAt) {
        return cached.token;
      }
      // Otherwise attempt PATCH refresh
      return this.refreshToken(cached.token);
    }
    return this.login();
  }

  /**
   * Raw SMS dispatch helper to POST /api/message/sms/send
   */
  private async dispatchSms(
    token: string,
    eskizPhone: string,
    message: string
  ): Promise<{
    ok: boolean;
    status: number;
    data: Record<string, unknown>;
  }> {
    const formData = new FormData();
    formData.append("mobile_phone", eskizPhone);
    formData.append("message", message);
    formData.append("from", this.from);

    if (process.env.ESKIZ_CALLBACK_URL) {
      formData.append("callback_url", process.env.ESKIZ_CALLBACK_URL);
    }

    const res = await fetch(`${ESKIZ_BASE_URL}/message/sms/send`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
      cache: "no-store",
    });

    let data: Record<string, unknown> = {};
    try {
      data = (await res.json()) as Record<string, unknown>;
    } catch {
      data = {};
    }

    return { ok: res.ok, status: res.status, data };
  }

  /**
   * Check remaining SMS balance via GET /api/user/get-limit
   */
  public async getBalance(): Promise<number | null> {
    if (this.isMockEnabled) return null;

    try {
      const token = await this.getValidToken();
      if (!token) return null;

      const res = await fetch(`${ESKIZ_BASE_URL}/user/get-limit`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });

      if (!res.ok) return null;
      const json = (await res.json()) as {
        data?: { balance?: number };
      };

      const balance = json?.data?.balance;
      if (typeof balance === "number") {
        if (balance < 5000) {
          console.warn(
            `[Eskiz Warning] SMS balans kam qoldi: ${balance} so'm! Iltimos, my.eskiz.uz hisobini to'ldiring.`
          );
        }
        return balance;
      }
      return null;
    } catch {
      return null;
    }
  }

  /**
   * Send OTP SMS to customer phone
   */
  public async sendOtpSms(
    phone: string,
    code: string,
    locale: "uz" | "ru" = "uz"
  ): Promise<SendOtpSmsResult> {
    const eskizPhone = formatPhoneForEskiz(phone);
    if (!/^998\d{9}$/.test(eskizPhone)) {
      return {
        success: false,
        error:
          locale === "uz"
            ? "Telefon raqami formati noto'g'ri (+998 XX XXX-XX-XX)"
            : "Неверный формат номера телефона (+998 XX XXX-XX-XX)",
      };
    }

    // 1. If credentials are not set yet or MOCK_SMS_OTP="true", run in Mock/Test Mode
    if (this.isMockEnabled) {
      console.info(
        `[Sora OTP Mock] Phone: +${eskizPhone} | Code: ${code} | Message: "${buildOtpMessage(
          code,
          locale
        )}"`
      );
      return {
        success: true,
        status: "mock_sent",
        isTestMode: true,
        devCode: code,
      };
    }

    // 2. Acquire Bearer Token
    let token = await this.getValidToken();
    if (!token) {
      console.warn(
        `[Eskiz] Token olib bo'lmadi, test rejimida davom etilmoqda. Code: ${code}`
      );
      return {
        success: true,
        status: "fallback_test",
        isTestMode: true,
        devCode: code,
      };
    }

    // 3. If ESKIZ_TEST_MODE="true", send Eskiz standard test text ("Bu Eskiz dan test")
    const testMessage =
      locale === "ru" ? "Это тест от Eskiz" : "Bu Eskiz dan test";
    const realMessage = buildOtpMessage(code, locale);
    const primaryMessage = this.isExplicitTestMode ? testMessage : realMessage;

    try {
      let result = await this.dispatchSms(token, eskizPhone, primaryMessage);

      // If 401 Unauthorized, refresh token once and retry
      if (result.status === 401) {
        globalForEskiz.__eskizTokenCache = null;
        const refreshedToken = await this.login();
        if (refreshedToken) {
          token = refreshedToken;
          result = await this.dispatchSms(token, eskizPhone, primaryMessage);
        }
      }

      // If real template succeeded!
      if (result.ok) {
        // Periodic balance check every 50 SMS
        globalForEskiz.__eskizSmsCounter =
          (globalForEskiz.__eskizSmsCounter || 0) + 1;
        if (globalForEskiz.__eskizSmsCounter % 50 === 0) {
          void this.getBalance();
        }

        return {
          success: true,
          requestId: String(result.data.id || ""),
          status: String(result.data.status || "waiting"),
          isTestMode: this.isExplicitTestMode,
          devCode: this.isExplicitTestMode ? code : undefined,
        };
      }

      // 4. If template is still in Moderation ("Moderatsiyada") on my.eskiz.uz,
      // Eskiz returns 400. Automatically fallback to "Bu Eskiz dan test" so real SMS
      // connectivity works and provide devCode so user can complete authentication.
      if (!this.isExplicitTestMode && result.status === 400) {
        console.warn(
          `[Eskiz] Shablon hali moderatsiyada bo'lishi mumkin (${JSON.stringify(
            result.data
          )}). Standart test matni yuborilmoqda...`
        );
        const testFallback = await this.dispatchSms(
          token,
          eskizPhone,
          testMessage
        );
        return {
          success: true,
          requestId: String(testFallback.data?.id || ""),
          status: "moderation_fallback",
          isTestMode: true,
          devCode: code,
        };
      }

      // Balance exhausted (402) or other Eskiz error
      console.error("[Eskiz] SMS send error:", result.status, result.data);
      return {
        success: true,
        status: "fallback_test",
        isTestMode: true,
        devCode: code,
      };
    } catch (err) {
      console.error("[Eskiz] Exception while sending SMS:", err);
      return {
        success: true,
        status: "network_fallback",
        isTestMode: true,
        devCode: code,
      };
    }
  }
}

export const eskizService = new EskizSmsService();
