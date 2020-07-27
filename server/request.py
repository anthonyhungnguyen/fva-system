import requests
import json
import cv2
import numpy as np
import pickle
import time
import pyaudio

lst = ['1752015', '1752259', '1752041', 'Guest']

def loadFromPickle(pickleFile):
    return pickle.load(pickleFile)

def faceRequest():

    url = 'http://127.0.0.1:5001/face'
    while True:
        ret, frame = cam.read()
        data = pickle.dumps(frame, protocol=pickle.HIGHEST_PROTOCOL)
        resp = requests.post(url, data=data).json()['data']
        resp = np.array(resp)
        if type(resp) is not int:
            if resp.any() > 0.9:
                print(resp, lst[resp.argmax()])
            else:
                print(resp, 'Guest')
        if cv2.waitKey(1) == 27:
            break

def voiceRequest():
    while True:
        url = 'http://127.0.0.1:5001/voice'
        p = pyaudio.PyAudio()

        stream = p.open(
            rate=16000,
            channels=1,
            format=pyaudio.paInt16,
            input=True,
            frames_per_buffer=512,
            # input_device_index=1
        )
        stream.start_stream()
        print("* recording")

        frames = []

        for _ in range(0, int(16000 / 512 * 2)):
            data = stream.read(512)
            frames.append(data)

        print("* done recording")
        stream.stop_stream()
        stream.close()
        p.terminate()
        data = pickle.dumps(frames, protocol=pickle.HIGHEST_PROTOCOL)
        resp = requests.post(url, data=data).json()['data']
        resp = np.array(resp)
        print(resp, lst[resp.argmax()])
if __name__ == '__main__':
    cam = cv2.VideoCapture(0)
    cam.set(3, 400)
    cam.set(4, 400)
    faceRequest()

    # voiceRequest()
