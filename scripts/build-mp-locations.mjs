import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const DATE = "04Nov2026";
const API = "https://api.github.com/repos/ramSeraph/opendata/releases/assets/";
const ASSETS = {
  "villages.04Nov2026.csv.7z": API + "708673215",
  "urban_local_bodies.04Nov2026.csv.7z": API + "708649438",
  "statewise_ulbs_coverage.04Nov2026.csv.7z": API + "708656965",
};
const assets = [
  `villages.${DATE}.csv.7z`,
  `urban_local_bodies.${DATE}.csv.7z`,
  `statewise_ulbs_coverage.${DATE}.csv.7z`,
];

const root = path.resolve(".location-build");
fs.rmSync(root, { recursive: true, force: true });
fs.mkdirSync(root, { recursive: true });

for (const asset of assets) {
  const archive = path.join(root, asset);
  const response = await fetch(ASSETS[asset], { headers: { Accept: "application/octet-stream", "User-Agent": "Apna-Kaam-build" } });
  if (!response.ok) throw new Error(`Could not download ${asset}: HTTP ${response.status}`);
  fs.writeFileSync(archive, Buffer.from(await response.arrayBuffer()));
  execFileSync("npx", ["7z-wasm", "x", archive, "-o" + root, "-y"], { stdio: "inherit" });
}

function parseSemicolonCsv(file) {
  const text = fs.readFileSync(file, "utf8").replace(/^\uFEFF/, "");
  const lines = text.split(/\r?\n/).filter(Boolean);
  const headers = lines[0].split(";");
  return lines.slice(1).map((line) => {
    const values = line.split(";");
    return Object.fromEntries(headers.map((h, i) => [h, values[i] ?? ""]));
  });
}

const villageFile = path.join(root, "villages.csv");
const ulbFile = path.join(root, "urban_local_bodies.csv");
const ulbCoverageFile = path.join(root, "statewise_ulbs_coverage.csv");
if (!fs.existsSync(villageFile)) throw new Error("villages.csv was not found in the LGD archive");
if (!fs.existsSync(ulbFile)) throw new Error("urban_local_bodies.csv was not found in the LGD archive");
if (!fs.existsSync(ulbCoverageFile)) throw new Error("statewise_ulbs_coverage.csv was not found in the LGD archive");

const villages = parseSemicolonCsv(villageFile)
  .filter((r) => r["State Code"] === "23")
  .map((r) => ({
    code: r["Village Code"],
    name: r["Village Name (In English)"],
    localName: r["Village Name (In Local)"] || "",
    districtCode: r["District Code"],
    district: r["District Name (In English)"],
    tehsilCode: r["Sub-District Code"],
    tehsil: r["Sub-District Name (In English)"],
    status: r["Village Status"] || "",
  }))
  .filter((r) => r.code && r.name && r.district && r.tehsil);

const ulbRows = parseSemicolonCsv(ulbFile);
const coverageRows = parseSemicolonCsv(ulbCoverageFile);
const districtByUlb = new Map();
for (const r of coverageRows.filter((x) => x["State Name (In English)"] === "MADHYA PRADESH")) {
  if (r["Localbody Code"] && r["District Code"]) {
    districtByUlb.set(r["Localbody Code"], { districtCode: r["District Code"], district: r["District Name (In English)"] });
  }
}
const cities = ulbRows
  .filter((r) => r["State Code"] === "23")
  .map((r) => {
    const parent = districtByUlb.get(r["Local Body Code"]);
    return {
      code: r["Local Body Code"],
      name: r["Local Body Name (In English)"],
      localName: r["Local Body Name (In Local)"] || "",
      districtCode: parent?.districtCode || "",
      district: parent?.district || "",
      type: r["Localbody Type Code"] || "",
    };
  })
  .filter((r) => r.code && r.name);
