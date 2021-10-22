const getFromApi = async (method) => {
    request = await fetch(`/api/${method}`);
    return request.json();
}

const postToApi = async (method, jsonData) => {
    await fetch(`/api/${method}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(jsonData)
    });
}

const commentForm = `
      <h5>Ваш комментарий</h5>
      <form id="commentForm" onsubmit="postComment(event)">
        <p><textarea name="text" style="width: 40em; height: 10em"></textarea></p>
        <p><input type="submit" value="Отправить комментарий"></p>
      </form>`

const postComment = async (event) => {
    event.preventDefault();
    let text = event.target.elements.text.value;
    let author = USER.username;
    let city = USER.city;

    await postToApi('comment', {
        text: text,
        author: author,
        city: city
    });

    start();
}

const submitLogin = async (event) => {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    const formEntries = Array.from(formData.entries());

    let formObject = {};

    for (let entry of formEntries) {
        let key = entry[0];
        let val = entry[1];
        formObject[key] = val;
    }

    postToApi('login', formObject);

    closeForm(form);
    start();
}

const makeHeaderHTML = () => {
    title = '<h1>Добро пожаловать на Веб-сайт!</h1>'
    if (USER.username) {
        return title + `<h2>
          Комментируйте закат, <code>${USER.username}</code>:
        </h2>
        <h6 style="margin-top: -1.75em">
          Если вы не ${USER.username}, вы <a onclick="logout()">выйдите</a>, ок?
        </h6>
        `
    } else {
        return title + `<h2>
          На данном Веб-сайте пользователи могут <a onclick="displayForm(registerForm)">регистрироваться</a>,
          <a onclick="displayForm(loginForm)">авторизовываться</a> и просто наблюдать закат:
        </h2>`
    }
}

const makeZakatHTML = (zakat) => {
    return `<img src="${zakat}" height="340" alt="Закат">`
}

const makeCommentHTML = (comment) => {
    return `<div class="comment">
          <h6 style="margin: 1em 0 -1em">${comment.author}, г. ${comment.city}</h6>
          <p>${comment.text}</p>
    </div>`
}

const displayComments = (comments) => {
    const commentsSection = document.getElementById('comments');

    commentsHTML = [];
    for (let comment of comments.comments) {
        commentsHTML.push(makeCommentHTML(comment));
    }

    commentsSection.innerHTML = '<h3>Комментарии</h3>'
    commentsSection.innerHTML += commentsHTML.join('');

    if (USER.username) {
        commentsSection.innerHTML += commentForm;
    }
}

const displayForm = async (form) => {
    // TODO: show the form
    form.classList = "shown";

    if (form.id == 'registerForm') {
        // TODO: insert cities
    }
}

const closeForm = (form) => {
    // TODO: close the form
    form.classList = "";
}

const logout = () => {
    getFromApi('logout');
    start();
}

const setTheme = () => {
    const currentTheme = localStorage.getItem('theme');
    document.body.classList = currentTheme;
}

const toggleTheme = () => {
    const currentTheme = localStorage.getItem('theme');
    console.log(currentTheme);

    if (currentTheme === 'light') {
        document.body.classList = 'dark';
        localStorage.setItem('theme', 'dark');
    } else if (currentTheme === 'dark') {
        document.body.classList = 'light';
        localStorage.setItem('theme', 'light');
    } else {
        localStorage.setItem('theme', 'light');
    }
}

let comments, USER, zakat, header, loginForm, registerForm;

const start = async () => {
    comments = await getFromApi('comments');
    USER  = (await getFromApi('user'));
    zakat = (await getFromApi('zakat')).url;

    header       = document.getElementById('header');
    loginForm    = document.getElementById('loginForm');
    registerForm = document.getElementById('registerForm');

    header.innerHTML = makeHeaderHTML(USER);
    header.innerHTML += makeZakatHTML(zakat);

    displayComments(comments, USER);
    setTheme();
}

start();
