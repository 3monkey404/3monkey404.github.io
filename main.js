import * as THREE from 'three';
import data from './data.json' assert { type: 'json' };
import WebGL from 'three/addons/capabilities/WebGL.js';
import { GLTFLoader      } from 'three/addons/loaders/GLTFLoader.js';
import { TextGeometry    } from 'three/addons/geometries/TextGeometry.js';
import { FontLoader      } from 'three/addons/loaders/FontLoader.js';
import { OrbitControls   } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer  } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass      } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass      } from 'three/addons/postprocessing/ShaderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

import * as anim from './animation.js';
import * as control from "./Controler.js";

const ENTIRE_SCENE = 0, BLOOM_SCENE = 1;

class Model3D {

    constructor(path, func) {
        this.path = path;
        this.model = null;
        this.scene = new THREE.Scene();

        this.loader = new GLTFLoader();

        this.mixer;
        this.gltf;

        this.loader.load( this.path, function ( gltf ) {

            this.gltf = gltf;
            this.model = this.gltf.scene;
            this.scene.add(this.model);
            console.log(gltf);
            
            this.mixer = new THREE.AnimationMixer(this.gltf.scene);

            this.animate();
            func();

        }.bind(this), undefined, function ( error ) {

            console.error( error );

        } );
    }

    animate() {
        requestAnimationFrame(this.animate.bind(this))

        this.mixer.update(0.05);
    }

    get Model() {
        return this.model;
    }
}
class Text3D {
    constructor(text, _color, font, _height, func) {

        this.text;

        const loader = new FontLoader();
        loader.load(font, function (font) {
        
          // Create the text geometry   
            const textGeometry = new TextGeometry(text, {
                font: font,
                size: 18,
                height: _height / 2,
                curveSegments: 32,
                bevelEnabled: true,
                bevelThickness: 0.5,
                bevelSize: 0.5,
                bevelSegments: 8,
            });
        
            // Create a standard material with red color and 50% gloss
            const material = new THREE.MeshStandardMaterial({
                color: _color
            });
        
            // Geometries are attached to meshes so that they get rendered
            this.text = new THREE.Mesh(textGeometry, material);

            func();
        }.bind(this) );
    }
}

class World extends HTMLElement {
    constructor() {
        super();

        this.scene = new THREE.Scene();
        this.renderer = new THREE.WebGLRenderer();

        this.bloomComposer;
        this.bloomPass;
        this.renderScene;
        this.finalPass;
        this.finalComposer;
        this.params;
        this.bloomLayer;

        this.darkMaterial;
        this.materials;

        this.camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

        this.anchor;
        this._controler;
    }

