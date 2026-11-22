import "server-only";
import { api } from "@/lib/api";
import { AuthUser, normalizePhone } from "@/lib/schemas/auth";
import { deriveOneCPassword } from "@/lib/sms/otp-store";

/**
 * Resolves 1C `contact_id` (КонтактноеЛицо GUID) and `client_id` (Контрагент GUID)
 * from verified session or 1C `/register` (with automatic 409 seamless ID recovery).
 * Never generates synthetic UUIDs because 1C rejects unknown GUIDs with 404.
 */
export async function resolveOneCCustomerIds(params: {
  sessionUser: AuthUser | null;
  isB2B: boolean;
  fullName: string;
  cleanPhone: string;
  cleanAltPhone?: string;
  companyName?: string;
  cleanInn?: string;
}): Promise<{ contactId?: string; clientId?: string }> {
  const {
    sessionUser,
    isB2B,
    fullName,
    cleanPhone,
    cleanAltPhone = "",
    companyName = "",
    cleanInn = "",
  } = params;

  const resolveContactId = async (): Promise<string | undefined> => {
    const sessionPhoneMatches =
      sessionUser?.type === "B2C" &&
      !!sessionUser.id &&
      (!sessionUser.phone || normalizePhone(sessionUser.phone) === cleanPhone);

    if (sessionPhoneMatches && sessionUser?.id) {
      return sessionUser.id;
    }

    try {
      const regRes = await api.registerUser({
        type: "B2C",
        name: fullName.trim(),
        phone1: cleanPhone,
        phone2: cleanAltPhone,
        password: deriveOneCPassword(cleanPhone),
      });

      if (regRes.id) {
        return regRes.id;
      }
    } catch {
      // Temporary 1C /register hiccup handled by caller as 503
    }

    return undefined;
  };

  const resolveClientId = async (): Promise<string | undefined> => {
    if (!isB2B) return undefined;

    const sessionInnMatches =
      sessionUser?.type === "B2B" &&
      !!sessionUser.id &&
      (!cleanInn ||
        !sessionUser.inn ||
        sessionUser.inn.replace(/\D/g, "") === cleanInn);

    if (sessionInnMatches && sessionUser?.id) {
      return sessionUser.id;
    }

    if (cleanInn) {
      try {
        const regB2B = await api.registerUser({
          type: "B2B",
          name: (companyName || fullName).trim(),
          inn: cleanInn,
          phone1: cleanPhone,
          password: deriveOneCPassword(cleanInn || cleanPhone),
        });
        if (regB2B.id) {
          return regB2B.id;
        }
      } catch {
        // Handled cleanly as 503 by caller
      }
    }

    return undefined;
  };

  const [contactId, clientId] = await Promise.all([
    resolveContactId(),
    resolveClientId(),
  ]);

  return { contactId, clientId };
}
