var modelo=require("./modelo.js");

describe("El juego del impostor", function() {
  var juego;
  //var usr;
  var nick;
 
  beforeEach(function() {
  	juego=new modelo.Juego(4);
  	//usr=new modelo.Usuario("Pepe",juego);
  	nick="Pepe";
  });

  it("comprobar valores iniciales del juego", function() {
  	expect(Object.keys(juego.partidas).length).toEqual(0);
  	expect(nick).toEqual("Pepe");
  	expect(juego).not.toBe(undefined);
  });

  describe("el usr Pepe crea una partida de 4 jugadores",function(){
	var codigo;
	beforeEach(function() {
	  	codigo=juego.crearPartida(4,nick);
	  });

	it("se comprueba la partida",function(){ 	
	  	expect(codigo).not.toBe(undefined);
	  	console.log(juego.partidas[codigo].nickOwner);
	  	expect(juego.partidas[codigo].nickOwner).toEqual(nick);
	  	expect(juego.partidas[codigo].maximo).toEqual(4);
	  	expect(juego.partidas[codigo].fase.nombre).toEqual("inicial");
	 	var num=Object.keys(juego.partidas[codigo].usuarios).length;
	  	expect(num).toEqual(1);
	  });
	

	it("varios usuarios se unen a la partida",function(){
		juego.unirAPartida(codigo,"ana");
	  	var num=Object.keys(juego.partidas[codigo].usuarios).length;
	  	expect(num).toEqual(2);
		expect(juego.partidas[codigo].fase.nombre).toEqual("inicial");
		juego.unirAPartida(codigo,"isa");
	  	var num=Object.keys(juego.partidas[codigo].usuarios).length;
	  	expect(num).toEqual(3);
		expect(juego.partidas[codigo].fase.nombre).toEqual("inicial");	  	
		juego.unirAPartida(codigo,"tomas");
	  	var num=Object.keys(juego.partidas[codigo].usuarios).length;
	  	expect(num).toEqual(4);
		expect(juego.partidas[codigo].fase.nombre).toEqual("completado");
	  });

	it("Pepe inicia la partida",function(){
		juego.unirAPartida(codigo,"ana");
	  	var num=Object.keys(juego.partidas[codigo].usuarios).length;
	  	expect(num).toEqual(2);
		expect(juego.partidas[codigo].fase.nombre).toEqual("inicial");
		juego.unirAPartida(codigo,"isa");
	  	var num=Object.keys(juego.partidas[codigo].usuarios).length;
	  	expect(num).toEqual(3);
		expect(juego.partidas[codigo].fase.nombre).toEqual("inicial");	  	
		juego.unirAPartida(codigo,"tomas");
	  	var num=Object.keys(juego.partidas[codigo].usuarios).length;
	  	expect(num).toEqual(4);
		expect(juego.partidas[codigo].fase.nombre).toEqual("completado");		
		//usr.iniciarPartida();
		juego.iniciarPartida(nick,codigo);
		expect(juego.partidas[codigo].fase.nombre).toEqual("jugando");
	})

	it("Hay un pinche impostor entre nosotros",function(){
		juego.unirAPartida(codigo,"Azul");
	  	var num=Object.keys(juego.partidas[codigo].usuarios).length;
	  	expect(num).toEqual(2);
		expect(juego.partidas[codigo].fase.nombre).toEqual("inicial");
		juego.unirAPartida(codigo,"Arcoiris");
	  	var num=Object.keys(juego.partidas[codigo].usuarios).length;
	  	expect(num).toEqual(3);
		expect(juego.partidas[codigo].fase.nombre).toEqual("inicial");	  	
		juego.unirAPartida(codigo,"Rojo");
	  	var num=Object.keys(juego.partidas[codigo].usuarios).length;
	  	expect(num).toEqual(4);
		expect(juego.partidas[codigo].fase.nombre).toEqual("completado");		
		//usr.iniciarPartida();
		juego.iniciarPartida(nick,codigo);
		for (var i = 0; i <= juego.partidas[codigo].usuarios.length; i++) {
			expect(juego.partidas[codigo].usuarios[i].impostor).toEqual(true);
		}
		
	})

	it("Verde ha abandonado la partida (tiene lag)",function(){
		juego.unirAPartida(codigo,"Azul");
	  	var num=Object.keys(juego.partidas[codigo].usuarios).length;
	  	expect(num).toEqual(2);
		expect(juego.partidas[codigo].fase.nombre).toEqual("inicial");
		juego.unirAPartida(codigo,"Arcoiris");
	  	var num=Object.keys(juego.partidas[codigo].usuarios).length;
	  	expect(num).toEqual(3);
		expect(juego.partidas[codigo].fase.nombre).toEqual("inicial");	  	
		juego.unirAPartida(codigo,"Rojo");
	  	var num=Object.keys(juego.partidas[codigo].usuarios).length;
	  	expect(num).toEqual(4);
		expect(juego.partidas[codigo].fase.nombre).toEqual("completado");		
		//usr.iniciarPartida();
		juego.iniciarPartida(nick,codigo);
		for (var i = 0; i <= juego.partidas[codigo].usuarios.length; i++) {
			expect(juego.partidas[codigo].usuarios[i]).toEqual(juego.partidas[codigo].usuarios[i].nombre!="Verde");
		}
		
	})

	it("Azul ha sido atacado",function(){
		juego.unirAPartida(codigo,"Azul");
	  	var num=Object.keys(juego.partidas[codigo].usuarios).length;
	  	expect(num).toEqual(2);
		expect(juego.partidas[codigo].fase.nombre).toEqual("inicial");
		juego.unirAPartida(codigo,"Arcoiris");
	  	var num=Object.keys(juego.partidas[codigo].usuarios).length;
	  	expect(num).toEqual(3);
		expect(juego.partidas[codigo].fase.nombre).toEqual("inicial");	  	
		juego.unirAPartida(codigo,"Rojo");
	  	var num=Object.keys(juego.partidas[codigo].usuarios).length;
	  	expect(num).toEqual(4);
		expect(juego.partidas[codigo].fase.nombre).toEqual("completado");		
		//usr.iniciarPartida();
		juego.iniciarPartida(nick,codigo);
		juego.partidas[codigo].usuarios.Rojo.impostor=true;
		juego.partidas[codigo].usuarios.Azul.impostor=false;
		juego.partidas[codigo].usuarios.Rojo.matarA("Azul");
		expect(juego.partidas[codigo].usuarios.Azul.estado.nombre).toEqual("muerto");
	})

	it("Azul recibe una tarea (por primera vez hará algo útil, esperemos)",function(){
		juego.unirAPartida(codigo,"Azul");
	  	var num=Object.keys(juego.partidas[codigo].usuarios).length;
	  	expect(num).toEqual(2);
		expect(juego.partidas[codigo].fase.nombre).toEqual("inicial");
		juego.unirAPartida(codigo,"Arcoiris");
	  	var num=Object.keys(juego.partidas[codigo].usuarios).length;
	  	expect(num).toEqual(3);
		expect(juego.partidas[codigo].fase.nombre).toEqual("inicial");	  	
		juego.unirAPartida(codigo,"Rojo");
	  	var num=Object.keys(juego.partidas[codigo].usuarios).length;
	  	expect(num).toEqual(4);
		expect(juego.partidas[codigo].fase.nombre).toEqual("completado");		
		//usr.iniciarPartida();
		juego.iniciarPartida(nick,codigo);
		expect(juego.partidas[codigo].usuarios.Azul.encargo).not.toEqual("ninguno");
		
	});
	describe("las votaciones",function(){
		beforeEach(function(){
			juego.unirAPartida(codigo,"ana");
			juego.unirAPartida(codigo,"isa");
			juego.unirAPartida(codigo,"maria");
			juego.iniciarPartida(nick,codigo);
		});

		it("todos skipean",function(){
			var partida=juego.partidas[codigo];
			juego.lanzarVotacion(nick,codigo);
			expect(partida.fase.nombre).toEqual("votacion");
			juego.saltarVoto(nick,codigo);
			expect(partida.fase.nombre).toEqual("votacion");
			juego.saltarVoto("ana",codigo);
			expect(partida.fase.nombre).toEqual("votacion");
			juego.saltarVoto("isa",codigo);
			expect(partida.fase.nombre).toEqual("votacion");
			juego.saltarVoto("maria",codigo);
			expect(partida.fase.nombre).toEqual("jugando");
		});
		it("se vota y mata a un inocente",function(){
			var partida=juego.partidas[codigo];
			juego.lanzarVotacion(nick,codigo);

			partida.usuarios[nick].impostor=true;
			partida.usuarios["ana"].impostor=false;
			partida.usuarios["isa"].impostor=false;
			partida.usuarios["maria"].impostor=false;

			expect(partida.fase.nombre).toEqual("votacion");
			juego.votar(nick,codigo,"maria");
			expect(partida.fase.nombre).toEqual("votacion");
			juego.votar("ana",codigo,"maria");
			expect(partida.fase.nombre).toEqual("votacion");
			juego.votar("isa",codigo,"maria");
			expect(partida.fase.nombre).toEqual("votacion");
			juego.votar("maria",codigo,"ana");
			expect(partida.usuarios["maria"].estado.nombre).toEqual("muerto");
			expect(partida.fase.nombre).toEqual("jugando");
		});
		it("se vota y mata al impostor, la partida termina",function(){
			var partida=juego.partidas[codigo];
			juego.lanzarVotacion(nick,codigo);
			
			partida.usuarios[nick].impostor=true;
			partida.usuarios["ana"].impostor=false;
			partida.usuarios["isa"].impostor=false;
			partida.usuarios["maria"].impostor=false;

			expect(partida.fase.nombre).toEqual("votacion");
			juego.votar(nick,codigo,"maria");
			expect(partida.fase.nombre).toEqual("votacion");
			juego.votar("ana",codigo,nick);
			expect(partida.fase.nombre).toEqual("votacion");
			juego.votar("isa",codigo,nick);
			expect(partida.fase.nombre).toEqual("votacion");
			juego.votar("maria",codigo,nick);
			expect(partida.usuarios[nick].estado.nombre).toEqual("muerto");
			expect(partida.fase.nombre).toEqual("final");
		});
	})

   });


	

})