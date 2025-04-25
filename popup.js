
document.getElementById('playBtn').addEventListener('click', async function () {
    const rtspUrl = document.getElementById('rtspInput').value;
    const video = document.getElementById('videoPlayer');

    if (!rtspUrl.startsWith('rtsp://')) {
        alert("Please enter a valid RTSP link.");
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/api/start-stream', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ rtspUrl })
        });

        const data = await response.json();
        const hlsUrl = data.hlsUrl;

        if (!hlsUrl) throw new Error("No HLS URL returned");

        // Retry logic to wait until HLS playlist becomes available
        const maxAttempts = 8; // ~16 seconds (2s interval)
        let attempts = 0;

        const tryLoadHLS = async () => {
            try {
                const probe = await fetch(hlsUrl, { method: 'HEAD' });
                if (probe.ok) {
                    if (Hls.isSupported()) {
                        const hls = new Hls();
                        hls.loadSource(hlsUrl);
                        hls.attachMedia(video);
                        hls.on(Hls.Events.MANIFEST_PARSED, () => {
                            video.play();
                        });
                    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                        video.src = hlsUrl;
                        video.addEventListener('loadedmetadata', () => {
                            video.play();
                        });
                    } else {
                        alert("HLS not supported in this browser.");
                    }
                    return;
                }
            } catch (e) {
                // Ignore fetch errors and retry
            }

            if (++attempts < maxAttempts) {
                setTimeout(tryLoadHLS, 2000);
            } else {
                alert("Stream not ready after multiple attempts. Try again later.");
            }
        };

        tryLoadHLS();

    } catch (err) {
        console.error('Error starting stream:', err);
        alert("Failed to start stream. Please check RTSP link or server status.");
    }
});
