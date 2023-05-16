import * as THREE from 'three';

class Animation extends HTMLElement {
    constructor() {
        super();

        this.incrementTime = 1;
        this.time = 0;
        this.parent;
        this.inAnime = false;

        this.hasAttribute("trigger")    ? this.setAttribute("trigger",    this.getAttribute("trigger"))    : this.setAttribute("trigger",   "click");
        this.hasAttribute("anim-type")  ? this.setAttribute("anim-type",  this.getAttribute("anim-type"))  : this.setAttribute("anim-type", "ping-pong")
        this.hasAttribute("start-time") ? this.setAttribute("start-time", this.getAttribute("start-time")) : this.setAttribute("start-time", 0);
        this.hasAttribute("speed")      ? this.setAttribute("speed",      this.getAttribute("speed"))      : this.setAttribute("speed", "1")
    }

    SetAnimTime(time) { }

    Play() { }
    Pause() { }
    Stop() { }

    map_range(value, low1, high1, low2, high2) {
        return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
    }
    clamp = (num, min, max) => Math.min(Math.max(num, min), max);
}

class RotateAnimation extends Animation {
    constructor() {
        super();

        this.spline = new THREE.CatmullRomCurve3();;
        this.camPosIndex = 0;
    }

    SetAnimTime(time) {
        var objRot = this.spline.getPoint(time);

        this.parent.setAttribute(
            "rot",
              (objRot.x * (Math.PI / 180)).toString() + " "
            + (objRot.y * (Math.PI / 180)).toString() + " "
            + (objRot.z * (Math.PI / 180)).toString()
        );
    }

    Play() {
        this.inAnime = true;
    }
    Pause() {
        this.inAnime = false;
    }
    Stop() {
        this.inAnime = false;
        this.parent.setAttribute("rot", "0 0 0");
    }

    connectedCallback() {
        this.parentElement.anim.push(this);
        this.parent = this.parentElement;

        this.hasAttribute("start-rot") ? this.setAttribute("start-rot", this.getAttribute("start-rot")) : this.setAttribute("start-rot", "0 0 0");
        this.hasAttribute("end-rot")   ? this.setAttribute("end-rot",   this.getAttribute("end-rot"))   : this.setAttribute("end-rot",   "0 90 0");

        this.spline.points.push(new THREE.Vector3(
            Number(this.getAttribute("start-rot").split(' ')[0]),
            Number(this.getAttribute("start-rot").split(' ')[1]),
            Number(this.getAttribute("start-rot").split(' ')[2])
        ));

        this.spline.points.push(new THREE.Vector3(
            Number(this.getAttribute("end-rot").split(' ')[0]),
            Number(this.getAttribute("end-rot").split(' ')[1]),
            Number(this.getAttribute("end-rot").split(' ')[2])
        ));

        this.SetAnimTime(this.getAttribute("start-time"));
        this.animate();
    }

    updateAnim() {
        var type = this.getAttribute("anim-type");

        if (type == "loop")
        {
            this.time += 1;
            if (this.time > (this.spline.points.length * 100)) {
                this.time = 0;
            } else {
                this.SetAnimTime(this.time / (this.spline.points.length * 100));
            }
        }
        else if (type == "ping-pong") 
        {
            this.time += this.incrementTime;
            if (this.time > (this.spline.points.length * 100)) {
                this.incrementTime = -1;
            } else if (this.time <= 0) {
                this.incrementTime = 1;
            }

            this.SetAnimTime(this.time / (this.spline.points.length * 100));
        }
    }

    animate() {
        requestAnimationFrame(this.animate.bind(this));

        if (this.inAnime) {
            this.updateAnim();
        }
    }
}
class PositionAnimation extends Animation {
    constructor() {
        super();

        this.spline = new THREE.CatmullRomCurve3();;
        this.camPosIndex = 0;
    }

    SetAnimTime(time) {
        var objPos = this.spline.getPoint(time);

        this.parentElement.setAttribute(
            "pos",
              objPos.x.toString() + " "
            + objPos.y.toString() + " "
            + objPos.z.toString()
        );
    }

    Play() {
        this.inAnime = true;
    }
    Pause() {
        this.inAnime = false;
    }
    Stop() {
        this.inAnime = false;
        this.parent.setAttribute("pos", "0 0 0");
    }

