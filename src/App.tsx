import React from 'react';
import './App.css';
import Webcam from "react-webcam";
import * as tf from  '@tensorflow/tfjs';
import { detectFace, loadModel } from './faceDetection/faceDetection';
import _cv from './cv';

const imageSizeX = 224;
const imageSizeY = 224;
const videoSizeX = 1024;
const videoSizeY = 768;
const videoConstraints = {
  width: videoSizeX,
  height: videoSizeY,
  facingMode: "user"
};

const MOODS = ["Anger", "Disgust", "Fear", "Happiness", "Neutral", "Sadness", "Surprise", "N/A"];

function App() {
    const webcamRef : React.Ref<Webcam> = React.useRef(null);
    let i = 0;
    React.useEffect(() => {
        console.log("Calling", i);
        i++;
        loadModel();
    }, []);

    const [moodScores, setMoodScores] = React.useState<number[]>([0, 0, 0, 0, 0, 0, 0]);
    const model = React.useMemo(async () => {
        const m = await tf.loadGraphModel("/model/model.json");
        return m;
    }, []);

    const capture = React.useCallback(
        async () => {
            const imageSrc = webcamRef.current ? webcamRef.current.getCanvas() : null;
            if (imageSrc === null)  {
                return;
            }

            const img = detectFace(imageSrc);
            if (img === null) {
                return;
            }
            // cv
            console.log('image width: ' + img.cols + '\n' +
            'image height: ' + img.rows + '\n' +
            'image size: ' + img.size().width + '*' + img.size().height + '\n' +
            'image depth: ' + img.depth() + '\n' +
            'image channels ' + img.channels() + '\n' +
            'image type: ' + img.type() + '\n');
            const tensorInput = [];
            for (let i = 0; i < imageSizeY; i++) {
                for (let j = 0; j < imageSizeX; j++) {
                    tensorInput.push(img.ucharAt(i, j * img.channels()) - 103.939);
                    tensorInput.push(img.ucharAt(i, j * img.channels() + 1) - 116.779);
                    tensorInput.push(img.ucharAt(i, j * img.channels() + 2) - 123.68);
                }
            }

            const realModel = await model;
            const input = tf.tensor(tensorInput, [1, imageSizeX, imageSizeY, 3], "float32");
            let out: tf.Tensor;
            try {
                out = realModel.execute(input) as tf.Tensor;
            } finally {
                input.dispose();
            }
            const outputData = await out.data();
            const outputArray = []
            for (let i = 0; i < 7; i++) {
                outputArray.push(outputData.at(i) as number);
            }
            setMoodScores(outputArray);
        },
        [webcamRef, model]
    );
    React.useEffect(() => {
        let cancelTimer: NodeJS.Timeout;
        const f = () => {
            try { capture(); } catch (e) { console.error(e); };
            cancelTimer = setTimeout(f, 1000);
        }

        cancelTimer = setTimeout(f, 500);
        return () => clearTimeout(cancelTimer);
    }, [capture]);

    let currentMood: number = 0;
    let currentMax: number = moodScores[0];
    for (let i = 1; i < 7; i++) {
        if (currentMax <= moodScores[i]) {
            currentMax = moodScores[i];
            currentMood = i;
        }
    }

    if (currentMax < 0.05) {
        currentMood = 7;
    }
    return (
        <div className="App">
            <h3>{MOODS[currentMood]}</h3>
            <Webcam
               audio={false}
               height={videoSizeY}
               ref={webcamRef}
               screenshotFormat="image/jpeg"
               width={videoSizeX}
               videoConstraints={videoConstraints}
            />
        </div>
    );
}

export default App;
