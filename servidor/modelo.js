function Juego(){
	this.partidas={};
	this.crearPartida=function(num,owner){
		let codigo="fallo";
		if (!this.partidas[codigo] && this.numeroValido(num)){
			codigo=this.obtenerCodigo();
			this.partidas[codigo]=new Partida(num,owner,codigo,this);
			//owner.partida=this.partidas[codigo];
		}
		else{
			console.log(codigo);
		}
		return codigo;
	}
	this.unirAPartida=function(codigo,nick){
		var res=-1;
		if (this.partidas[codigo]){
			res=this.partidas[codigo].agregarUsuario(nick);
		}
		
		return res;
	}
	
	this.obtenerCodigo=function(){
		let cadena="ABCDEFGHIJKLMNOPQRSTUVXYZ";
		let letras=cadena.split('');
		let maxCadena=cadena.length;
		let codigo=[];
		for(i=0;i<6;i++){
			codigo.push(letras[randomInt(1,maxCadena)-1]);
		}
		return codigo.join('');
	}

	this.iniciarPartida=function(nick,codigo){
		var owner=this.partidas[codigo].nickOwner;
		if(nick == owner){
			this.partidas[codigo].iniciarPartida();
		}
	}

	this.listaPartidas=function(){
		var lista=[];
		for (var key in this.partidas){
			var partida=this.partidas[key];
			var owner=partida.nickOwner;
			 lista.push({"codigo":key,"owner":owner});
		}
		return lista;
	}

	this.listaPartidasDisponibles=function(){
		var lista=[];
		var huecos=0;
		var maximo=0;
		for (var key in this.partidas){
			var partida=this.partidas[key];
			huecos=partida.obtenerHuecos();
			maximo=partida.maximo;
			if (huecos>0)
			{
			  lista.push({"codigo":key,"huecos":huecos,"maximo":maximo});
			}
		}
		return lista;
	}

	this.eliminarPartida=function(codigo){
		delete this.partidas[codigo];
	}

	this.numeroValido=function(num){
		return (num>=4 && num<=10)
	}

	this.obtenerCodigo=function(){
		let cadena="ABCDEFGHIJKLMNOPQRSTUVXYZ";
		let letras=cadena.split('');
		let maxCadena=cadena.length;
		let codigo=[];
		for(i=0;i<6;i++){
			codigo.push(letras[randomInt(1,maxCadena)-1]);
		}
		return codigo.join('');
	}

	this.asignarEncargos=function(nick,codigo){
		var res={};
		var encargo=this.partidas[codigo].usuarios[nick].encargo;
		var impostor=this.partidas[codigo].usuarios[nick].impostor;
		res={"nick":nick,"encargo":encargo,"impostor":impostor};

		return res;
	}


	this.lanzarVotacion=function(nick,codigo){
		var usr=this.partidas[codigo].usuarios[nick];
		usr.lanzarVotacion();
	}

	this.saltarVoto=function(nick,codigo){
		var usr=this.partidas[codigo].usuarios[nick];
		usr.saltarVoto();
	}
	
	this.votar=function(nick,codigo,sospechoso){
		var usr=this.partidas[codigo].usuarios[nick];
		//usr=this.partidas[codigo].obtenerUsuario(nick)
		usr.votar(sospechoso);
	}

	this.matarA=function(nick,codigo,inocente){
		var usr=this.partidas[codigo].usuarios[nick];
		usr.matarA(inocente);
	}

	this.obtenerListaJugadores=function(codigo){
		return this.partidas[codigo].obtenerListaJugadores();
	}


}

