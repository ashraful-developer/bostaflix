<!DOCTYPE html>
<html>
<head>
  <script src="/aes.js"></script> <!-- your own copy -->
</head>
<body>
<script>
async function runToken() {
    // Load remote page through your backend
    const response = await fetch(`/api/token?url=${encodeURIComponent("https://example.com/page")}`);
    const html = await response.text();

    // Example: extract 3 values required
    const match = html.match(/toNumbers\("([0-9a-f]+)"\)[\s\S]*toNumbers\("([0-9a-f]+)"\)[\s\S]*toNumbers\("([0-9a-f]+)"\)/);

    if (!match) {
        console.log("No AES data found");
        return;
    }

    const [_, aHex, bHex, cHex] = match;

    function toNumbers(hex) {
        return hex.match(/../g).map(h => parseInt(h, 16));
    }

    const a = toNumbers(aHex);
    const b = toNumbers(bHex);
    const c = toNumbers(cHex);

    // Use your own aes.js (slowAES) for YOUR OWN COOKIE
    const result = slowAES.decrypt(c, 2, a, b);
    const token = result.map(v => ('0' + v.toString(16)).slice(-2)).join('');

    // Set your own cookie
    document.cookie = "mytoken=" + token + "; path=/; max-age=86400";

    console.log("Token:", token);
}

runToken();
</script>
</body>
</html>
