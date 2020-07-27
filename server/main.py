from flask import Flask, request
import json
from utils import loadFromPickle, faceRun, voiceRun
import pickle

app = Flask(__name__)


@app.route('/face', methods=['POST'])
def face_detect():
    if request.method == 'POST':
        data = pickle.loads(request.data)
        result = faceRun(data)
        if result:
            ret, left, right, top, bottom = result
            print('Face', ret)
            return json.dumps({'data': ret, 'box':[left, right, top, bottom]})
        else:
            return json.dumps({'data': None})

@app.route('/voice', methods=['POST'])
def voice_detect():
    if request.method == 'POST':
        data = pickle.loads(request.data)
        ret = voiceRun(data)
        print('Voice', ret)
        return json.dumps({'data': ret})

# When debug = True, code is reloaded on the fly while saved
app.run(host='192.168.1.3', port='5001', debug=True)