function Partida(num,owner,codigo,juego){
	this.maximo=num;
	this.nickOwner=owner;
	this.codigo=codigo;
	this.juego=juego;
	this.fase=new Inicial();
	this.usuarios={};
	this.elegido="no se ha elegido a nadie";
	this.encargos=new encargos();
	this.agregarUsuario=function(nick){
		return this.fase.agregarUsuario(nick,this)
	}
	this.puedeAgregarUsuario=function(nick){
		let nuevo=nick;
		let contador=1;
		while(this.usuarios[nuevo]){
			nuevo=nick+contador;
			contador=contador+1;
		}
		this.usuarios[nuevo]=new Usuario(nuevo);
		this.usuarios[nuevo].partida=this;
		var numero = this.numeroJugadores()-1;
		this.usuarios[nuevo].numJugador= numero;
		if (this.comprobarMinimo()){
			this.fase=new Completado();
		}
		return {"codigo":this.codigo,"nick":nuevo,"numJugador":numero};
	}
	this.numeroJugadores=function(){
		return Object.keys(this.usuarios).length;
	}
	this.comprobarMinimo=function(){
		return this.numeroJugadores()>=4;
	}
	this.comprobarMaximo=function(){
		return this.numeroJugadores()<this.maximo;
		//return Object.keys(this.usuarios).length<this.maximo
	}
	this.obtenerListaJugadores=function(){
		var lista=[];
		for(var key in this.usuarios){
			var numero=this.usuarios[key].numJugador;
			lista.push({nick:key,numJugador:numero})
		}
		return lista;
		//return Object.keys(this.usuarios);
	}
	this.obtenerHuecos=function(){
		return this.maximo-this.numeroJugadores();
	}
	this.iniciarPartida=function(){
		this.fase.iniciarPartida(this);
	}
	this.abandonarPartida=function(nick){
		this.fase.abandonarPartida(nick,this);
	}
	this.puedeAbandonarPartida=function(nick){
		this.eliminarUsuario(nick);
		if (!this.comprobarMinimo()){
			this.fase=new Inicial();
		}
		if (this.numeroJugadores()<=0){
			this.juego.eliminarPartida(this.codigo);
		}
	}
	this.eliminarUsuario=function(nick){
		delete this.usuarios[nick];
	}
	this.asignarImpostor=function(nick){
		this.fase.asignarImpostor(nick,this);
	}

	this.impostor=function(nick) {
		let usr = Object.keys(this.usuarios);
		this.usuarios[usr[randomInt(0,usr.length)]].impostor = true;		
	}

	this.esImpostor=function(nick){
		return this.usuarios[nick].esImpostor();
	}

	this.matarA=function(nick){
		this.fase.matarA(nick,this)
	}

	this.puedeMatar=function(nick){
		this.usuarios[nick].esAtacado();
	}

	this.asignarEncargos=function(){
		this.fase.encargos(this);
	}

	this.puedeAsignarEncargo=function(){
		for (var usr in this.usuarios) {
			this.usuarios[usr].encargo=this.encargos.asignarEncargos();

		}
	}

	this.numeroImpostoresVivos=function(){
		let cont=0;
		for (var key in this.usuarios) {
			if (this.usuarios[key].impostor && this.usuarios[key].estado.nombre=="vivo"){
				cont++;
			}
		}
		return cont;
	}

	this.numeroTripulantesVivos=function(){
		let cont=0;
		for (var key in this.usuarios) {
			if (this.usuarios[key].estado.nombre=="vivo" && !this.usuarios[key].impostor){
				cont++;
			}
		}
		return cont;
	}

	this.gananTripulantes=function(){
		return (this.numeroImpostoresVivos()==0);
	}

	this.gananImpostores=function(){
		return (this.numeroTripulantesVivos()==0);
	}

	this.votar=function(sospechoso){
		this.fase.votar(sospechoso,this);
	}

	this.puedeVotar=function(sospechoso){
		var usr = this.usuarios[sospechoso];
		usr.esVotado();
		//this.usuarios[sospechoso].esVotado();
		this.comprobarVotacion();
	}

	this.masVotado=function(){
		let votado=undefined;
		let cont=0;
		let max=1;
		for (var key in this.usuarios) {
			if (max<this.usuarios[key].votos){
				max=this.usuarios[key].votos;
				votado=this.usuarios[key];
			}
		}
		for (var key in this.usuarios) {
			if (max==this.usuarios[key].votos){
				cont++;
			}
		}

		if (cont>1){
			votado=undefined;
		}
		return votado;
	}

	this.numeroSkips=function(){
		let cont=0;
		for (var key in this.usuarios) {
			if (this.usuarios[key].estado.nombre=="vivo" && this.usuarios[key].skip){
				cont++;
			}
		}
		return cont;
	}

	this.todosHanVotado=function(){
		let res=true;
		for (var key in this.usuarios) {
			if (this.usuarios[key].estado.nombre=="vivo" && !this.usuarios[key].haVotado){
				res=false;
				break;
			}
		}
		return res;
	}

	this.listaHanVotado=function(){
		var lista=[];
		for (var key in this.usuarios) {
			if (this.usuarios[key].estado.nombre=="vivo" && this.usuarios[key].haVotado){
				lista.push(key);
			}
		}
		return lista;
	}

	this.comprobarVotacion=function(){
		if (this.todosHanVotado()){
			let elegido=this.masVotado();
			if (elegido && elegido.votos>this.numeroSkips()){
				elegido.esAtacado();
				this.elegido=elegido.nick;
			}
			this.finalVotacion();
		}
	}

	this.finalVotacion=function(){
		this.fase=new Jugando();
		//this.reiniciarContadoresVotaciones(); 
		this.comprobarFinal();
	}

	this.reiniciarContadoresVotaciones=function(){
		this.elegido="no hay nadie elegido";
		for (var key in this.usuarios) {
			if (this.usuarios[key].estado.nombre=="vivo"){
				this.usuarios[key].reiniciarContadoresVotaciones();
			}
		}
	}

	this.comprobarFinal=function(){
		if (this.gananImpostores()){
			this.finPartida();
		}
		else if (this.gananTripulantes()){
			this.finPartida();
		}
	}

	this.finPartida=function(){
		this.fase=new Final();
	}

	this.lanzarVotacion=function(){
		this.fase.lanzarVotacion(this);
	}

	this.puedeLanzarVotacion=function(){
		this.reiniciarContadoresVotaciones();
		this.fase=new Votacion();
	}

	this.agregarUsuario(owner);

	
}

