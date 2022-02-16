import * as THREE from 'three';
import Stats from 'stats.js';
import css from './index.css';
import BezierEasing from 'bezier-easing'
import {FontLoader} from 'three/examples/jsm/loaders/FontLoader.js';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {TextGeometry} from 'three/examples/jsm/geometries/TextGeometry.js';
import MainVert from './main.vert';
import MainFrag from './main.frag';
import Avatar from './avatar';
import Effect from "./effect";
import EffectNumber from "./effect-number";

class LoveEffectThreeWorld {
    constructor(canvasContainer) {
        this.container = canvasContainer || document.body;
        // 创建场景
        this.createScene();

        // 性能监控插件
        this.initStats();
        // 物体添加
        // this.initNumbers();
        // this.number = new EffectNumber(this.scene)
        // this.avatar = new Avatar(this.scene)
        this.initNumbersWithCache();
        // 轨道控制插件（鼠标拖拽视角、缩放等）
        this.orbitControls = new OrbitControls(this.camera, this.container);
        this.orbitControls.maxDistance = 1000;
        this.orbitControls.minDistance = 100;
        this.cubic = BezierEasing(0.25, 0.0, 0.25, 1.0);
        // 循环更新场景
        this.update();
    }

    createScene() {
        this.HEIGHT = window.innerHeight;
        this.WIDTH = window.innerWidth;
        // 创建场景
        this.scene = new THREE.Scene();
        var dirLight = new THREE.PointLight(0xffffff, 3, 400);
        dirLight.position.set(100, 100, 100);
        this.scene.add(dirLight);

        // 创建相机
        let aspectRatio = this.WIDTH / this.HEIGHT;
        let nearPlane = 1;
        let farPlane = 2000;
        let fieldOfView = 45;
        /**
         * PerspectiveCamera 透视相机
         * @param fieldOfView 视角
         * @param aspectRatio 纵横比
         * @param nearPlane 近平面
         * @param farPlane 远平面
         */
        this.camera = new THREE.PerspectiveCamera(
            fieldOfView,
            aspectRatio,
            nearPlane,
            farPlane
        );

        // 设置相机的位置
        this.camera.position.x = 0;
        this.camera.position.z = 900;
        this.camera.position.y = 0;
        // 创建渲染器
        this.renderer = new THREE.WebGLRenderer({
            // 在 css 中设置背景色透明显示渐变色
            alpha: true,
            // 开启抗锯齿
            antialias: true
        });
        // 黑色背景
        this.renderer.setClearColor(0x000000);
        // 定义渲染器的尺寸；在这里它会填满整个屏幕
        this.renderer.setSize(this.WIDTH, this.HEIGHT);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        // 打开渲染器的阴影地图
        this.renderer.shadowMap.enabled = true;
        // this.renderer.shadowMapSoft = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
        // 在 HTML 创建的容器中添加渲染器的 DOM 元素
        this.container.appendChild(this.renderer.domElement);
        // 监听屏幕，缩放屏幕更新相机和渲染器的尺寸
        window.addEventListener('resize', this.handleWindowResize.bind(this), false);
    }
    initStats() {
        this.stats = new Stats();
        // 将性能监控屏区显示在左上角
        this.stats.domElement.style.position = 'absolute';
        this.stats.domElement.style.bottom = '0px';
        this.stats.domElement.style.zIndex = 100;
        this.statsPanel = 0;
        this.container.appendChild(this.stats.domElement);
        setInterval(() => {
            this.statsPanel++;
            if(this.statsPanel > 2){
                this.statsPanel = 0;
            }
            this.stats.showPanel(this.statsPanel)
        }, 3000) 
    }
    handleWindowResize() {
        // 更新渲染器的高度和宽度以及相机的纵横比
        this.HEIGHT = window.innerHeight;
        this.WIDTH = window.innerWidth;
        this.renderer.setSize(this.WIDTH, this.HEIGHT);
        this.camera.aspect = this.WIDTH / this.HEIGHT;
        this.camera.updateProjectionMatrix();
    }
    // 模型加入场景
    initNumbers() {
        const loader = new FontLoader();
        loader.load('/static/LESLIE.json', (font) => {
            const geometries = new Array(12);
            for(let i = 0; i < 10; i++){
                geometries[i] = new TextGeometry(String.fromCharCode(48 + i), {
                    font: font,
                    size: 64,
                    height: 8
                })
            }
            geometries[10] = new TextGeometry(':', {
                font: font,
                size: 64,
                height: 8
            })
            geometries[11] = new TextGeometry('X', {
                font: font,
                size: 64,
                height: 8
            })
            this.initNumbersWithGeometries(geometries);
        })
    }

