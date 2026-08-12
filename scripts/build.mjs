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

const safeHref = (value = "") => {
  const href = String(value).trim();
  if (/^(https?:\/\/|mailto:|tel:|#)/i.test(href)) return escapeHtml(href);
  if (/^(?:\.\/)?assets\/[a-zA-Z0-9][a-zA-Z0-9_./-]*$/i.test(href) && !href.includes("..")) {
    return escapeHtml(href.startsWith("./") ? href : `./${href}`);
  }
  return "";
};

const safeAsset = (value = "") => {
  const asset = String(value).trim().replace(/^\.\//, "");
  return /^[a-zA-Z0-9][a-zA-Z0-9_./-]*$/.test(asset) && !asset.includes("..")
    ? escapeHtml(asset)
    : "";
};

const safeColor = (value, fallback) =>
  /^#[0-9a-f]{6}$/i.test(String(value || "")) ? String(value) : fallback;

const safeLength = (value, fallback) =>
  /^\d{2,4}px$/i.test(String(value || "")) ? String(value) : fallback;

const externalAttributes = (href = "") =>
  /^https?:\/\//i.test(String(href)) ? ' target="_blank" rel="noreferrer"' : "";

const renderLinks = (links = [], className = "text-links") => {
  const items = links
    .map((link) => {
      const resolvedHref = link.href === "$email"
        ? `mailto:${data.profile?.email || ""}`
        : link.href === "$phone"
          ? `tel:${String(data.profile?.phone || "").replace(/\s/g, "")}`
          : link.href;
      return { ...link, resolvedHref, safe: safeHref(resolvedHref) };
    })
    .filter((link) => link.safe)
    .map(
      (link) =>
        `<a href="${link.safe}"${externalAttributes(link.resolvedHref)}>${escapeHtml(link.label)}</a>`
    )
    .join("");
  return items ? `<div class="${className}">${items}</div>` : "";
};

const section = (id, title, content, className = "") =>
  content
    ? `<section class="content-section ${className}" id="${id}">
        <h2>${escapeHtml(title)}</h2>
        ${content}
      </section>`
    : "";

const profilePhoto = safeAsset(data.profile?.photo);
const photoMarkup = profilePhoto
  ? `<img class="profile-photo" src="./${profilePhoto}" alt="${escapeHtml(data.profile.photoAlt)}">`
  : `<div class="photo-placeholder" role="img" aria-label="尚未添加个人照片">
      <span>PHOTO</span>
      <small>照片路径写在<br>content.json</small>
    </div>`;

const navigation = (data.navigation || [])
  .map((item) => ({ ...item, safe: safeHref(item.href) }))
  .filter((item) => item.safe)
  .map((item) => `<a href="${item.safe}">${escapeHtml(item.label)}</a>`)
  .join("");

const aboutContent = (data.about?.paragraphs || [])
  .map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`)
  .join("");

const newsContent = (data.news || [])
  .map((item) => {
    const href = safeHref(item.href);
    const copy = href
      ? `<a href="${href}"${externalAttributes(item.href)}>${escapeHtml(item.text)}</a>`
      : escapeHtml(item.text);
    return `<li><time>${escapeHtml(item.date)}</time><span>${copy}</span></li>`;
  })
  .join("");

const educationContent = (data.education || [])
  .map(
    (item) => `<article class="entry">
      <time>${escapeHtml(item.period)}</time>
      <div>
        <h3>${escapeHtml(item.degree)}</h3>
        <p class="entry-meta">${escapeHtml(item.institution)}</p>
        ${item.description ? `<p>${escapeHtml(item.description)}</p>` : ""}
      </div>
    </article>`
  )
  .join("");

const researchContent = (data.researchInterests || [])
  .map(
    (item) => `<article class="interest-item">
      <h3>${escapeHtml(item.title)}</h3>
      <p>${escapeHtml(item.description)}</p>
    </article>`
  )
  .join("");

const projectContent = (data.projects || [])
  .map(
    (item) => `<article class="project-item">
      <div class="project-heading">
        <div>
          <h3>${escapeHtml(item.title)}</h3>
          <p class="entry-meta">${escapeHtml(item.role)}</p>
        </div>
        <time>${escapeHtml(item.period)}</time>
      </div>
      <p>${escapeHtml(item.description)}</p>
      ${(item.tags || []).length ? `<ul class="tag-list">${item.tags.map((tag) => `<li>${escapeHtml(tag)}</li>`).join("")}</ul>` : ""}
      ${renderLinks(item.links || [], "project-links")}
    </article>`
  )
  .join("");

const honorContent = (data.honors || [])
  .map(
    (item) => `<li>
      <time>${escapeHtml(item.date)}</time>
      <span><strong>${escapeHtml(item.title)}</strong>${item.organization ? ` · ${escapeHtml(item.organization)}` : ""}</span>
    </li>`
  )
  .join("");

const skillsContent = (data.skillGroups || [])
  .map(
    (group) => `<article>
      <h3>${escapeHtml(group.title)}</h3>
      <p>${(group.items || []).map(escapeHtml).join(" · ")}</p>
    </article>`
  )
  .join("");

const titleParts = [data.profile?.name, data.profile?.englishName].filter(Boolean);
const pageTitle = titleParts.join(" · ");
const sectionTitles = data.sectionTitles || {};

const html = `<!doctype html>
<html lang="${escapeHtml(data.site?.language || "zh-CN")}">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="${escapeHtml(data.site?.description)}">
    <meta name="theme-color" content="${safeColor(data.theme?.accentColor, "#2f6288")}">
    <meta http-equiv="Content-Security-Policy" content="default-src 'self'; img-src 'self' data:; style-src 'self'; script-src 'none'; object-src 'none'; base-uri 'self'; form-action 'self'">
    <title>${escapeHtml(pageTitle)}｜${escapeHtml(data.site?.title)}</title>
    <link rel="stylesheet" href="./theme.css">
    <link rel="stylesheet" href="./styles.css">
  </head>
  <body>
    <header class="site-header">
      <div class="header-inner">
        <a class="site-name" href="#top">${escapeHtml(data.profile?.englishName || data.profile?.name)}</a>
        ${navigation ? `<nav aria-label="主导航">${navigation}</nav>` : ""}
      </div>
    </header>

    <main class="page" id="top">
      <aside class="profile-card" aria-label="个人资料">
        ${photoMarkup}
        <h1>${escapeHtml(data.profile?.name)}</h1>
        ${data.profile?.englishName ? `<p class="english-name">${escapeHtml(data.profile.englishName)}</p>` : ""}
        <p class="profile-role">${escapeHtml(data.profile?.role)}</p>
        <p class="affiliation">${escapeHtml(data.profile?.affiliation)}</p>
        ${data.profile?.location ? `<p class="location">${escapeHtml(data.profile.location)}</p>` : ""}
        ${renderLinks(data.links || [], "profile-links")}
      </aside>

      <article class="main-content">
        <section class="intro" id="about">${aboutContent}</section>
        ${section("news", sectionTitles.news || "近期动态", newsContent ? `<ul class="news-list">${newsContent}</ul>` : "")}
        ${section("education", sectionTitles.education || "教育背景", educationContent, "entries-section")}
        ${section("research", sectionTitles.research || "研究兴趣", researchContent ? `<div class="interest-list">${researchContent}</div>` : "")}
        ${section("projects", sectionTitles.projects || "项目经历", projectContent, "projects-section")}
        ${section("honors", sectionTitles.honors || "荣誉与奖项", honorContent ? `<ul class="honor-list">${honorContent}</ul>` : "")}
        ${section("skills", sectionTitles.skills || "技能", skillsContent ? `<div class="skills-list">${skillsContent}</div>` : "")}
      </article>
    </main>

    <footer class="site-footer">
      <div>
        <p>${escapeHtml(data.footer?.note)}</p>
        <p>© ${new Date().getFullYear()} ${escapeHtml(data.profile?.name)}。${escapeHtml(data.footer?.copyright)}</p>
      </div>
    </footer>
  </body>
</html>`;

const themeCss = `:root {
  --accent: ${safeColor(data.theme?.accentColor, "#2f6288")};
  --text: ${safeColor(data.theme?.textColor, "#4b5055")};
  --muted: ${safeColor(data.theme?.mutedColor, "#73787d")};
  --line: ${safeColor(data.theme?.lineColor, "#e6e8ea")};
  --content-width: ${safeLength(data.theme?.contentWidth, "1180px")};
  --sidebar-width: ${safeLength(data.theme?.sidebarWidth, "210px")};
}`;

await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });
await writeFile(resolve(out, "index.html"), html, "utf8");
await writeFile(resolve(out, "theme.css"), themeCss, "utf8");
await cp(resolve(root, "src/styles.css"), resolve(out, "styles.css"));
await writeFile(resolve(out, ".nojekyll"), "", "utf8");

const assets = resolve(root, "assets");
if (existsSync(assets)) await cp(assets, resolve(out, "assets"), { recursive: true });

console.log(`Built independent static site in ${out}`);
