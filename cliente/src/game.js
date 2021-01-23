/**
 * Author: Michael Hadley, mikewesthad.com
 * Asset Credits:
 *  - Tuxemon, https://github.com/Tuxemon/Tuxemon
 */

function lanzarJuego(){
  game = new Phaser.Game(config);
}

  const config = {
    type: Phaser.AUTO,
    width: 500,
    height: 400,
    parent: "game-container",
    pixelArt: true,
    physics: {
      default: "arcade",
      arcade: {
        gravity: { y: 0 }
      }
    },
    scene: {
      preload: preload,
      create: create,
      update: update
    }
  };

  var game;// = new Phaser.Game(config);
  let cursors;
  var player;
  //let player2;
  var jugadores={}; //la colección de jugadores remotos
  let showDebug = false;
  let camera;
  var worldLayer;
  let map;
  var crear;
  var spawnPoint;
  var recursos=[{frame:0,sprite:"ana"},{frame:0,sprite:"pepe"},{frame:0,sprite:"tom"},{frame:0,sprite:"rayo"},{frame:0,sprite:"paco"},{frame:0,sprite:"jose"},{frame:0,sprite:"esteban"},{frame:0,sprite:"luis"},{frame:0,sprite:"felipe"},{frame:0,sprite:"wence"}];
  var remotos;
  var muertos;
  var capaTareas;
  var tareasOn=true;
  var ataquesOn=true;
  var votarOn=true;
  var final=false;
  var nametag;
  var remotag={};

  function resetGame(){
    if(!game){
      return ;
    }
       game.destroy();// = new Phaser.Game(config);
       cursors=null;
       player=null;
      //let player2;
       jugadores={}; //la colección de jugadores remotos
       showDebug = false;
       camera=null;
       worldLayer=null;
       map=null;
       crear=null;
       spawnPoint=null;
       remotos=null;
       muertos=null;
       capaTareas=null;
       tareasOn=true;
       ataquesOn=true;
       votarOn=true;
       final=false;
       nametag=null;
       remotag={};
  }

  function preload() {
    this.load.image("tiles", "cliente/assets/tilesets/tuxmon-sample-32px-extruded.png");
    this.load.tilemapTiledJSON("map", "cliente/assets/tilemaps/filomena-town.json");

    // An atlas is a way to pack multiple images together into one texture. I'm using it to load all
    // the player animations (walking left, walking right, etc.) in one image. For more info see:
    //  https://labs.phaser.io/view.html?src=src/animation/texture%20atlas%20animation.js
    // If you don't use an atlas, you can do the same thing with a spritesheet, see:
    //  https://labs.phaser.io/view.html?src=src/animation/single%20sprite%20sheet.js
    //this.load.atlas("atlas", "cliente/assets/atlas/atlas.png", "cliente/assets/atlas/atlas.json");
    //this.load.spritesheet("gabe","cliente/assets/images/gabe.png",{frameWidth:24,frameHeight:24});
    //this.load.spritesheet("gabe","cliente/assets/images/male01-2.png",{frameWidth:32,frameHeight:32});
    this.load.spritesheet("varios0","cliente/assets/personaje/pjs1/Male/m1.png",{frameWidth:32,frameHeight:32});
    this.load.spritesheet("varios1","cliente/assets/personaje/pjs1/Male/m2.png",{frameWidth:32,frameHeight:32});
    this.load.spritesheet("varios2","cliente/assets/personaje/pjs1/Male/m3.png",{frameWidth:32,frameHeight:32});
    this.load.spritesheet("varios3","cliente/assets/personaje/pjs1/Male/m4.png",{frameWidth:32,frameHeight:32});
    this.load.spritesheet("varios4","cliente/assets/personaje/pjs1/Male/m5.png",{frameWidth:32,frameHeight:32});
    this.load.spritesheet("varios5","cliente/assets/personaje/pjs1/Male/m6.png",{frameWidth:32,frameHeight:32});
    this.load.spritesheet("varios6","cliente/assets/personaje/pjs1/Male/m7.png",{frameWidth:32,frameHeight:32});
    this.load.spritesheet("varios7","cliente/assets/personaje/pjs1/Male/m8.png",{frameWidth:32,frameHeight:32});
    this.load.spritesheet("varios8","cliente/assets/personaje/pjs1/Male/m9.png",{frameWidth:32,frameHeight:32});
    this.load.spritesheet("varios9","cliente/assets/personaje/pjs1/Male/m10.png",{frameWidth:32,frameHeight:32});
    this.load.spritesheet("muertos","cliente/assets/personaje/pjs1/Male/tombstone.png",{frameWidth:32,frameHeight:64});
  }

  function create() {
    crear=this;
    map = crear.make.tilemap({ key: "map" });

    // Parameters are the name you gave the tileset in Tiled and then the key of the tileset image in
    // Phaser's cache (i.e. the name you used in preload)
    const tileset = map.addTilesetImage("tuxmon-sample-32px-extruded", "tiles");

    // Parameters: layer name (or index) from Tiled, tileset, x, y
    const belowLayer = map.createStaticLayer("Below Player", tileset, 0, 0);
    worldLayer = map.createStaticLayer("World", tileset, 0, 0);
    capaTareas = map.createStaticLayer("capaTareas", tileset, 0, 0);

    const aboveLayer = map.createStaticLayer("Above Player", tileset, 0, 0);

    worldLayer.setCollisionByProperty({ collides: true });
    capaTareas.setCollisionByProperty({ collides: true });

    // By default, everything gets depth sorted on the screen in the order we created things. Here, we
    // want the "Above Player" layer to sit on top of the player, so we explicitly give it a depth.
    // Higher depths will sit on top of lower depth objects.
    aboveLayer.setDepth(10);

    // Object layers in Tiled let you embed extra info into a map - like a spawn point or custom
    // collision shapes. In the tmx file, there's an object layer with a point named "Spawn Point"
    spawnPoint = map.findObject("Objects", obj => obj.name === "Spawn Point");

    // Create a sprite with physics enabled via the physics system. The image used for the sprite has
    // a bit of whitespace, so I'm using setSize & setOffset to control the size of the player's body.
    // player = this.physics.add
    //   .sprite(spawnPoint.x, spawnPoint.y, "atlas", "misa-front")
    //   .setSize(30, 40)
    //   .setOffset(0, 24);

    // // Watch the player and worldLayer for collisions, for the duration of the scene:
    //this.physics.add.collider(player, worldLayer);

     const anims = crear.anims;
      anims.create({
        key: "gabe-left-walk",
        frames: anims.generateFrameNames("gabe", {
          //prefix: "misa-left-walk.",
          start: 3,
          end: 5,
          //zeroPad: 3
        }),
        //frameRate: 10,
        repeat: -1
      });
      anims.create({
        key: "gabe-right-walk",
        frames: anims.generateFrameNames("gabe", {
          //prefix: "misa-left-walk.",
          start: 6,
          end: 8,
          //zeroPad: 3
        }),
        //frameRate: 10,
        repeat: -1
      });
      anims.create({
        key: "gabe-front-walk",
        frames: anims.generateFrameNames("gabe", {
          //prefix: "misa-left-walk.",
          start: 0,
          end: 2,
          //zeroPad: 3
        }),
        //frameRate: 10,
        repeat: -1
      });
      anims.create({
        key: "gabe-back-walk",
        frames: anims.generateFrameNames("gabe", {
          //prefix: "misa-left-walk.",
          start: 9,
          end: 11,
          //zeroPad: 3
        }),
        //frameRate: 10,
        repeat: -1
      });

      const anims2 = crear.anims;
      anims2.create({
        key: "ana-left-walk",
        frames: anims.generateFrameNames("varios0", {
          start: 3,
          end: 5,
        }),
        repeat: -1
      });
      anims2.create({
        key: "ana-right-walk",
        frames: anims.generateFrameNames("varios0", {
          start: 6,
          end: 8,
        }),
        repeat: -1
      });
      anims2.create({
        key: "ana-front-walk",
        frames: anims.generateFrameNames("varios0", {
          //prefix: "misa-left-walk.",
          start: 0,
          end: 2,
          //zeroPad: 3
        }),
        //frameRate: 10,
        repeat: -1
      });
      anims2.create({
        key: "ana-back-walk",
        frames: anims.generateFrameNames("varios0", {
          //prefix: "misa-left-walk.",
          start: 9,
          end: 11,
          //zeroPad: 3
        }),
        //frameRate: 10,
        repeat: -1
      });

      const anims3 = crear.anims;
      anims3.create({
        key: "pepe-left-walk",
        frames: anims.generateFrameNames("varios1", {
          //prefix: "misa-left-walk.",
          start: 3,
          end: 5,
          //zeroPad: 3
        }),
        //frameRate: 10,
        repeat: -1
      });
      anims3.create({
        key: "pepe-right-walk",
        frames: anims.generateFrameNames("varios1", {
          //prefix: "misa-left-walk.",
          start: 6,
          end: 8,
          //zeroPad: 3
        }),
        //frameRate: 10,
        repeat: -1
      });
      anims3.create({
        key: "pepe-front-walk",
        frames: anims.generateFrameNames("varios1", {
          //prefix: "misa-left-walk.",
          start: 0,
          end: 2,
          //zeroPad: 3
        }),
        //frameRate: 10,
        repeat: -1
      });
      anims3.create({
        key: "pepe-back-walk",
        frames: anims.generateFrameNames("varios1", {
          //prefix: "misa-left-walk.",
          start: 9,
          end: 11,
          //zeroPad: 3
        }),
        //frameRate: 10,
        repeat: -1
      });

    const anims4 = crear.anims;
      anims4.create({
        key: "tom-left-walk",
        frames: anims.generateFrameNames("varios2", {
          //prefix: "misa-left-walk.",
          start: 3,
          end: 5,
          //zeroPad: 3
        }),
        //frameRate: 10,
        repeat: -1
      });
      anims4.create({
        key: "tom-right-walk",
        frames: anims.generateFrameNames("varios2", {
          //prefix: "misa-left-walk.",
          start: 6,
          end: 8,
          //zeroPad: 3
        }),
        //frameRate: 10,
        repeat: -1
      });
      anims4.create({
        key: "tom-front-walk",
        frames: anims.generateFrameNames("varios2", {
          //prefix: "misa-left-walk.",
          start: 0,
          end: 2,
          //zeroPad: 3
        }),
        //frameRate: 10,
        repeat: -1
      });
      anims4.create({
        key: "tom-back-walk",
        frames: anims.generateFrameNames("varios2", {
          //prefix: "misa-left-walk.",
          start: 9,
          end: 11,
          //zeroPad: 3
        }),
        //frameRate: 10,
        repeat: -1
      });

      const anims5 = crear.anims;
      anims5.create({
        key: "rayo-left-walk",
        frames: anims.generateFrameNames("varios3", {
          //prefix: "misa-left-walk.",
          start: 3,
          end: 5,
          //zeroPad: 3
        }),
        //frameRate: 10,
        repeat: -1
      });
      anims5.create({
        key: "rayo-right-walk",
        frames: anims.generateFrameNames("varios3", {
          //prefix: "misa-left-walk.",
          start: 6,
          end: 8,
          //zeroPad: 3
        }),
        //frameRate: 10,
        repeat: -1
      });
      anims5.create({
        key: "rayo-front-walk",
        frames: anims.generateFrameNames("varios3", {
          //prefix: "misa-left-walk.",
          start: 0,
          end: 2,
          //zeroPad: 3
        }),
        //frameRate: 10,
        repeat: -1
      });
      anims5.create({
        key: "rayo-back-walk",
        frames: anims.generateFrameNames("varios3", {
          //prefix: "misa-left-walk.",
          start: 9,
          end: 11,
          //zeroPad: 3
        }),
        //frameRate: 10,
        repeat: -1
      });
      const anims6 = crear.anims;
      anims6.create({
        key: "paco-left-walk",
        frames: anims.generateFrameNames("varios4", {
          //prefix: "misa-left-walk.",
          start: 3,
          end: 5,
          //zeroPad: 3
        }),
        //frameRate: 10,
        repeat: -1
      });
      anims6.create({
        key: "paco-right-walk",
        frames: anims.generateFrameNames("varios4", {
          //prefix: "misa-left-walk.",
          start: 6,
          end: 8,
          //zeroPad: 3
        }),
        //frameRate: 10,
        repeat: -1
      });
      anims6.create({
        key: "paco-front-walk",
        frames: anims.generateFrameNames("varios4", {
          //prefix: "misa-left-walk.",
          start: 0,
          end: 2,
          //zeroPad: 3
        }),
        //frameRate: 10,
        repeat: -1
      });
      anims6.create({
        key: "paco-back-walk",
        frames: anims.generateFrameNames("varios4", {
          //prefix: "misa-left-walk.",
          start: 9,
          end: 11,
          //zeroPad: 3
        }),
        //frameRate: 10,
        repeat: -1
      });
      const anims7 = crear.anims;
      anims7.create({
        key: "jose-left-walk",
        frames: anims.generateFrameNames("varios5", {
          //prefix: "misa-left-walk.",
          start: 3,
          end: 5,
          //zeroPad: 3
        }),
        //frameRate: 10,
        repeat: -1
      });
      anims7.create({
        key: "jose-right-walk",
        frames: anims.generateFrameNames("varios5", {
          //prefix: "misa-left-walk.",
          start: 6,
          end: 8,
          //zeroPad: 3
        }),
        //frameRate: 10,
        repeat: -1
      });
      anims7.create({
        key: "jose-front-walk",
        frames: anims.generateFrameNames("varios5", {
          //prefix: "misa-left-walk.",
          start: 0,
          end: 2,
          //zeroPad: 3
        }),
        //frameRate: 10,
        repeat: -1
      });
      anims7.create({
        key: "jose-back-walk",
        frames: anims.generateFrameNames("varios5", {
          //prefix: "misa-left-walk.",
          start: 9,
          end: 11,
          //zeroPad: 3
        }),
        //frameRate: 10,
        repeat: -1
      });
      const anims8 = crear.anims;
      anims8.create({
        key: "esteban-left-walk",
        frames: anims.generateFrameNames("varios6", {
          //prefix: "misa-left-walk.",
          start: 3,
          end: 5,
          //zeroPad: 3
        }),
        //frameRate: 10,
        repeat: -1
      });
      anims8.create({
        key: "esteban-right-walk",
        frames: anims.generateFrameNames("varios6", {
          //prefix: "misa-left-walk.",
          start: 6,
          end: 8,
          //zeroPad: 3
        }),
        //frameRate: 10,
        repeat: -1
      });
      anims8.create({
        key: "esteban-front-walk",
        frames: anims.generateFrameNames("varios6", {
          //prefix: "misa-left-walk.",
          start: 0,
          end: 2,
          //zeroPad: 3
        }),
        //frameRate: 10,
        repeat: -1
      });
      anims8.create({
        key: "esteban-back-walk",
        frames: anims.generateFrameNames("varios6", {
          //prefix: "misa-left-walk.",
          start: 9,
          end: 11,
          //zeroPad: 3
        }),
        //frameRate: 10,
        repeat: -1
      });
      const anims9 = crear.anims;
      anims9.create({
        key: "luis-left-walk",
        frames: anims.generateFrameNames("varios7", {
          //prefix: "misa-left-walk.",
          start: 3,
          end: 5,
          //zeroPad: 3
        }),
        //frameRate: 10,
        repeat: -1
      });
      anims9.create({
        key: "luis-right-walk",
        frames: anims.generateFrameNames("varios7", {
          //prefix: "misa-left-walk.",
          start: 6,
          end: 8,
          //zeroPad: 3
        }),
        //frameRate: 10,
        repeat: -1
      });
      anims9.create({
        key: "luis-front-walk",
        frames: anims.generateFrameNames("varios7", {
          //prefix: "misa-left-walk.",
          start: 0,
          end: 2,
          //zeroPad: 3
        }),
        //frameRate: 10,
        repeat: -1
      });
      anims9.create({
        key: "luis-back-walk",
        frames: anims.generateFrameNames("varios7", {
          //prefix: "misa-left-walk.",
          start: 9,
          end: 11,
          //zeroPad: 3
        }),
        //frameRate: 10,
        repeat: -1
      });
      const anims10 = crear.anims;
      anims10.create({
        key: "felipe-left-walk",
        frames: anims.generateFrameNames("varios8", {
          //prefix: "misa-left-walk.",
          start: 3,
          end: 5,
          //zeroPad: 3
        }),
        //frameRate: 10,
        repeat: -1
      });
      anims10.create({
        key: "felipe-right-walk",
        frames: anims.generateFrameNames("varios8", {
          //prefix: "misa-left-walk.",
          start: 6,
          end: 8,
          //zeroPad: 3
        }),
        //frameRate: 10,
        repeat: -1
      });
      anims10.create({
        key: "felipe-front-walk",
        frames: anims.generateFrameNames("varios8", {
          //prefix: "misa-left-walk.",
          start: 0,
          end: 2,
          //zeroPad: 3
        }),
        //frameRate: 10,
        repeat: -1
      });
      anims10.create({
        key: "felipe-back-walk",
        frames: anims.generateFrameNames("varios8", {
          //prefix: "misa-left-walk.",
          start: 9,
          end: 11,
          //zeroPad: 3
        }),
        //frameRate: 10,
        repeat: -1
      });
      const anims11 = crear.anims;
      anims11.create({
        key: "wence-left-walk",
        frames: anims.generateFrameNames("varios9", {
          //prefix: "misa-left-walk.",
          start: 3,
          end: 5,
          //zeroPad: 3
        }),
        //frameRate: 10,
        repeat: -1
      });
      anims11.create({
        key: "wence-right-walk",
        frames: anims.generateFrameNames("varios9", {
          //prefix: "misa-left-walk.",
          start: 6,
          end: 8,
          //zeroPad: 3
        }),
        //frameRate: 10,
        repeat: -1
      });
      anims11.create({
        key: "wence-front-walk",
        frames: anims.generateFrameNames("varios9", {
          //prefix: "misa-left-walk.",
          start: 0,
          end: 2,
          //zeroPad: 3
        }),
        //frameRate: 10,
        repeat: -1
      });
      anims11.create({
        key: "wence-back-walk",
        frames: anims.generateFrameNames("varios9", {
          //prefix: "misa-left-walk.",
          start: 9,
          end: 11,
          //zeroPad: 3
        }),
        //frameRate: 10,
        repeat: -1
      });

    // const camera = this.cameras.main;
    // camera.startFollow(player);
    // camera.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    cursors = crear.input.keyboard.createCursorKeys();
    remotos = crear.add.group();
    muertos=crear.add.group();
    teclaA=crear.input.keyboard.addKey('a');
    teclaV=crear.input.keyboard.addKey('v');
    teclaT=crear.input.keyboard.addKey('t');
    lanzarJugador(ws.nick,ws.numJugador);
    ws.estoyDentro();
  }

  function crearColision(){
    if(crear && ws.impostor){
      crear.physics.add.overlap(player,remotos,kill,()=>{return ataquesOn});
    }
  }

  function kill(sprite,inocente){
    //dibujar el inocente muerto
    //avisar del ataque 
    var nick =inocente.nick;
    if(teclaA.isDown){
      ataquesOn=false;
      ws.matarA(nick);
    }
  }

  function jugadorAbandonaPartida(nick){
    jugadores[nick].destroy();
  }

  function dibujarMuereInocente(inocente){
    var x=jugadores[inocente].x;
    var y=jugadores[inocente].y;
    var numJugador=jugadores[inocente].numJugador;
    var muerto = crear.physics.add.sprite(x, y,"muertos",5);

    if(ws.nick!=inocente){
      jugadores[inocente].visible=false;   
    }
    //jugadores[inocente].setTexture("muertos",recurs...)
    //agregar jugadores[inocente] al grupo muertos
    muertos.add(muerto);

    crear.physics.add.overlap(player,muertos,votacion);
  }

  function votacion(sprite,muerto){
    //comprobar si el jugador local pulsa la tecla de votacion "v"
    //en ese caso, llamamos al servidor para lanzar votacion
    if(teclaV.isDown){
      votarOn=false;
      ws.lanzarVotacion(); //Sin paráemtro? Sin nick?
    }
  }

  function tareas(sprite,objeto){
    if(ws.encargo==objeto.properties.tarea && teclaT.isDown){
      tareasOn=false;
      console.log("realizar tarea " + ws.encargo);
      ws.realizarTarea();
      cw.mostrarModalTarea(ws.encargo);
    }

  }

  function lanzarJugador(nick,numJugador){
    var x = spawnPoint.x+numJugador+24*2;
    var nombreSprite = "varios" + numJugador;
    //ws.console("varios"+numJugador);
    player = crear.physics.add.sprite( spawnPoint.x+15*numJugador, spawnPoint.y,"varios"+numJugador,recursos[numJugador].frame);
    ws.console("Siuuuu " + recursos[numJugador].frame);
    // Watch the player and worldLayer for collisions, for the duration of the scene:
    crear.physics.add.collider(player, worldLayer);
    crear.physics.add.collider(player, capaTareas, tareas,()=>{return tareasOn});

    jugadores[nick]=player;
    jugadores[nick].nick=nick
    jugadores[nick].numJugador=numJugador;

    camera = crear.cameras.main;
    camera.startFollow(player);
    camera.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    nametag=crear.add.text(player.x-20,player.y-40,ws.nick,{fontSize:'14px',fill:'#337CFF'});
  }

  function lanzarJugadorRemoto(nick,numJugador){
    var x = spawnPoint.x+numJugador+24*2;
    var frame=recursos[numJugador].frame;

    jugadores[nick]=crear.physics.add.sprite(spawnPoint.x+15*numJugador, spawnPoint.y,"varios"+numJugador,frame);   
    crear.physics.add.collider(jugadores[nick], worldLayer);
    jugadores[nick].nick=nick;
    jugadores[nick].numJugador=numJugador
    remotos.add(jugadores[nick]);
    remotag[nick]=crear.add.text(jugadores[nick].x-20, jugadores[nick].y-40,nick,{fontSize:'14px',fill:'#33FFC6'});
  }

  // function moverRemoto(direccion,nick,numJugador)
  // {
  //   const speed = 175;
  //   var remoto=jugadores[nick];

  //   if (direccion=="left"){
  //     remoto.body.setVelocityX(-speed);
  //   }
  // }
  function resetVisible(){
    for(var nick in jugadores){
      jugadores[nick].visible=true;
    }
  }

  function mover(datos){
        var nick=datos.nick;
        var remoto=jugadores[nick];
        if(remoto && !final){
          var direccion=datos.direccion;

          var numJugador=datos.numJugador;
          var x=datos.x;
          var y=datos.y;
          
          const speed = 175;
          //const prevVelocity = player.body.velocity.clone();
          const nombre=recursos[numJugador].sprite;
           if (datos.estado!="muerto" || ws.estado=="muerto"){
            remoto.body.setVelocity(0);
            remoto.setX(x);
            remoto.setY(y);
            remotag[nick].visible=true;
            remotag[nick].setX(x-20);
            remotag[nick].setY(y-40);
            remoto.body.velocity.normalize().scale(speed);
            if (direccion=="left") {
              remoto.anims.play(nombre+"-left-walk", true);
            } else if (direccion=="right") {
              remoto.anims.play(nombre+"-right-walk", true);
            } else if (direccion=="up") {
              remoto.anims.play(nombre+"-back-walk", true);
            } else if (direccion=="down") {
              remoto.anims.play(nombre+"-front-walk", true);
            } else {
              remoto.anims.stop();
            }
          }else{
            remoto.visible=false;
            remotag[nick].visible=false;
          }
        }
    }

  function abandonarPartida(nick){
    jugadores[nick].destroy();
  }

  function report(){
    /*Esta funcion se encarga de eliminar todos las tumbas, 
      si se ha llamado a reportar*/
    var i = 0;
    for(i=0;i<muertos.children.size;i++){
        muertos.children.entries[0].destroy();
      }
  }


  function finPartida(data){
    final=true;
    ws.fase="final";
    cw.mostrarModalSimple("Fin de la partida --->" + data);
  }

  function update(time, delta) {
    if(ws.fase!="jugando"){
      return ;
    }
    if(ws.estado=="muerto"){
      resetVisible();
    }
    const speed = 175;
    var direccion="stop";
    const prevVelocity = player.body.velocity.clone();

    const nombre=recursos[ws.numJugador].sprite;
    if(!final){
      player.body.setVelocity(0);
      //player2.body.setVelocity(0);
      //PARA CAMINAR if(ws.estado!="muerto"){}

      // Horizontal movement
      if (cursors.left.isDown) {
        player.body.setVelocityX(-speed);
        direccion="left";
      } else if (cursors.right.isDown) {
        player.body.setVelocityX(speed);
        direccion="right";
      }


      // Vertical movement
      if (cursors.up.isDown) {
        player.body.setVelocityY(-speed);
        direccion="up";
      } else if (cursors.down.isDown) {
        player.body.setVelocityY(speed);
        direccion="down";
      }


      // Normalize and scale the velocity so that player can't move faster along a diagonal
      player.body.velocity.normalize().scale(speed);
      nametag.setX(player.x-20);
      nametag.setY(player.y-40);
      ws.movimiento(direccion,player.x,player.y);
      // Update the animation last and give left/right animations precedence over up/down animations
      if (cursors.left.isDown) {
        player.anims.play(nombre+"-left-walk", true);
      } else if (cursors.right.isDown) {
        player.anims.play(nombre+"-right-walk", true);
      } else if (cursors.up.isDown) {
        player.anims.play(nombre+"-back-walk", true);
      } else if (cursors.down.isDown) {
        player.anims.play(nombre+"-front-walk", true);
      } else {
        player.anims.stop();

        // If we were moving, pick and idle frame to use
        // if (prevVelocity.x < 0) player.setTexture("gabe", "gabe-left-walk");
        // else if (prevVelocity.x > 0) player.setTexture("gabe", "gabe-right-walk");
        // else if (prevVelocity.y < 0) player.setTexture("gabe", "gabe-back-walk");
        // else if (prevVelocity.y > 0) player.setTexture("gabe", "gabe-front-walk");
      }
    }
    // Stop any previous movement from the last frame
    

  
}