    connectedCallback() {

        this.hasAttribute("render-width")  ? this.setAttribute("render-width",  this.getAttribute("render-width"))  : this.setAttribute("render-width",  window.innerWidth);
        this.hasAttribute("render-height") ? this.setAttribute("render-height", this.getAttribute("render-height")) : this.setAttribute("render-height", window.innerHeight);
        this.hasAttribute("render-attach") ? this.setAttribute("render-attach", this.getAttribute("render-attach")) : this.setAttribute("render-attach", "render-anchor")

        addEventListener("resize", (event) => {
            this.renderer.setSize(
                this.getAttribute("render-width"),
                this.getAttribute("render-height")
            );
            this.finalComposer.setSize(
                this.getAttribute("render-width"),
                this.getAttribute("render-height")
            );

            this.camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
        });

        this.anchor = document.getElementById(this.getAttribute("render-attach"));
        this.anchor.prepend(this.renderer.domElement);

        if (this.hasAttribute("controler")) {

            this.hasAttribute("min-ctr") ? this.setAttribute("min-ctr", this.getAttribute("min-ctr")) : this.setAttribute("min-ctr", 1);
            this.hasAttribute("max-ctr") ? this.setAttribute("max-ctr", this.getAttribute("max-ctr")) : this.setAttribute("max-ctr", 45);

            this.controls = new OrbitControls( this.camera, this.renderer.domElement );
            this.controls.enableDamping = true;
            this.controls.dampingFactor = 0.05;
            this.controls.enablePan = false;
            this.controls.screenSpacePanning = false;
            this.controls.minDistance = this.hasAttribute("dist-ctr") ? this.getAttribute("dist-ctr") : this.getAttribute("min-ctr");
            this.controls.maxDistance = this.hasAttribute("dist-ctr") ? this.getAttribute("dist-ctr") : this.getAttribute("max-ctr");
            this.controls.maxPolarAngle = Math.PI / 2;
        }

        this.hasAttribute("bg-color") ? this.setAttribute("bg-color", this.getAttribute("bg-color")) : this.setAttribute("bg-color", "white");

        this.scene.background = new THREE.Color( this.getAttribute("bg-color") );

        this.hasAttribute("cam-pos")  ? this.setAttribute("cam-pos",  this.getAttribute("cam-pos"))  : this.setAttribute("cam-pos", "0 2 50");
        this.hasAttribute("cam-rot")  ? this.setAttribute("cam-rot",  this.getAttribute("cam-rot"))  : this.setAttribute("cam-rot", "0 0 0");

        this.camera.position.set(Number(this.getAttribute("cam-pos").split(' ')[0]),
                                 Number(this.getAttribute("cam-pos").split(' ')[1]),
                                 Number(this.getAttribute("cam-pos").split(' ')[2]));
        
        this.camera.rotation.set(Number(this.getAttribute("cam-rot").split(' ')[0]),
                                 Number(this.getAttribute("cam-rot").split(' ')[1]),
                                 Number(this.getAttribute("cam-rot").split(' ')[2]));


        if ( WebGL.isWebGLAvailable() ) {
            this.animate();
        } else {
            const warning = WebGL.getWebGLErrorMessage();
            document.getElementById( 'container' ).appendChild( warning );
        }
    }

    static get observedAttributes() {
        return ['cam-pos', 'cam-rot', 'render-width', 'render-height', 'cam-look'];
    }

    attributeChangedCallback(name, oldVal, newVal) {
        switch(name) {
            case "render-width":
                this.renderer.setSize(
                    newVal,
                    this.getAttribute("render-height")
                );    
                break;
            case "render-height":
                this.renderer.setSize(
                    this.getAttribute("render-width"),
                    newVal
                );
                break;
            case "cam-pos":
                this.camera.position.set(Number(newVal.split(' ')[0]),
                                        Number(newVal.split(' ')[1]),
                                        Number(newVal.split(' ')[2]));
                break;
            case "cam-rot":
                this.camera.rotation.set(Number(newVal.split(' ')[0]),
                                        Number(newVal.split(' ')[1]),
                                        Number(newVal.split(' ')[2]));
                break;
            case "cam-look":
                this.camera.lookAt(Number(newVal.split(' ')[0]),
                                    Number(newVal.split(' ')[1]),
                                    Number(newVal.split(' ')[2]));
                break;
        }
    }

    renderBloom( mask ) {

        if ( mask === true ) {

            this.scene.traverse( this.darkenNonBloomed.bind(this) );
            this.bloomComposer.render();
            this.scene.traverse( this.restoreMaterial.bind(this) );

        } else {

            this.camera.layers.set( this.BLOOM_SCENE );
            this.bloomComposer.render();
            this.camera.layers.set( this.ENTIRE_SCENE );

        }

    }
    darkenNonBloomed( obj ) {

        if ( obj.isMesh && this.bloomLayer.test( obj.layers ) === false ) {

            this.materials[ obj.uuid ] = obj.material;
            obj.material = this.darkMaterial;

        }

    }
    restoreMaterial( obj ) {

        if ( this.materials[ obj.uuid ] ) {

            obj.material = this.materials[ obj.uuid ];
            delete this.materials[ obj.uuid ];

        }

    }

