let estudiantes =
JSON.parse(localStorage.getItem("estudiantes")) || [];

let asistencias =
JSON.parse(localStorage.getItem("asistencias")) || [];

function guardar() {

localStorage.setItem(
"estudiantes",
JSON.stringify(estudiantes)
);

localStorage.setItem(
"asistencias",
JSON.stringify(asistencias)
);

render();
}

function render() {

let tabla = document.getElementById(
"tablaEstudiantes"
);

tabla.innerHTML="";

estudiantes.forEach((e,index)=>{

tabla.innerHTML += `
<tr>
<td>${e.dni}</td>
<td>${e.nombres}</td>
<td>${e.apellidos}</td>
<td>${e.genero}</td>
<td>${e.telefono}</td>
<td>${e.edad}</td>

<td>

<button onclick="editarEstudiante(${index})">
✏️
</button>

<button onclick="eliminarEstudiante(${index})">
🗑️
</button>

</td>
</tr>
`;

});

let tablaA=
document.getElementById(
"tablaAsistencias"
);

tablaA.innerHTML="";

asistencias.forEach((a,index)=>{

tablaA.innerHTML += `
<tr>

<td>${a.dni}</td>
<td>${a.nombre}</td>
<td>${a.fecha}</td>
<td>${a.hora}</td>

<td>

<button onclick="editarAsistencia(${index})">
✏️
</button>

<button onclick="eliminarAsistencia(${index})">
🗑️
</button>

</td>

</tr>
`;

});

}

function nuevoEstudiante(){

Swal.fire({

title:"Nuevo Estudiante",

html:`
<input id="dni" class="swal2-input" placeholder="DNI">
<input id="nom" class="swal2-input" placeholder="Nombres">
<input id="ape" class="swal2-input" placeholder="Apellidos">
<input id="gen" class="swal2-input" placeholder="Genero">
<input id="tel" class="swal2-input" placeholder="Telefono">
<input id="edad" class="swal2-input" placeholder="Edad">
`,

preConfirm:()=>{

return{

dni:dni.value,
nombres:nom.value,
apellidos:ape.value,
genero:gen.value,
telefono:tel.value,
edad:edad.value

}

}

}).then(r=>{

if(r.isConfirmed){

estudiantes.push(r.value);

guardar();

}

});

}

function editarEstudiante(i){

let e=estudiantes[i];

Swal.fire({

title:"Editar",

html:`

<input id="dni" class="swal2-input" value="${e.dni}">
<input id="nom" class="swal2-input" value="${e.nombres}">
<input id="ape" class="swal2-input" value="${e.apellidos}">
<input id="gen" class="swal2-input" value="${e.genero}">
<input id="tel" class="swal2-input" value="${e.telefono}">
<input id="edad" class="swal2-input" value="${e.edad}">

`,

preConfirm:()=>{

estudiantes[i]={

dni:dni.value,
nombres:nom.value,
apellidos:ape.value,
genero:gen.value,
telefono:tel.value,
edad:edad.value

};

guardar();

}

});

}

function eliminarEstudiante(i){

Swal.fire({

title:"Eliminar?",
icon:"warning",
showCancelButton:true

}).then(r=>{

if(r.isConfirmed){

estudiantes.splice(i,1);

guardar();

}

});

}

async function abrirScanner() {

    Swal.fire({
        title: 'Escanear QR de Asistencia',
        html: `
            <div id="reader" style="width:100%;"></div>
        `,
        width: 600,
        showConfirmButton: false,
        showCloseButton: true,
        didOpen: async () => {

            const html5QrCode = new Html5Qrcode("reader");

            try {

                const devices = await Html5Qrcode.getCameras();

                if (!devices || devices.length === 0) {

                    Swal.fire(
                        "Error",
                        "No se detectaron cámaras",
                        "error"
                    );

                    return;
                }

                let cameraId = devices[0].id;

                const trasera = devices.find(
                    d =>
                    d.label.toLowerCase().includes("back") ||
                    d.label.toLowerCase().includes("rear") ||
                    d.label.toLowerCase().includes("trasera")
                );

                if (trasera) {
                    cameraId = trasera.id;
                }

                await html5QrCode.start(
                    cameraId,
                    {
                        fps: 10,
                        qrbox: {
                            width: 250,
                            height: 250
                        }
                    },
                    async (decodedText) => {

                        registrarAsistenciaQR(decodedText);

                        await html5QrCode.stop();

                        Swal.close();
                    }
                );

            } catch (error) {

                console.error(error);

                Swal.fire(
                    "Error",
                    "No fue posible acceder a la cámara",
                    "error"
                );
            }

        },

        willClose: () => {

            const reader =
            Html5Qrcode.getCameras;

        }

    });

}

function registrarAsistenciaQR(dni) {

    const alumno =
    estudiantes.find(
        e => e.dni === dni
    );

    if (!alumno) {

        Swal.fire(
            "No encontrado",
            `No existe un estudiante con DNI ${dni}`,
            "error"
        );

        return;
    }

    const ahora = new Date();

    const fecha =
    ahora.toLocaleDateString();

    const hora =
    ahora.toLocaleTimeString();

    const existeHoy =
    asistencias.some(a =>
        a.dni === dni &&
        a.fecha === fecha
    );

    if (existeHoy) {

        Swal.fire(
            "Asistencia existente",
            `${alumno.nombres} ya registró asistencia hoy`,
            "warning"
        );

        return;
    }

    asistencias.push({

        dni: alumno.dni,

        nombre:
        alumno.nombres +
        " " +
        alumno.apellidos,

        fecha,

        hora

    });

    guardar();

    Swal.fire({
        icon: "success",
        title: "Asistencia Registrada",
        html: `
            <b>${alumno.nombres}</b><br>
            DNI: ${alumno.dni}<br>
            Hora: ${hora}
        `
    });

}

function onScanSuccess(dni){

let alumno=
estudiantes.find(x=>x.dni===dni);

if(!alumno){

Swal.fire(
"Error",
"No existe el estudiante",
"error"
);

return;
}

let ahora=new Date();

asistencias.push({

dni,
nombre:
alumno.nombres+" "+alumno.apellidos,

fecha:
ahora.toLocaleDateString(),

hora:
ahora.toLocaleTimeString()

});

guardar();

Swal.fire(
"Asistencia",
"Registrada",
"success"
);

}

function editarAsistencia(i){

let a=asistencias[i];

Swal.fire({

title:"Editar Asistencia",

html:`

<input id="fecha"
class="swal2-input"
value="${a.fecha}">

<input id="hora"
class="swal2-input"
value="${a.hora}">

`,

preConfirm:()=>{

a.fecha=fecha.value;
a.hora=hora.value;

guardar();

}

});

}

function eliminarAsistencia(i){

Swal.fire({

title:"Eliminar asistencia",
showCancelButton:true

}).then(r=>{

if(r.isConfirmed){

asistencias.splice(i,1);

guardar();

}

});

}

function exportarDatos(){

let data={

estudiantes,
asistencias

};

let blob=
new Blob(
[JSON.stringify(data,null,2)],
{type:"application/json"}
);

let url=
URL.createObjectURL(blob);

let a=
document.createElement("a");

a.href=url;
a.download="backup.json";

a.click();

}

function importarDatos(e){

let file=
e.target.files[0];

let reader=
new FileReader();

reader.onload=function(){

let data=
JSON.parse(reader.result);

estudiantes=
data.estudiantes || [];

asistencias=
data.asistencias || [];

guardar();

};

reader.readAsText(file);

}

render();