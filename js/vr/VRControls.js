/**
 * @author dmarcos / https://github.com/dmarcos
 * Changes to support manual keyboard controls by hawksley / https://github.com/hawksley
 */

THREE.VRControls = function ( camera, done ) {

	this._camera = camera;

	this._init = function () {
		var self = this;
		if ( !navigator.mozGetVRDevices && !navigator.getVRDevices ) {
			if ( done ) {
				done("Your browser is not VR Ready");
			}
			return;
		}
		if ( navigator.getVRDevices ) {
			navigator.getVRDevices().then( gotVRDevices );
		} else {
			navigator.mozGetVRDevices( gotVRDevices );
		}
		function gotVRDevices( devices ) {
			var vrInput;
			var error;
			for ( var i = 0; i < devices.length; ++i ) {
				if ( devices[i] instanceof PositionSensorVRDevice ) {
					vrInput = devices[i]
					self._vrInput = vrInput;
					break; // We keep the first we encounter
				}
			}
			if ( done ) {
				if ( !vrInput ) {
				 error = 'HMD not available';
				}
				done( error );
			}
		}
	};

	this._init();

	this.manualRotation = new THREE.Quaternion();

	this.manualControls = {
      'a' : {index: 1, sign: 1, active: 0},
      'd' : {index: 1, sign: -1, active: 0},
      'w' : {index: 0, sign: 1, active: 0},
      's' : {index: 0, sign: -1, active: 0},
      'q' : {index: 2, sign: -1, active: 0},
      'e' : {index: 2, sign: 1, active: 0},
    };

	this.manualRotateRate = new Float32Array([0, 0, 0]);
	this.updateTime = 0;

	this.update = function() {
		var camera = this._camera;
		var vrState = this.getVRState();
		var manualRotation = this.manualRotation;
		var oldTime = this.updateTime;
		var newTime = performance.now();
		this.updateTime = newTime;

	  var interval = (newTime - oldTime) * 0.001;
	  var update = new THREE.Quaternion(this.manualRotateRate[0] * interval,
	                               this.manualRotateRate[1] * interval,
	                               this.manualRotateRate[2] * interval, 1.0);
	  update.normalize();
		manualRotation.multiplyQuaternions(manualRotation, update);

		if ( camera ) {
			if ( !vrState ) {
				camera.quaternion.copy(manualRotation);
				return;
			}

			// Applies head rotation from sensors data.
			var totalRotation = new THREE.Quaternion();
      var state = vrState.hmd.rotation;
      if (state[0] !== 0 ||
					state[1] !== 0 ||
					state[2] !== 0 ||
					state[3] !== 0) {
				var vrStateRotation = new THREE.Quaternion(state[0], state[1], state[2], state[3]);
        totalRotation.multiplyQuaternions(manualRotation, vrStateRotation);
      } else {
        totalRotation = manualRotation;
      }

			camera.quaternion.copy( totalRotation );
		}
	};

	this.zeroSensor = function() {
		var vrInput = this._vrInput;
		if ( !vrInput ) {
			return null;
		}
		vrInput.zeroSensor();
	};

	this.getRotation = function() {
		var manualRotation = this.manualRotation;

		var totalRotation = new THREE.Quaternion();
		var state = this.getVRState().hmd.rotation;
		if (state[0] !== 0 ||
				state[1] !== 0 ||
				state[2] !== 0 ||
				state[3] !== 0) {
			var vrStateRotation = new THREE.Quaternion(state[0], state[1], state[2], state[3]);
			totalRotation.multiplyQuaternions(manualRotation, vrStateRotation);
		} else {
			totalRotation = manualRotation;
		}

		return totalRotation;
	}

	this.getVRState = function() {
		var vrInput = this._vrInput;
		var orientation;
		var vrState;
		if ( !vrInput ) {
			return null;
		}
		orientation	= vrInput.getState().orientation;
		vrState = {
			hmd : {
				rotation : [
					orientation.x,
					orientation.y,
					orientation.z,
					orientation.w
				]
			}
		};
		return vrState;
	};

};
