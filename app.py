from flask import Flask, render_template

app = Flask(__name__)

@app.route("/ping")
def ping():
    return "pong"

@app.route("/")
def index():
    return render_template("index.html")


app.run()
