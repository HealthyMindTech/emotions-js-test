import __cv from './opencv_js';

let _loaded = false;
let _cv: any;
__cv().then((cv: any) => {
    _loaded = true;
    _cv = cv;
}).catch((e: any) => console.error(e));

function cv(): any {
    if (_loaded) {
        return _cv;
    } else {
        return null;
    }
}

export default cv;