    connectedCallback() {
        this.parentElement.anim.push(this);

        this.hasAttribute("start-pos") ? this.setAttribute("start-pos", this.getAttribute("start-pos")) : this.setAttribute("start-pos", "0 0 0");
        this.hasAttribute("end-pos")   ? this.setAttribute("end-pos",   this.getAttribute("end-pos"))   : this.setAttribute("end-pos",   "0 90 0");

        this.spline.points.push(new THREE.Vector3(
            Number(this.getAttribute("start-pos").split(' ')[0]),
            Number(this.getAttribute("start-pos").split(' ')[1]),
            Number(this.getAttribute("start-pos").split(' ')[2])
        ));

        this.spline.points.push(new THREE.Vector3(
            Number(this.getAttribute("end-pos").split(' ')[0]),
            Number(this.getAttribute("end-pos").split(' ')[1]),
            Number(this.getAttribute("end-pos").split(' ')[2])
        ));

        this.SetAnimTime(this.getAttribute("start-time"));
        this.animate();
    }

    updateAnim() {
        var type = this.getAttribute("anim-type");
        console.log(type);

        if (type == "loop")
        {
            this.time += this.incrementTime;
            if (this.time > (this.spline.points.length * 100)) {
                this.time = 0;
            } else {
                this.SetAnimTime(this.time / (this.spline.points.length * 100));
            }
        }
        else if (type == "ping-pong") 
        {   
            this.time += this.incrementTime;
            if (this.time > (this.spline.points.length * 100)) {
                this.incrementTime = -1;
            } else if (this.time <= 0) {
                this.incrementTime = 1;
            }

            this.SetAnimTime(this.time / (this.spline.points.length * 100));
        }
    }

    animate() {
        requestAnimationFrame(this.animate.bind(this));

        if (this.inAnime) {
            this.updateAnim();
        }
    }
}
class ScaleAnimation extends Animation {
    constructor() {
        super();

        this.spline = new THREE.CatmullRomCurve3();;
        this.camPosIndex = 0;
    }

    SetAnimTime(time) {
        var objSca = this.spline.getPoint(time);

        this.parent.setAttribute(
            "sca",
              objSca.x.toString() + " "
            + objSca.y.toString() + " "
            + objSca.z.toString()
        );
    }

    Play() {
        this.inAnime = true;
    }
    Pause() {
        this.inAnime = false;
    }
    Stop() {
        this.inAnime = false;
        this.parent.setAttribute("sca", this.getAttribute("start-sca"));
    }

    connectedCallback() {
        this.parent = this.parentElement;

        console.log(this.parent);
        this.parentElement.anim.push(this);

        this.hasAttribute("start-sca") ? this.setAttribute("start-sca", this.getAttribute("start-sca")) : this.setAttribute("start-sca", "0.1 0.1 0.1");
        this.hasAttribute("end-sca")   ? this.setAttribute("end-sca",   this.getAttribute("end-sca"))   : this.setAttribute("end-sca",   "1 1 1");

        this.spline.points.push(new THREE.Vector3(
            Number(this.getAttribute("start-sca").split(' ')[0]),
            Number(this.getAttribute("start-sca").split(' ')[1]),
            Number(this.getAttribute("start-sca").split(' ')[2])
        ));

        this.spline.points.push(new THREE.Vector3(
            Number(this.getAttribute("end-sca").split(' ')[0]),
            Number(this.getAttribute("end-sca").split(' ')[1]),
            Number(this.getAttribute("end-sca").split(' ')[2])
        ));

        this.SetAnimTime(this.getAttribute("start-time"));
        this.animate();
    }

    updateAnim() {
        var type = this.getAttribute("anim-type");

        if (type == "loop")
        {
            this.time += this.incrementTime;
            if (this.time > (this.spline.points.length * 100)) {
                this.time = 0;
            } else {
                this.SetAnimTime(this.time / (this.spline.points.length * 100));
            }
        }
        else if (type == "ping-pong") 
        {
            this.time += this.incrementTime;
            if (this.time > (this.spline.points.length * 100)) {
                this.incrementTime = -1;
            } else if (this.time <= 0) {
                this.incrementTime = 1;
            }

            this.SetAnimTime(this.time / (this.spline.points.length * 100));
        }
    }

    animate() {
        requestAnimationFrame(this.animate.bind(this));
        if (this.inAnime) {
            this.updateAnim();
        }
    }
}


class RotateAnimationScroll extends Animation {
    constructor() {
        super();

        this.spline = new THREE.CatmullRomCurve3();;
        this.camPosIndex = 0;
    }

    SetAnimTime(time) {
        var objRot = this.spline.getPoint(time);

        this.parent.setAttribute(
            "rot",
              (objRot.x * (Math.PI / 180)).toString() + " "
            + (objRot.y * (Math.PI / 180)).toString() + " "
            + (objRot.z * (Math.PI / 180)).toString()
        );
    }

    Play() {
        this.inAnime = true;
    }
    Pause() {
        this.inAnime = false;
    }
    Stop() {
        this.inAnime = false;
        this.parent.setAttribute("rot", "0 0 0");
    }

