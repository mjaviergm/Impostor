var modelo = require("./modelo.js");

function ServidorWS(){
	
	this.enviarRemitente=function(socket,mens,datos){
        socket.emit(mens,datos);
    }
    this.enviarATodos=function(io,nombre,mens,datos){
        io.sockets.in(nombre).emit(mens,datos);
    }
    this.enviarATodosMenosRemitente=function(socket,nombre,mens,datos){
        socket.broadcast.to(nombre).emit(mens,datos);
    }
    this.enviarGlobal=function(socket,mens,datos){
    	socket.broadcast.emit(mens,datos);
    }


	this.lanzarSocketSrv=function(io,juego){
		var cli=this;
		io.on('connection',function(socket){		    
		    socket.on('crearPartida', function(nick,numero) {
		        
				var codigo=juego.crearPartida(numero,nick);
				socket.join(codigo);	
				console.log('usuario: '+nick+" crea partida codigo: "+codigo);	        				
		       	cli.enviarRemitente(socket,"partidaCreada",{"codigo":codigo,"owner":nick});	
		       	//enviar a todos los clientes la lista de partidas
		       	var lista=juego.listaPartidasDisponibles();
		       	cli.enviarGlobal(socket,"recibirListaPartidasDisponibles",lista);
		    });
		    socket.on('unirAPartida',function(nick,codigo){
		    	//nick o codigo nulo
		    	var res=juego.unirAPartida(codigo,nick);
		    	socket.join(codigo);
		    	var owner = juego.partidas[codigo].nickOwner;
		    	console.log("Usuario "+nick+" se une a partida " + codigo);
		    	cli.enviarRemitente(socket,"unidoAPartida",res);
		    	var lista=juego.obtenerListaJugadores(codigo);
		    	cli.enviarATodos(io,codigo, "nuevoJugador",lista);
		    });

		    socket.on('iniciarPartida',function(nick,codigo){
	    		juego.iniciarPartida(nick,codigo);
		    	var fase=juego.partidas[codigo].fase.nombre;
		    	if(fase=="jugando"){
		    		cli.enviarATodos(io, codigo, "partidaIniciada",fase);
		    	}
		    });

		    socket.on('listaPartidasDisponibles',function(){
		    	var lista=juego.listaPartidasDisponibles();
		    	cli.enviarRemitente(socket,"recibirListaPartidasDisponibles",lista);
		    });

		    socket.on('listaPartidas',function(){
		    	var lista=juego.listaPartidas();
		    	cli.enviarRemitente(socket,"recibirListaPartidas",lista);
		    });

		    socket.on('recibirListaPartidasDisponibles',function(){
		    	var lista=juego.listaPartidasDisponibles();
		    	cli.enviarRemitente(socket,"recibirListaPartidasDisponibles",lista);
		    });

		    socket.on('recibirListaPartidas',function(){
		    	var lista=juego.listaPartidas();
		    	cli.enviarRemitente(socket,"recibirListaPartidas",lista);
		    });
		    socket.on('lanzarVotacion',function(nick,codigo){
		    	juego.lanzarVotacion(nick,codigo);
		    	var partida=juego.partidas[codigo];
		    	var lista= partida.obtenerListaJugadoresVivos();
		    	console.log("console server." + lista);
		    	cli.enviarATodos(io, codigo, "votacion", lista);
		    });
		    socket.on('estoyDentro',function(nick,codigo){
		    	//var usr=juego.obtenerJugador(nick,codigo);
		    	// var numero = juego.partidas[codigo].usuarios[nick].numJugador;
		    	// var datos={nick:nick,numJugador:numero};
		    	// cli.enviarATodosMenosRemitente(socket,codigo,"dibujarRemoto",datos);
		    	var lista=juego.obtenerListaJugadores(codigo);
		    	cli.enviarRemitente(socket,"dibujarRemoto",lista);
		    });
		    

		    socket.on('movimiento',function(datos){
		    	cli.enviarATodosMenosRemitente(socket,datos.codigo,"moverRemoto",datos);
		    });

		    socket.on('saltarVoto',function(nick,codigo){
		    	var partida = juego.partidas[codigo];
		    	juego.saltarVoto(nick,codigo);
		    	var fase = partida.fase.nombre;
		    	if(partida.todosHanVotado()){
		    		var data={"elegido":partida.elegido,"fase":fase};
		    		cli.enviarATodos(io,codigo,"finalVotacion",data);
		    		if(fase=="final"){
				    	cli.enviarATodos(io,codigo,"final",partida.comprobarFinal());		    	
				    }		    	
		    	}else{
		    		cli.enviarATodos(io,codigo,"haVotado",partida.listaHanVotado());
		    	}

		    });

		    socket.on('votar',function(nick,codigo,sospechoso){
		    	var partida = juego.partidas[codigo];
		    	var lista = partida.listaHanVotado();
		    	var msg = juego.votar(nick,codigo,sospechoso);
		    	var fase = partida.fase.nombre;
		    	if(partida.todosHanVotado()){
		    		console.log("ServidorWS.votar."+fase);
		    		var data={"elegido":partida.elegido,"fase":fase,"msg":msg};
		    		cli.enviarATodos(io,codigo,"finalVotacion",data);
		    		if(fase=="final"){
				    	cli.enviarATodos(io,codigo,"final",partida.comprobarFinal());		    	
				    }		    	
		    	}else{
		    		
		    		cli.enviarATodos(io,codigo,"haVotado",lista);
		    	}

		    });

		    socket.on("obtenerEncargo",function(nick,codigo){
		    	var encargo=juego.partidas[codigo].usuarios[nick].encargo;
		    	var impostor=juego.partidas[codigo].usuarios[nick].impostor;
		    	cli.enviarRemitente(socket,"recibirEncargo",{"encargo":encargo,"impostor":impostor});
		    });

		    socket.on('matarA',function(nick,codigo,inocente){
		    	console.log("ServidorWS.matarA");
		    	var partida =juego.partidas[codigo];
				    var fase = partida.fase.nombre;
		    	if(juego.matarA(nick,codigo,inocente)){
				    cli.enviarATodos(io,codigo,"muereInocente",inocente);
				}
				cli.enviarRemitente(socket,"hasAtacado",fase);
				if(fase=="final"){
				    	cli.enviarATodos(io,codigo,"final",partida.comprobarFinal());		    	
				    }
		    });

		    socket.on("realizarTarea",function(nick,codigo){
		    	var partida=juego.partidas[codigo];
		    	juego.realizarTarea(nick,codigo);
		    	var percent=partida.obtenerPercentTarea(nick);
		    	var global=partida.obtenerPercentGlobal();
				cli.enviarRemitente(socket,"tareaRealizada",{"percent":percent,"goblal":global});			    	
		    	var fase=partida.fase.nombre;
		    	if (fase=="final"){
			    	cli.enviarATodos(io, codigo, "final",partida.comprobarFinal());
			    }
		    });

		    socket.on("abandonarPartida",function(nick,codigo){
		    	if(juego.abandonarPartida(nick,codigo)){
		    		if(juego.partidas[codigo] && juego.partidas[codigo].fase.nombre=="jugando"){
		    			cli.enviarRemitente(socket,"hasAbandonado",true);
			    		cli.enviarATodosMenosRemitente(socket,codigo,"abandonaJugando",{"nick":nick,"msg":"el usuario "+nick+" ha abandonado partida."});
		    		}else{
		    			if(!juego.partidas[codigo] || juego.partidas[codigo].fase.nombre=="final"){
		    				cli.enviarRemitente(socket,"hasAbandonado",true);
		    				cli.enviarATodos(io,codigo,"final",juego.partidas[codigo]?juego.partidas[codigo].comprobarFinal():"Eres el último jugador en la partida.")
			    		}else{
			    			cli.enviarRemitente(socket,"hasAbandonado",false);
		    				cli.enviarATodosMenosRemitente(socket,codigo,"nuevoJugador",juego.obtenerListaJugadores(codigo));
			    		}
		    		}
		    	}
		    	/* 
		    	FALTA ENVIAR A TODOS LISTA USUARIOS, REFRESCCAR REMITENTE WEI, PRUEBAS DE ABANDONAR PARTIDA Y AAAAAAAAH... JAJAJAJA... *SUSPIRO* *TOS* QUE NO PUEDO RESPIRAR, SISI
		    	E INTENTAR OWNER
		    	*/


		    })

		});
	}
}

module.exports.ServidorWS=ServidorWS;

