from flask import Flask, request, session, redirect, render_template, g
import sqlite3
import random

app = Flask(__name__)
app.secret_key = "secret123123123"

# Заклинания для того, чтобы подключение к БД было глобальным,
# и его можно было не создавать заново на каждый запрос.
#
# (см. https://flask.palletsprojects.com/en/2.0.x/patterns/sqlite3/)

def get_db():
    db = getattr(g, '_database', None)
    if db is None:
        # открываем соединение с БД, если его ещё не было
        db = g._database = sqlite3.connect("zakat.db")
    # ...отдаём открытое соединение
    return db

@app.teardown_appcontext # хитрый декоратор
def close_connection(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        db.close() # закрываем соединение при завершении работы

# Маршруты приложения:

@app.route('/')
def index():
    cur = get_db().cursor()

    base_result = cur.execute(
        """
        select text, username, cities.name from comments
        join users on author = users.id
        left join cities on cities.id = users.city;
        """
    ).fetchall()

    return render_template(
        'index.html',
        comments = base_result,
        username = session.get('username', None)
    )


@app.route('/comment', methods=["POST"])
def comment():
    author = session['username']
    if author is None:
        return "Вы сперва ВОЙДИТЕ, а затем только комментарии ОСТАВЛЯЙТЕ!"
    else:
        cur = get_db().cursor()

        form = request.form
        text = form['text']

        user = cur.execute(
            f"select id from users where username = '{author}';"
        ).fetchone()

        user_id = user[0]

        cur.execute(f"insert into comments (text, author) values ('{text}', '{user_id}');")
        get_db().commit()

        return redirect('/')



@app.route('/register', methods=["GET", "POST"])
def register():
    cur = get_db().cursor()

    if request.method == "GET":
        cities = cur.execute('select id, name from cities;')
        return render_template('register.html', cities=cities)
    else:
        form = request.form
        username = form.get('username')
        password = form.get('password')
        city_id  = form.get('city')

        try:
            cur.execute(f"insert into users (username, password, city) values ('{username}', '{password}', '{city_id}');")
            get_db().commit()
        except sqlite3.IntegrityError:
            return render_template('register.html', message='Такой пользователь уже есть!')

        return render_template('register.html', message="Вы зарегистрированы. Теперь можно войти.")


@app.route('/login', methods=["GET", "POST"])
def login():
    if request.method == "GET":
        return render_template('login.html')
    else:
        form = request.form
        username = form['username']
        password = form['password']

        cur = get_db().cursor()
        base_result = cur.execute(
            f"""
            select username, password from users
            where username = '{username}' and password = '{password}';
            """
        ).fetchone()

        if base_result is None:
            return render_template("login.html", message="Неверный пароль!")
        else:
            base_username = base_result[0]
            session['username'] = base_username
            return redirect('/')


@app.route('/logout')
def logout():
    del session['username']
    return redirect('/')


app.run(debug=True, host="0.0.0.0")
