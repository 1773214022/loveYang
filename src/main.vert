uniform float time;
varying float opacity;

void main() {
	vec3 targetPosition = position;
	gl_Position = projectionMatrix * modelViewMatrix * vec4(targetPosition, 1.0);
	gl_PointSize = 800.0 / gl_Position.z;
	opacity = sin(targetPosition.x * 0.1 + targetPosition.y * 0.1 + time);
}