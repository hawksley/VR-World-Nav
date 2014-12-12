/**
Add videos here.
*/
var videoChoices = [
	{
    "name": "actually a video",
    "texture": 'images/denver-botanical-5-small.jpg',
		"url": "http://mozvr.com/content/elevr4",
		"title": {
			"title": "ELEVR: Talk chat show EP.4",
  		"titleCredits": "ELEVR\n-\nWebGL"
		},
    "selected": false
	},
  {
    "name": "WebVR Experiments",
    "texture": 'images/kirby-cove-1-small.jpg',
    "url": "http://vihart.github.io/webVR-playing-with/",
    "title": {
      "title": "ELEVR: Talk chat show EP.4",
      "titleCredits": "ELEVR\n-\nWebGL"
    },
    "selected": false
  },
  {
    "name": "Under Construction",
    "texture": 'images/mosaic-math-art.JPG',
    "url": "http://vihart.github.io/webVR-playing-with/underConstruction.html",
    "title": {
      "title": "ELEVR: Talk chat show EP.4",
      "titleCredits": "ELEVR\n-\nWebGL"
    },
    "selected": false
  },
  {
    "name": "Room with a View",
    "texture": 'images/utrecht-canal.jpg',
    "url": "http://emilyeifler.github.io/roomwithaview/apartment.html",
    "title": {
      "title": "ELEVR: Talk chat show EP.4",
      "titleCredits": "ELEVR\n-\nWebGL"
    },
    "selected": false
  }
];

window.WorldNav = (function() {
  function WorldNav() {
    var self = this;

    self.container = document.querySelector("#container");
    self.container.height = window.innerHeight;
    self.container.width = window.innerWidth;

    self.navContainer = document.querySelector("#nav");

    /*
    Setup three.js WebGL renderer
    */
    self.renderer = new THREE.WebGLRenderer( { antialias: true } );
    self.navContainer.appendChild(self.renderer.domElement);

    /*
    Create a three.js scene
    */
    self.scene = new THREE.Scene();

    /*
    Create a three.js camera
    */
    self.camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 10000 );

    self.cursor = new VRCursor();
    self.cursor.ready.then(function() {
    	self.scene.add(self.cursor.layout);
    	self.cursor.init(self.renderer.domElement, self.camera, self.scene);
    	self.cursor.enable();
    });

    /*
    Apply VR headset positional data to camera.
    */
    self.controls = new THREE.VRControls( self.camera );

    /*
    Apply VR stereo rendering to renderer
    */
    self.effect = new THREE.VREffect( self.renderer );
    self.effect.setSize( window.innerWidth, window.innerHeight );

    /*
    Create 3d objects
    */
    var backgroundGeometry   = new THREE.SphereGeometry(200, 32, 32);
    var backgroundMaterial  = new THREE.MeshBasicMaterial();
    backgroundMaterial.map = THREE.ImageUtils.loadTexture('images/video1.jpg');
    var backgroundMesh = new THREE.Mesh(backgroundGeometry, backgroundMaterial);
    backgroundMesh.scale.x = -1;
    self.scene.add(backgroundMesh);

    var planetGeometry   = new THREE.SphereGeometry(5, 32, 32);

    for (var i=0; i<videoChoices.length; i++) {
      var pi = 3.1415926535897932384626;
      var planetMaterial  = new THREE.MeshBasicMaterial( );
      planetMaterial.map = THREE.ImageUtils.loadTexture(videoChoices[i].texture);
      planetMaterial.color = {r:0.5, g:0.5, b:0.5};
      videoChoices[i].planetMesh = new THREE.Mesh(planetGeometry, planetMaterial);
      var z = Math.sin(-3/2*pi/videoChoices.length*i)*20;
      var x = Math.cos(-3/2*pi/videoChoices.length*i)*20;
      videoChoices[i].planetMesh.position.z = z;
      videoChoices[i].planetMesh.position.x = x;
			videoChoices[i].planetMesh.scale.x = -1;
      self.scene.add( videoChoices[i].planetMesh );
    }

		self.dynamicTexture	= new THREEx.DynamicTexture(512,512);
		self.dynamicTexture.context.font	= "normal 50px Verdana";
		self.dynamicTexture.clear().drawText("", undefined, 256, 'red');
		var geometry = new THREE.PlaneGeometry( 20, 20 );
		var material = new THREE.MeshBasicMaterial( {color: 0xffff00, transparent: true, map	: self.dynamicTexture.texture, side: THREE.DoubleSide} );
		self.titleMesh = new THREE.Mesh( geometry, material );

		self.selectedPlanet = videoChoices[0];
		self.frameCount = 0;
		self.growWorld = function(selectedPlanet) {
			self.selectedPlanet = selectedPlanet;
			for (var i=0; i<videoChoices.length; i++) {
				if (self.selectedPlanet !== videoChoices[i]) {
						self.scene.remove(videoChoices[i].planetMesh); //remove back other planets
				}
			}
			self.frameCount = 0;
		}

		self.resetPlanets = function() {
			self.selectedPlanet.planetMesh.scale.set(-1,1,1);
			for (var i=0; i<videoChoices.length; i++) {
				self.scene.add(videoChoices[i].planetMesh); //add back other planets
			}
		}

    self.animate = function() {
      /*
      Update VR headset position and apply to camera and cursor.
      */
      self.controls.update();
      if (self.cursor.enabled) {
        self.cursor.updatePosition();
        for (var i=0; i<videoChoices.length; i++) {
          if (self.cursor.objectMouseOver === videoChoices[i].planetMesh) {
            if (!videoChoices[i].selected) {
              videoChoices[i].selected = true;
              videoChoices[i].planetMesh.material.color = {r:1, g:1, b:1};
							self.dynamicTexture.clear().drawText(videoChoices[i].name, undefined, 256, 'red');
							self.titleMesh.position.x = videoChoices[i].planetMesh.position.x;
							self.titleMesh.position.z = videoChoices[i].planetMesh.position.z;
							self.titleMesh.position.y = -10;
							self.titleMesh.rotation.setFromQuaternion(self.controls.getRotation());
							self.scene.add(self.titleMesh);
            }
            videoChoices[i].planetMesh.rotation.y += 0.02;
          } else {
            //make darker
            if (videoChoices[i].selected) {
							self.scene.remove(self.titleMesh);
              videoChoices[i].selected = false;
              videoChoices[i].planetMesh.material.color = {r:0.5, g:0.5, b:0.5};
            }
            videoChoices[i].planetMesh.rotation.y += 0.01;
          }
        }
      } else if (self.frameCount < 125) { //experimental transition - would make more sense for a picture viewer...
				self.selectedPlanet.planetMesh.scale.x += -0.04;
				self.selectedPlanet.planetMesh.scale.y += 0.04;
				self.selectedPlanet.planetMesh.scale.z += 0.04;
				self.frameCount++;
			} else if (self.frameCount === 125) { //hide and transition. only need to do this once
				self.navContainer.style.display = "none";
				self.frameCount++;
			}

      /*
      Render the scene through the VREffect.
      */
      self.effect.render( self.scene, self.camera );

      requestAnimationFrame( self.animate );
    }
  }

  return new WorldNav();
})();


