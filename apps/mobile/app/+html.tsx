import { ScrollViewStyleReset } from "expo-router/html";
import type { PropsWithChildren } from "react";

// SW + cache killer — runs on every load while we iterate (incl. Vercel previews).
// Flip to a proper SW story once UX stabilises.
const DEV_SW_NUKE = `
(function () {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(function (rs) {
      var had = rs.length > 0;
      rs.forEach(function (r) { r.unregister(); });
      if (had) console.log('[sw] unregistered ' + rs.length);
    }).catch(function () {});
  }
  if (typeof caches !== 'undefined' && caches.keys) {
    caches.keys().then(function (keys) {
      if (keys.length > 0) console.log('[sw] cleared ' + keys.length + ' cache(s)');
      keys.forEach(function (k) { caches.delete(k); });
    }).catch(function () {});
  }
})();
`;

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover" />
        <title>SocialTV</title>
        <meta name="description" content="Your social feeds, TV-ified" />
        <meta name="theme-color" content="#0a0a0f" />

        {/* PWA */}
        <link rel="manifest" href="/manifest.webmanifest" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icon.png" />

        {/* iOS standalone install */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="SocialTV" />
        <meta name="format-detection" content="telephone=no" />

        <ScrollViewStyleReset />
        <script dangerouslySetInnerHTML={{ __html: DEV_SW_NUKE }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
