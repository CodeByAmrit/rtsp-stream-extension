document.getElementById('openBtn').addEventListener('click', () => {
    const rtspUrl = document.getElementById('rtspInput').value.trim();
    if (rtspUrl) {
        const encodedURL = encodeURIComponent(rtspUrl);
        // const fullURL = `http://localhost:3000/?rtsp=${encodedURL}`;
        const fullURL = `https://cctvcameralive.in/?rtsp=${encodedURL}`;

        chrome.tabs.create({ url: fullURL });
    } else {
        alert('Please enter a valid RTSP URL.');
    }
});