from flask import Flask, request, render_template, url_for, send_file, abort, make_response
import requests as req
from pprint import pprint
import os
import re

app = Flask(__name__)

current_user = ''

users = {}

#  BASE_URL = 'https://sydney.test.instructure.com/api/v1'
BASE_URL = 'https://canvas.sydney.edu.au/api/v1'

COURSE = 13984
ASSIGNMENT = 130963

CRITERIA = [ '_5362', '_6391', '_2163' ]

sids = []

with open('token') as f:
    TOKEN = f.read().strip()

HEADERS = {
    'Authorization': 'Bearer ' + TOKEN,
    'Content-Type': 'multipart/form-data'
}

def nocache(s):
    resp = make_response(s)
    resp.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
    resp.headers['Pragma'] = 'no-cache'
    resp.headers['Expires'] = '0'
    return resp

@app.route('/grade', methods=['POST'])
def grade():
    json = request.get_json()
    send_assignment(json['sid'], json['rubric'], json['comment'], json['mark'])
    return nocache("{}")

@app.route('/<int:sid>')
def view(sid):
    global current_user
    current_user = users[sid]

    return render_template('view.html',
                           sid=current_user['sid'],
                           name=current_user['name'],
                           late=current_user['late'])

@app.route('/mySketch.js')
def get_sketch():
    if os.path.exists(f"extracted/{current_user['latest_submission']}/mySketch.js"):
        return nocache(send_file(f"extracted/{current_user['latest_submission']}/mySketch.js"))
    else:
        return nocache(send_file(f"extracted/{current_user['latest_submission']}/sketch.js"))

@app.route('/index.html')
def extracted_index():
    print("boop");
    return nocache(send_file(f"fixed_index.html"))

@app.route('/<path:path>')
def static_proxy(path):
    if path != 'favicon.ico':
        return nocache(send_file(f"extracted/{current_user['latest_submission']}/{path}"))
    abort(404);

@app.route('/')
def index():
    return nocache(render_template(
        'index.html',
        student_ids=sorted(list(users.keys()), key=lambda x: users[x]['unikey']),
        students=users))

def send_assignment(sid, rubric, comment, mark):
    print(sid, rubric, comment, mark)
    print("Sending to",
          f'{BASE_URL}/courses/{COURSE}/assignments/{ASSIGNMENT}/submissions/sis_user_id:{sid}')
    r = req.put(
        f'{BASE_URL}/courses/{COURSE}/assignments/{ASSIGNMENT}/submissions/sis_user_id:{sid}',
        data=(f'submission[posted_grade]={mark}'
              f'&comment[text_comment]={comment}'
              f'&rubric_assessment[{CRITERIA[0]}][points]={rubric["A"]}'
              f'&rubric_assessment[{CRITERIA[1]}][points]={rubric["B"]}'
              f'&rubric_assessment[{CRITERIA[2]}][points]={rubric["C"]}'),
        headers=HEADERS).json()

def get_user_id(filename):
    match = re.match(r'^\w+_(late_)?(\d+)_(\d+).+$', filename)
    if match:
        return int(match.group(2))

    match = re.match(r'^\w+_(late_)?(\d+)_text.+$', filename)
    if match:
        return int(match.group(2))

def get_submission_id(filename):
    match = re.match(r'^\w+_(late_)?(\d+)_(\d+).+$', filename)
    if match:
        return int(match.group(3))
    return 0

def get_sketch_path(filename):
    if not os.path.isdir(f'extracted/{filename}'):
        return ''
    if 'index.html' in os.listdir(f'extracted/{filename}'):
        return filename
    for f in os.listdir(f'extracted/{filename}'):
        if not os.path.isdir(f'extracted/{filename}/{f}'):
            continue;
        if 'index.html' in os.listdir(f'extracted/{filename}/{f}'):
            return f'{filename}/{f}'
    return ''

def get_users():
    with open('users') as f:
        users = [x.strip().split('|') for x in f.read().strip().split('\n')]
        users = [(int(u[0]), int(u[1]), u[2], u[3]) for u in users]
        return users

if __name__ == '__main__':
    files = os.listdir('extracted/')
    ids = {get_user_id(f): {} for f in files}
    if os.path.exists('sids'):
        with open('sids') as f:
            sids = f.readlines()
            sids = [int(x.strip()) for x in sids if x]
    for f in files:
        ids[get_user_id(f)][get_submission_id(f)] = get_sketch_path(f)
    for user in get_users():
        if user[0] in ids:
            if sids and int(user[1]) not in sids:
                continue
            users[user[0]] = {
                'name': user[3],
                'unikey': user[2],
                'submissions': ids[user[0]],
                'latest_submission': ids[user[0]][max([x for x in ids[user[0]]])],
                'sid': int(user[1]),
            }
            users[user[0]]['late'] = ('_late_' in users[user[0]]['latest_submission'])
    #  app.run(ssl_context='adhoc')
    app.run()
