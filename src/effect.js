import * as THREE from "three"

export default class Effect {

    static fillMeshByRayCaster(geometry, count) {
        const mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({color: 0xFFFFFF, side: THREE.DoubleSide}));
        const result = new Float32Array(count * 3);
        const rayCaster = new THREE.Raycaster();
        mesh.geometry.computeBoundingBox()
        const boundingBox = mesh.geometry.boundingBox;
        while (count >= 0) {
            const point = Effect.randomVector3(boundingBox.min, boundingBox.max);
            rayCaster.set(point, new THREE.Vector3(1, 1, 1))
            const intersectsOne = rayCaster.intersectObject(mesh);
            rayCaster.set(point, new THREE.Vector3(-1, -1, -1))
            const intersectsTow = rayCaster.intersectObject(mesh);
            if (intersectsOne.length % 2 === 1 || intersectsTow.length % 2 === 1) { // Points is in objet
                count--;
                result[count * 3] = point.x;
                result[count * 3 + 1] = point.y;
                result[count * 3 + 2] = point.z;
            }
        }
        return result;
    }

    static randomVector3(min, max) {
        const result = new THREE.Vector3()
        result.x = min.x + (max.x - min.x) * Math.random()
        result.y = min.y + (max.y - min.y) * Math.random()
        result.z = min.z + (max.z - min.z) * Math.random()
        return result;
    }

    static downloadFileByBlob(blobUrl, filename) {
        const eleLink = document.createElement('a')
        eleLink.download = filename
        eleLink.style.display = 'none'
        eleLink.href = blobUrl
        // 触发点击
        document.body.appendChild(eleLink)
        eleLink.click()
        // 然后移除
        document.body.removeChild(eleLink)
    }
}