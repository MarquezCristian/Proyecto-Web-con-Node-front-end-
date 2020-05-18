let mealsState =[]
let ruta='login'  //mlogin, register , orders
let user = {}
const stringToHTML = (s) => {
    const parser = new DOMParser()
    const doc = parser.parseFromString(s ,'text/html')
    return doc.body.firstChild
    
}

const renderItem= (item) => {
     const  element =stringToHTML(`<li data-id="${item._id}">${item.name} </li>`)
     element.addEventListener('click',()=> {
        const mealsList = document.getElementById('meals-list')
        Array.from(mealsList.children).forEach(x=> x.classList.remove('selected'))
        element.classList.add('selected')
        const mealsIdInput = document.getElementById('meals-id')
        mealsIdInput.value = item._id
         
     })
     return element
}

const renderOrder = (order,meals) => {
     const meal = meals.find(meal => meal._id === order.meal_id)
     const element = stringToHTML(`<li data-i="${order._id}">${meal.name}
      - ${order.user_id}</li>`)
     return element
   
}

const inicializaFormulario = () => {
    const orderForm=document.getElementById("order")
    orderForm.onsubmit= (e)=> {
        e.preventDefault()
        const submit = document.getElementById('submit')
        submit.setAttribute('disabled', true)
        const mealId= document.getElementById("meals-id")
        const mealIdValue= mealId.value
        if (!mealIdValue) {
          alert("Debe seleccionar un plato")
          submit.removeAttribute('disabled')
          return
        }
        const order = {
            meal_id :mealIdValue,
            user_id : user._id,
        }
        fetch("http://localhost:3000/api/orders", {
           method:'POST',
           headers : {
               'Content-Type':'application/json',
           } ,
           body: JSON.stringify(order)
        } ).then (x => x.json ())
           .then(respuesta => {
            const renderedOrder = renderOrder (respuesta, mealsState)
            const orderList= document.getElementById('orders-list')
            orderList.appendChild(renderedOrder)
            submit.removeAttribute('disabled')
        })
    }
}

const inicializaDatos = ()=> {
    fetch ('http://localhost:3000/api/meals/')
    .then(response => response.json())
    .then(data => {
      mealsState = data
      const mealsList = document.getElementById('meals-list')
      const submit = document.getElementById('submit')
      const listItems= data.map(renderItem)
      mealsList.removeChild(mealsList.firstElementChild) //elimina el cargando
      listItems.forEach(element => mealsList.appendChild(element))
      submit.removeAttribute('disabled')
      fetch ('http://localhost:3000/api/orders')
         .then(response => response.json())
         .then(ordersData => {
             const orderList= document.getElementById('orders-list')
             const listOrders= ordersData.map(orderData => renderOrder(orderData,data
                ))
             orderList.removeChild  (orderList.firstElementChild)
             listOrders.forEach(element => orderList.appendChild(element))
            
         })
    })
}

const renderApp = ()=> {
    const token = localStorage.getItem('token')
    console.log('token', token)
    if (token){
        user = JSON.parse(localStorage.getItem('user'))
        return renderOrders()
    }
    renderLogin ()
    
}

const renderOrders = () => {
       const ordersView =document.getElementById('orders-view')
       document.getElementById('app').innerHTML = ordersView.innerHTML
       inicializaFormulario()
       inicializaDatos()
}

const renderLogin = ()=> {
    const loginTemplate = document.getElementById('login-template')
    document.getElementById('app').innerHTML = loginTemplate.innerHTML
    
    const loginForm = document.getElementById('login-form')
    loginForm.onsubmit = (e) => {
        e.preventDefault()
        const email = document.getElementById('email').value
        const password = document.getElementById('password').value

         fetch('http://localhost:3000/api/auth/login',{
           method:'POST',
           headers: {
             'Content-Type':'application/json',
           },
           body: JSON.stringify({email ,password})
         }).then (x => x.json())
           .then(respuesta => {
             localStorage.setItem('token',respuesta.token)
             ruta ='orders'
             return respuesta.token
         })
         .then(token  => {
           return fetch('http://localhost:3000/api/auth/me', {
               method:'GET',
               headers: {
                   'Content-Type': 'application/json',
                   authorization : token,
               },
           })
         })
         .then(x => x.json())
         .then(fetchedUser => {
           localStorage.setItem('user', JSON.stringify(fetchedUser))
           user = fetchedUser
           renderOrders()
         })
 }
}

window.onload = () => {
    renderApp()
    
      
    
   
   //  inicializaFormulario()
     // inicializaDatos()
}