import fs from "node:fs";

const required = [
  "ANDROID_KEYSTORE_PATH",
  "ANDROID_KEYSTORE_PASSWORD",
  "ANDROID_KEY_ALIAS",
  "ANDROID_KEY_PASSWORD"
];

for (const key of required) {
  if (!process.env[key]) throw new Error(`Missing Android signing variable: ${key}`);
}

const path = "android/app/build.gradle";
let gradle = fs.readFileSync(path, "utf8");

if (!gradle.includes("signingConfigs.release")) {
  gradle = gradle.replace(
    /android\s*\{/,
    `android {
    signingConfigs {
        release {
            storeFile file(System.getenv("ANDROID_KEYSTORE_PATH"))
            storePassword System.getenv("ANDROID_KEYSTORE_PASSWORD")
            keyAlias System.getenv("ANDROID_KEY_ALIAS")
            keyPassword System.getenv("ANDROID_KEY_PASSWORD")
        }
    }`
  );
}

if (!/buildTypes\s*\{[\s\S]*?release\s*\{[\s\S]*?signingConfig\s+signingConfigs\.release/.test(gradle)) {
  gradle = gradle.replace(
    /(buildTypes\s*\{\s*release\s*\{)/,
    "$1\n            signingConfig signingConfigs.release"
  );
}

fs.writeFileSync(path, gradle);
console.log("Android release signing configured.");
