import _cv from "../cv";
import { loadDataFile } from "./cvDataFile";

let faceCascade: any = null;
let called = false;
export async function loadHaarFaceModels() {
    if (called) {
        return;
    }
    called = true;
    console.log("=======start downloading Haar-cascade models=======");

    await loadDataFile(
        "haarcascade_frontalface_default.xml",
        "opencv_models/haarcascade_frontalface_default.xml"
    );

    console.log("=======downloaded Haar-cascade models=======");

    await new Promise((resolve: any) => {

        const f = () => {
            try {
                const cv = _cv();
                if (cv === null) {
                    setTimeout(f, 1000);
                }
                // load pre-trained classifiers
                faceCascade = new cv.CascadeClassifier();

                faceCascade.load("/haarcascade_frontalface_default.xml");
            } catch (e: any) {
                console.error(e);
                setTimeout(f, 1000);
            }
            resolve();
        };
        setTimeout(f, 1000);
    });
}

// /**
//  * Detect faces from the input image.
//  * See https://docs.opencv.org/master/d2/d99/tutorial_js_face_detection.html
//  * @param {cv.Mat} img Input image
//  * @returns the modified image with detected faces drawn on it.
//  */
export function detectHaarFace(img: any): any {
    const cv = _cv();
    const msize = new cv.Size(0, 0);

    if (cv === null) {
        return;
    }
    const gray = new cv.Mat();
    try {
        cv.cvtColor(img, gray, cv.COLOR_RGBA2GRAY, 0);

        const faces = new cv.RectVector();

        if (faceCascade === null) {
            console.error("No face cascade");
            return faces;
        }

        faceCascade.detectMultiScale(gray, faces, 1.1, 3, 0, msize, msize);
        return faces;
    } finally {
        gray.delete();
    }
}
