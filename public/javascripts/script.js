const idleAndLoadingP = document.getElementById('idleAndLoading');
const refresh = document.getElementById('refresh');
let isToggle = 0;

async function addLoading(url= 'http://127.0.0.1:8080/isloading') {
    return await fetch(url).then(res => res.text()).then(isLoading => {
        const processesNumber = Number(isLoading);
        if (processesNumber > 0) {
            idleAndLoadingP.innerText = `loading... (${isLoading})`;
            refresh.classList.add('invisible');
            ++isToggle;
        } else {
            idleAndLoadingP.innerText = 'idle...';
            if (isToggle) {
                refresh.classList.remove('invisible');
            }
        }
    }).catch(err => console.log(err));
}

setInterval(addLoading, 250);

const createForm = document.getElementById('create');

const clearInputValue = () => {
    createForm.reset();
}

createForm.addEventListener('formdata', clearInputValue);