    animate() {
        requestAnimationFrame( this.animate.bind(this) );
        this.renderer.render( this.scene, this.camera );

        if (this._controler != null) {
            this._controler.update();
        }
    }
}
customElements.define("world-3d", World);


class ActorElement extends HTMLElement {
    constructor() {
        super();

        this.scene = new THREE.Scene();

        this.anim = new Array();

        this.hasAttribute("pos") ? this.setAttribute("pos", this.getAttribute("pos")) : this.setAttribute("pos", "0 0 0");
        this.hasAttribute("sca") ? this.setAttribute("sca", this.getAttribute("sca")) : this.setAttribute("sca", "1 1 1");
        this.hasAttribute("rot") ? this.setAttribute("rot", this.getAttribute("rot")) : this.setAttribute("rot", "0 0 0");

        this.hasAttribute("name") ? this.setAttribute("name", this.getAttribute("name")) : this.setAttribute("name", "");
    }

    hover() {
        for (let i = 0; i < this.anim.length; i++) {

            var triggers = this.anim[i].getAttribute("trigger").split(' ');

            for (let t = 0; t < triggers.length; t++) {
                if (triggers[t] == "hover") {
                    this.anim[i].updateAnim();
                }
            }
        }  
    }
    click() {
        for (let i = 0; i < this.anim.length; i++) {
            const _a = this.anim[i];

            var triggers = _a.getAttribute("trigger").split(' ');

            for (let t = 0; t < triggers.length; t++) {
                if (triggers[t] == "click") {
                    if (_a.inAnime) {
                        _a.Pause();
                    }
                    else {
                        _a.Play();
                    }
                }
            }
        }  
    }
}

class Custom3DModel extends ActorElement  {
    constructor() {
        super();

        this.model = null;
        this.classModel;
        this.onModelLoad;
    }

    connectedCallback() {
        this.hasAttribute("src") ? this.setAttribute("src", this.getAttribute("src")) : this.setAttribute("src", "glbModel/baseCube.glb");

        var s = this.parentElement.scene;

        this.classModel = new Model3D(this.getAttribute("src"), () => {
            this.model = this.classModel.scene;

            this.model.position.set(
                Number(this.getAttribute("pos").split(' ')[0]),
                Number(this.getAttribute("pos").split(' ')[1]),
                Number(this.getAttribute("pos").split(' ')[2])
            );

            this.model.scale.set(
                Number(this.getAttribute("sca").split(' ')[0]),
                Number(this.getAttribute("sca").split(' ')[1]),
                Number(this.getAttribute("sca").split(' ')[2])
            );

            this.model.rotation.set(
                Number(this.getAttribute("rot").split(' ')[0]),
                Number(this.getAttribute("rot").split(' ')[1]),
                Number(this.getAttribute("rot").split(' ')[2])
            );
            
            //this.changeName(this.getAttribute("name"), this.classModel.model.children);
            this.classModel.model.children[0].name = this.getAttribute("name");
            
            this.scene.add(this.model);
            s.add(this.scene);

            console.log(this.classModel.gltf);

            if (this.onModelLoad != null) {
                this.onModelLoad();
            }
        });

    }

    changeName(name, children) {
        if (children.length <= 0) {
            return;
        }

        for (let i = 0; i < children.length; i++) {
            children[i].name = name;
            this.changeName(name, children[i].children);
        }
    }

    static get observedAttributes() {
        return ['pos', 'rot', 'sca'];
    }

    get Model() {
        return this.model;
    }

