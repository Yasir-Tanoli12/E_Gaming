/**
 * Read video duration from local File before upload.
 */
export async function getVideoDurationSeconds(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const video = document.createElement("video");
    /** Long / high-bitrate files can take longer to expose duration metadata. */
    const timeoutMs = 180000;
    let timeout: ReturnType<typeof setTimeout> | null = null;
    let resolved = false;

    const cleanup = () => {
      if (timeout) clearTimeout(timeout);
      video.removeAttribute("src");
      video.load();
      URL.revokeObjectURL(objectUrl);
    };

    const finish = (duration: number) => {
      if (resolved) return;
      resolved = true;
      cleanup();
      resolve(duration);
    };

    video.preload = "metadata";
    video.muted = true;
    video.src = objectUrl;

    timeout = setTimeout(() => {
      if (resolved) return;
      cleanup();
      reject(new Error("Could not read video duration. Try another file."));
    }, timeoutMs);

    video.onloadedmetadata = () => {
      const duration = video.duration;
      if (Number.isFinite(duration) && duration > 0) {
        finish(duration);
        return;
      }
      // Some encodes report Infinity until seeking far into the stream.
      video.currentTime = 1e101;
    };

    video.ondurationchange = () => {
      const duration = video.duration;
      if (Number.isFinite(duration) && duration > 0) {
        finish(duration);
      }
    };

    video.onerror = () => {
      if (resolved) return;
      cleanup();
      reject(new Error("Invalid or unsupported video file."));
    };
  });
}
