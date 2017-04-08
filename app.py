from flask import Flask, render_template, g, request
import random
import sqlite3
import json

DATABASE = "db/database.db"
DATA_FOLDER = './data'

app = Flask(__name__)

def get_db():
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = sqlite3.connect(DATABASE)
    return db

def init_db():
    with app.app_context():
        db = get_db()
        with app.open_resource('schema.sql', mode='r') as f:
            db.cursor().executescript(f.read())
        db.commit()

@app.route("/ping")
def ping():
    return "pong"

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/save_data",methods=['POST'])
def save_data():
    data = request.json
    # import ipdb
    # ipdb.set_trace()
    
    file_type = data['format'].split('/')[-1]
    file_id = str(random.randint(0,1e6))
    file_name = "%s.%s"%(file_id,file_type)


    with open("%s/%s"%(DATA_FOLDER,file_name), "wb") as fh:
        fh.write(data['image'].decode('base64'))

    with open("%s/data.txt"%DATA_FOLDER,'a+') as fh:
        fh.write("%s|%s|%s\n"%(file_id,file_type,json.dumps(data['data'])))

    return "Data succesfully sent to server."

@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()

if __name__ == "__main__":
    app.run()
