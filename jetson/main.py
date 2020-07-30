from PyQt5.QtWidgets import QApplication, QWidget, QMainWindow, QFileDialog, QMessageBox, QShortcut
from PyQt5.QtGui import QImage, QPixmap, QKeySequence
from PyQt5.QtCore import QTimer, Qt, QUrl, QCoreApplication, QObject, QRunnable, QThread, QThreadPool, pyqtSignal, pyqtSlot

import snowboydecoder
import sys
import cv2
import os
import json
import numpy as np
import requests
import pyaudio
from queue import Queue
from io import BytesIO
import time
import struct
import wave
import pickle
import tkinter as tk
import traceback
import csv
sensitivity = 0.7
model_file = './computer.umdl'
detection = snowboydecoder.HotwordDetector(model_file, sensitivity=sensitivity)
url_check = 'https://fva.now.sh/api/checkFromJetson'

# GUI of register app
from ui_jetsonWindow import *

class RecordSignals(QObject):
    '''
    Defines the signals available from a running worker thread.

    Supported signals are:

    finished
        No data
    
    error
        `tuple` (exctype, value, traceback.format_exc() )
    
    result
        `object` data returned from processing, anything

    progress
        `int` indicating % progress 

    '''
    finished = pyqtSignal()
    error = pyqtSignal(tuple)
    result = pyqtSignal(object)
    progress = pyqtSignal(object)


class Record(QRunnable):
    '''
    Worker thread

    Inherits from QRunnable to handler worker thread setup, signals and wrap-up.

    :param callback: The function callback to run on this worker thread. Supplied args and 
                     kwargs will be passed through to the runner.
    :type callback: function
    :param args: Arguments to pass to the callback function
    :param kwargs: Keywords to pass to the callback function

    '''

    def __init__(self, fn, *args, **kwargs):
        super(Record, self).__init__()

        # Store constructor arguments (re-used for processing)
        self.fn = fn
        self.args = args
        self.kwargs = kwargs
        self.signals = RecordSignals()    

        # Add the callback to our kwargs
        self.kwargs['progress_callback'] = self.signals.progress        

    @pyqtSlot()
    def run(self):
        '''
        Initialise the runner function with passed args, kwargs.
        '''
        
        # Retrieve args/kwargs here; and fire processing using them
        try:
            result = self.fn(*self.args, **self.kwargs)
        except:
            traceback.print_exc()
            exctype, value = sys.exc_info()[:2]
            self.signals.error.emit((exctype, value, traceback.format_exc()))
        else:
            self.signals.result.emit(result)  # Return the result of the processing
        finally:
            self.signals.finished.emit()  # Done

