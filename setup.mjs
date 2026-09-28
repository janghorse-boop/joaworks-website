#!/usr/bin/env node
/**
 * 도메인과 이메일을 한 번에 채워 넣는다.
 *
 * 홈페이지 곳곳에 `DOMAIN_PLACEHOLDER`·`EMAIL_PLACEHOLDER` 를 심어 두었다.
 * 손으로 고치면 **한두 군데를 빠뜨린다** — canonical, og:url, mailto 는
 * 눈에 잘 안 띈다. 한 번에 바꾸고, 남은 자리가 있으면 알려 준다.
 *
 *   node setup.mjs joaworks.co.kr contact@joaworks.co.kr
 *
 * 다시 돌려도 안전하다(이미 바뀐 자리는 그대로 둔다).
 */

import { readdirSync, readFileSync, writeFileSync, statSync } from "node:fs";
import { join, extname } from "node:path";

const [domain, email] = process.argv.slice(2);

if (!domain || !email) {
  console.error("쓰는 법: node setup.mjs <도메인> <이메일>");
  console.error("  예)   node setup.mjs joaworks.co.kr contact@joaworks.co.kr");
  process.exit(1);
}

// 흔한 실수를 먼저 막는다 — https:// 를 붙여 넣으면 주소가 두 겹이 된다.
if (/^https?:\/\//i.test(domain)) {
  console.error(`도메인에 http(s):// 를 빼고 적으십시오: ${domain}`);
  process.exit(1);
}
if (domain.endsWith("/")) {
  console.error(`도메인 끝의 / 를 빼십시오: ${domain}`);
  process.exit(1);
}
if (!email.includes("@")) {
  console.error(`이메일이 아닌 것 같습니다: ${email}`);
  process.exit(1);
}

const EXT = new Set([".html", ".css", ".js", ".md", ".txt", ".xml"]);

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    if (name === ".git" || name === "node_modules") continue;
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else if (EXT.has(extname(name))) out.push(p);
  }
  return out;
}

let changed = 0;
const left = [];

for (const file of walk(".")) {
  const before = readFileSync(file, "utf8");
  const after = before
    .replaceAll("DOMAIN_PLACEHOLDER", domain)
    .replaceAll("EMAIL_PLACEHOLDER", email);
  if (after !== before) {
    writeFileSync(file, after, "utf8");
    changed++;
    console.log(`고침  ${file}`);
  }
  if (after.includes("PLACEHOLDER")) left.push(file);
}

// GitHub Pages 의 사용자 지정 도메인 파일. 이것이 없으면 설정에서 넣은
// 도메인이 배포할 때마다 풀린다.
writeFileSync("CNAME", domain + "\n", "utf8");
console.log(`만듦  CNAME  (${domain})`);

// 검색엔진이 볼 것들. 도메인이 정해져야 쓸 수 있어 여기서 만든다.
const pages = ["/", "/selah-rta/", "/privacy/", "/terms/", "/support/"];
const today = new Date().toISOString().slice(0, 10);
writeFileSync(
  "sitemap.xml",
  `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    pages
      .map(
        (p) =>
          `  <url><loc>https://${domain}${p}</loc><lastmod>${today}</lastmod></url>`,
      )
      .join("\n") +
    `\n</urlset>\n`,
  "utf8",
);
console.log("만듦  sitemap.xml");

writeFileSync(
  "robots.txt",
  `User-agent: *\nAllow: /\n\nSitemap: https://${domain}/sitemap.xml\n`,
  "utf8",
);
console.log("만듦  robots.txt");

console.log(`\n고친 파일 ${changed}개.`);
if (left.length) {
  console.log("\n아직 자리표가 남은 파일:");
  left.forEach((f) => console.log("  " + f));
  process.exit(1);
}
console.log("남은 자리표 없음.");
