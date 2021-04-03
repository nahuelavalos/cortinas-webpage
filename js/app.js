document.addEventListener("DOMContentLoaded", (e) => {
  obtenerProductos();
});

// listar productos
const listaProductos = document.querySelector("#lista-productos");
const footerCarrito = document.querySelector("#footer-carrito");
const itemsCarrito = document.querySelector("#items");
let carrito = [];

const obtenerProductos = async () => {
  try {
    const res = await fetch("api.json");
    const data = await res.json();
    pintarTemplate(data);
    eventoBotones(data);
  } catch (error) {
    console.log(error);
  }
};

const pintarTemplate = (data) => {
  const template = document.querySelector("#template-producto").content;
  const fragment = new DocumentFragment();
  data.forEach((producto) => {
    template.querySelector("img").setAttribute("src", producto.thumbnailUrl);
    template.querySelector("h4").textContent = producto.title;
    template.querySelector(".card-ancho").textContent = producto.ancho;
    template.querySelector(".card-alto").textContent = producto.alto;
    template.querySelector(".tag-ancho-error").textContent = "";
    template.querySelector(".tag-alto-error").textContent = "";
    // https://developer.mozilla.org/es/docs/Web/API/HTMLElement/dataset
    template.querySelector("button").setAttribute("data-id", producto.id);
    const clone = template.cloneNode(true);
    fragment.appendChild(clone);
  });
  listaProductos.appendChild(fragment);
};

var count=0
const eventoBotones = (data) => {
  const btnAgregar = document.querySelectorAll(".btn-dark");
  btnAgregar.forEach((btn) => {
    btn.addEventListener("click", () => {
        const [producto] = data.filter(
            (item) => item.id === parseInt(btn.dataset.id)
        );

        // creamos un producto para el carrito
        const productoCarrito = {
            id: ++count,
            title: producto.title,
            ancho: Math.trunc(Number(document.getElementsByClassName("value-ancho")[producto.id-1].value)),
            alto: Math.trunc(Number(document.getElementsByClassName("value-alto")[producto.id-1].value)),
            cantidad: 1,
        }

        // valores minimos y maximos
        document.documentElement.scrollTop = 10000000;
        document.getElementsByClassName("tag-ancho-error")[producto.id-1].textContent = ""
        document.getElementsByClassName("tag-alto-error")[producto.id-1].textContent = ""
        if (productoCarrito.ancho < producto.min) {
            productoCarrito.ancho = producto.min
            document.getElementsByClassName("value-ancho")[producto.id-1].value = producto.min
            document.getElementsByClassName("tag-ancho-error")[producto.id-1].textContent = "Min."
        } else if (productoCarrito.ancho > producto.max) {
            productoCarrito.ancho = producto.max
            document.getElementsByClassName("value-ancho")[producto.id-1].value = producto.max
            document.getElementsByClassName("tag-ancho-error")[producto.id-1].textContent = "Max."
        }
        if (productoCarrito.alto < producto.min) {
            productoCarrito.alto = producto.min
            document.getElementsByClassName("value-alto")[producto.id-1].value = producto.min
            document.getElementsByClassName("tag-alto-error")[producto.id-1].textContent = "Min."
            //document.getElementsByClassName("value-alto")[producto.id-1].value
        } else if (productoCarrito.alto > producto.max) {
            productoCarrito.alto = producto.max
            document.getElementsByClassName("value-alto")[producto.id-1].value = producto.max
            document.getElementsByClassName("tag-alto-error")[producto.id-1].textContent = "Max."
        }
        document.getElementsByClassName("value-ancho")[producto.id-1].value = productoCarrito.ancho
        document.getElementsByClassName("value-alto")[producto.id-1].value = productoCarrito.alto
        productoCarrito.precioTotal = Math.round((( productoCarrito.ancho 
                                                    * productoCarrito.alto)
                                                    / producto.precio)
                                                    + 20)

        const exiteEnCarrito = carrito.some(item => item.ancho === productoCarrito.ancho
                                                    && item.alto === productoCarrito.alto
                                                    && item.title === productoCarrito.title )
        if (exiteEnCarrito) {
            const productos = carrito.map(item => {
                if (item.id === productoCarrito.id
                    && item.ancho === productoCarrito.ancho
                    && item.alto === productoCarrito.alto) {
                    item.cantidad++
                    item.precioTotal = item.precioTotal + productoCarrito.precioTotal
                    return item;
                } else {
                    return item
                }
            })
            carrito = [...productos]
        } else {
            carrito.push(productoCarrito);
        }
    
        pintarEnCarrito();
    });
  });
};

