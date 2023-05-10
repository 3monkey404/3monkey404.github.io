import * as THREE from 'three';

class Animation extends HTMLElement {
    constructor() {
        super();

        this.incrementTime = 1;
        this.time = 0;
        this.parent;
        this.inAnime = true;

        this.hasAttribute("trigger")   ? this.setAttribute("trigger",   this.getAttribute("trigger"))   : this.setAttribute("trigger",   "");
        this.hasAttribute("anim-type") ? this.setAttribute("anim-type", this.getAttribute("anim-type")) : this.setAttribute("anim-type", "ping-pong")
    }

    SetAnimTime(time) { }

    Play() { }
    Pause() { }
    Stop() { }
}

class RotateAnimation extends Animation {
    constructor() {
        super();

        this.spline = new THREE.CatmullRomCurve3();;
        this.camPosIndex = 0;
    }

    SetAnimTime(time) {
        console.log(time);
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

        this.animate();
    }

    animate() {
        requestAnimationFrame(this.animate.bind(this));

        var type = this.getAttribute("anim-type");

        if (this.inAnime) {
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
    }
}
class PositionAnimation extends Animation {
    constructor() {
        super();

        this.spline = new THREE.CatmullRomCurve3();;
        this.camPosIndex = 0;
    }

    SetAnimTime(time) {
        console.log(time);
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
        this.parent = this.parentElement;

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

        this.animate();
    }

    animate() {
        requestAnimationFrame(this.animate.bind(this));

        var type = this.getAttribute("anim-type");

        if (this.inAnime) {
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
    }
}
class ScaleAnimation extends Animation {
    constructor() {
        super();

        this.spline = new THREE.CatmullRomCurve3();;
        this.camPosIndex = 0;
    }

    SetAnimTime(time) {
        console.log(time);
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
        this.parent.setAttribute("sca", "0 0 0");
    }

    connectedCallback() {
        this.parent = this.parentElement;

        this.hasAttribute("start-sca") ? this.setAttribute("start-sca", this.getAttribute("start-sca")) : this.setAttribute("start-sca", "0 0 0");
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

        this.animate();
    }

    animate() {
        requestAnimationFrame(this.animate.bind(this));

        var type = this.getAttribute("anim-type");

        if (this.inAnime) {
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
    }
}

customElements.define("anim-rotate",   RotateAnimation);
customElements.define("anim-position", PositionAnimation);
customElements.define("anim-scale",    ScaleAnimation);

export { RotateAnimation, PositionAnimation, ScaleAnimation }