    attributeChangedCallback(attrName, oldVal, newVal) {

        if (this.model == undefined || this.model == null) {
            return;
        }

        switch (attrName) {
            
            case "pos":
                this.model.position.set(
                    Number(newVal.split(' ')[0]),
                    Number(newVal.split(' ')[1]),
                    Number(newVal.split(' ')[2])
                );
                break;
            case "rot":
                this.model.rotation.set(
                    Number(newVal.split(' ')[0]),
                    Number(newVal.split(' ')[1]),
                    Number(newVal.split(' ')[2])
                    );
                break;
            case "sca":
                this.model.scale.set(
                    Number(newVal.split(' ')[0]),
                    Number(newVal.split(' ')[1]),
                    Number(newVal.split(' ')[2])
                );
                break;
            
            default:
                break;
        }
    }
}
class Base3DModel extends ActorElement {
    constructor() {
        super();

        this.geometrie = null;
        this.material = null;
        this.model = null;
    }

    connectedCallback() {

        var s = this.parentElement.scene;

        this.hasAttribute("geometrie") ? this.setAttribute("geometrie", this.getAttribute("geometrie")) : this.setAttribute("geometrie", "cube");
        this.hasAttribute("material")  ? this.setAttribute("material",  this.getAttribute("material"))  : this.setAttribute("material",  "basic");
        this.hasAttribute("color")     ? this.setAttribute("color",     this.getAttribute("color"))     : this.setAttribute("color",     "white");

        this.hasAttribute("roughness") ? this.setAttribute("roughness", this.getAttribute("roughness")) : this.setAttribute("roughness", 0)
        this.hasAttribute("shininess") ? this.setAttribute("shininess", this.getAttribute("shininess")) : this.setAttribute("shininess", 0)

        const _geometrie = this.getAttribute("geometrie");

        switch(_geometrie) {

            case "cube":      this.geometrie = new THREE.BoxGeometry();       break;
            case "sphere" :   this.geometrie = new THREE.SphereGeometry();    break;
            case "capsule" :  this.geometrie = new THREE.CapsuleGeometry();   break;
            case "torus":     this.geometrie = new THREE.TorusGeometry();     break;
            case "torusKnot": this.geometrie = new THREE.TorusKnotGeometry(); break;

            default:
                break;
        }

        const _Material  = this.getAttribute("material");
        const _color     = this.getAttribute("color");
        const _shininess = this.getAttribute("shininess");
        const _roughness = this.getAttribute("roughness");
        switch (_Material) {

            case "basic" :   this.material = new THREE.MeshBasicMaterial({color: _color, shininess: _shininess, roughness: _roughness});    break;
            case "phong":    this.material = new THREE.MeshPhongMaterial({color: _color, shininess: _shininess, roughness: _roughness});    break;
            case "lambert" : this.material = new THREE.MeshLambertMaterial({color: _color, shininess: _shininess, roughness: _roughness});  break;
            case "standard": this.material = new THREE.MeshStandardMaterial({color: _color, shininess: _shininess, roughness: _roughness}); break;
            case "toon":     this.material = new THREE.MeshToonMaterial({color: _color, shininess: _shininess, roughness: _roughness});     break;

            default:
                break;
        }

        this.model = new THREE.Mesh(this.geometrie, this.material);

        this.model.position.set(
            Number(this.getAttribute("pos").split(' ')[0]),
            Number(this.getAttribute("pos").split(' ')[1]),
            Number(this.getAttribute("pos").split(' ')[2])
        );

        this.model.scale.set(
            Number(this.getAttribute("sca").split(' ')[0]),
            Number(this.getAttribute("sca").split(' ')[1]),
            Number(this.getAttribute("sca").split(' ')[2])
        );

        this.model.rotation.set(
            Number(this.getAttribute("rot").split(' ')[0]),
            Number(this.getAttribute("rot").split(' ')[1]),
            Number(this.getAttribute("rot").split(' ')[2])
        );

        this.model.name = this.getAttribute("name");

        this.scene.add(this.model);
        s.add(this.scene);
    }

    static get observedAttributes() {
        return ['pos', 'rot', 'sca'];
    }

    get Model() {
        return this.model;
    }

