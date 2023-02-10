import { Component, OnInit } from '@angular/core';
import * as THREE from 'three';

@Component({
  selector: 'app-bouncing-logo',
  templateUrl: './bouncing-logo.component.html',
  styleUrls: ['./bouncing-logo.component.scss']
})
export default class BouncingLogoComponent extends THREE.Scene {
  
  vcdTexture:any;

  animations:any;

  start: any;
  current: any;
  delta:any;

  scene:any;

  model:any;

  

  super() {

  }


  initialize() {
    console.log('executed');
    
    // Texture Loader
    const textureLoader = new THREE.TextureLoader()
    this.vcdTexture = textureLoader.load('assets/textures/ShaheerLogo.png')

    this.model = {};

    this.model.group = new THREE.Group();
    this.model.group.position.x = 0.0006490945816040039
    this.model.group.position.y = 0.7589207291603088
    this.model.group.position.z = 0.645
    this.model.group.rotation.y = 4.7;
    this.add(this.model.group)

    this.model.texture = this.vcdTexture
    this.model.texture.encoding = THREE.sRGBEncoding

    this.model.geometry = new THREE.PlaneGeometry(4, 1, 1, 1)
    this.model.geometry.rotateY(- Math.PI * 0.5)

    this.model.material = new THREE.MeshBasicMaterial({
        transparent: true,
        premultipliedAlpha: true,
        map: this.model.texture,
        side: THREE.DoubleSide
    })

    this.model.mesh = new THREE.Mesh(this.model.geometry, this.model.material)
    this.model.mesh.scale.y = 0.359/4
    this.model.mesh.scale.z = 0.424/4
    this.model.group.add(this.model.mesh)

    this.animations = {}
    this.animations.z = 0
    this.animations.y = 0

    this.animations.limits = {}
    this.animations.limits.z = { min: -1.076/12, max: 1.454/12 }
    this.animations.limits.y = { min: -1.055/12, max: 0.947/12 }

    this.animations.speed = {}
    this.animations.speed.z = 0.00061
    this.animations.speed.y = 0.00037

    this.start = Date.now()
    this.current = this.start
  }

  update() {
    const current = Date.now()
    this.delta = current - this.current
    this.current = current

    if(this.model.mesh && this.animations) {

      this.animations.z += this.animations.speed.z * this.delta / 5
      this.animations.y += this.animations.speed.y * this.delta / 5

      if(this.animations.z > this.animations.limits.z.max)
      {
          this.animations.z = this.animations.limits.z.max
          this.animations.speed.z *= -1
          
      }
      if(this.animations.z < this.animations.limits.z.min)
      {
          this.animations.z = this.animations.limits.z.min
          this.animations.speed.z *= -1
          
      }
      if(this.animations.y > this.animations.limits.y.max)
      {
          this.animations.y = this.animations.limits.y.max
          this.animations.speed.y *= -1
      }
      if(this.animations.y < this.animations.limits.y.min)
      {
          this.animations.y = this.animations.limits.y.min
          this.animations.speed.y *= -1
      }

      this.model.mesh.position.z = this.animations.z
      this.model.mesh.position.y = this.animations.y
    }
      
      // this.model.mesh.position.z = Math.sin(Date.now() * 0.001) * 0.05;
      // this.model.mesh.position.y = Math.sin(Date.now() * 0.001) * 0.05;
  }

}
