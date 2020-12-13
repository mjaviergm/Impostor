function ClienteWS(){

	this.socket=undefined;
	this.nick=undefined;
	this.codigo=undefined;
	this.owner=false;
	this.numJugador=undefined;
	this.impostor;
	this.estado;
	this.encargo;
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
		var datos={nick:this.nick,codigo:this.codigo,numJugador:this.numJugador,direccion:direccion,x:x,y:y};
		this.socket.emit("movimiento",datos);
	}

	this.obtenerEncargo=function(){
		this.socket.emit("obtenerEncargo",this.nick,this.codigo);
	}
	this.matarA=function(inocente){
		this.socket.emit("matarA",this.nick,this.codigo,inocente);
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
				cli.obtenerEncargo();
				cw.limpiar();
				lanzarJuego();
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
		this.socket.on("votacion",function(data){
			console.log(data);
			//dibujarVotacion(lista)
		});
		this.socket.on("finalVotacion",function(data){
			console.log(data);
		});
		this.socket.on("haVotado",function(data){
			console.log(data);
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
				$('#avisarImpostor').modal("show");
				//crearColision();
			}
		});
		this.socket.on("final",function(data){
			console.log(data);
		});
		this.socket.on("muereInocente",function(inocente){
			console.log('muere '+inocente);
			if(cli.nick==inocente){
				cli.estado="muerto";
			}
			dibujarMuereInocente(inocente);
		});


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