    attributeChangedCallback(attrName, oldVal, newVal) {

        if (this.model == undefined || this.model == null) {
            return;
        }

        switch (attrName) {
            
            case "pos":
                this.model.position.set(
                    Number(newVal.split(' ')[0]),
                    Number(newVal.split(' ')[1]),
                    Number(newVal.split(' ')[2])
                );
                break;
            case "rot":
                this.model.rotation.set(
                    Number(newVal.split(' ')[0]),
                    Number(newVal.split(' ')[1]),
                    Number(newVal.split(' ')[2])
                );
                break;
            case "sca":
                this.model.scale.set(
                    Number(newVal.split(' ')[0]),
                    Number(newVal.split(' ')[1]),
                    Number(newVal.split(' ')[2])
                );
                break;
            
            default:
                break;
        }
    }
}
class Light extends ActorElement {
    constructor() {
        super();

        this.light = null;
    }

    connectedCallback() {
        var s = this.parentElement.scene;

        this.hasAttribute("color")     ? this.setAttribute("color",     this.getAttribute("color"))     : this.setAttribute("color", "white");
        this.hasAttribute("intensity") ? this.setAttribute("intensity", this.getAttribute("intensity")) : this.setAttribute("intensity", 10);

        this.light = new THREE.DirectionalLight(
            this.getAttribute("color"),
            this.getAttribute("intensity")
        );

        this.light.position.set(
            Number(this.getAttribute("pos").split(' ')[0]),
            Number(this.getAttribute("pos").split(' ')[1]),
            Number(this.getAttribute("pos").split(' ')[2])
            );

        this.light.scale.set(
            Number(this.getAttribute("sca").split(' ')[0]),
            Number(this.getAttribute("sca").split(' ')[1]),
            Number(this.getAttribute("sca").split(' ')[2])
        );

        this.light.rotation.set(
            Number(this.getAttribute("rot").split(' ')[0]),
            Number(this.getAttribute("rot").split(' ')[1]),
            Number(this.getAttribute("rot").split(' ')[2])
        );

        this.scene.add(this.light);
        s.add(this.scene);
    }

    static get observedAttributes() {
        return ['pos', 'rot', 'sca'];
    }

    get Model() {
        return this.light;
    }

    attributeChangedCallback(attrName, oldVal, newVal) {

        if (this.light == undefined || this.light == null) {
            return;
        }

        switch (attrName) {
            
            case "pos":
                this.light.position.set(
                    Number(newVal.split(' ')[0]),
                    Number(newVal.split(' ')[1]),
                    Number(newVal.split(' ')[2])
                );
                break;
            case "rot":
                this.light.rotation.set(
                    Number(newVal.split(' ')[0]),
                    Number(newVal.split(' ')[1]),
                    Number(newVal.split(' ')[2])
                );
                break;
            case "sca":
                this.light.scale.set(
                    Number(newVal.split(' ')[0]),
                    Number(newVal.split(' ')[1]),
                    Number(newVal.split(' ')[2])
                );
                break;
            
            default:
                break;
        }
    }
}
class Text extends ActorElement {
    constructor() {
        super();

        this.t = null;
    }

