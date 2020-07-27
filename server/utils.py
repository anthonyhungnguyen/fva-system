import os
from resemblyzer import VoiceEncoder, preprocess_wav
import pickle
import cv2
import numpy as np
import dlib
import tensorflow as tf
import wave
import pyaudio

lst = ['1752015', '1752259', '1752041', 'Guest']
detector = dlib.get_frontal_face_detector()
predictor = dlib.shape_predictor(
    './Face/shape_predictor_68_face_landmarks.dat')
facerec = dlib.face_recognition_model_v1(
    './Face/dlib_face_recognition_resnet_model_v1.dat')

faceModel = tf.keras.models.load_model('./Face/facemodel.h5')
voiceModel = tf.keras.models.load_model('./Voice/voicemodel.h5')
encoder = VoiceEncoder('cpu')


def faceRun(image):
    dets = detector(image)
    if dets:
        max_a = (dets[0].bottom() - dets[0].top()) * \
            (dets[0].right() - dets[0].left())
        d = dets[0]
        if len(dets) > 1:
            for dz in dets[1:]:
                h = (dz.bottom() - dz.top()) * (dz.right() - dz.left())
                if h > max_a:
                    d = dz
        
        left = d.left()
        right = d.right()
        top = d.top()
        bottom = d.bottom()

        shape = predictor(image, d)
        face = facerec.compute_face_descriptor(image, shape)
        face = faceModel.predict(np.array(face).reshape(-1, 1, 128)).flatten()
        return face.tolist(), left, right, top, bottom
    return None

def voiceRun(frames):
    p = pyaudio.PyAudio()
    wf = wave.open('check.wav', 'wb')
    wf.setnchannels(1)
    wf.setsampwidth(p.get_sample_size(pyaudio.paInt16))
    wf.setframerate(16000)
    wf.writeframes(b''.join(frames))
    wf.writeframes(b''.join(frames))
    wf.close()
    wav = preprocess_wav('check.wav')
    embed = encoder.embed_utterance(wav)
    embed = np.array(embed).reshape(-1, 1, 256)
    res1 = voiceModel.predict(embed)
    res1 = res1.flatten()
    return res1.tolist()


def loadFromPickle(pickleFile):
    return pickle.load(pickleFile)
