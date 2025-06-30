(function () {
    //Globals
    const todoList = document.getElementById('todo-list')
    const userSelect = document.getElementById('user-todo')
    const form = document.querySelector('form')
    let todos = [];
    let users = [];

    //Attach Events
    document.addEventListener('DOMContentLoaded', initApp);
    document.addEventListener('submit', handleSubmit)


    //Basic Logic
    function getUserName(userId) {
        const user = users.find(u => u.id === userId)
        return user.name
    }

    function printTodo({userId, id, title, completed}) {
        const li =  document.createElement('li')
        li.className = 'todo-item';
        li.dataset.id = id;
        li.innerHTML = `<span>${title} <i>by</i> <b>${getUserName(userId)}</b></span>`

        const status = document.createElement('input')
        status.type = 'checkbox';
        status.checked = completed;
        status.addEventListener('change', handleTodoChange)

        const close = document.createElement('span')
        close.innerHTML = ' &times;';
        close.style.color = 'red'
        close.className = 'close';
        close.addEventListener('click', handleClose)

        li.prepend(status)
        li.append(close)
        todoList.prepend(li);
    }

    function createUserOption(user) {
        const option = document.createElement('option')
        option.value = user.id
        option.innerText = user.name
        userSelect.append(option)
    }

    function RemoveTodo(todoId) {
        todos = todos.filter(todo => todoId !== todo.id);

        const newTodo = todoList.querySelector(`[data-id="${todoId}"]`)
        // newTodo.querySelector('input').removeEventListener('change', handleTodoChange)
        // newTodo.querySelector('.close').removeEventListener('click', deleteTodo)

        newTodo.remove()
    } 

    function alertError(error) {
        alert(error.message);
    }

    //Event Logic
    function initApp() {
        Promise.all([getAllTodos(), getAllUsers()]).then(values => {
            [todos, users] = values;
            console.log(todos)
            console.log(users)

            //Send to html
            todos.forEach(todo => printTodo(todo))
            users.forEach(user => createUserOption(user))
        });
    }

    function handleSubmit(event) {
        event.preventDefault();
        createTodo({
            userId: Number(form.user.value),
            title: form.todo.value,
            completed: false,
        })
    }
    function handleTodoChange(event) {
        const todoId = this.parentElement.dataset.id; //this - чякбокс обьекта input; parentElement - родитель li; dataset - доступ ко всем дата-атрибутов
        const completed = this.checked; // сам чекбокс

        toggleTodoComplete(todoId, completed)
    }

    function handleClose(event) {
        const todoId = this.parentElement.dataset.id;

        deleteTodo(todoId)
    }
        
    //Async Logic
    async function getAllTodos() {
        try {
            const response = await fetch('https://jsonplaceholder.typicode.com/todos?_limit=20')
            const data = await response.json()
            
            return data
        }
        catch (error) {
            alertError(error)
        }
    }

    async function getAllUsers() {
        try {
            const response = await fetch('https://jsonplaceholder.typicode.com/users')
            const data = await response.json()
            
            return data
        } catch (error) {
            alertError(error)
        }
    }

    async function createTodo(todo) {
        try {
            const response = await fetch('https://jsonplaceholder.typicode.com/todos', {
                method: 'POST',
                body: JSON.stringify(todo),
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            const newTodo = await response.json();
        
            printTodo(newTodo)
        }
        catch (error) {
            alertError(error)
        }
    }

    async function toggleTodoComplete(todoId, completed) {
        try {
            const response = await fetch(`https://jsonplaceholder.typicode.com/todos/${todoId}/`, {
                method: 'PATCH',
                body: JSON.stringify({completed: completed}),
                headers: {
                    'Content-Type': 'application/json'
                },
            });
            if (!response.ok) {
                throw new Error('Fail to connect with server! Please try again later')
            }
        }
        catch(error) {
            alertError(error)
        }
    } 

    async function deleteTodo(todoId) {
        try {
            const response = await fetch(`https://jsonplaceholder.typicode.com/todos/${todoId}/`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            if (response.ok) {
                RemoveTodo(todoId)
            } else {
                throw new Error('Failed to connect to server! Please try again letter')
            }
        }
        catch (error) {
            alertError(error)
        }
    }
})()