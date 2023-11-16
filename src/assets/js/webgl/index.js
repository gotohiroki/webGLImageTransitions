import Plane from './components/mesh';
import Stage from './components/stage';

export default class webGL {
  constructor() {
    this.stage = new Stage('#webgl');
    this.stage.init();
    this.plane = new Plane(this.stage, {
      debug: true,
      uniforms: {
        uIntensity: {value: 1, type:'f', min:0., max:3}
      },
    });
  }
  
  init() {
    this.setEventListeners();
    this.onUpdate();
  }

  setEventListeners() {
    window.addEventListener('resize', ()=> this.onResize());
  }

  onResize() {
    this.stage.onResize();
    this.plane.onResize();
  }

  onUpdate() {
    requestAnimationFrame(this.onUpdate.bind(this));
    this.stage.onUpdate();
    this.plane.onUpdate();
  }



}
