'use strict';

Physijs.scripts.worker = '../libs/physijs_worker.js';
Physijs.scripts.ammo = '../libs/ammo.js';
const textureLoader = new THREE.TextureLoader();

const initScene = function () {

	const renderer = new THREE.WebGLRenderer({
		antinlias: true
	});
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.setClearColor(new THREE.Color(0x080808));
	document.getElementById('viewport').appendChild(renderer.domElement);

	// scene
	const scene = new Physijs.Scene({
		reportSize: 10,
		fixedTimeStep: 1 / 60
	});
	scene.setGravity(new THREE.Vector3(0, -98, 0));

	// camera
	const camera = new function () {
		this.object = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 1, 1000);
		this.object.position.set(-200, 20, -45);
		this.object.lookAt(new THREE.Vector3(200, 95, 20));
		this.addScene = function () {
			scene.add(this.object);
		}
		this.count = 0;
		this.flip = function () {
			if (camera.count % 2 == 0) {
				camera.object.position.set(-200, 20, 45);
				camera.object.lookAt(new THREE.Vector3(200, 95, -20));
				UI.shootButton.classList.add('shoot-button--left');
				UI.buttonArea.classList.add('button-area--left');
				UI.slider.classList.add('slider--left');
			} else if (camera.count % 2 == 1) {
				camera.object.position.set(-200, 20, -45);
				camera.object.lookAt(new THREE.Vector3(200, 95, 20));
				UI.shootButton.classList.remove('shoot-button--left');
				UI.buttonArea.classList.remove('button-area--left');
				UI.slider.classList.remove('slider--left');
			}
			camera.count ++;
		}
	}
	camera.addScene();


	// Light
	const light = new function () {
		this.object = new THREE.DirectionalLight();
		this.object.position.set(-70, 100, 50);
		this.addScene = function () {
			scene.add(this.object);
		}
	}
	light.addScene();
	
	// sound
	const sound = new function() {
		this.listener = new THREE.AudioListener();
		camera.object.add(this.listener);
		// shoot sound
		this.shoot = new THREE.Audio(this.listener);
		this.shootLoader = new THREE.AudioLoader();
		this.shootLoader.load('assets/audio/bound.ogg', function(buffer) {
			sound.shoot.setBuffer(buffer);
			sound.shoot.setLoop(false);
			sound.shoot.setVolume(0.5);
			sound.shoot.hasPlaybackControl = false;
		});
		// goal sound
		this.goal = new THREE.Audio(this.listener);
		this.goalLoader = new THREE.AudioLoader();
		this.goalLoader.load('assets/audio/goal.ogg', function(buffer) {
			sound.goal.setBuffer(buffer);
			sound.goal.setLoop(false);
			sound.goal.setVolume(0.5);
			sound.goal.hasPlaybackControl = false;
		});
		// clear sound
		this.clear = new THREE.Audio(this.listener);
		this.clearLoader = new THREE.AudioLoader();
		this.clearLoader.load('assets/audio/clear.ogg', function(buffer) {
			sound.clear.setBuffer(buffer);
			sound.clear.setLoop(false);
			sound.clear.setVolume(0.3);
			sound.clear.hasPlaybackControl = false;
		});
		// point sound
		this.point = new THREE.Audio(this.listener);
		this.pointLoader = new THREE.AudioLoader();
		this.pointLoader.load('assets/audio/point.ogg', function(buffer) {
			sound.point.setBuffer(buffer);
			sound.point.setLoop(false);
			sound.point.setVolume(0.3);
			sound.point.hasPlaybackControl = false;
		});
		// on/off button
		this.switching = function() {
			sound.goal.hasPlaybackControl = !sound.goal.hasPlaybackControl;
			sound.shoot.hasPlaybackControl = !sound.shoot.hasPlaybackControl;
			sound.clear.hasPlaybackControl = !sound.clear.hasPlaybackControl;
			sound.point.hasPlaybackControl = !sound.point.hasPlaybackControl;
			if (sound.shoot.hasPlaybackControl) {
				UI.toVisible(UI.soundButtonOn);
				UI.toHidden(UI.soundButtonOff);				
			} else {
				UI.toVisible(UI.soundButtonOff);
				UI.toHidden(UI.soundButtonOn);				
			}
		};
	}

	// ball
	class Ball {
		constructor() {
			this.geometry = new THREE.SphereGeometry(5, 10, 10);
			this.material = Physijs.createMaterial(
				new THREE.MeshPhongMaterial({
					map: textureLoader.load('assets/textures/ball.jpg')
				}), 1, 1);
			this.object = new Physijs.SphereMesh(this.geometry, this.material);
			this.object.position.x = -0.95;
			this.object.position.y = 0;
			this.object.position.z = 0;
			this.object.rotation.x = Math.PI * 0.5;
			this.object.rotation.z = Math.PI * 0.25;
		}
		addScene () {
			scene.add(this.object);
		}
	}

	// shooter
	const shooter = new function () {
		this.radius = 13;
		this.material = Physijs.createMaterial(
			new THREE.MeshPhongMaterial({transparent: true,	opacity: 0}), 1, 1);
		this.setSize = function() {
			this.geometry = new THREE.SphereGeometry(this.radius, 3);
			this.object = new Physijs.SphereMesh(this.geometry, this.material, 0);
			this.object.position.x = -10;
			this.object.position.y = -1;
			this.object.position.z = 0;
		}
		this.addScene = function () {
			scene.add(this.object);
		}
		this.remove = function () {
			scene.remove(this.object)
		};
	}
	
	// shootStand
	const shootStand = new function() {
		this.geometry = new THREE.BoxGeometry(1, 30, 10);
		this.material = Physijs.createMaterial(new THREE.MeshPhongMaterial({transparent: true, opacity: 0}),0,0);
		this.object = new Physijs.BoxMesh(this.geometry, this.material, 0);
		this.object.position.x = 0;
		this.object.position.y = -1;
		this.object.position.z = 0;
		this.object.rotation.z = Math.PI * -0.25;
		this.addScene = function () {
			scene.add(this.object)
		};
		this.remove = function () {
			scene.remove(this.object)
		};
	}
		
	// floor
	const floor = new function () {
		this.geometry = new THREE.BoxGeometry(460, 1, 100);
		this.material = Physijs.createMaterial(new THREE.MeshPhongMaterial({
			map: textureLoader.load('assets/textures/floor.jpg')
		}), 1, 1);
		this.object = new Physijs.BoxMesh(this.geometry, this.material, 0);
		this.object.position.x = 240;
		this.object.position.y = -1;
		this.object.position.z = 0;
		this.addScene = function () {
			scene.add(this.object)
		};
	}
	
	// remover
	const remover = new function() {
		this.geometry = new THREE.BoxGeometry(1200, 1, 800);
		this.material = Physijs.createMaterial(new THREE.MeshBasicMaterial({transparent: true, opacity: 0}),0,0);
		this.object = new Physijs.BoxMesh(this.geometry, this.material, 0);
		this.object.position.x = 500;
		this.object.position.y = -100;
		this.object.position.z = 0;
		this.object.addEventListener('collision', function(object) {
			scene.remove(object);
		});
		this.addScene = function () {
			scene.add(this.object)
		};
	}

	// goal
	
	const goalParam = new function() {
		this.parts = [];
		this.zPosition = 0;
		this.distance = 200;
	}
	
	// goal objects
	
	// pole
	const pole = new function () {
		this.material = Physijs.createMaterial(new THREE.MeshPhongMaterial({
			color: 0xaaaaaa,
		}), 0, 0.1);
		this.setPosition = function() {
			this.geometry = new THREE.CylinderGeometry(2.5, 2.5, goalParam.distance * 0.625);
			this.object = new Physijs.ConeMesh(this.geometry, this.material, 0);
			this.object.position.x = goalParam.distance + 5;
			this.object.position.y = goalParam.distance * 0.625 / 2;
			this.object.position.z = 0;
		};
		goalParam.parts.push(this);
		this.addScene = function () {
			scene.add(this.object)
		};
		this.remove = function () {
			scene.remove(this.object)
		};
	}


	// board
	const board = new function () {
		this.geometry = new THREE.BoxGeometry(7, 40, 72);
		this.material = Physijs.createMaterial(new THREE.MeshPhongMaterial({
			map: textureLoader.load('assets/textures/goalboard.gif')
		}), 0, 0.5);
		this.object = new Physijs.BoxMesh(this.geometry, this.material, 0);
		this.setPosition = function() {
			this.object.position.x = goalParam.distance + 3;
			this.object.position.y = goalParam.distance * 0.625;
			this.object.position.z = goalParam.zPosition;
		};
		goalParam.parts.push(this);
		this.addScene = function () {
			scene.add(this.object)
		};
		this.remove = function () {
			scene.remove(this.object)
		};
	}


	// ring
	const ring = new function () {
		this.geometry = new THREE.CylinderGeometry(0.8, 0.8, 3.1);
		this.material = new Physijs.createMaterial(new THREE.MeshLambertMaterial({
			color: 0xff3333
		}), 0, 0);
		this.setPosition = function() {
			this.object = [];
			for (let i = 0; i < 16; i++) {
				let ringPart = new Physijs.CylinderMesh(this.geometry, this.material, 0);
				ringPart.rotation.x = 0.5 * Math.PI;
				ringPart.position.y = goalParam.distance * 0.625 - 17;
				ringPart.position.x = goalParam.distance - 10 + 7 * Math.cos(Math.PI * 0.125 * i);
				ringPart.position.z = goalParam.zPosition + 7 * Math.sin(Math.PI * 0.125 * i);
				ringPart.rotation.z = Math.PI * 0.125 * i;
				this.object.push(ringPart);
			}
		};
		goalParam.parts.push(this);
		this.addScene = function () {
			for (let i = 0; i < 16; i++) {
				scene.add(this.object[i]);
			}
		}
		this.remove = function () {
			for (let i = 0; i < 16; i++) {
				scene.remove(this.object[i]);
			}
		};
	}


	// net
	const net = new function () {
		this.geometry = new THREE.CylinderGeometry(7, 4, 12, 8, 3, true);
		this.material = new THREE.MeshBasicMaterial();
		this.material.color = new THREE.Color(0xffffff);
		this.material.wireframe = true;
		this.material.openEnded = true;
		this.material.transparent = true;
		this.material.opacity = 0.2;
		this.material.side = "double";
		this.object = new THREE.Mesh(this.geometry, this.material, 0);
		this.setPosition = function() {
			net.object.position.x = goalParam.distance - 10;
			net.object.position.y = goalParam.distance * 0.625 - 24;
			net.object.position.z = goalParam.zPosition;
		};		
		goalParam.parts.push(this);
		this.addScene = function () {
			scene.add(this.object)
		};
		this.remove = function () {
			scene.remove(this.object)
		};
	}

	
	// blocker
	const blocker = new function () {
		this.geometry = new THREE.BoxGeometry(1, 1, 8);
		this.material = Physijs.createMaterial(new THREE.MeshBasicMaterial({color: 0xffffff, transparent: true, opacity: 0}),0,0);
		this.object = new Physijs.BoxMesh(this.geometry, this.material, 0);
		this.setPosition = function() {
			this.object.position.x = goalParam.distance - 17;
			this.object.position.y = goalParam.distance * 0.625 - 23;
			this.object.position.z = goalParam.zPosition;
		};
		goalParam.parts.push(this);
		this.addScene = function () {
			scene.add(this.object)
		};
		this.remove = function () {
			scene.remove(this.object)
		};
	}
	
	// goal effect
	const effect = new function() {
		this.timer = 0;
		this.stage = 0;
		this.colors = [0xffffff, 0xff0000, 0xffa500, 0xffff00, 0x008000, 0x00ffff, 0x0000ff, 0x800080];
		this.event = function() {
			if (goalSwitch.waiting) {
				return;
			} else {
				goalSwitch.waiting = true;
				goalSwitch.count++;
				setTimeout(function() {
					goalSwitch.waiting = false;
				}, 1500);
				// goal sound
				if (goalSwitch.count != 5) {
					sound.goal.connect();
					sound.goal.play();
					setTimeout(() => sound.goal.disconnect, 100);
				}
				// add color balls
				for (let i = 0; i < Math.min((4 + goalSwitch.count * 2), 25); i++) {
					let sphereColor = effect.colors[Math.floor(Math.random() * effect.colors.length)];
					let sphere = new Physijs.SphereMesh(new THREE.SphereGeometry(2, 5), Physijs.createMaterial(new THREE.MeshLambertMaterial({
						color: sphereColor
					}), 1, 0.5));
					sphere.position.y = goalParam.distance * 0.625 - 24,
					sphere.position.x = goalParam.distance - 10 - Math.random() * 10 + 5;
					sphere.position.z = goalParam.zPosition + Math.random() * 10 - 5;
					scene.add(sphere);
				}
				// stage event
				if (goalSwitch.count == 2) {
					UI.slider.classList.remove('removed');
					setTimeout(()=> UI.toVisible(UI.slider), 2000);
				}
				if (goalSwitch.count == 5) {
					for(let a of UI.messages) {
						a.classList.add('message--animation');
					}
					sound.clear.connect();
					sound.clear.play();
					setTimeout(() => sound.clear.disconnect, 1000);
				}
				if (goalSwitch.count < 6) {
					setTimeout(()=> {
						effect.stage ++;
						// point sound
						sound.point.connect();
						sound.point.play();
						setTimeout(() => sound.point.disconnect, 100);
						// board change
						board.material = Physijs.createMaterial(new THREE.MeshPhongMaterial({
							map: textureLoader.load('assets/textures/goalboard-' + goalSwitch.count + '.gif')
						}), 0, 0.5);
						board.remove();					
						board.object = new Physijs.BoxMesh(board.geometry, board.material, 0);
						board.setPosition();
						board.addScene();
					}, 1000);
				}
				if (goalSwitch.count > 4) {
					for (let i = 0; i < effect.colors.length + 1; i++) {
						let sphere = new Physijs.SphereMesh(new THREE.SphereGeometry(2, 5), Physijs.createMaterial(new THREE.MeshLambertMaterial({
							color: effect.colors[i]
						}), 1, 0.8));
						sphere.position.y = goalParam.distance * 0.625 - 50 + 1 * i,
						sphere.position.x = goalParam.distance - 20 - 0.05 * i,
						sphere.position.z = goalParam.zPosition,
						scene.add(sphere);
					}
				}
			}
		}
		this.animation = function() {
			switch (effect.stage) {
				case 0: break;
				case 1:	slideZ(10); break;
				case 2:	slideZto0(); break;
				case 3:	away(250); break;
				case 4: break;
				case 5:	away(280); break;
				case 6:	awayAlternate(280, 330); break;
				case 7:	away(450); break;
				case 8:	slideZ(10); break;
				case 9:	slideZto0(); break;
				default: slideAwayMix(400, 450, 10); break;
			}
			function slideZ(width) {
				effect.timer += 1;
				for (let a of goalParam.parts) {
					a.remove();
				}
				goalParam.zPosition = width * Math.sin(effect.timer / 100);
				for (let a of goalParam.parts) {
					a.setPosition();
					a.addScene();
				}
			}
			function slideZto0() {
				effect.timer += 1;
				for (let a of goalParam.parts) { a.remove(); }
				if (goalParam.zPosition > 0.5) {
					goalParam.zPosition -= 0.2;
				} else if(goalParam.zPosition < - 0.5) {
					goalParam.zPosition += 0.2;
				} else {
					goalParam.zPosition = 0;
					effect.timer = 0;
					effect.stage++;
				}
				for (let a of goalParam.parts) {
					a.setPosition();
					a.addScene();
				}
			}
			function away(distance) {
				if (goalParam.distance < distance) {
					for (let a of goalParam.parts) {
						a.remove();
					}
					goalParam.distance += 1;
					for (let a of goalParam.parts) {
						a.setPosition();
						a.addScene();
					}
				} else {
					effect.timer = 0
					effect.stage++;
				}
			}
			function awayAlternate(disMin, disMax) {
				effect.timer += 1;
				for (let a of goalParam.parts) {
					a.remove();
				}
				goalParam.distance = disMin + (1 + Math.cos(effect.timer / 50 + Math.PI)) * (disMax - disMin);
				for (let a of goalParam.parts) {
					a.setPosition();
					a.addScene();
				}
			}
			function slideAwayMix(disMin, disMax, width) {
				effect.timer += 1;
				for (let a of goalParam.parts) {
					a.remove();
				}
				goalParam.zPosition = width * Math.sin(effect.timer / 100);
				goalParam.distance = disMax + (Math.cos(effect.timer / 120) - 1) * (disMax - disMin);
				for (let a of goalParam.parts) {
					a.setPosition();
					a.addScene();
				}
			}
		}
	}
	// switch
	const goalSwitch = new function () {
		this.geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
		this.material = Physijs.createMaterial(new THREE.MeshBasicMaterial({
			transparent: true,
			opacity: 0
		}), 0, 0);
		this.object = new Physijs.BoxMesh(this.geometry, this.material, 0);
		this.setPosition = function() {
			this.object.position.x = goalParam.distance - 6;
			this.object.position.y = goalParam.distance * 0.625 - 22;
			this.object.position.z = goalParam.zPosition;
		};
		this.waiting = false;
		this.count = 0;
		this.object.addEventListener('collision', effect.event);
		goalParam.parts.push(this);
		this.addScene = function () {
			scene.add(this.object);
		}
		this.remove = function () {
			scene.remove(this.object)
		};
	}
	
	// initialize
	function createField() {
		shooter.setSize();
		shooter.addScene();
		shootStand.addScene();
		floor.addScene();
		remover.addScene();
		for (let a of goalParam.parts) {
			a.setPosition();
			a.addScene();
		}
	}
	
	createField();
	requestAnimationFrame(render);
	
	// render
	function render() {
		effect.animation();
		requestAnimationFrame(render);
		renderer.render(scene, camera.object);
		scene.simulate();
	}

	// UI
	const UI = new function() {
		// shoot button
		this.shootButton = document.getElementById("shoot-button");
		this.shootWaiting = false;
		this.shootButton.addEventListener('click', function() {
			if (UI.shootWaiting) {
				return;
			} else {
				UI.shootWaiting = true;
				let ball = new Ball;
				ball.addScene();
				sound.shoot.connect();
				sound.shoot.play();
				UI.shootButton.innerHTML = "reloading";
				UI.shootButton.classList.add('shoot-button--waiting');
				setTimeout(()=> {
					sound.shoot.disconnect;
					UI.shootWaiting = false;
					UI.shootButton.innerHTML = "shooot!";
					UI.shootButton.classList.remove('shoot-button--waiting');
				}, 1500);
			}
			
		});
		// camera flip button
		this.cameraButton = document.getElementById('camera-button');
		this.cameraButton.addEventListener('click', camera.flip);
		// sound on/off button
		this.soundButton = document.getElementById("audio-button");
		this.soundButton.addEventListener('click', sound.switching);
		this.soundButtonOff = document.getElementById("off");
		this.soundButtonOn = document.getElementById("on");
		// button area
		this.buttonArea = document.getElementById('button-area');
		// slider
		this.slider = document.getElementById('slider');
		this.slider.addEventListener('input',function(event) {
			shooter.remove();
			shootStand.remove();
			shooter.radius = slider.value;
			shooter.setSize();
			shooter.addScene();
			shootStand.addScene();
		})
		// messages
		this.messages = document.getElementsByClassName('message');
		// to visible effect
		this.toVisible = function (element) {
			element.classList.remove('hidden');
			element.classList.add('visible');
		}
		this.toHidden = function (element) {
			element.classList.remove('visible');
			element.classList.add('hidden');
		}
	}
	
	// 画面サイズが変わったら再描写する
	// 初期化処理
	//	onResize();
	// リサイズイベント発生時に実行
	window.addEventListener('resize', onResize);

	function onResize() {
	  // サイズを取得
	  const width = window.innerWidth;
	  const height = window.innerHeight;

	  // レンダラーのサイズを調整する
	  renderer.setPixelRatio(window.devicePixelRatio);
	  renderer.setSize(width, height);

	  // カメラのアスペクト比を正す
	  camera.object.aspect = width / height;
	  camera.object.updateProjectionMatrix();
	}

	};

window.onload = initScene;



