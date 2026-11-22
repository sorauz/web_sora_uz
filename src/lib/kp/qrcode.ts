import QRCode from "qrcode";

/**
 * Generates a high-contrast PNG Data URL for the public KP verification QR code.
 */
export async function generateKpQrDataUrl(url: string): Promise<string> {
  return QRCode.toDataURL(url, {
    errorCorrectionLevel: "M",
    margin: 1,
    width: 240,
    color: {
      dark: "#0f172a",
      light: "#ffffff",
    },
  });
}