    connectedCallback() {
        var s = this.parentElement.scene;

        this.hasAttribute("color")  ? this.setAttribute("color",  this.getAttribute("color"))  : this.setAttribute("color", "pink");
        this.hasAttribute("texte")  ? this.setAttribute("texte",  this.getAttribute("texte"))  : this.setAttribute("texte", "new text");
        this.hasAttribute("font")   ? this.setAttribute("font",   this.getAttribute("font"))   : this.setAttribute("font",  "fonts/regular.json");
        this.hasAttribute("height") ? this.setAttribute("height", this.getAttribute("height")) : this.setAttribute("height", 1)

        this.t = new Text3D(
            this.getAttribute("texte"),
            this.getAttribute("color"),
            this.getAttribute("font"),
            this.getAttribute("height"),
        () => {

            this.t.text.position.set(
                Number(this.getAttribute("pos").split(' ')[0]),
                Number(this.getAttribute("pos").split(' ')[1]),
                Number(this.getAttribute("pos").split(' ')[2])
            );

            this.t.text.scale.set(
                Number(this.getAttribute("sca").split(' ')[0]),
                Number(this.getAttribute("sca").split(' ')[1]),
                Number(this.getAttribute("sca").split(' ')[2])
            );

            this.t.text.rotation.set(
                Number(this.getAttribute("rot").split(' ')[0]),
                Number(this.getAttribute("rot").split(' ')[1]),
                Number(this.getAttribute("rot").split(' ')[2])
            );
            
            this.t.text.name = this.getAttribute("name");

            this.scene.add(this.t.text);
            s.add(this.scene);
        });
    }

    static get observedAttributes() {
        return ['pos', 'rot', 'sca'];
    }

    get Model() {
        return this.t.text;
    }

    attributeChangedCallback(attrName, oldVal, newVal) {

        if (this.t == undefined || this.t == null) {
            return;
        }

        if (this.t.text == undefined || this.t.text == null) {
            return;
        }

        switch (attrName) {
            
            case "pos":
                this.t.text.position.set(
                    Number(newVal.split(' ')[0]),
                    Number(newVal.split(' ')[1]),
                    Number(newVal.split(' ')[2])
                );
                break;
            case "rot":
                this.t.text.rotation.set(
                    Number(newVal.split(' ')[0]),
                    Number(newVal.split(' ')[1]),
                    Number(newVal.split(' ')[2])
                );
                break;
            case "sca":
                this.t.text.scale.set(
                    Number(newVal.split(' ')[0]),
                    Number(newVal.split(' ')[1]),
                    Number(newVal.split(' ')[2])
                );
                break;
            
            default:
                break;
        }
    }
}

customElements.define("custom-3d-model", Custom3DModel);
customElements.define("basic-3d-model",  Base3DModel);
customElements.define("custom-3d-light", Light);
customElements.define("custom-3d-texte", Text);

class Rail extends HTMLElement {
    constructor() {
        super();

        this.spline = new THREE.CatmullRomCurve3();
        this.camPosIndex = 0;

        this.controlMove = new Array();
    }

    moveToCurve(moveValue) {
        if(this.spline.points.length > 1) {

            this.camPosIndex += isNaN(moveValue) ? 0 : moveValue;

            if (this.camPosIndex < 0) {
                this.camPosIndex = 0;
            }

            if (this.camPosIndex > (this.spline.points.length * 100)) {
                this.camPosIndex = this.spline.points.length * 100;
                return;
            }
            
            let camPos = this.spline.getPoint(this.camPosIndex / (this.spline.points.length * 100));
          
            this.parentElement.setAttribute("cam-pos", camPos.x.toString() + " " + camPos.y.toString() + " " + camPos.z.toString());

            const _event = new CustomEvent("camRailChangePosition", {
                detail: {
                    camPosIndex: this.camPosIndex
                }
            });

            dispatchEvent(_event);
        }
    }
}

class cineRail extends Rail {
    constructor() {
        super();

        this.cam;
    }

    connectedCallback() {
        this.cam = this.parentElement.camera;

        if (this.cam == undefined) {
            console.error("le parent doit etre un world-3d");
        }

        this.animate();
    }

    animate() {
        requestAnimationFrame( this.animate.bind(this) );
        this.moveToCurve(1);
    }
}
class scrollRail extends Rail {
    constructor() {
        super();

        this.cam;

        addEventListener("wheel", (event) => {
            this.moveToCurve(event.deltaY * 0.1);
        });

        addEventListener("sweep", (event) => {
            console.log(event);
            this.moveToCurve(event.detail.deltaY * 0.01);
        })
    }

