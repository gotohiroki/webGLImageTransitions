import gsap from 'gsap';
import GUI from 'lil-gui';
import { DoubleSide, Mesh, PlaneGeometry, ShaderMaterial, TextureLoader, Vector2, Vector4 } from 'three';
import vertexShader from '../shader/vertex.glsl';
import fragmentShader from '../shader/fragment.glsl';

export default class Plane {
  constructor(stage, option) {
    this.stage = stage;
    this.fragment = option.fragmentShader;
    this.uniforms = option.uniforms || {};
    this.duration = option.duration || 1;
    this.debug = option.debug || false;
    this.easing = option.easing || 'power1.inOut';
    
    this.clicker = document.querySelector('#slider');
    
    this.images = [
      "assets/img/image01.jpg",
      "assets/img/image02.jpg",
      "assets/img/image03.jpg",
    ]
    
    // this.images = JSON.parse(this.clicker.getAttribute('data-images'));
    this.textures = [];
    console.log(this.textures[0]);
    
    this.noiseImage = "assets/img/disp1.jpg";

    this.time = 0;
    this.current = 0;
    this.paused = true;

    this.init();
  }

  init() {
    this.assetsLoader(()=>{
      console.log(this.textures);
      this.settings();
      this._setMesh();
      this._setMeshScale();
      this.setEventListeners();
      this.play();
    })
  }

  assetsLoader(cb){
    const promises = [];
    let that = this;
    this.images.forEach((url,i)=>{
      let promise = new Promise(resolve => {
        that.textures[i] = new TextureLoader().load( url, resolve );
      });
      promises.push(promise);
    })

    Promise.all(promises).then(() => {
      cb();
    });
  }

  settings() {
    if(this.debug) {
      this.gui = new GUI();
    }

    this.settings = { progress: 0.5 };

    Object.keys(this.uniforms).forEach((item)=> {
      this.settings[item] = this.uniforms[item].value;
      console.log(this.settings[item])
      if(this.debug) {
        this.gui.add(this.settings, item, this.uniforms[item].min, this.uniforms[item].max, 0.01).name('intensity');
      }
    });
  }

  _setMesh() {
    this.geometry = new PlaneGeometry(1.0, 1.0, 32, 32);
    this.material = new ShaderMaterial({
      vertexShader,
      fragmentShader,
      transparent: true,
      side: DoubleSide,
      // wireframe: true,
      uniforms: {
        uTime: { type: "f", value: 0 },
        uProgress: { type: "f", value: 0 },
        uBorder: { type: "f", value: 0 },
        uIntensity: { type: "f", value: 0 },
        uScaleX: { type: "f", value: 40 },
        uScaleY: { type: "f", value: 40 },
        utTansition: { type: "f", value: 40 },
        uSwipe: { type: "f", value: 0 },
        uWidth: { type: "f", value: 0 },
        uRadius: { type: "f", value: 0 },
        uTexture1: { type: "t", value: this.textures[0] },
        uTexture2: { type: "t", value: this.textures[1] },
        uDisplacement: { type: "t",  value: new TextureLoader().load(this.noiseImage )},
        uResolution: { type: "vec4", value: new Vector4(0.0) }
      }
    });
    this.mesh = new Mesh(this.geometry, this.material);
    this.stage.scene.add(this.mesh);
  }

  _setMeshScale() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.mesh.scale.x = this.width / this.height;
    this.mesh.scale.y = 1;
    
    this.imageAspect = this.textures[0].image.height/this.textures[0].image.width;
      
    let a1; let a2;

    if (this.height / this.width > this.imageAspect) {
      a1 = (this.width / this.height) * this.imageAspect;
      a2 = 1;
    } else {
      a1 = 1;
      a2 = (this.height / this.width) / this.imageAspect;
    }

    this.material.uniforms.uResolution.value.x = this.width;
    this.material.uniforms.uResolution.value.y = this.height;
    this.material.uniforms.uResolution.value.z = a1;
    this.material.uniforms.uResolution.value.w = a2;
  }

  setEventListeners() {
    this.clicker.addEventListener('click', ()=> {
      this.next();
    })
  }

  stop() {
    this.paused = true;
  }

  play() {
    this.paused = false;
    this._render();
  }

  next() {
    if(this.isRunning) return;
    this.isRunning = true;
    
    let len = this.textures.length;
    let nextTexture = this.textures[(this.current +1)% len];
    console.log(nextTexture)
    this.material.uniforms.uTexture2.value = nextTexture;
    console.log(this.material.uniforms.uTexture1.value)
    console.log(this.material.uniforms.uTexture2.value)

    const tl = gsap.timeline();
    tl.to(this.material.uniforms.uProgress, {
      value: 1,
      duration: this.duration,
      ease: this.easing,
      onComplete: ()=> {
        console.log('finish');
        this.current = (this.current +1)% len;
        this.material.uniforms.uTexture1.value = nextTexture;
        this.material.uniforms.uProgress.value = 0;
        this.isRunning = false;
        console.log(this.material.uniforms.uTexture1.value)
      }
    })
  }

  _render() {
    if(this.mesh) {
      this._setMeshScale();

      if (this.paused) return;
      this.time += 0.05;
      this.material.uniforms.uTime.value = this.time;

      Object.keys(this.uniforms).forEach((item) => {
        this.material.uniforms[item].value = this.settings[item];
      })
    }
  }

  onResize() {
    this._setMeshScale();
  }

  onUpdate() {
    this._render();
  }
}