# First window for filling ID
class JetsonWindow(QMainWindow):
    # class constructor
    def __init__(self):
        # call QWidget constructor
        super().__init__()
        self.ui = Ui_JetsonWindow()
        self.ui.setupUi(self)
    
        self.root = tk.Tk()
        self.w = self.root.winfo_screenwidth()
        self.h = self.root.winfo_screenheight()
        self.queue = Queue()
        self.image = None
        self.box = None
        self.shortcut = QShortcut(QKeySequence("Ctrl+Esc"), self)
        self.shortcut.activated.connect(self.closeApp)
        
        self.threadpool = QThreadPool()
        print("Multithreading with maximum %d threads" % self.threadpool.maxThreadCount())
        
        # self.server_url = 'http://192.168.1.3:5001/'

        
        self.p = pyaudio.PyAudio()
        self.stream = self.p.open(
                        rate=16000,
                        channels=1,
                        format=pyaudio.paInt16,
                        input=True,
                        frames_per_buffer=512,
                        input_device_index=11,
                        stream_callback = self.callback
        )
        self.stream.start_stream()
        self.list = []
        with open('DATA.csv', newline='') as f:
            reader = list(csv.reader(f))
            for data in reader:
                self.list.append(data[0])
        self.server_url = self.list.pop()
        self.list.append('NOT IDENTIFIED')
        print(f"Server url: {self.server_url}")
        print(f"ID List: {self.list}")

        # self.list = ['1752015', '1752259', '1752041', 'NOT INDENTIFIED']

        # create a timer
        self.timer = QTimer()
        # set timer timeout callback function that check temporary ID
        self.timer.timeout.connect(self.Attendance)

        #Run Face Recognition
        self.cap = cv2.VideoCapture(self.gstreamer_pipeline(), cv2.CAP_GSTREAMER)
        self.flag = 0

        self.timer.start(20)

    def closeApp(self):
        app.quit()

    def callback(self, in_data, frame_count, time_info, status):
        self.queue.put(in_data)
        return (in_data, pyaudio.paContinue)
    
    def gstreamer_pipeline(self,
        capture_width=1280,
        capture_height=720,
        display_width=1280,
        display_height=720,
        framerate=90,
        flip_method=0,
    ):
        return (
            "nvarguscamerasrc ! "
            "video/x-raw(memory:NVMM), "
            "width=(int)%d, height=(int)%d, "
            "format=(string)NV12, framerate=(fraction)%d/1 ! "
            "nvvidconv flip-method=%d ! "
            "video/x-raw, width=(int)%d, height=(int)%d, format=(string)BGRx ! "
            "videoconvert ! "
            "video/x-raw, format=(string)BGR ! appsink"
            % (
                capture_width,
                capture_height,
                framerate,
                flip_method,
                display_width,
                display_height,
            )
        )

    def progress_fn(self, n):
        n = int(n)
        print("%d%% done" % n)
        if n == 0:
            self.ui.infor_label.setText("Recording |")
        if n == 20:
            self.ui.infor_label.setText("Recording /")
        if n == 40:
            self.ui.infor_label.setText("Recording -")
        if n == 60:
            self.ui.infor_label.setText("Recording \\")
        if n == 80:
            self.ui.infor_label.setText("Recording |")
        if n == 91:
            self.ui.infor_label.setText("Done Recording")

    def execute_voice(self, progress_callback): # main function
        voiceframes = []
        p = pyaudio.PyAudio()
        stream = p.open(
                rate=16000,
                channels=1,
                format=pyaudio.paInt16,
                input=True,
                frames_per_buffer=512,
                input_device_index=11,
        )
        stream.start_stream()
        for i in range(0, int(16000/512*3)):
            voiceframes.append(stream.read(512))
            progress_callback.emit(i)
        
        p.terminate()
        stream.close()
        return voiceframes

    def print_output(self, voice):
        # send server
        voice = list(voice)
        print("Output printing...")
        encapsulate_face = pickle.dumps(self.image, protocol=pickle.HIGHEST_PROTOCOL)
        encapsulate_voice = pickle.dumps(voice, protocol=pickle.HIGHEST_PROTOCOL)
        face_response = requests.post(self.server_url+'face', data=encapsulate_face).json()
        face_result = np.array(face_response['data'])
        voice_response = requests.post(self.server_url+'voice', data=encapsulate_voice).json()['data']
        voice_result = np.array(voice_response)
        # result =  np.add(face_result*0.8, voice_result*0.2)
        result = 2*face_result*voice_result/(face_result+voice_result)
        if np.any(result > 0.9):
            name = "Device 1 \n" + self.list[result.argmax()] + f': {round(result[result.argmax()] * 100 , 1)}'
            requests.post(url_check, data={'roomId':'A4405', 'stuId': self.list[result.argmax()]})
        else:
            name = "Device 1 \n" + self.list[-1]
        self.ui.infor_label.setText(name)

    def thread_complete(self):
        print("THREAD COMPLETE!")
        self.p = pyaudio.PyAudio()
        self.stream = self.p.open(
                        rate=16000,
                        channels=1,
                        format=pyaudio.paInt16,
                        input=True,
                        frames_per_buffer=512,
                        input_device_index=11,
                        stream_callback = self.callback
        )
        self.stream.start_stream()

    def recording(self):
        self.p.terminate()
        self.stream.close()
        # Pass the function to execute
        record = Record(self.execute_voice) # Any other args, kwargs are passed to the run function
        record.signals.result.connect(self.print_output)
        record.signals.finished.connect(self.thread_complete)
        record.signals.progress.connect(self.progress_fn)
        
        # Execute
        self.threadpool.start(record) 
    
    def Attendance(self):
        ret, self.image = self.cap.read()
        img = self.image
        # cv2.rectangle(img, (480, 180), (800, 600), (0, 0, 0), thickness=2)
        procimage = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        # get image infos
        height, width, channel = procimage.shape
        step = channel * width
                    
        # create QImage from image
        qImg = QImage(procimage.data, width, height, step, QImage.Format_RGB888)
        # show image in img_label
        wi = self.ui.image_label.width()
        he = self.ui.image_label.height()

        self.ui.image_label.setPixmap(QPixmap.fromImage(qImg).scaled(wi, he, QtCore.Qt.KeepAspectRatio))

        if self.queue.qsize() > 0:
            while self.queue.qsize() > 32:
                self.queue.get()
            buff = []
            if self.queue.qsize() >= 32:
                while self.queue.qsize() > 0:
                    buff.append(self.queue.get())
            ans = detection.detector.RunDetection(b''.join(buff))
            if ans==1:
                print("success")
                self.recording()
                



        return 0

        
if __name__ == '__main__':
    app = QApplication(sys.argv)

    # create and show mainWindow
    mainWindow = JetsonWindow()
    mainWindow.showFullScreen()
    # mainWindow.show()

    sys.exit(app.exec_())
