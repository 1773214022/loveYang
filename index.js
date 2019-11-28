class ThreeDWorld {
    constructor(canvasContainer) {
        // canvas容器
        this.container = canvasContainer || document.body;
        // 创建场景
        this.createScene();

        // 性能监控插件
        this.initStats();
        // 物体添加
        this.addObjs();
        // 轨道控制插件（鼠标拖拽视角、缩放等）
        this.orbitControls = new THREE.OrbitControls(this.camera);
        // this.orbitControls.autoRotate = true;
        // 循环更新场景
        this.update();
    }
    createScene() {
        this.HEIGHT = window.innerHeight;
        this.WIDTH = window.innerWidth;
        // 创建场景
        this.scene = new THREE.Scene();
        // 在场景中添加雾的效果，参数分别代表‘雾的颜色’、‘开始雾化的视线距离’、刚好雾化至看不见的视线距离’
        this.scene.fog = new THREE.Fog(0x090918, 1, 600);
        // 创建相机
        let aspectRatio = this.WIDTH / this.HEIGHT;
        let fieldOfView = 60;
        let nearPlane = 1;
        let farPlane = 10000;
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
        this.camera.position.z = 150;
        this.camera.position.y = 0;
        // 创建渲染器
        this.renderer = new THREE.WebGLRenderer({
            // 在 css 中设置背景色透明显示渐变色
            alpha: true,
            // 开启抗锯齿
            antialias: true
        });
        // 渲染背景颜色同雾化的颜色
        this.renderer.setClearColor(this.scene.fog.color);
        // 定义渲染器的尺寸；在这里它会填满整个屏幕
        this.renderer.setSize(this.WIDTH, this.HEIGHT);

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
        this.container.appendChild(this.stats.domElement);
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
    addObjs() {
        var loader = new THREE.FontLoader();
        loader.load('LESLIE.json', (font) => {
            var geometrys = new Array(10)
            for(var i = 0; i < 10; i++){
                geometrys[i] = new THREE.TextGeometry(String.fromCharCode(48 + i), {
                    font: font,
                    size: 64,
                    height: 8
                })
            }
            // var meshMaterial = new THREE.MeshNormalMaterial({
            //     flatShading: THREE.FlatShading,
            //     transparent: true,
            //     opacity: 0.9
            // });
            // var mesh = new THREE.Mesh(helloGeometry, meshMaterial);
            // this.scene.add(mesh);
            this.addPartices(geometrys);
        })
    }

    fillMeshToFloat32Array(geometry, count) {
        var mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ color: 0xffff00, side: THREE.DoubleSide }));
        var result = new Float32Array(count * 3)
        var raycaster = new THREE.Raycaster()
        mesh.geometry.computeBoundingBox()
        var boundingBox = mesh.geometry.boundingBox
        while (count >= 0) {
            var point = this.randomVector3(boundingBox.min, boundingBox.max)
            raycaster.set(point, new THREE.Vector3(1, 1, 1))
            var intersectsOne = raycaster.intersectObject(mesh)
            raycaster.set(point, new THREE.Vector3(-1, -1, -1))
            var intersectsTow = raycaster.intersectObject(mesh)
            if (intersectsOne.length % 2 === 1 || intersectsTow.length % 2 === 1) { // Points is in objet
                count--;
                result[count * 3] = point.x;
                result[count * 3 + 1] = point.y;
                result[count * 3 + 2] = point.z;
            }
        }
        return result;
    }

    randomVector3(min, max) {
        const result = new THREE.Vector3()
        result.x = min.x + (max.x - min.x) * Math.random()
        result.y = min.y + (max.y - min.y) * Math.random()
        result.z = min.z + (max.z - min.z) * Math.random()
        return result;
    }

    // 粒子变换
    addPartices(geometrys) {
        // 着色器材料
        let shaderMaterial = new THREE.ShaderMaterial({
            uniforms:{
                time: {
                    type:'f',value: 0.2
                },
                number: {
                    type:'i',value: 0
                }
            },
            vertexShader: document.getElementById('vertexshader').textContent,
            fragmentShader: document.getElementById('fragmentshader').textContent,
            blending: THREE.AdditiveBlending,
            depthTest: false,
            transparent: true
        });
        var bufferGeometry = new THREE.BufferGeometry();
        for(var i = 0; i < 10; i++){
            var vertexs = this.fillMeshToFloat32Array(geometrys[i], 3000);
            if(i == 0){
                bufferGeometry.addAttribute('position', new THREE.BufferAttribute(vertexs, 3));
            }
            bufferGeometry.addAttribute('p' + i, new THREE.BufferAttribute(vertexs, 3));
        }
        // 创建粒子系统
        let particleSystem = new THREE.Points(bufferGeometry, shaderMaterial);
        this.scene.add(particleSystem);
        this.particleSystem = particleSystem;
    }
    update() {
        this.stats.update();
        if(this.particleSystem){
            this.particleSystem.material.uniforms.time.value = Date.now() % 1000 / 1000
            this.particleSystem.material.uniforms.number.value = Math.floor(Date.now() / 1000) % 10
        }
        this.renderer.render(this.scene, this.camera);
        requestAnimationFrame(() => {
            this.update()
        });
    }
}

function onLoad() {
    new ThreeDWorld(document.getElementById("world"));
}