//async (funciones asincronas) y await (espera)
//son para que se frene x linea hasta que el servidor responda
//pero deja que el resto de la pagina siga funcionando.

const url = 'https://max-fernandez-utec.github.io/2026/papuchat';
const fotosJugadores = {
    "juanperez_1233": "resources/hugo.jpg",
    "marialopez_4567": "resources/atilio.jpg",
    "anagomez_7890": "resources/coates.jpeg",
    "carlosrodriguez_1122": "resources/maxi.jpeg",
    "lauragarcia_3344": "resources/recoba.jpeg"
};

function obtenerFotoPerfil(idContacto){
    return fotosJugadores[idContacto] || 'resources/logo_letras_Nacional.png';
}

function formatearFecha(fecha){
    if(!fecha) return '';

    const fechaMensaje = new Date(fecha);
    const hoy = new Date(); //creamos la fecha de hoy

    //comparamos que sean iguales
    const esHoy = fechaMensaje.getDate() === hoy.getDate() &&
    fechaMensaje.getMonth() === hoy.getMonth() &&
    fechaMensaje.getFullYear() === hoy.getFullYear();

    if(esHoy){
        //si es el mismo dia retornamos la hora y los minutos
        return fechaMensaje.toLocaleTimeString('es-UY', {hour: '2-digit', minute: '2-digit'})
    }else{
        //si es distinto dia retornamos solo el dia y el mes
        return fechaMensaje.toLocaleDateString('es-UY', {day: '2-digit', month: '2-digit'})
    }
}

//creamos un componente para tener la parte del html a modificar
function ParteChat(conversacion){
    const fotoPerfil = obtenerFotoPerfil(conversacion.idContacto); 
    
    const fechaFormateada = formatearFecha(conversacion.fechaUltMensaje);
    return `
        <img src="${fotoPerfil}" alt=" ${conversacion.nombre} ">
        <div class="info">
            <div class="linea-superior">
                <h3>${conversacion.nombre}</h3>
                <span class="hora">${fechaFormateada}</span> 
            </div>
            <p class="ult-mensaje">${conversacion.ultMensaje || 'Sin mensajes'}</p>
        </div>
    `;
}

function ParteChatMensajes(conversacion){
    const fotoPerfil = obtenerFotoPerfil(conversacion.idContacto); 

    return `
        <header>
            <div class="encabezado">
                <button class="boton-volver">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="15 18 9 12 15 6"></polyline>
                    </svg>
                </button>
                <img src="${fotoPerfil}" alt="${conversacion.nombre}">
                <h3>${conversacion.nombre}</h3>
            </div>
        </header>
        
        <div id="mensajes">
            </div>

        <div id="input">
            <input type="file" id="imagen-selector" accept="image/*" style="display: none;">
            <label for="imagen-selector" class="upload-btn">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
                </svg>
            </label>
            <input id="mensaje_input" type="text" placeholder="Escribe un mensaje...">
            <button id="enviar_btn">Enviar</button>
        </div>
    `;
}

function MensajesChat(mensaje){
    const fechaFormateada = formatearFecha(mensaje.timestamp);
    const remitente = mensaje.remitente;
    const mensajeRecibido = mensaje.tipo === 'image' ? `<img src="${mensaje.contenido}">` : mensaje.contenido;
    if(remitente == 'yo'){
return `
        <div class="mensaje-enviado">
            ${mensajeRecibido}
            <p class="hora2">${fechaFormateada}</p>
        </div>
    `;
    }else{
        return `
        <div class="mensaje-recibido">
            ${mensajeRecibido}
            <p class="hora2">${fechaFormateada}</p>
        </div>
    `;}
}