    // 粒子变换
    initNumbersWithGeometries(geometries) {
        // 着色器材料
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
        const bufferGeometry = new THREE.BufferGeometry();
        const numberVertexes = new Float32Array(geometries.length * 1000 * 3)
        for(let i = 0; i < geometries.length; i++){
            console.log("Fill Mesh Use Raycaster Process: ", i);
            const vertexes = Effect.fillMeshByRayCaster(geometries[i], 1000);
            if(i === 11){
                // 以 X 作为 Base
                bufferGeometry.setAttribute('position', new THREE.BufferAttribute(vertexes, 3));
            }
            bufferGeometry.setAttribute('p' + i, new THREE.BufferAttribute(vertexes, 3));
            for (let j = 0; j < 1000 * 3; j++) {
                numberVertexes[i * 1000 * 3 + j] = vertexes[j];
            }
        }
        Effect.downloadFileByBlob(URL.createObjectURL(new Blob([numberVertexes.buffer])), "numbers.bin")
        this.numbers = new Array(14);
        for(let i = 0; i < 8; i++){
            this.numbers[i] = new THREE.Points(bufferGeometry, shaderMaterial.clone());
            this.numbers[i].translateY(-64);
            this.numbers[i].translateX(-48 * (i - 4));
            this.scene.add(this.numbers[i]);
        }
        for(let i = 0; i < 6; i++){
            this.numbers[i + 8] = new THREE.Points(bufferGeometry, shaderMaterial.clone());
            this.numbers[i + 8].translateY(24);
            this.numbers[i + 8].translateX(-48 * (i - 3));
            this.scene.add(this.numbers[i + 8]);
        }
    }

    initNumbersWithCache(){
        this.numbers = new Array(14);
        for(let i = 0; i < 6; i++){
            if (i !== 0){
                this.numbers[i + 8] = new EffectNumber(this.scene);
                this.numbers[i + 8].load(-48 * (i - 3) - 24, 24);
            }
        }
        for(let i = 0; i < 8; i++){
            this.numbers[i] = new EffectNumber(this.scene)
            if (i === 2 || i === 5){
                this.numbers[i].load(-48 * (i - 3) + 18, -64)
            } else {
                this.numbers[i].load(-48 * (i - 3), -64)
            }
        }
    }

    update() {
        this.stats.begin();
        if(this.numbers){
            let now = new Date().getTime() - new Date('2012.11.22').getTime()
            let currentSecond = Math.floor(now / 1000)
            let secondProcess = now % 1000 / 1000
            let currentNumbers = this.solveNumbers(currentSecond)
            let nextNumbers = this.solveNumbers(currentSecond + 1)
            for(let i = 0; i < 14; i++){
                if (currentNumbers[i] != null){
                    this.numbers[i].update(now % 1000000 / 1000, this.cubic(secondProcess), currentNumbers[i], nextNumbers[i])
                }
            }
        }
        this.renderer.render(this.scene, this.camera);
        this.stats.end();
        requestAnimationFrame(() => {
            this.update()
        });
    }
    solveNumbers(second){
        let day = Math.floor(second / 24 / 60 / 60)
        let secondOfDay = second % (24 * 60 * 60)
        let hourOfDay = Math.floor(secondOfDay / 60 / 60)
        let secondOfHour = secondOfDay % (60 * 60)
        let minuteOfHour = Math.floor(secondOfHour / 60)
        let secondOfMinute = secondOfHour % 60
        let result = new Array(14);
        result[0] = secondOfMinute % 10
        result[1] = Math.floor(secondOfMinute / 10)
        result[2] = 10;
        result[3] = minuteOfHour % 10
        result[4] = Math.floor(minuteOfHour / 10)
        result[5] = 10;
        result[6] = hourOfDay % 10
        result[7] = Math.floor(hourOfDay / 10)
        result[8] = null;
        result[13] = Math.floor(day / 10000) % 10
        result[12] = Math.floor(day / 1000) % 10
        result[11] = Math.floor(day / 100) % 10
        result[10] = Math.floor(day / 10) % 10
        result[9] = day % 10
        return result;
    }
}

const world = new LoveEffectThreeWorld(document.body);