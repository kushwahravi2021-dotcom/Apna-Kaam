import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const DATE = "04Nov2026";
const BASE = "https://github.com/ramSeraph/opendata/releases/download/lgd-latest";
const assets = [
  `villages.${DATE}.csv.7z`,
  `urban_local_bodies.${DATE}.csv.7z`,
];

const root = path.resolve(".location-build");
fs.rmSync(root, { recursive: true, force: true });
fs.mkdirSync(root, { recursive: true });

for (const asset of assets) {
  const archive = path.join(root, asset);
  const response = await fetch(`${BASE}/${asset}`);
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
if (!fs.existsSync(villageFile)) throw new Error("villages.csv was not found in the LGD archive");
if (!fs.existsSync(ulbFile)) throw new Error("urban_local_bodies.csv was not found in the LGD archive");

const villages = parseSemicolonCsv(villageFile)
  .filter((r) => r["State Code"] === "23")
  .map((r) => ({
    code: r["Village Code"],
    name: r["Village Name (In Englsih)"] || r["Village Name (In English)"],
    localName: r["Village Name (In Local)"] || "",
    districtCode: r["District Code"],
    district: r["District Name (In English)"],
    tehsilCode: r["Sub-District Code"],
    tehsil: r["Sub-District Name (In English)"],
    status: r["Village Status"] || "",
  }))
  .filter((r) => r.code && r.name && r.district && r.tehsil);

const cities = parseSemicolonCsv(ulbFile)
  .filter((r) => r["State Code"] === "23")
  .map((r) => ({
    code: r["Local Body Code"],
    name: r["Local Body Name (IN English)"] || r["Local Body Name (In English)"],
    localName: r["Local Body Name (In Local)"] || "",
    districtCode: r["District Code"],
    district: r["District Name (In English)"],
    type: r["Local Body Type Name"] || "",
  }))
  .filter((r) => r.code && r.name && r.district);

const districtMap = new Map();
for (const v of villages) {
  if (!districtMap.has(v.districtCode)) districtMap.set(v.districtCode, { code: v.districtCode, name: v.district, tehsils: new Map() });
  const d = districtMap.get(v.districtCode);
  if (!d.tehsils.has(v.tehsilCode)) d.tehsils.set(v.tehsilCode, { code: v.tehsilCode, name: v.tehsil });
}

const districts = [...districtMap.values()].map((d) => ({
  code: d.code,
  name: d.name,
  tehsils: [...d.tehsils.values()].sort((a,b) => a.name.localeCompare(b.name))
})).sort((a,b) => a.name.localeCompare(b.name));

const payload = {
  state: { code: "23", name: "Madhya Pradesh" },
  source: "Ministry of Panchayati Raj — Local Government Directory (LGD), 04 Nov 2026 snapshot",
  license: "GODL-India",
  counts: { districts: districts.length, villages: villages.length, cities: cities.length, tehsils: districts.reduce((n,d)=>n+d.tehsils.length,0) },
  districts,
  villages,
  cities
};

fs.mkdirSync(path.resolve("public/data"), { recursive: true });
fs.writeFileSync(path.resolve("public/data/mp-locations.json"), JSON.stringify(payload));
fs.rmSync(root, { recursive: true, force: true });
console.log(`MP location data ready: ${payload.counts.districts} districts, ${payload.counts.tehsils} tehsils, ${payload.counts.villages} villages, ${payload.counts.cities} urban local bodies.`);