async function cargarChats(){

    try{
        // el await fetch va a buscar los datos de la api
        const respuesta = await fetch(url + '/chats');

        //si esta ok y los datos estan en json, los convierte en objeto de js
        const datos = await respuesta.json();

        const listaChats = document.getElementById('chats');
        listaChats.innerHTML = ''; //limpiamos por si habia algo viejo

        const chatsObtenedios = datos.chats.map(conversacion =>{
            const ClaveStorage = 'chats_'+conversacion.idContacto;
            const datosLocalString = localStorage.getItem(ClaveStorage);
            
            // Si hay un historial guardado en el localStorage para este chat
            if(datosLocalString){
                const objetoLocal = JSON.parse(datosLocalString);
                // si hay mensajes locales
                if(objetoLocal.mensajes && objetoLocal.mensajes.length > 0){
                    // agarramos el ultimo mensaje
                    const ultimoMensaje = objetoLocal.mensajes[objetoLocal.mensajes.length - 1];
                    // actualizamos la conversacion con los datos locales
                    conversacion.ultMensaje = ultimoMensaje.tipo === 'image' ? "[imagen]" : ultimoMensaje.contenido;
                    conversacion.fechaUltMensaje = ultimoMensaje.timestamp;
                }
            }
            // retornamos la conversacion actualizada
            return conversacion;
        })
        
        // Ordenamos los chats por fecha (los mas recientes primero)
        chatsObtenedios.sort((a, b) => new Date(b.fechaUltMensaje) - new Date(a.fechaUltMensaje));

        chatsObtenedios.forEach(conversacion => {
            //creamos la tarjeta del chat
            const contenedorChat = document.createElement('div');
            contenedorChat.className = 'chat';
            contenedorChat.id = 'chat-' + conversacion.idContacto;
            // Insertamos el contenido de la tarjeta
            contenedorChat.innerHTML = ParteChat(conversacion);

            contenedorChat.addEventListener('click', () => {
                abrirChat(conversacion.idContacto);
            });

            // guardamos la tarjeta en el contenedor usando appendChild
            listaChats.appendChild(contenedorChat);
        });

        console.log("datos traidos correctamente", datos);
    }
    // si algo falla, cae aca y muestra el error pera no romper toda la pagina
    catch (error){
        console.log("hubo un error al traer los datos: ", error);
    }
}

cargarChats();

