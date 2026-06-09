//async (funciones asincronas) y await (espera)
//son para que se frene x linea hasta que el servidor responda
//pero deja que el resto de la pagina siga funcionando.

const url = 'https://max-fernandez-utec.github.io/2026/papuchat';

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
    const fotoPerfil = 'resources/logo_letras_Nacional.png'; 
    
    const fechaFormateada = formatearFecha(conversacion.fechaUltMensaje);
    return `
    <div class="chat" id="chat-${conversacion.idContacto}">
        <img src="${fotoPerfil}" alt=" ${conversacion.nombre} ">
        <div class="info">
            <div class="linea-superior">
                <h3>${conversacion.nombre}</h3>
                <span class="hora">${fechaFormateada}</span> 
            </div>
            <p class="ult-mensaje">${conversacion.ultMensaje || 'Sin mensajes'}</p>
        </div>
    </div>
    `;
}

function ParteChatMensajes(conversacion){
    const fotoPerfil = 'resources/logo_letras_Nacional.png'; 

    return `
        <header>
            <div class="encabezado">
                <img src="${fotoPerfil}" alt="${conversacion.nombre}">
                <h3>${conversacion.nombre}</h3>
            </div>
        </header>
        
        <div id="mensajes">
            </div>

        <div id="input">
            <span class="upload-btn">📎</span>
            <input type="text" id="mensaje_input" placeholder="Escribe un mensaje...">
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

        datos.chats.forEach(conversacion => {
            const chat = ParteChat(conversacion);
            //lo metemos en el html
            listaChats.innerHTML += chat;
        });

        const filaChats = document.querySelectorAll('.chat');

        filaChats.forEach(fila =>{
            fila.addEventListener('click', () => {
            const idContacto = fila.id.replace('chat-', '');
            abrirChat(idContacto);
            })
        })

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
        //cambiamos de pantalla, sacamos la de bienvenida y mostramos la de chat activo
        document.getElementById('pantalla-bienvenida').style.display = 'none';
        document.getElementById('chat-activo').style.display = 'flex';
        // el await fetch va a buscar los datos de la api
        const respuesta = await fetch(url + '/chats/' + idContacto);

        //si esta ok y los datos estan en json, los convierte en objeto de js
        const datos = await respuesta.json();

        const contenedorMain = document.getElementById('chat-activo');
        contenedorMain.style.display = 'flex';
        contenedorMain.innerHTML = ParteChatMensajes(datos);

        const mensajesContainer = document.getElementById('mensajes');
        mensajesContainer.innerHTML = '';

        datos.mensajes.forEach(mensaje => {
            const htmlMensaje = MensajesChat(mensaje);
            mensajesContainer.innerHTML += htmlMensaje;
        });

        console.log("datos traidos correctamente", datos);
    }
    catch (error){
        console.log("hubo un error al traer los datos: ", error);
    }
}