    connectedCallback() {
        this.cam = this.parentElement.camera;

        if (this.cam == undefined) {
            console.error("le parent doit etre un world-3d");
        }
    }
}
class scrollStopPointRail extends Rail {
    constructor() {
        super();

        this.stopPoint = new Array();
        this.onMove = false;
        this.index = 0;
        this.direction = 0;

        addEventListener("wheel", (event) => {

            if (!this.onMove) {

                if (event.deltaY > 0) {
                    this.index = this.index + 1 >= this.stopPoint.length ? this.index = this.stopPoint.length - 1 : this.index + 1;
                    this.direction = 1;
                } else {
                    this.index = this.index - 1 <= 0 ? 0 : this.index - 1;
                    this.direction = -1;
                }

                this.onMove = true;
            }
        });
        addEventListener("sweep", (event) => {

            if (!this.onMove) {

                if (event.detail.deltaY > 0) {
                    this.index = this.index + 1 >= this.stopPoint.length ? this.index = this.stopPoint.length - 1 : this.index + 1;
                    this.direction = 1;
                } else {

                    this.index = this.index - 1 <= 0 ? 0 : this.index - 1;
                    this.direction = -1;
                }

                this.onMove = true;
            }
        })
    }

    connectedCallback() {
        this.cam = this.parentElement.camera;

        if (this.cam == undefined) {
            console.error("le parent doit etre un world-3d");
        }

        this.animate();
    }

    animate() {
        requestAnimationFrame(this.animate.bind(this))

        if (this.stopPoint.length > 0) {
            if (this.onMove) {

                if (this.direction == 1) {

                    if (this.camPosIndex >= this.stopPoint[this.index].getAttribute("stopPosIndex")) {
                        this.onMove = false;
                        return;
                    }
                }else if (this.direction == -1) {

                    if (this.camPosIndex <= this.stopPoint[this.index].getAttribute("stopPosIndex")) {
                        this.onMove = false;
                        return;
                    }
                }

                this.moveToCurve(this.direction * Number(this.stopPoint[this.index].getAttribute("speed")));
            }
        }
    }
}


class ControlPoint extends HTMLElement {
    constructor() {
        super();

        this.spline;
    }

    connectedCallback() {
        this.spline = this.parentElement.spline;

        this.hasAttribute("pos") ? this.setAttribute("pos", this.getAttribute("pos")) : this.setAttribute("pos", "0 0 0");

        this.spline.points.push(new THREE.Vector3(Number(this.getAttribute("pos").split(' ')[0]),
                                                  Number(this.getAttribute("pos").split(' ')[1]),
                                                  Number(this.getAttribute("pos").split(' ')[2])));
    }
}
class StopPoint extends HTMLElement {
    constructor() {
        super();

        this.hasAttribute("stopPosIndex") ? this.setAttribute("stopPosIndex", this.getAttribute("stopPosIndex")) : this.setAttribute("stopPosIndex", 0);
        this.hasAttribute("speed")        ? this.setAttribute("speed",        this.getAttribute("speed"))        : this.setAttribute("speed", "1.5");
    }

    connectedCallback() {
        this.parentElement.stopPoint.push(this);
    }
}

customElements.define("cine-rail",              cineRail);
customElements.define("scroll-rail",            scrollRail);
customElements.define("scroll-stop-point-rail", scrollStopPointRail)

customElements.define("control-point", ControlPoint);
customElements.define("stop-point", StopPoint)


class CustomPage extends HTMLElement {
    constructor() {
        super();

        this.hasAttribute("name") ? this.setAttribute("name", this.getAttribute("name")) : this.setAttribute("name", "home");
        var element = data.page[this.getAttribute("name")];

        this.createElement(element);
    }