function Inicial(){
	this.nombre="inicial";
	this.agregarUsuario=function(nick,partida){
		return partida.puedeAgregarUsuario(nick);
		// if (partida.comprobarMinimo()){
		// 	partida.fase=new Completado();
		// }		

	}
	this.iniciarPartida=function(partida){
		console.log("Faltan jugadores");
	}
	this.abandonarPartida=function(nick,partida){
		partida.eliminarUsuario(nick);
		//comprobar si no quedan usr
	}
	this.matarA=function(nick,partida){}

	this.lanzarVotacion=function(){}
}

function Completado(){
	this.nombre="completado";
	this.iniciarPartida=function(partida){
		partida.fase=new Jugando();
		partida.asignarImpostor();
		partida.asignarEncargos();
	}
	this.agregarUsuario=function(nick,partida){
		if (partida.comprobarMaximo()){
			partida.puedeAgregarUsuario(nick);
		}
		else{
			console.log("Lo siento, numero máximo")
		}
	}
	this.abandonarPartida=function(nick,partida){
		partida.eliminarUsuario(nick);
		if (!partida.comprobarMinimo()){
			partida.fase=new Inicial();
		}
	}
	this.matarA=function(inocente){}

	this.lanzarVotacion=function(){}
}

function Jugando(){
	this.nombre="jugando";
	this.agregarUsuario=function(nick,partida){
		console.log("La partida ya ha comenzado");
	}
	this.iniciarPartida=function(partida){
		console.log("Hay un impostor entre nosotros...");
	}
	this.abandonarPartida=function(nick,partida){
		partida.eliminarUsuario(nick);
		//comprobar si termina la partida
				if(partida.usuarios.length <= 0){
					console.log(this.nick, "era el ultimo jugador de la partida");
				}
	}
	this.asignarImpostor=function(nick,partida){
		partida.impostor(nick);
	}
	this.matarA=function(inocente,partida){
		partida.puedeMatar(inocente);
	}
	this.encargos=function(partida){
		partida.puedeAsignarEncargo();
	}

	this.lanzarVotacion=function(partida){
		partida.puedeLanzarVotacion();
	}
	this.votar=function(sospechoso,partida){}
}

