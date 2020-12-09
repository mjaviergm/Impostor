function ClienteRest(){
	this.agregarUsuario=function(nick){
		$.getJSON("/agregarUsuario/"+nick,function(data){    
    		console.log(data);
		});
	}

	this.unirAPartida=function(nick,codigo){
		$.getJSON("/unirAPartida" +nick+"/"+codigo,function(data){
			console.log(data);
		});
	}

	this.listaPartidas=function(){
		$.getJSON("/listaPartidas",function(data){
			console.log(data);
		});
	}

	this.iniciarPartida=function(nick,codigo){
		$.getJSON("/iniciarAPartida" +nick+"/"+codigo,function(data){
			console.log(data);
		});
	}

	this.crearPartida=function(nick,num,callback){
		$.getJSON("/crearPartida/"+nick+"/"+num,function(data){    
    		console.log(data);
    		callback(data);
		});
	}
};
	function pruebas(){
	var codigo=undefined;
	rest.crearPartida("pepe",3,function(data){
		codigo=data.codigo;		
	});
	rest.crearPartida("pepe",4,function(data){
		codigo=data.codigo;
		rest.unirAPartida("juan",codigo);
		rest.unirAPartida("juani",codigo);
		rest.unirAPartida("juana",codigo);
		rest.unirAPartida("juanma",codigo);
	});
	rest.crearPartida("pepe",5,function(data){
		codigo=data.codigo;
		rest.unirAPartida("juan",codigo);
		rest.unirAPartida("juani",codigo);
		rest.unirAPartida("juana",codigo);
		rest.unirAPartida("juanma",codigo);
	});


}