    connectedCallback() {
        this.parentElement.anim.push(this);
        this.parent = this.parentElement;

        this.hasAttribute("start-rot") ? this.setAttribute("start-rot", this.getAttribute("start-rot")) : this.setAttribute("start-rot", "0 0 0");
        this.hasAttribute("end-rot")   ? this.setAttribute("end-rot",   this.getAttribute("end-rot"))   : this.setAttribute("end-rot",   "1 1 1");

        this.hasAttribute("start-scroll") ? this.setAttribute("start-scroll", this.getAttribute("start-scroll")) : this.setAttribute("start-scroll", 40);
        this.hasAttribute("end-scroll")   ? this.setAttribute("end-scroll",   this.getAttribute("end-scroll"))   : this.setAttribute("end-scroll", 150);

        this.spline.points.push(new THREE.Vector3(
            Number(this.getAttribute("start-rot").split(' ')[0]),
            Number(this.getAttribute("start-rot").split(' ')[1]),
            Number(this.getAttribute("start-rot").split(' ')[2])
        ));

        this.spline.points.push(new THREE.Vector3(
            Number(this.getAttribute("end-rot").split(' ')[0]),
            Number(this.getAttribute("end-rot").split(' ')[1]),
            Number(this.getAttribute("end-rot").split(' ')[2])
        ));

        this.SetAnimTime(this.getAttribute("start-time"));

        addEventListener("camRailChangePosition", (event) => {

            const scrollY = event.detail.camPosIndex;

            this.SetAnimTime(this.clamp(this.map_range(scrollY, this.getAttribute("end-scroll"), this.getAttribute("start-scroll"), 1, 0), 0, 1));
        })
    }
}
class PositionAnimationScroll extends Animation {
    constructor() {
        super();

        this.spline = new THREE.CatmullRomCurve3();;
        this.camPosIndex = 0;
    }

    SetAnimTime(time) {
        var objPos = this.spline.getPoint(time);

        this.parent.setAttribute(
            "pos",
              objPos.x.toString() + " "
            + objPos.y.toString() + " "
            + objPos.z.toString()
        );
    }

    Play() {
        this.inAnime = true;
    }
    Pause() {
        this.inAnime = false;
    }
    Stop() {
        this.inAnime = false;
        this.parent.setAttribute("pos", "0 0 0");
    }

    connectedCallback() {
        this.parentElement.anim.push(this);
        this.parent = this.parentElement;

        this.hasAttribute("start-pos") ? this.setAttribute("start-pos", this.getAttribute("start-pos")) : this.setAttribute("start-pos", "0 0 0");
        this.hasAttribute("end-pos")   ? this.setAttribute("end-pos",   this.getAttribute("end-pos"))   : this.setAttribute("end-pos",   "1 1 1");

        this.hasAttribute("start-scroll") ? this.setAttribute("start-scroll", this.getAttribute("start-scroll")) : this.setAttribute("start-scroll", 40);
        this.hasAttribute("end-scroll")   ? this.setAttribute("end-scroll",   this.getAttribute("end-scroll"))   : this.setAttribute("end-scroll", 150);

        this.spline.points.push(new THREE.Vector3(
            Number(this.getAttribute("start-pos").split(' ')[0]),
            Number(this.getAttribute("start-pos").split(' ')[1]),
            Number(this.getAttribute("start-pos").split(' ')[2])
        ));

        this.spline.points.push(new THREE.Vector3(
            Number(this.getAttribute("end-pos").split(' ')[0]),
            Number(this.getAttribute("end-pos").split(' ')[1]),
            Number(this.getAttribute("end-pos").split(' ')[2])
        ));

        this.SetAnimTime(this.getAttribute("start-time"));

        addEventListener("camRailChangePosition", (event) => {

            const scrollY = event.detail.camPosIndex;

            this.SetAnimTime(this.clamp(this.map_range(scrollY, this.getAttribute("end-scroll"), this.getAttribute("start-scroll"), 1, 0), 0, 1));
        })
    }
}
class ScaleAnimationScroll extends Animation {
    constructor() {
        super();

        this.spline = new THREE.CatmullRomCurve3();;
        this.camPosIndex = 0;
    }

    SetAnimTime(time) {
        var objPos = this.spline.getPoint(time);

        this.parent.setAttribute(
            "sca",
              objPos.x.toString() + " "
            + objPos.y.toString() + " "
            + objPos.z.toString()
        );
    }

    Play() {
        this.inAnime = true;
    }
    Pause() {
        this.inAnime = false;
    }
    Stop() {
        this.inAnime = false;
        this.parent.setAttribute("sca", "0 0 0");
    }