function Votacion(){
	this.nombre="votacion";
	this.agregarUsuario=function(nick,partida){}
	this.iniciarPartida=function(partida){}
	this.abandonarPartida=function(nick,partida){}
	this.matarA=function(nick,partida){}
	this.lanzarVotacion=function(){}
	this.votar=function(sospechoso,partida){
		partida.puedeVotar(sospechoso);
	}
}

function Final(){
	this.nombre="final";
	this.agregarUsuario=function(nick,partida){
		console.log("La partida ha terminado");
	}
	this.iniciarPartida=function(partida){
	}
	this.abandonarPartida=function(nick,partida){
		//esto es absurdo
	}
	this.matarA=function(inocente){}
	this.lanzarVotacion=function(){}
}

function Usuario(nick){
	this.nick=nick;
	//this.juego=juego;
	this.partida;
	this.impostor = false;
	this.numJugador;
	this.encargo = "ninguno";
	this.estado=new estadoVivo();
	this.votos = 0;
	this.skip = false;
	this.haVotado=false;
	// this.crearPartida=function(num){
	// 	return this.juego.crearPartida(num,this);
	// }
	this.iniciarPartida=function(){
		this.partida.iniciarPartida();
	}
	this.abandonarPartida=function(){
		this.partida.abandonarPartida(this.nick);
	}
	this.asignarImpostor=function(){
		this.partida.asignarImpostor(this.nick);
	}
	this.estadoMuerto=function(){
		this.estado = "muerto";
	}
	this.matarA=function(inocente){
		if (this.impostor && !(this.nick==inocente)){
			this.partida.matarA(inocente);
		}
	}
	this.esImpostor=function(){
		return this.impostor;
	}
	this.esAtacado=function(){
		this.estado.esAtacado(this);
	}
	this.lanzarVotacion=function(){
		this.estado.lanzarVotacion(this);
	}
	this.saltarVoto=function(){
		this.skip=true;
		this.haVotado=true;
		this.partida.comprobarVotacion();
	}
	this.puedeLanzarVotacion=function(){
		this.partida.lanzarVotacion();
	}
	this.votar=function(sospechoso){
		this.haVotado=true;
		this.partida.votar(sospechoso);
	}
	this.esVotado=function(){
		this.votos++;
	}
	this.reiniciarContadoresVotaciones=function(){
		this.votos=0;
		this.haVotado=false;
		this.skip=false;
	}

}

function estadoVivo(nick){
	this.nombre="vivo";
	this.matarA=function(nick,partida){
		partida.matarA(nick);
	}
	this.esAtacado=function(usr){
		usr.estado=new estadoMuerto();
		usr.partida.comprobarFinal();
	}
	this.lanzarVotacion=function(usr){
		usr.puedeLanzarVotacion();
	}
}

function estadoMuerto(nick){
	this.nombre="muerto";
	// this.matarA=function(nick,partida){
	// 	return false;
	// }
	this.esAtacado=function(usr){}
	this.lanzarVotacion=function(usr){}
}

function encargos(){
	var almacenTareas=["jardines","basura","calles","mobiliario"];
	this.asignarEncargos=function(){
		return almacenTareas[randomInt(0,almacenTareas.length)];
	}
}

function randomInt(low, high) {
	return Math.floor(Math.random() * (high - low) + low);
}

// function Inicio(){
// 	juego = new Juego();
// 	var usr = new Usuario("Pepe",juego);
// 	var codigo = usr.crearPartida(8);

// 	juego.unirAPartida(codigo,"verde");
// 	juego.unirAPartida(codigo,"azul");
// 	juego.unirAPartida(codigo,"rojo");
// 	juego.unirAPartida(codigo,"arcoiris");
// 	juego.unirAPartida(codigo,"amarillo");
// 	juego.unirAPartida(codigo,"rosa");
// 	juego.unirAPartida(codigo,"blanco");
// 	juego.unirAPartida(codigo,"negro");
// 	juego.unirAPartida(codigo,"transparente");



// 	usr.iniciarPartida();
// }

module.exports.Juego=Juego;
module.exports.Usuario=Usuario;