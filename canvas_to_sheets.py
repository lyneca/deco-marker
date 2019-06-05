import requests
from tqdm import tqdm
from pprint import pprint
import multiprocessing as mp

URL = "https://script.google.com/macros/s/AKfycbxYB3-IF-UW1xeYpMqD5F5l4hyHBNk8UDq8LB-XCgmBaiOLIR4G/exec"

BASE_URL = 'https://canvas.sydney.edu.au/api/v1'
SPREADSHEET_ID = "15_S3NnkU6Z7lEXlEEpWCsYy0tDbs_46tkt5khuCkcOI"

COURSE = 13984
ASSIGNMENT = 130963

CRITERIA = [ '_5362', '_6391', '_2163' ]

with open('token') as f:
    TOKEN = f.read().strip()

HEADERS = {
    'Authorization': 'Bearer ' + TOKEN,
    'Content-Type': 'multipart/form-data'
}

markers = {
    2652: "Liam",
    33665: "Michael",
    127108: "Kartik",
    27704: "Harrison",
    40726: "Callum",
    114342: "Crystal",
    45172: "Alex",
    87131: "Luke"
}

users = {}

def get_student(sid):
    r = requests.get(
        f"{BASE_URL}/courses/{COURSE}/assignments/{ASSIGNMENT}/submissions/{sid}",
        "include[]=rubric_assessment&include[]=submission_comments",
        headers=HEADERS
    )
    return r.json()

def clear_sheet():
    return requests.post(URL);

def append_row(student):
    sid = int(student["user_id"])
    user = users[sid]
    comments = student["submission_comments"]
    if user[0] not in allocations:
        return
    crit_a = ""
    crit_b = ""
    crit_c = ""
    if "rubric_assessment" in student and "points" in student["rubric_assessment"][CRITERIA[0]]:
        print(student)
        crit_a = student["rubric_assessment"][CRITERIA[0]]["points"]
        crit_b = student["rubric_assessment"][CRITERIA[1]]["points"]
        crit_c = student["rubric_assessment"][CRITERIA[2]]["points"]
    r = requests.get(
        URL,
        {
            "Marker": markers[allocations[user[0]]],
            "SID": user[0],
            "Unikey": user[1],
            "Name": user[2],
            "Comments": '\n\n'.join([
                x["comment"]
               for x in comments
               if x["author"]["id"] == allocations[user[0]]
            ]),
            "Criteria A": crit_a,
            "Criteria B": crit_b,
            "Criteria C": crit_c,
            "Final Grade": float(student["score"]) if student["score"] is not None else "",
        }
    )
    return r

def get_users():
    with open('users') as f:
        users = [x.strip().split('|') for x in f.read().strip().split('\n')]
        users = {int(u[0]): (int(u[1]), u[2], u[3]) for u in users}
        return users

with open('allocations') as f:
    a = [x.strip().split('|') for x in f.read().strip().split('\n')]
    allocations = {}
    for s in a:
        allocations[int(s[0])] = int(s[1])

users = get_users()

#  pprint(get_student(137070))

test = {
    "user_id": 137070,
    "submission_comments": [
        {
            "comment": "Hello, world",
            "author": {
                "id": 87131
            }
        }
    ],
    "score": "300"
}

clear_sheet()
def process(student):
    append_row(get_student(student))
with mp.Pool() as pool:
    list(tqdm(pool.imap(process, users), total=len(users)))
