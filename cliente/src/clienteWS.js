function ClienteWS(){

	this.socket=undefined;
	this.nick=undefined;
	this.codigo=undefined;
	this.owner=false;
	this.numJugador=undefined;
	this.impostor;
	this.estado;
	this.encargo;
	this.fase;
	this.ini=function(){
		this.socket=io.connect();
		this.lanzarSocketSrv();
	}
	this.crearPartida=function(nick,numero){
		this.nick=nick;
		this.socket.emit("crearPartida",nick,numero);
	}
	this.unirAPartida=function(nick,codigo){
		//this.nick=nick;
		this.socket.emit("unirAPartida",nick,codigo);
	}
	this.console=function(message){
		console.log(message);
	}
	this.iniciarPartida=function(nick,codigo){
		this.socket.emit("iniciarPartida",this.nick,this.codigo);
	}
	this.listaPartidas=function(){
		this.socket.emit("listaPartidas");
	}
	this.listaPartidasDisponibles=function(){
		this.socket.emit("listaPartidasDisponibles");
	}
	this.lanzarVotacion=function(nick){
		this.socket.emit("lanzarVotacion",this.nick,this.codigo);
	}
	this.saltarVoto=function(){
		this.socket.emit("saltarVoto",this.nick,this.codigo);
	}
	this.estoyDentro=function(){
		this.socket.emit("estoyDentro",this.nick,this.codigo);
	}
	this.finalVotacion=function(){
		this.socket.emit("finalVotacion",this.nick,this.codigo);
	}
	this.haVotado=function(){
		this.socket.emit("haVotado",this.nick,this.codigo);
	}
	this.votar=function(sospechoso){
		this.socket.emit("votar",this.nick,this.codigo,sospechoso);
	}
	this.movimiento=function(direccion,x,y){
		var datos={nick:this.nick,codigo:this.codigo,numJugador:this.numJugador,direccion:direccion,x:x,y:y,estado:this.estado};
		this.socket.emit("movimiento",datos);
	}

	this.obtenerEncargo=function(){
		this.socket.emit("obtenerEncargo",this.nick,this.codigo);
	}
	this.matarA=function(inocente){
		this.socket.emit("matarA",this.nick,this.codigo,inocente);
	}
	
	this.realizarTarea=function(nick,codigo){
		this.socket.emit("realizarTarea",this.nick,this.codigo);
	}	
	this.abandonarPartida=function(){
		this.socket.emit("abandonarPartida",this.nick,this.codigo);
	}
	this.reset=function(jugando){
		if(jugando){
			resetGame();
		}
		this.nick=undefined;
		this.codigo=undefined;
		this.owner=false;
		this.numJugador=undefined;
		this.impostor=undefined;
		this.estado=undefined;
		this.encargo=undefined;
		this.fase=undefined;
		cw.mostrarCrearPartida(4);
		this.listaPartidasDisponibles();
	}

	//servidor WS dentro del cliente
	this.lanzarSocketSrv=function(){
		var cli=this;
		this.socket.on('connect', function(){			
			console.log("conectado al servidor de Ws");
		});
		this.socket.on('partidaCreada',function(data){
			cli.codigo=data.codigo;
			console.log(data);
			if (data.codigo!="fallo"){
				cli.owner=true;
				cli.numJugador=0;
				cli.estado="vivo";
				cw.mostrarEsperandoRival();
			}
		});
		this.socket.on('unidoAPartida',function(data){
			cli.codigo=data.codigo;
			cli.nick=data.nick;
			cli.numJugador=data.numJugador;
			cli.estado="vivo";
			console.log(data);
			cw.mostrarEsperandoRival();
		});

		this.socket.on("moverRemoto",function(datos){
			mover(datos);
		});
		this.socket.on('dibujarRemoto',function(lista){
			console.log(lista);
			for(var i=0;i<lista.length;i++){
				if(lista[i].nick!=cli.nick){
					lanzarJugadorRemoto(lista[i].nick,lista[i].numJugador);
				}
			}
			crearColision();
		})
		this.socket.on('nuevoJugador',function(lista){
			//console.log(nick+" se une a la partida");
			cw.mostrarListaJugadores(lista);
			//cli.iniciarPartida();
		});
		this.socket.on('esperando',function(fase){
			console.log('esperando' + fase);
		});
		this.socket.on('partidaIniciada',function(fase){
			console.log("Partida en fase: "+fase);
			if (fase=="jugando"){
				cli.fase=fase;
				cli.obtenerEncargo();
				cw.limpiar();
				cw.mostrarJuego();
				lanzarJuego();
				//cw.mostrarModalTarea(fase.lista);
			}
		});
		this.socket.on('recibirListaPartidasDisponibles',function(lista){
			console.log(lista);
			//cw.mostrarUnirAPartida(lista);
			if (!cli.codigo){
				cw.mostrarListaPartidas(lista);
			}
		});
		this.socket.on('recibirListaPartidas',function(lista){
			console.log(lista);
		});
		this.socket.on("votacion",function(lista){
			console.log(lista);
			cli.fase="votacion";
			votarOn=false;
			report();
			cw.mostrarModalVotacion(lista);
		});
		this.socket.on("finalVotacion",function(data){
			cli.fase="jugando";
			//cw.cerrarModal();
			$('#modalGeneral').modal('show');
			if(ws.nick==data.elegido){
				ws.estado="muerto";
			}
			//mostrar otro modal
			cw.mostrarModalSimple("Se ha votado a: " + data.elegido);
			if(data.fase=="jugando"){
				votarOn=true;
			}
			if(data.fase=="final"){
				console.log("Mamasita me da igual ya tu sabe")
				cw.mostrarModalFinal(data.msg);
			}
		});
		this.socket.on("haVotado",function(data){
			console.log(data);
			//actualizar lista
			
		});
		this.socket.on('lanzarVotacion',function(data){
			console.log(data);
		});
		this.socket.on('saltarVoto',function(data){
			console.log(data);
		});
		this.socket.on("recibirEncargo",function(data){
			console.log(data);
			cli.impostor=data.impostor;
			cli.encargo=data.encargo;
			if(data.impostor){
				//$('#avisarImpostor').modal("show");
				cw.mostrarModalSimple('eres el impostor');
				//crearColision();
			}else{
				cw.mostrarModalTarea("Se te ha asignado la tarea de: " + data.encargo);
			}
		});
		this.socket.on("final",function(data){
			console.log(data);
			finPartida(data);
		});
		this.socket.on("muereInocente",function(inocente){
			console.log('muere '+inocente);
			if(cli.nick==inocente){
				cli.estado="muerto";
			}
			dibujarMuereInocente(inocente);
		});

		this.socket.on("tareaRealizada",function(data){
			console.log(data);
			//tareasOn=true;
		});

		this.socket.on("hasAtacado",function(fase){
			if(fase=="jugando"){
				ataquesOn=true;
			}

		});
		this.socket.on("hasAbandonado",function(data){
			cli.reset(data);
		});
		this.socket.on("abandonaJugando",function(data){
			jugadorAbandonaPartida(data.nick);
			cw.mostrarModalSimple(data.msg);
		})

	}

	this.ini();
}

var ws2,ws3,ws4;
function pruebasWS(){
	ws2=new ClienteWS();
	ws3=new ClienteWS();
	ws4=new ClienteWS();
	var codigo=ws.codigo;

	ws.unirAPartida("Juana",codigo);
	ws.unirAPartida("Juani",codigo);
	ws.unirAPartida("Juane",codigo);

	//ws.iniciarPartida();
}

function saltarVotos(){
	ws.saltarVoto();
	ws2.saltarVoto();
	ws3.saltarVoto();
	ws4.saltarVoto();
}

function encargos(){
	ws.obtenerEncargo();
	ws2.obtenerEncargo();
	ws3.obtenerEncargo();
	ws4.obtenerEncargo();
}

