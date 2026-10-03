/* Подтверждение прав на сайт в Яндекс Вебмастере: файл должен открываться по точному адресу
   /yandex_f88518e42559857a.html без переадресации, а Cloudflare Pages убирает «.html» у статических файлов. */
export function onRequest() {
  return new Response(`<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    </head>
    <body>Verification: f88518e42559857a</body>
</html>
`, { headers: { 'content-type': 'text/html; charset=UTF-8', 'cache-control': 'public, max-age=300' } });
}