    createElement(parentData) {
        for (let i = 0; i < parentData.length; i++) {
            const _name = parentData[i].name;
            var object = null;

            switch (_name) {
                case "custom-3d-model": object = new Custom3DModel();          break;
                case "basic-3d-model":  object = new Base3DModel();            break;
                case "custom-3d-light": object = new Light();                  break;
                case "custom-3d-texte": object = new Text();                   break;
                case "world-3d":        object = new World();                  break;

                case "scroll-stop-point-rail": object = new scrollStopPointRail(); break;
                case "cine-rail":              object = new cineRail();            break;
                case "scroll-rail":            object = new scrollRail();          break;

                case "stop-point":      object = new StopPoint();              break;
                case "control-point":   object = new ControlPoint();           break;

                case "anim-rotate":     object = new anim.RotateAnimation();   break;
                case "anim-position":   object = new anim.PositionAnimation(); break;
                case "anim-scale":      object = new anim.ScaleAnimation();    break;

                case "control-p":       object = new control.Controler();      break;

                case "anim-rotate-scroll":   object = new anim.RotateAnimationScroll();   break;
                case "anim-position-scroll": object = new anim.PositionAnimationScroll(); break;
                case "anim-scale-scroll":    object = new anim.ScaleAnimationScroll();    break;

                case "anim-model":        object = new anim.ModelAnimation();       break;
                case "anim-model-scroll": object = new anim.ModelAnimationScroll(); break;

                default: object = document.createElement(_name); break;
            }

            const _attr = parentData[i].attr;

            for (let a = 0; a < _attr.length; a++) {
                object.setAttribute(_attr[a].name, _attr[a].value);
            }

            document.body.appendChild(object);

            const _element = parentData[i].element;
            if (_element.texte != "" || _element.html.length > 0) {
                this.createElementwithParent(_element, object);
            }
        }
    }

    createElementwithParent(_element, parent) {

        var object = null;

        if (_element.texte != "") {
            const texteContent = document.createTextNode(_element.texte);
            parent.appendChild(texteContent);
        } 
        
        if (_element.html.length > 0) {

            const _data = _element.html;

            for (let i = 0; i < _element.html.length; i++) {
                
                const _name = _data[i].name;
    
                switch (_name) {
                    case "custom-3d-model": object = new Custom3DModel();          break;
                    case "basic-3d-model":  object = new Base3DModel();            break;
                    case "custom-3d-light": object = new Light();                  break;
                    case "custom-3d-texte": object = new Text();                   break;
                    case "world-3d":        object = new World();                  break;
    
                    case "scroll-stop-point-rail": object = new scrollStopPointRail(); break;
                    case "cine-rail":              object = new cineRail();            break;
                    case "scroll-rail":            object = new scrollRail();          break;
    
                    case "stop-point":      object = new StopPoint();              break;
                    case "control-point":   object = new ControlPoint();           break;
    
                    case "anim-rotate":     object = new anim.RotateAnimation();   break;
                    case "anim-position":   object = new anim.PositionAnimation(); break;
                    case "anim-scale":      object = new anim.ScaleAnimation();    break;
    
                    case "control-p":       object = new control.Controler();      break;
    
                    case "anim-rotate-scroll":   object = new anim.RotateAnimationScroll();   break;
                    case "anim-position-scroll": object = new anim.PositionAnimationScroll(); break;
                    case "anim-scale-scroll":    object = new anim.ScaleAnimationScroll();    break;

                    case "anim-model":        object = new anim.ModelAnimation();       break;
                    case "anim-model-scroll": object = new anim.ModelAnimationScroll(); break;

                    default: object = document.createElement(_name); break;
                }
                
                const _attr = _data[i].attr;

                for (let a = 0; a < _attr.length; a++) {
                    object.setAttribute(_attr[a].name, _attr[a].value);
                }
    
                parent.appendChild(object);

                const e = _data[i].element;
                if (e.texte != "" || e.html.length > 0) {
                    this.createElementwithParent(e, object);
                }
            }
        }
    }
}

customElements.define("custom-page", CustomPage);