async function abrirChat(idContacto){
    try{
        const cambioCelular = document.getElementById('principal');
        //clave para el localstorage (usamos const ya que no puede cambiar)
        const ClaveStorage = 'chats_' + idContacto;
        //intentamos traer el historial de mensajes del storage local
        const datosLocal = localStorage.getItem(ClaveStorage);
        // let datos es una variable donde guardaremos los datos (usamos let ya que puede cambiar)
        let datos;
        if(datosLocal){
            //JSON.parse convierte el string en objeto
            datos = JSON.parse(datosLocal);
        }else{
            // el await fetch va a buscar los datos de la api
            const respuesta = await fetch(url + '/chats/' + idContacto);
            //si esta ok y los datos estan en json, los convierte en objeto de js
            datos = await respuesta.json();

            //se guarda en localStorage
            // ClaveStorage se utiliza para que no se mezclen los mensajes de distintos contactos
            //JSON.stringify convierte el objeto en string para que se pueda guardar en localStorage
            localStorage.setItem(ClaveStorage, JSON.stringify(datos));
        }
        // contenedorMain es el contenedor de la pantalla de chat activo
        const contenedorMain = document.getElementById('chat-activo');
        //le insertamos el contenido de chat activo con el componente ParseChatMensaje y
        //le mandamos los datos (header)
        contenedorMain.innerHTML = ParteChatMensajes(datos);

        // contenedor de mensajes
        const mensajesContainer = document.getElementById('mensajes');
        //limpiamos los mensajes viejos
        mensajesContainer.innerHTML = '';
        //recorremos los mensajes
        datos.mensajes.forEach(mensaje => {
            //creamos el html del mensaje
            const htmlMensaje = MensajesChat(mensaje);
            //lo insertamos en el contenedor de mensajes
            mensajesContainer.innerHTML += htmlMensaje;
        });

        const botonEnviar = document.getElementById('enviar_btn');
        const inputMensaje = document.getElementById('mensaje_input');
        const botonImagen = document.getElementById('imagen-selector');

        cambioCelular.classList.add('chat-seleccionado');
        cambioCelular.classList.add('mostrar-detalle');

        function NuevoMensajeAuxiliar(nuevoMensaje) {
            //agregamos el mensaje al array de mensajes
            datos.mensajes.push(nuevoMensaje);
            //actualizamos el localStorage
            localStorage.setItem(ClaveStorage, JSON.stringify(datos));
            //limpiamos el input
            inputMensaje.value = '';
            //agregamos el mensaje al chat
            mensajesContainer.innerHTML += MensajesChat(nuevoMensaje);
            // Scroll automatico al final
            mensajesContainer.scrollTop = mensajesContainer.scrollHeight;

            //obtenemos la tarjeta del chat actual por el id
            const tarjetaChat = document.getElementById('chat-' + idContacto);

            //si existe la tarjeta
            if(tarjetaChat){
                //obtenemos el ultimo mensaje y la hora
                const ultimoMensaje = tarjetaChat.querySelector('.ult-mensaje');
                const hora = tarjetaChat.querySelector('.hora');
                //verificamos si el mensaje es una imagen o texto
                const texto = (nuevoMensaje.tipo === 'image') ? '[imagen]' : nuevoMensaje.contenido;
                
                //actualizamos el ultimo mensaje y la hora
                if(ultimoMensaje){
                    ultimoMensaje.textContent = texto;
                }

                if(hora){
                    hora.textContent = formatearFecha(nuevoMensaje.timestamp);
                }

                //obtenemos la lista de chats, usamos esto para ordenar los chats
                const listaChats = document.getElementById('chats');
                if(listaChats){
                    listaChats.insertBefore(tarjetaChat, listaChats.firstChild);
                }
            }
        }
        
        botonEnviar.addEventListener('click', () =>{
            const mensaje = inputMensaje.value.trim(); //trim para sacar los espacios vacios
            if(mensaje === "") return;
            const nuevoMensaje = {
                id: 'mensaje_'+Date.now(),
                remitente: 'yo', //para que sea un mensaje enviado y no recicvido
                contenido: mensaje,
                timestamp: new Date().toISOString(), //fecha y hora actual
                tipo: 'text' //tipo de mensaje texto o imagen
            };
            NuevoMensajeAuxiliar(nuevoMensaje);
            inputMensaje.value = ""; //limpiamos el input
        });
        
        inputMensaje.addEventListener('keydown', (event) =>{
            if(event.key === 'Enter'){
                botonEnviar.click();
            }
        });
        
        botonImagen.addEventListener('change', (event) =>{
            const imagen = event.target.files[0];
            if(!imagen) return;

            const lector = new FileReader();

            lector.onload = function(e){
                const imagenDataUrl = e.target.result;
                const nuevoMensaje = {
                    id: 'mensaje_'+Date.now(),
                    remitente: 'yo', //para que sea un mensaje enviado y no recicvido
                    contenido: imagenDataUrl,
                    timestamp: new Date().toISOString(), //fecha y hora actual
                    tipo: 'image' //tipo de mensaje texto o imagen
                };
                NuevoMensajeAuxiliar(nuevoMensaje);
                botonImagen.value = ""; // Limpiamos el selector de archivos
            };
            
            lector.readAsDataURL(imagen);
        });
        const botonVolver = document.querySelector('.boton-volver');

        botonVolver.addEventListener('click', () => {
            cambioCelular.classList.remove('mostrar-detalle');
            cambioCelular.classList.remove('chat-seleccionado');
        });


        console.log("datos traidos y eventos mapeados correctamente", datos);
    }
    catch (error){
        console.log("hubo un error al traer los datos: ", error);
    }
}