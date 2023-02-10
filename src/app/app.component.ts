import { Component } from '@angular/core';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import * as dat from 'dat.gui'

import BouncingLogoComponent from "./bouncing-logo/bouncing-logo.component"

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'shaheer-shahabudeen';
  camera: any;
  scene: any;
  controls: any;


  constructor() {
      
  }

  ngOnInit() {
    //Canvas
    const canvas = document.querySelector('.webgl') as HTMLCanvasElement;
    
    const cubeTextureLoader = new THREE.CubeTextureLoader()
    
    //Scene Initialisation  
    this.scene = new BouncingLogoComponent();
    this.scene.initialize();
    
    this.scene.background = new THREE.Color( 0xBDCEDB );

    const fog = new THREE.Fog('#BDCEDB', 1, 300)
    // this.scene.fog = fog;

    // Texture Loader
    const textureLoader = new THREE.TextureLoader()

    const ambientLight = new THREE.AmbientLight( 0xffffff, 1 );
    this.scene.add(ambientLight)
    ambientLight.position.set(0, 15, 0);

    //Create a DirectionalLight and turn on shadows for the light
    const light = new THREE.DirectionalLight( 0xffffff, .2 );
    light.position.set( 10, 15, 10 ); //default; light shining from top
    light.castShadow = true; // default false
    this.scene.add( light );

    // Debug
    const gui = new dat.GUI();

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
      'assets/model/PortfolioV2.glb',
      (gltf) => {
        this.scene.add(gltf.scene)
      }
    )

    //TV Screen
    const geometry = new THREE.PlaneGeometry( 50, 50, 10, 10 );
    const material2 = new THREE.MeshStandardMaterial( {color: 0x04374b, side: THREE.DoubleSide} );
    const plane = new THREE.Mesh( geometry, material2 );
    // plane.rotation.x = Math.PI / 2
    plane.rotation.x = 0
    plane.receiveShadow = true;
    // this.scene.add( plane );

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
    // this.camera = new THREE.PerspectiveCamera(15, sizes.width / sizes.height, 0.1, 1000)
    this.camera = new THREE.PerspectiveCamera(20, sizes.width / sizes.height, 0.1, 150)
    this.camera.rotation.reorder('YXZ')
    this.camera.position.set(0, 10, 10)
    this.scene.add(this.camera)

    // this.setModel();
    // this.setAnimation();
    
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

    // document.getElementById("pos")?.addEventListener("input", (e:any)=> {
    //   model.mesh.position.x = e.target.value;
    // })

    // Clock
    let clock = new THREE.Clock()
    let oldELapsedTime = 0

    //Animate
    const tick = () => {

      //Clock
      const elapsedTime = clock.getElapsedTime()
      const deltaTime = elapsedTime - oldELapsedTime
      oldELapsedTime = elapsedTime

      this.scene.update();

      // Update mixer
      if(mixer !== null) {
        mixer.update(deltaTime)
      }

      this.controls.update()
      renderer.render(this.scene, this.camera)
      window.requestAnimationFrame(tick)
    }
    tick()
  }

}
