uniform int next;
uniform int current;
uniform float time;
uniform float process;
varying float opacity;
attribute vec3 p0;
attribute vec3 p1;
attribute vec3 p2;
attribute vec3 p3;
attribute vec3 p4;
attribute vec3 p5;
attribute vec3 p6;
attribute vec3 p7;
attribute vec3 p8;
attribute vec3 p9;
attribute vec3 p10;
attribute vec3 p11;

vec3 resolvePosition(int i) {
	if(i == 0) {
		return p0;
	} else if(i == 1) {
		return p1;
	} else if(i == 2) {
		return p2;
	} else if(i == 3) {
		return p3;
	} else if(i == 4) {
		return p4;
	} else if(i == 5) {
		return p5;
	} else if(i == 6) {
		return p6;
	} else if(i == 7) {
		return p7;
	} else if(i == 8) {
		return p8;
	} else if(i == 9) {
		return p9;
	} else if(i == 10) {
		return p10;
	} else if(i == 11) {
		return p11;
	} else {
		return p0;
	}
}

void main() {
	vec3 currentPosition = resolvePosition(current);
	vec3 nextPosition = resolvePosition(next);
	vec3 targetPosition = currentPosition * (1.0 - process) + nextPosition * process;
	gl_Position = projectionMatrix * modelViewMatrix * vec4(targetPosition, 1.0);
	gl_PointSize = 800.0 / gl_Position.z * sin(position.y + time * 3.14 * 2.0);
	opacity = sin(targetPosition.x * 0.1 + targetPosition.y * 0.1 + time);
}