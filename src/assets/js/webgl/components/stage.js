import { AxesHelper, GridHelper, PerspectiveCamera, Scene, Vector3, WebGLRenderer } from 'three';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import Stats from "three/examples/jsm/libs/stats.module";
import { MathUtils } from 'three/src/math/MathUtils';

export default class Stage {
  constructor(container) {
    this.container = document.querySelector(container);

    this.renderParam = {
      clearColor: 0x000000,
      width: window.innerWidth,
      height: window.innerHeight
    };

    this.cameraParam = {
      fov: 70,
      near: 0.001,
      far: 1000,
      lookAt: new Vector3(0, 0, 0),
      x: 0,
      y: 0,
      z: 2.0,
    };

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.isInitialized = false;
    this.orbitcontrols = null;
    this.stats = null;
    this.isDev = false;
  }

  init() {
    this._setScene();
    this._setRender();
    this._setCamera();
    // this._setDev();
  }

  _setScene() {
    this.scene = new Scene();
  }

  _setRender() {
    this.renderer = new WebGLRenderer({
      antialias: true,
      alpha: true,
    });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(this.renderParam.width, this.renderParam.height);
    this.container.appendChild(this.renderer.domElement);
  }

  _setCamera() {
    if (!this.isInitialized) {
      this.camera = new PerspectiveCamera(
        this.cameraParam.fov, 
        this.cameraParam.aspect, 
        this.cameraParam.near,
        this.cameraParam.far
      );

      this.camera.position.set(
        this.cameraParam.x,
        this.cameraParam.y,
        this.cameraParam.z
      );
      this.camera.lookAt(this.cameraParam.lookAt);
      this.isInitialized = true;
    }

    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const dist = this.camera.position.z;
    const height = 1;
    this.camera.aspect = windowWidth / windowHeight;
    // this.camera.fov = MathUtils.radToDeg(Math.atan(windowWidth / this.camera.aspect / (2 * dist)) * 2);
    this.camera.fov = 2 * ( 180 / Math.PI ) * Math.atan( height / ( 2 * dist ) );

    this.camera.updateProjectionMatrix();
    this.renderer.setSize(windowWidth, windowHeight);
  }

  _setDev() {
    this.scene.add(new GridHelper(1000, 100));
    this.scene.add(new AxesHelper(100));
    this.orbitcontrols = new OrbitControls(this.camera, this.renderer.domElement);
    this.orbitcontrols.enableDamping = true;
    this.stats = new Stats();
    this.stats.domElement.style.position = "absolute";
    this.stats.domElement.style.left = "0px";
    this.stats.domElement.style.right = "0px";
    document.getElementById("stats").appendChild(this.stats.domElement);
    this.isDev = true;
  }

  _render() {
    this.renderer.render(this.scene, this.camera);
    if(this.isDev) this.stats.update();
    if(this.isDev) this.orbitcontrols.update();
  }

  onResize() {
    this._setCamera();
  }

  onUpdate() {
    this._render();
  }
}