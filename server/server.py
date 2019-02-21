from flask import Flask, request
from flask_cors import CORS
import json
from pprint import pprint
from flask import jsonify
import os

app = Flask(__name__)
CORS(app)

MODELS_DIR = 'server/models/'

if not os.path.exists(MODELS_DIR):
    os.makedirs(MODELS_DIR)

@app.route('/model', methods=['GET', 'POST'])
def model():
    if request.method == 'GET':
        month = request.args.get('month', default = 'null', type = str)
        fileName = month.lower() + '.json'
        print(fileName)
        dataModel = {}
        try:
            file = open(MODELS_DIR + fileName, 'r')
            dataModel = json.load(file)
        except IOError:
            pass

        return jsonify(dataModel)
    elif request.method == 'POST':
        print("posting")
        data = request.get_json(force = True)
        fileName = data['model']['mesec']['ime'].lower() + '.json'

        with open(MODELS_DIR + fileName, 'w+') as outfile:
            # json.dump(data, outfile)
            outfile.write(json.dumps(data, indent=2, sort_keys=True))

    return 'Hello, World!'


if __name__ == '__main__':
    app.jinja_env.auto_reload = True
    app.config['TEMPLATES_AUTO_RELOAD'] = True
    app.run(debug=True, host='0.0.0.0')

# $scope.raspored = {
#     meseci: [
#         {
#             ime: 'Januar-2019',
#             dani: [
#                 {
#                     ime: '01-Pon'.
#                 }
#             ]
#         }
#     ]
# }
