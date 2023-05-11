import * as THREE from 'three';

class Controler extends HTMLElement {
    constructor() {
        super();

        this.raycaster;
        this.pointer;
        this.element;

        window.addEventListener( 'pointermove', this.onPointerMove.bind(this) );
        window.addEventListener( 'click', this.click.bind(this) );
    }

    connectedCallback() {
        this.parentElement._controler = this;

        this.pointer   = new THREE.Vector2();
        this.raycaster = new THREE.Raycaster();
    }

    onPointerMove( event ) {
        this.pointer.x =  ( event.clientX / window.innerWidth  ) * 2 - 1;
        this.pointer.y = -( event.clientY / window.innerHeight ) * 2 + 1;
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
}

customElements.define("control-p", Controler);

export { Controler }