let idEdit = null;
var params = {
    totalData: 0,
    totalPages: 0,
    display: 3,
    page: 1
}

const readData = () => {
    fetch('http://localhost:3000/users')
        .then((response) => response.json())
        .then((data) => {
            let html = ''
            data.forEach((item, index) => {
                html += `
            <tr>
              <td>${item._id}</td>
              <td>${item.string}</td>
              <td>${item.integer}</td>
              <td>${item.float}</td>
              <td>${item.date}</td>
              <td>${item.boolean}</td>
              <td  class="text-center">
                <button type="button" class="btn btn-success" onclick='editData(${JSON.stringify(item)})'><i
                                        class="fa-solid fa-pencil"></i></button>
                <button type="button" class="btn btn-danger" onclick="removeData('${item._id}')"><i
                                        class="fa-solid fa-trash"></i></button>
              </td>
            </tr>
            `
            })
            document.getElementById('body-users').innerHTML = html
            pagination()
        });
}

const saveData = (e) => {
    e.preventDefault()
    const string = document.getElementById('string').value
    const integer = document.getElementById('integer').value
    const float = document.getElementById('float').value
    const date = document.getElementById('date').value
    const boolean = document.getElementById('boolean').value
    console.log(string, integer, float, date, boolean)

    if (idEdit == null) {
        fetch('http://localhost:3000/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ string, integer, float, date, boolean })
        }).then((response) => response.json()).then((data) => {
            readData()
        })
    } else {
        fetch(`http://localhost:3000/users/${idEdit}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ string, integer, float, date, boolean })
        }).then((response) => response.json()).then((data) => {
            readData()
        })
        idEdit = null;
    }

    document.getElementById('string').value = ''
    document.getElementById('integer').value = ''
    document.getElementById('float').value = ''
    document.getElementById('date').value = ''
    document.getElementById('boolean').value = ''
    return false
}

const removeData = (id) => {
    fetch(`http://localhost:3000/users/${id}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        }
    }).then((response) => response.json()).then((data) => {
        readData()
    })
}

const editData = (user) => {
    idEdit = user._id
    document.getElementById('string').value = user.string
    document.getElementById('integer').value = user.integer
    document.getElementById('float').value = user.float
    document.getElementById('date').value = user.date
    document.getElementById('boolean').value = user.boolean
}

const pagination = () => {
    let pagination = `<ul class="pagination">
                               <li class="page-item${params.page == 1 ? ' disabled' : ''}">
                                 <a class="page-link" href="#" datapage="${parseInt(params.page) - 1}" aria-label="Previous">
                                  <span aria-hidden="true">&laquo;</span>
                                    </a>
                                </li>`
    for (let i = 1; i <= params.totalPages; i++) {
        pagination += `<li class="page-item${i == params.page ? ' active' : ''}"><a class="page-link" href="#" datapage="${i}">${i}</a></li>`
    }
    pagination += `<li class="page-item${params.page == params.totalPages ? ' disabled' : ''}">
            <a class="page-link" datapage="${parseInt(params.page) + 1}" href="#" aria-label="Next">
                <span aria-hidden="true">&raquo;</span>
            </a>
        </li>
    </ul>`
    //$('#pagination').html(pagination)
    document.getElementById('pagination').innerHTML = pagination
}

$('#pagination').on('click', '.page-link', function (event) {
    event.preventDefault()
    params = { ...params, page: parseInt($(this).attr('datapage')) }
    readData()
})

readData()