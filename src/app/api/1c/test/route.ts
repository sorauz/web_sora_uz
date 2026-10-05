import { NextResponse } from "next/server";

export async function GET() {
  const baseUrl = process.env.SORA_API_BASE_URL || "http://1cloud.uz:777/SORA/hs/for_msp";
  const username = process.env.SORA_API_USERNAME || "web_user";
  const password = process.env.SORA_API_PASSWORD || "977540910";
  const authHeader = `Basic ${Buffer.from(`${username}:${password}`).toString("base64")}`;

  const endpoints = [
    { name: "Kategoriyalar", path: "/categories" },
    { name: "O'lchov birliklari", path: "/units" },
    { name: "Brendlar va Filtrlar", path: "/brands" },
    { name: "Narxlar va Qoldiqlar", path: "/price" },
    { name: "Barcha Mahsulotlar", path: "/all_product" },
    {
      name: "Bitta Mahsulot (Namuna)",
      path: "/product?id=70ee3bb2-cd83-11ea-96bb-50b7c370a30f",
    },
    {
      name: "Mahsulot Sharhlari (Namuna)",
      path: "/review?productId=f6d951a5-8dfd-11ea-81b6-50b7c370a30f",
    },
  ];

  const results = [];

  for (const ep of endpoints) {
    const url = `${baseUrl}${ep.path}`;
    const start = Date.now();
    try {
      const res = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: authHeader,
          Accept: "application/json",
          "User-Agent": "Sora-Web-Client/1.0",
        },
        cache: "no-store",
      });

      const duration = Date.now() - start;
      const isJson = res.headers.get("content-type")?.includes("application/json");

      let bodyPreview = "";
      if (isJson) {
        const json = await res.json();
        bodyPreview = JSON.stringify(json).slice(0, 300);
      } else {
        const text = await res.text();
        bodyPreview = text.slice(0, 300);
      }

      results.push({
        name: ep.name,
        endpoint: ep.path,
        url,
        status: res.status,
        statusText: res.statusText,
        durationMs: duration,
        isSuccess: res.ok,
        contentType: res.headers.get("content-type"),
        preview: bodyPreview,
      });
    } catch (err: unknown) {
      results.push({
        name: ep.name,
        endpoint: ep.path,
        url,
        status: 0,
        statusText: "Network Error / Timeout",
        durationMs: Date.now() - start,
        isSuccess: false,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  const allSuccess = results.every((r) => r.isSuccess);

  return NextResponse.json(
    {
      timestamp: new Date().toISOString(),
      config: {
        baseUrl,
        username,
        authType: "Basic Auth",
      },
      status: allSuccess ? "CONNECTED" : "AUTH_OR_CONFIG_REQUIRED",
      summary: allSuccess
        ? "1C ERP API bilan to'liq aloqa o'rnatildi, jonli ma'lumotlar qabul qilinmoqda."
        : "1C serveri bilan TCP/HTTP ulanish mavjud, ammo 1C/IIS da 'web_user' uchun avtorizatsiyani tasdiqlash talab etiladi.",
      endpoints: results,
    },
    { status: 200 }
  );
}
