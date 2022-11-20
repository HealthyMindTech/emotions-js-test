import { loadHaarFaceModels, detectHaarFace } from "./haarFaceDetection";
import _cv from "../cv";

export async function loadModel() {
    await loadHaarFaceModels();
}

export function detectFace(canvas: HTMLCanvasElement) {
    const cv = _cv();
    if (cv === null) {
        return null;
    }
    const img = cv.imread(canvas);
    let croppedImage = null;
    const rects = detectHaarFace(img);
    try {
        if (rects.size() == 0) {
            return null;
        }
        const rect = rects.get(0);
        croppedImage = img.roi(new cv.Rect(rect.x - 20, rect.y - 20, rect.width + 40, rect.height + 40));
        const dest = new cv.Mat();
        cv.resize(croppedImage, dest, new cv.Size(224, 224));
        return dest;
    } finally {
        rects.delete();
        img.delete();
        if (croppedImage) croppedImage.delete();
    }
}
