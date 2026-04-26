import fetch from 'node-fetch';

async function test() {
  try {
    const res = await fetch("https://pub-16c77c3aa29c4145b29453efaaf65851.r2.dev/");
    console.log("Status:", res.status);
    console.log("Text:", await res.text());
  } catch(e) {
    console.error(e);
  }
}
test();
