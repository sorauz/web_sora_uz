"use client";

import { useEffect, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Script from "next/script";

interface YandexMetrikaProps {
  counterId?: string;
}

function YandexMetrikaTracker({ counterId }: { counterId: string }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // SPA (Soft Navigation) - Har bir sahifa almashganda Metrikaga 'hit' yuborish
  useEffect(() => {
    if (typeof window !== "undefined" && typeof (window as any).ym === "function") {
      const url = `${pathname}${searchParams?.toString() ? `?${searchParams.toString()}` : ""}`;
      (window as any).ym(Number(counterId), "hit", url);
    }
  }, [pathname, searchParams, counterId]);

  return null;
}

export function YandexMetrika({ counterId }: YandexMetrikaProps) {
  const cId =
    counterId ||
    process.env.NEXT_PUBLIC_YA_METRIKA_ID ||
    "113797561";

  if (!cId) return null;

  return (
    <>
      <Script
        id="yandex-metrika"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            (function(m,e,t,r,i,k,a){
                m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
                m[i].l=1*new Date();
                for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
                k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
            })(window, document,'script','https://mc.yandex.ru/metrika/tag.js?id=${cId}', 'ym');

            ym(${cId}, 'init', {
                ssr: true,
                webvisor: true,
                clickmap: true,
                ecommerce: "dataLayer",
                accurateTrackBounce: true,
                trackLinks: true
            });
          `,
        }}
      />
      <noscript>
        <div>
          <img
            src={`https://mc.yandex.ru/watch/${cId}`}
            style={{ position: "absolute", left: "-9999px" }}
            alt=""
          />
        </div>
      </noscript>
      <Suspense fallback={null}>
        <YandexMetrikaTracker counterId={cId} />
      </Suspense>
    </>
  );
}
