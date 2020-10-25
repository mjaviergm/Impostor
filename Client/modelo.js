function Juego(){
	this.partidas={};
	this.crearPartida=function(num,owner){
		if(num >= 4 && num < 11){
			let codigo=this.obtenerCodigo();
			if (!this.partidas[codigo]){
				this.partidas[codigo]=new Partida(num,owner.nick);
				owner.partida=this.partidas[codigo];
			}
			return codigo;
		}else return console.log("El numero de jugadores debe ser superior a 4 o menor a 10 para iniciar la partida")
	}
	this.unirAPartida=function(codigo,nick){
		if (this.partidas[codigo]){
			this.partidas[codigo].agregarUsuario(nick);
		}
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
}

function Partida(num,owner){
	this.maximo=num;
	this.nickOwner=owner;
	this.fase=new Inicial();
	this.usuarios={};
	this.encargos=new encargos();
	this.agregarUsuario=function(nick){
		this.fase.agregarUsuario(nick,this)
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
	}
	this.comprobarMinimo=function(){
		return Object.keys(this.usuarios).length>=4
	}
	this.comprobarMaximo=function(){
		return Object.keys(this.usuarios).length<this.maximo
	}
	this.iniciarPartida=function(){
		this.fase.iniciarPartida(this);
	}
	this.abandonarPartida=function(nick){
		this.fase.abandonarPartida(nick,this);
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
		let auxImp = this.usuarios[key] - this.usuarios[key].impostor;
		for (var key in this.usuarios) {
			if (auxImp && this.usuarios[key].estado.nombre=="vivo"){
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

	this.agregarUsuario(owner);

	
}

function Inicial(){
	this.nombre="inicial";
	this.agregarUsuario=function(nick,partida){
		partida.puedeAgregarUsuario(nick);
		if (partida.comprobarMinimo()){
			partida.fase=new Completado();
		}		
	}
	this.iniciarPartida=function(partida){
		console.log("Faltan jugadores");
	}
	this.abandonarPartida=function(nick,partida){
		partida.eliminarUsuario(nick);
		//comprobar si no quedan usr
	}
	this.matarA=function(nick,partida){}

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
	this.matarA=function(nick,partida){}
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
	this.matarA=function(nick,partida){
		partida.puedeMatar(nick);
	}
	this.encargos=function(partida){
		partida.puedeAsignarEncargo();
	}
}

function Final(){
	this.final="final";
	this.agregarUsuario=function(nick,partida){
		console.log("La partida ha terminado");
	}
	this.iniciarPartida=function(partida){
	}
	this.abandonarPartida=function(nick,partida){
		//esto es absurdo
	}
	this.matarA=function(nick,partida){}
}

function Usuario(nick,juego){
	this.nick=nick;
	this.juego=juego;
	this.partida;
	this.impostor = false;
	this.encargo = "ninguno";
	this.estado=new estadoVivo();
	this.votos = 0;
	this.skip = false;
	this.haVotado=false;
	this.crearPartida=function(num){
		return this.juego.crearPartida(num,this);
	}
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
	this.matarA=function(nick){
		if(this.impostor && !this.partida.esImpostor(nick)){
			this.estado.matarA(nick,this.partida);
		}
	}
	this.esImpostor=function(){
		return this.impostor;
	}
	this.esAtacado=function(){
		this.estado.esAtacado(this);
	}

}

function estadoVivo(nick){
	this.nombre="vivo";
	this.matarA=function(nick,partida){
		partida.matarA(nick);
	}
	this.esAtacado=function(usr){
		usr.estado=new estadoMuerto();
	}
}

function estadoMuerto(nick){
	this.nombre="muerto";
	this.matarA=function(nick,partida){
		return false;
	}
	this.esAtacado=function(usr){}
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

function Inicio(){
	juego = new Juego();
	var usr = new Usuario("Pepe",juego);
	var codigo = usr.crearPartida(8);

	juego.unirAPartida(codigo,"verde");
	juego.unirAPartida(codigo,"azul");
	juego.unirAPartida(codigo,"rojo");
	juego.unirAPartida(codigo,"arcoiris");
	juego.unirAPartida(codigo,"amarillo");
	juego.unirAPartida(codigo,"rosa");
	juego.unirAPartida(codigo,"blanco");
	juego.unirAPartida(codigo,"negro");
	juego.unirAPartida(codigo,"transparente");



	usr.iniciarPartida();
}