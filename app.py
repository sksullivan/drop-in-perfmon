import json
from flask import Flask,request,send_from_directory
app = Flask(__name__)


col_names = ['pid','user','pri','nice','virt','phys','share','status','cpu%','mem%','time','task']
observations = []

@app.route('/api/stats')
def hello_world():
    bashCommand = "top -b -n 1 | tail -n +8"
    import subprocess
    process = subprocess.Popen(['sh','-c',bashCommand], stdout=subprocess.PIPE)
    output, error = process.communicate()
    stat_dict_list = map(lambda x: dict(zip(col_names,x.split())),output.split('\n'))[:-1]
    stat_dict_list_sorted = sorted(stat_dict_list, key=lambda k: ''.join(map(lambda column: k[column], request.args.get('sort').split(','))), reverse=True)
    return json.dumps(stat_dict_list_sorted) 

@app.route('/<path:path>')
def send_js(path):
    return send_from_directory('static', path)
