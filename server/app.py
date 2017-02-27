from datetime import timedelta
import json
from flask import Flask,make_response,request,send_from_directory
from functools import update_wrapper
app = Flask(__name__)


def crossdomain(origin=None, methods=None, headers=None,
                max_age=21600, attach_to_all=True,
                automatic_options=True):
    if methods is not None:
        methods = ', '.join(sorted(x.upper() for x in methods))
    if headers is not None and not isinstance(headers, basestring):
        headers = ', '.join(x.upper() for x in headers)
    if not isinstance(origin, basestring):
        origin = ', '.join(origin)
    if isinstance(max_age, timedelta):
        max_age = max_age.total_seconds()

    def get_methods():
        if methods is not None:
            return methods

        options_resp = app.make_default_options_response()
        return options_resp.headers['allow']

    def decorator(f):
        def wrapped_function(*args, **kwargs):
            if automatic_options and request.method == 'OPTIONS':
                resp = app.make_default_options_response()
            else:
                resp = make_response(f(*args, **kwargs))
            if not attach_to_all and request.method != 'OPTIONS':
                return resp

            h = resp.headers

            h['Access-Control-Allow-Origin'] = origin
            h['Access-Control-Allow-Methods'] = get_methods()
            h['Access-Control-Max-Age'] = str(max_age)
            if headers is not None:
                h['Access-Control-Allow-Headers'] = headers
            return resp

        f.provide_automatic_options = False
        return update_wrapper(wrapped_function, f)
    return decorator


col_names = ['pid','user','pri','nice','virt','phys','share','status','cpu%','mem%','time','task']
observations = []

@app.route('/api/stats')
@crossdomain(origin='*')
def hello_world():
    bashCommand = "top -b -n 1 | tail -n +8"
    import subprocess
    process = subprocess.Popen(['sh','-c',bashCommand], stdout=subprocess.PIPE)
    output, error = process.communicate()
    stat_dict_list = map(lambda x: dict(zip(col_names,x.split())),output.split('\n'))[:-1]
    stat_dict_list_sorted = sorted(stat_dict_list, key=lambda k: ''.join(map(lambda column: k[column], request.args.get('sort',default='cpu%').split(','))), reverse=True)
    return json.dumps(stat_dict_list_sorted) 

@app.route('/<path:path>')
def send_js(path):
    return send_from_directory('../dist', path)
