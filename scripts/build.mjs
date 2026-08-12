import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const out = resolve(root, "dist");
const data = JSON.parse(await readFile(resolve(root, "content.json"), "utf8"));

const escapeHtml = (value = "") =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const safeHref = (value = "#") => {
  const href = String(value).trim();
  return /^(https?:\/\/|mailto:|tel:|#)/i.test(href) ? escapeHtml(href) : "#";
};

const safeAsset = (value = "") => {
  const asset = String(value).trim().replace(/^\.\//, "");
  return /^[a-zA-Z0-9][a-zA-Z0-9_./-]*$/.test(asset) && !asset.includes("..")
    ? escapeHtml(asset)
    : "";
};

const sectionHeading = (index, title) => `
  <div class="section-heading">
    <span>${escapeHtml(index)}</span>
    <h2>${escapeHtml(title)}</h2>
  </div>`;

const timeline = (items = []) => `
  <div class="timeline">
    ${items
      .map(
        (item) => `
      <article class="timeline-item">
        <p class="timeline-period">${escapeHtml(item.period)}</p>
        <div class="timeline-copy">
          <h3>${escapeHtml(item.title)}</h3>
          <p class="timeline-organization">${escapeHtml(item.organization)}</p>
          <p class="timeline-description">${escapeHtml(item.description)}</p>
          ${
            item.highlights?.length
              ? `<ul class="highlight-list">${item.highlights
                  .map((highlight) => `<li>${escapeHtml(highlight)}</li>`)
                  .join("")}</ul>`
              : ""
          }
        </div>
      </article>`
      )
      .join("")}
  </div>`;

const photoMarkup = data.profile.photo
  ? `<img class="portrait" src="${safeAsset(data.profile.photo)}" alt="${escapeHtml(data.profile.photoAlt)}">`
  : `<div class="portrait-placeholder" role="img" aria-label="尚未添加个人照片">
      <strong>${escapeHtml(data.profile.englishName || data.profile.name)}</strong>
      <span>将照片保存到 assets/profile.jpg<br>并在 content.json 填写路径</span>
    </div>`;

const nav = (data.navigation || [])
  .map((item) => `<a href="${safeHref(item.href)}">${escapeHtml(item.label)}</a>`)
  .join("");

const social = (data.socialLinks || [])
  .map(
    (link) =>
      `<a href="${safeHref(link.href)}" target="_blank" rel="noreferrer">${escapeHtml(link.label)}</a>`
  )
  .join("");

const html = `<!doctype html>
<html lang="${escapeHtml(data.site.language || "zh-CN")}">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="${escapeHtml(data.site.description)}">
    <meta name="theme-color" content="${escapeHtml(data.site.accentColor || "#2e684b")}">
    <meta http-equiv="Content-Security-Policy" content="default-src 'self'; img-src 'self' data:; style-src 'self'; script-src 'none'; object-src 'none'; base-uri 'self'; form-action 'self'">
    <title>${escapeHtml(data.profile.name)}｜${escapeHtml(data.site.title)}</title>
    <link rel="stylesheet" href="./styles.css">
  </head>
  <body>
    <main>
      <header class="site-header">
        <a class="wordmark" href="#top" aria-label="返回页面顶部">${escapeHtml(data.profile.englishName)}</a>
        <nav aria-label="主导航">${nav}</nav>
        <a class="header-contact" href="mailto:${escapeHtml(data.profile.email)}">联系我 <span aria-hidden="true">↗</span></a>
      </header>

      <section class="hero" id="top">
        <div class="portrait-wrap">
          ${photoMarkup}
          <div class="portrait-caption" aria-hidden="true">
            <span>${escapeHtml(data.profile.portraitLabel)}</span>
            <span>${escapeHtml(data.profile.portraitCoordinate)}</span>
          </div>
        </div>
        <div class="hero-content">
          <div class="availability"><span class="status-dot" aria-hidden="true"></span>${escapeHtml(data.profile.status)}</div>
          <p class="hero-role">${escapeHtml(data.profile.role)}</p>
          <h1>${escapeHtml(data.profile.name)}</h1>
          <p class="hero-intro">${escapeHtml(data.profile.intro)}</p>
          <div class="hero-meta">
            <span>${escapeHtml(data.profile.location)}</span>
            <a href="mailto:${escapeHtml(data.profile.email)}">${escapeHtml(data.profile.email)}</a>
          </div>
          <div class="facts" aria-label="个人概览">
            ${(data.facts || [])
              .map((fact) => `<div class="fact"><strong>${escapeHtml(fact.value)}</strong><span>${escapeHtml(fact.label)}</span></div>`)
              .join("")}
          </div>
        </div>
      </section>

      <div class="content-shell">
        <aside class="side-note" aria-label="个人简介导语">
          <p>${escapeHtml(data.about.eyebrow)}</p>
          <span>${escapeHtml(data.about.sideNote)}</span>
        </aside>
        <div class="main-column">
          <section class="page-section about-section" id="about">
            ${sectionHeading("01", "个人介绍")}
            <h2 class="statement">${(data.about.titleLines || []).map((line) => `<span>${escapeHtml(line)}</span>`).join("")}</h2>
            <div class="about-copy">${(data.about.paragraphs || []).map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("")}</div>
          </section>
          <section class="page-section" id="experience">
            ${sectionHeading("02", "工作经历")}
            ${timeline(data.experience)}
          </section>
          <section class="page-section" id="education">
            ${sectionHeading("03", "教育背景")}
            ${timeline(data.education)}
          </section>
          <section class="page-section" id="skills">
            ${sectionHeading("04", "专业能力")}
            <div class="skills-grid">
              ${(data.skillGroups || [])
                .map(
                  (group) => `<article class="skill-group"><h3>${escapeHtml(group.title)}</h3><ul>${(group.skills || [])
                    .map((skill) => `<li>${escapeHtml(skill)}</li>`)
                    .join("")}</ul></article>`
                )
                .join("")}
            </div>
          </section>
          <section class="page-section projects-section" id="projects">
            ${sectionHeading("05", "代表项目")}
            <div class="projects-list">
              ${(data.projects || [])
                .map(
                  (project) => `<article class="project"><span class="project-number">${escapeHtml(project.number)}</span><div><p class="project-type">${escapeHtml(project.type)}</p><h3>${escapeHtml(project.title)}</h3><p>${escapeHtml(project.summary)}</p></div><span class="project-arrow" aria-hidden="true">↗</span></article>`
                )
                .join("")}
            </div>
          </section>
        </div>
      </div>

      <footer class="site-footer" id="contact">
        <p class="footer-kicker">${escapeHtml(data.footer.kicker)}</p>
        <h2>${escapeHtml(data.footer.title)}</h2>
        <p class="footer-note">${escapeHtml(data.footer.note)}</p>
        <a class="email-link" href="mailto:${escapeHtml(data.profile.email)}">${escapeHtml(data.profile.email)} <span aria-hidden="true">↗</span></a>
        <div class="footer-bottom">
          <div class="social-links">${social}</div>
          <div class="footer-legal">
            <a href="tel:${escapeHtml(data.profile.phone.replace(/\s/g, ""))}">${escapeHtml(data.profile.phone)}</a>
            <p>© ${new Date().getFullYear()} ${escapeHtml(data.profile.name)}。${escapeHtml(data.footer.copyright)}</p>
          </div>
        </div>
      </footer>
    </main>
  </body>
</html>`;

await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });
await writeFile(resolve(out, "index.html"), html, "utf8");
await cp(resolve(root, "src/styles.css"), resolve(out, "styles.css"));
await writeFile(resolve(out, ".nojekyll"), "", "utf8");

const assets = resolve(root, "assets");
if (existsSync(assets)) await cp(assets, resolve(out, "assets"), { recursive: true });

console.log(`Built independent static site in ${out}`);