    connectedCallback() {
        this.parentElement.anim.push(this);
        this.parent = this.parentElement;

        this.hasAttribute("start-sca") ? this.setAttribute("start-sca", this.getAttribute("start-sca")) : this.setAttribute("start-sca", "0 0 0");
        this.hasAttribute("end-sca")   ? this.setAttribute("end-sca",   this.getAttribute("end-sca"))   : this.setAttribute("end-sca",   "1 1 1");

        this.hasAttribute("start-scroll") ? this.setAttribute("start-scroll", this.getAttribute("start-scroll")) : this.setAttribute("start-scroll", 40);
        this.hasAttribute("end-scroll")   ? this.setAttribute("end-scroll",   this.getAttribute("end-scroll"))   : this.setAttribute("end-scroll", 150);

        this.spline.points.push(new THREE.Vector3(
            Number(this.getAttribute("start-sca").split(' ')[0]),
            Number(this.getAttribute("start-sca").split(' ')[1]),
            Number(this.getAttribute("start-sca").split(' ')[2])
        ));

        this.spline.points.push(new THREE.Vector3(
            Number(this.getAttribute("end-sca").split(' ')[0]),
            Number(this.getAttribute("end-sca").split(' ')[1]),
            Number(this.getAttribute("end-sca").split(' ')[2])
        ));

        this.SetAnimTime(this.getAttribute("start-time"));

        addEventListener("camRailChangePosition", (event) => {

            const scrollY = event.detail.camPosIndex;

            this.SetAnimTime(this.clamp(this.map_range(scrollY, this.getAttribute("end-scroll"), this.getAttribute("start-scroll"), 1, 0), 0, 1));
        })
    }
}


class ModelAnimation extends Animation {
    constructor() {
        super();

        this.mixer;
        this.gltf;

        this.anim;
    }

    SetAnimTime(time) {
        this.anim.time = time;
    }

    Play() {
        console.log("start");
        this.inAnime = true;
    }
    Pause() {
        console.log("pause");
        this.inAnime = false;
    }
    Stop() {
        this.inAnime = false;
        this.anim.time = 0;
    }

    connectedCallback() {

        this.parentElement.anim.push(this);

        this.parentElement.onModelLoad = () => {

            this.mixer = this.parentElement.classModel.mixer;
            this.gltf  = this.parentElement.classModel.gltf;
    
            this.hasAttribute("anim-name") ? this.setAttribute("anim-name", this.getAttribute("anim-name")) : this.setAttribute("anim-name", "");
    
            let clip = THREE.AnimationClip.findByName( this.gltf.animations, this.getAttribute("anim-name") );
            this.anim = this.mixer.clipAction(clip);

            this.anim.play();
            this.SetAnimTime(this.getAttribute("start-time"));
            this.anim.paused = true;

            this.animate();
        }
    }

    updateAnim() {
        var type = this.getAttribute("anim-type");

        if (type == "loop")
        {
            this.time += 1;
            if (this.time > (this.anim._clip.duration * 100)) {
                this.time = 0;
            } else {
                this.SetAnimTime(this.time / (this.anim._clip.duration * 100));
            }
        }
        else if (type == "ping-pong")
        {
            this.time += this.incrementTime;
            if (this.time > (this.anim._clip.duration * 100)) {
                this.incrementTime = -1;
            } else if (this.time <= 0) {
                this.incrementTime = 1;
            }

            this.SetAnimTime(this.time / (this.anim._clip.duration * 100));
        }
    }

    animate() {
       requestAnimationFrame(this.animate.bind(this));

       if (this.inAnime) {
        this.updateAnim();
       }
    }
}
class ModelAnimationScroll extends Animation {
    constructor() {
        super();
    }

    connectedCallback() {

        this.parentElement.anim.push(this);

        this.hasAttribute("start-scroll") ? this.setAttribute("start-scroll", this.getAttribute("start-scroll")) : this.setAttribute("start-scroll", 40);
        this.hasAttribute("end-scroll")   ? this.setAttribute("end-scroll",   this.getAttribute("end-scroll"))   : this.setAttribute("end-scroll", 150);

        addEventListener("camRailChangePosition", (event) => {

            const scrollY = event.detail.camPosIndex;

            this.SetAnimTime(this.clamp(this.map_range(scrollY, this.getAttribute("end-scroll"), this.getAttribute("start-scroll"), 1, 0), 0, 1));
        })
    }
}


customElements.define("anim-rotate",   RotateAnimation);
customElements.define("anim-position", PositionAnimation);
customElements.define("anim-scale",    ScaleAnimation);

customElements.define("anim-rotate-scroll",   RotateAnimationScroll);
customElements.define("anim-position-scroll", PositionAnimationScroll);
customElements.define("anim-scale-scroll",    ScaleAnimationScroll);

customElements.define("anim-model",        ModelAnimation);
customElements.define("anim-model-scroll", ModelAnimationScroll);

export {
     RotateAnimation, PositionAnimation, ScaleAnimation,
     RotateAnimationScroll, PositionAnimationScroll, ScaleAnimationScroll,
     ModelAnimation
}