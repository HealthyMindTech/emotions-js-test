import _cv from '../cv';

let imported = false;
let called = false;
export async function loadDataFile(cvFilePath: string, url: string): Promise<any> {
    if (called) {
        return;
    }
    called = true;
    // see https://docs.opencv.org/master/utils.js
    const f = async function() {
        if (imported) return;
        const cv = _cv();
        if (cv === null) {
            await new Promise((resolve: any) => setTimeout(() => { f(); resolve(); }, 200));
            return;
        }
        const response = await fetch(url);
        const buffer = await response.arrayBuffer();
        const data = new Uint8Array(buffer);
        console.log("Creating datafile", cvFilePath);
        try {
            await cv.FS_createDataFile("/", cvFilePath, data, true, false, false);
        } catch (e:any ) {
            console.error(e);
            await f();
            return;
        }
        console.log("Created datafile");
        imported = true;
    }
    await f();
    return;
}
