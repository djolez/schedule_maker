from flask import Flask, request
from flask_cors import CORS
import json
from pprint import pprint
from flask import jsonify

app = Flask(__name__)
CORS(app)

@app.route('/model', methods=['GET', 'POST'])
def model():
    if request.method == 'GET':
        print("getting")
        dataModel = {}
        try:
            file = open('model.json', 'r')
            dataModel = json.load(file)
        except IOError:
            pass

        # with open('model.json') as f:
        #     dataModel = json.load(f)

        return jsonify(dataModel)
    elif request.method == 'POST':
        print("posting")
        data = request.get_json(force = True)
        with open('model.json', 'w') as outfile:
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
