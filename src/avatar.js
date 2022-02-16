import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import Effect from "./effect";
import MainVert from "./main.vert";
import MainFrag from "./main.frag";



export default class Avatar {
    constructor(scene) {
        this.scene = scene;
        this.loader = new GLTFLoader();
        this.loader.load('static/falcon_bird_pubg/scene.gltf', (gltf) => {
            console.log(gltf)
            gltf.scene.scale.set(200, 200, 200)
            gltf.scene.position.set(0,0,0)
            const geometry = gltf.scene.getObjectByName('Object_4').geometry;
            const bufferGeometry = new THREE.BufferGeometry();
            const vertexes = Effect.fillMeshByRayCaster(geometry, 100);
            bufferGeometry.setAttribute('position', new THREE.BufferAttribute(vertexes, 3));
            let shaderMaterial = new THREE.ShaderMaterial({
                uniforms:{
                    time: {
                        type:'f',value: 0.0
                    },
                    process: {
                        type:'f',value: 0.0
                    },
                    current: {
                        type:'i',value: 0
                    },
                    next: {
                        type:'i',value: 0
                    }
                },
                vertexShader: MainVert,
                fragmentShader: MainFrag,
                blending: THREE.AdditiveBlending,
                depthTest: false,
                transparent: true
            });
            this.scene.add(new THREE.Points(bufferGeometry, shaderMaterial))
        })
        // const geometry = new THREE.BoxGeometry();
        // const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
        // const cube = new THREE.Mesh( geometry, material );
        // cube.scale.set(100, 100, 100)
        // scene.add( cube );
    }
}