import { Component } from '@angular/core';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'animations';
  camera: any;
  scene: any;
  controls: any;
  swingAudio: any;
  constructor() {

  }

  ngOnInit() {
    //Canvas
    const canvas = document.querySelector('.webgl') as HTMLCanvasElement;

    this.swingAudio = new Audio('assets/sounds/swing.mp3')

    //Scene Initialisation  
    this.scene = new THREE.Scene();
    const cubeTextureLoader = new THREE.CubeTextureLoader()
    
    this.scene.background = new THREE.Color( 0x3fd84c );

    const fog = new THREE.Fog('#2669b9', 1, 300)
    // this.scene.fog = fog;

    // Texture Loader
    const textureLoader = new THREE.TextureLoader()

    // Threejs Lights
    const pointLight = new THREE.PointLight( 0x000000, 1.2);
    this.scene.add(pointLight)
    pointLight.position.set(0, 25, 0);
    pointLight.castShadow = true

    // const pointLightHelper = new THREE.PointLightHelper( pointLight, 1 );
    // this.scene.add( pointLightHelper );

    const ambientLight = new THREE.AmbientLight( 0xffffff, 1 );
    this.scene.add(ambientLight)
    ambientLight.position.set(0, 15, 0);
    ambientLight.castShadow = true

    // Loaders and decoders

    const dracoLoader = new DRACOLoader()
    dracoLoader.setDecoderPath('assets/decoders/draco/')

    const gltfLoader = new GLTFLoader()
    gltfLoader.setDRACOLoader(dracoLoader)

    const swingTexture = textureLoader.load('assets/model/flag/bakeFlagV2.jpg')
    swingTexture.flipY = false
    swingTexture.encoding = THREE.sRGBEncoding

    const swingMaterial = new THREE.MeshBasicMaterial({ map: swingTexture, side: THREE.DoubleSide, wireframe: false })

    THREE.ShaderLib[ 'lambert' ].fragmentShader = THREE.ShaderLib[ 'lambert' ].fragmentShader.replace(

      `vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;`,
  
      `#ifndef CUSTOM
          vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
      #else
          vec3 outgoingLight = diffuseColor.rgb * ( 1.0 - 0.3 * ( 1.0 - getShadowMask() ) ); // shadow intensity hardwired to 0.3 here
      #endif`
  
    );

    var material = new THREE.MeshLambertMaterial( { map: swingTexture, side: THREE.DoubleSide } );
    material.defines = material.defines || {};
    material.defines.CUSTOM = "";

    let mixer: any = null;
    gltfLoader.load(
      'assets/model/flag/FlagV3.glb',
      (gltf) => {

        gltf.scene.traverse((o)=>{
          if(o instanceof THREE.Mesh) { 
            o.material = material;

            //Flag Project
            if(o.name === 'Cube' || 'Cube001') {
              o.receiveShadow = true;
              // o.castShadow = true;
            } else if('Cylinder') {
              o.castShadow = true;
            } else if('Plane') {
              o.castShadow = true;
            }

            // Loop Project
            console.log(o.name);
            // if(o.name === 'floor' || o.name === 'slider') {
            //   o.material = material;
            //   o.receiveShadow = true;
            //   o.castShadow = true;
            // } else if (o.name === 'Sphere') {
            //   o.material = material;
            //   // o.receiveShadow = true;
            //   o.castShadow = true;
            // }
            // else {
            //   o.material = swingMaterial;
            //   o.receiveShadow = true;
            // }
          }
          
        })
        console.log(gltf.animations);
        
        mixer = new THREE.AnimationMixer(gltf.scene);
        const action1 = mixer.clipAction(gltf.animations[0]);
        // const action2 = mixer.clipAction(gltf.animations[1]);
        // const action3 = mixer.clipAction(gltf.animations[2]);
        action1.play();
        // action2.play();
        // action3.play();
        this.scene.add(gltf.scene)
        gltf.scene.scale.set(5,5,5)
      }
    )

    let mixer2: any = null;
    gltfLoader.load(
      'assets/model/avatar/Shaheer.glb',
      (gltf) => {

        gltf.scene.traverse((o)=>{
          if(o instanceof THREE.Mesh) {
            // o.receiveShadow = true;
            o.castShadow = true;
          }
        })

        mixer2 = new THREE.AnimationMixer(gltf.scene)
        const action = mixer2.clipAction(gltf.animations[0])
        action.play();

        gltf.scene.scale.set(5,5,5)
        this.scene.add(gltf.scene)
        gltf.scene.position.y = gltf.scene.position.y + .25
        gltf.scene.position.x = -7
        gltf.scene.rotateY(Math.PI / 2)
        gltf.scene.castShadow = true;
      });
  
    //Renderer Size
    const sizes = {
      width: innerWidth,
      height: innerHeight
    }

    //Render Initialisation
    const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: false })
    // document.body.appendChild( renderer.domElement );
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.outputEncoding = THREE.sRGBEncoding

    //Camera Initialisation
    this.camera = new THREE.PerspectiveCamera(15, sizes.width / sizes.height, 0.1, 1000)
    this.camera.position.set(0, 40, 110)
    this.scene.add(this.camera)

    // Controls
    this.controls = new OrbitControls(this.camera, canvas)
    this.controls.enableDamping = true;
    // this.controls.autoRotate = true;

    //Resize Event
    window.addEventListener('resize', () => {
      // Update sizes
      sizes.width = window.innerWidth
      sizes.height = window.innerHeight

      //Update camera
      this.camera.aspect = sizes.width / sizes.height
      this.camera.updateProjectionMatrix()

      //Update renderer
      renderer.setSize(sizes.width, sizes.height)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    })

    // Clock
    let clock = new THREE.Clock()
    let oldELapsedTime = 0

    //Animate
    const tick = () => {

      //Clock
      const elapsedTime = clock.getElapsedTime()
      const deltaTime = elapsedTime - oldELapsedTime
      oldELapsedTime = elapsedTime

      // Update mixer
      if(mixer !== null) {
        mixer.update(deltaTime)
      }
      if(mixer2 !== null) {
        mixer2.update(deltaTime)
      }

      this.controls.update()
      renderer.render(this.scene, this.camera)
      window.requestAnimationFrame(tick)
    }
    tick()
  }

  playSwingSound() {
    this.swingAudio.currentTime = 0;
    this.swingAudio.volume = 0.5;
    this.swingAudio.play();
  }
}
