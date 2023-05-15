import * as THREE from 'three';

class Controler extends HTMLElement {
    constructor() {
        super();

        this.raycaster;
        this.pointer;
        this.element;

        this.initialY = null;
        this.diffY;
        this.onSweep = false;

        window.addEventListener( 'pointermove', this.onPointerMove.bind(this) );
        window.addEventListener( 'click', this.click.bind(this) );

        addEventListener("touchstart", this.startTouch.bind(this));
        addEventListener("touchend",   this.endTouch.bind(this));
        addEventListener("touchmove",  this.moveTouch.bind(this));
    }

    connectedCallback() {
        this.parentElement._controler = this;

        this.pointer   = new THREE.Vector2();
        this.raycaster = new THREE.Raycaster();

        this.animate();
    }

    onPointerMove( event ) {
        this.pointer.x =  ( event.clientX / window.innerWidth  ) * 2 - 1;
        this.pointer.y = -( event.clientY / window.innerHeight ) * 2 + 1;
    }

    endTouch(e) {
        this.onSweep = false;
    }

    startTouch(e) {
        this.initialY = e.touches[0].clientY;
        this.onSweep = true;
    }
    
    moveTouch(e) {

        let currentY = e.touches[0].clientY;
        this.diffY = this.initialY - currentY;
    } 

    update() {
        
        this.raycaster.setFromCamera( this.pointer, this.parentElement.camera );

        const intersects = this.raycaster.intersectObjects( this.parentElement.scene.children );

        for ( let i = 0; i < intersects.length; i ++ ) {

            const _name = intersects[ i ].object.name;
            this.element = document.getElementsByName(_name);

            if (this.element != null)
            {
                this.element[0].hover();
                this.element = null;
            }
        }
    }

    click() {

        this.raycaster.setFromCamera( this.pointer, this.parentElement.camera );

        const intersects = this.raycaster.intersectObjects( this.parentElement.scene.children );

        for ( let i = 0; i < intersects.length; i ++ ) {

            const _name = intersects[ i ].object.name;
            this.element = document.getElementsByName(_name);

            if (this.element != null)
            {
                this.element[0].click();
                this.element = null;
            }
        }
    }

    animate() {
        requestAnimationFrame(this.animate.bind(this));

        if (this.onSweep) {
            const _event = new CustomEvent("sweep", {
                detail: {
                    deltaY: this.diffY
                }
            });
            // console.log("dispatch");

            dispatchEvent(_event);
        }
    }
}

customElements.define("control-p", Controler);

export { Controler }