varying float opacity;

vec3 hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}
void main() {
	if(dot(gl_PointCoord - 0.5, gl_PointCoord - 0.5) > 0.25) {
		discard;
	} else {
		gl_FragColor = vec4(hsv2rgb(vec3(sin(opacity), 0.8, 0.8)), 1.0);
	}
}

