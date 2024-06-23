/**
 * Show media stream in a video element
 *
 * @param stream MediaStream to read from
 * @param video
 * @param muted
 */
export function showVideo(
    stream: MediaStream | null,
    video: HTMLVideoElement,
    muted = true
) {
    video.srcObject = stream
    video.volume = muted ? 0 : 1
    video.onloadedmetadata = () =>
        video.play().catch((error) => {
            console.error(error)
        })
}