const totalFooter = () => {
    if (carrito.length === 0) {
        footerCarrito.innerHTML = `<th scope="row" colspan="5">Empty Cart</th>`
        document.getElementById("hacer-pedido").hidden = true
        return
    }

    const nProductos = carrito.reduce((a, b) => ({ cantidad: a.cantidad + b.cantidad }))
    const nPrecio = carrito.reduce((a, b) => ({ precioTotal: a.precioTotal + b.precioTotal }))

    // Limpiamos el elemento ya que necesitamos reemplazar su contenido
    footerCarrito.innerHTML = ''
    const template = document.querySelector("#template-footer").content;
    const fragment = document.createDocumentFragment();

    template.querySelectorAll('td')[1].textContent = nProductos.cantidad
    template.querySelector('.font-weight-bold span').textContent = nPrecio.precioTotal

    document.getElementById("hacer-pedido").hidden = false
    //document.getElementById("estamos-trabajando-msg").hidden = false

    const clone = template.cloneNode(true)
    fragment.appendChild(clone)
    footerCarrito.appendChild(fragment)


    const vaciarCarrito = document.querySelector('#vaciar-carrito')
    vaciarCarrito.addEventListener('click', () => {
        carrito = []
        pintarEnCarrito()
    })
}

var count = 0
const pintarEnCarrito = () => {

    // Limpiamos el elemento ya que necesitamos reemplazar su contenido
    itemsCarrito.innerHTML = ''

    const template = document.querySelector("#template-carrito").content;
    const fragment = document.createDocumentFragment();

    carrito.forEach(item => {
        template.querySelectorAll("td")[0].textContent = item.title;
        template.querySelectorAll("td")[1].textContent = item.ancho + "x" + item.alto + " inches";
        template.querySelectorAll("td")[2].textContent = item.cantidad;
        template.querySelector('.btn-danger').setAttribute('data-id', item.id)
        template.querySelector('.btn-info').setAttribute('data-id', item.id)
        template.querySelectorAll("td")[4].textContent = "$" + item.precioTotal;
        const clone = template.cloneNode(true);
        fragment.appendChild(clone);
    })
    
    itemsCarrito.appendChild(fragment);  
    borrarItemCarrito()
    totalFooter();
};

const borrarItemCarrito = () => {
    // console.log('ejecutado')
    const btnAgregar = document.querySelectorAll('#items .btn-info')
    const btnEliminar = document.querySelectorAll('#items .btn-danger')

    btnAgregar.forEach(btn => {
        btn.addEventListener('click', () => {
            const arrayFiltrado = carrito.map(item => {
                if (item.id === parseInt(btn.dataset.id))
                    {
                    item.precioTotal = item.precioTotal + item.precioTotal/item.cantidad
                    item.cantidad++
                    return item;
                } else {
                    return item
                }
            })
            carrito = [...arrayFiltrado]
            pintarEnCarrito()
            totalFooter()
        })
        
    })

    btnEliminar.forEach(btn => {
        btn.addEventListener('click', () => {
            const arrayFiltrado = carrito.filter(item => {
                if (item.id === parseInt(btn.dataset.id)) {
                    item.precioTotal = item.precioTotal - item.precioTotal/item.cantidad
                    item.cantidad--
                    if (item.cantidad === 0) {
                        return
                    }
                    return item;
                } else {
                    return item
                }
            })

            carrito = [...arrayFiltrado]
            pintarEnCarrito()
            totalFooter()
        })
    })

}