/*
Kick off animation loop
*/
WorldNav.animate();

function fullScreen() {
  var fullDiv = document.getElementById('full');
  if (fullDiv.mozRequestFullScreen) {
    fullDiv.mozRequestFullScreen({ vrDisplay: WorldNav.effect._vrHMD }); // Firefox
  } else if (fullDiv.webkitRequestFullscreen) {
    fullDiv.webkitRequestFullscreen({ vrDisplay: WorldNav.effect._vrHMD }); // Chrome and Safari
  } else if (fullDiv.requestFullScreen){
    fullDiv.requestFullscreen();
  }
}

/*
Listen for double click event to enter full-screen VR mode
*/
document.body.addEventListener( 'dblclick', function() {
  fullScreen();
});

/*
Listen for keyboard event and zero positional sensor on appropriate keypress.
*/
function onkey(event) {
  event.preventDefault();

  if (event.keyCode == 90) { // z to zero sensor
    WorldNav.controls.zeroSensor();
  } else if (event.keyCode == 70) { // f to fullscreen
    fullScreen();
  } else if (event.keyCode == 32) { // spacebar to select planet
    if (WorldNav.cursor.enabled) {
      WorldNav.cursor.updatePosition();
      for (var i=0; i<videoChoices.length; i++) {
        if (WorldNav.cursor.objectMouseOver === videoChoices[i].planetMesh) {
          // enter scene
          WorldNav.container.src = videoChoices[i].url;
					WorldNav.cursor.disable();
					WorldNav.growWorld(videoChoices[i]);
        }
      }
    } else { // Cursor is disabled when not in nav, return to nav
			WorldNav.resetPlanets();
      WorldNav.container.src = "";
      WorldNav.navContainer.style.display = "block";
      WorldNav.cursor.enable();
    }
  }
};
window.addEventListener("keydown", onkey, true);

function key(event, sign) {
  var control = WorldNav.controls.manualControls[String.fromCharCode(event.keyCode).toLowerCase()];
  if (!control)
    return;
  if (sign === 1 && control.active || sign === -1 && !control.active)
    return;
  control.active = (sign === 1);
  WorldNav.controls.manualRotateRate[control.index] += sign * control.sign;
}
document.addEventListener('keydown', function(event) { key(event, 1); }, false);
document.addEventListener('keyup', function(event) { key(event, -1); }, false);

/*
Handle window resizes
*/
function onWindowResize() {
  WorldNav.camera.aspect = window.innerWidth / window.innerHeight;
  WorldNav.camera.updateProjectionMatrix();

  WorldNav.effect.setSize( window.innerWidth, window.innerHeight );

  WorldNav.container.height = window.innerHeight;
  WorldNav.container.width = window.innerWidth;
}

window.addEventListener( 'resize', onWindowResize, false );
