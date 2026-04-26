async function run() {
  try {
    const res = await fetch("http://localhost:3000/api/upload-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filename: "hello.pdf", contentType: "application/pdf" })
    });
    console.log("Status:", res.status);
    console.log("Body:", await res.text());
  } catch (e) {
    console.error(e);
  }
}
run();
