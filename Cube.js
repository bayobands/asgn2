// Cube.js – Draws a unit cube (-0.5 to 0.5) using 12 triangles (6 faces)
// Fake lighting: each face has a slightly different brightness so you can
// tell them apart without real lighting. Matches lecture tutorial approach.

class Cube {
  constructor() {
    this.type  = 'cube';
    this.color = [1.0, 1.0, 1.0, 1.0]; // [r, g, b, a]
    this.matrix = new Matrix4();         // model matrix
  }

  // ── render(matrix) ─────────────────────────────────────────────────
  // Draws the cube using the provided Matrix4 (or this.matrix if none given)
  render() {
    var M = this.matrix;
    var rgba = this.color;

    // Pass the model matrix to the shader
    gl.uniformMatrix4fv(u_ModelMatrix, false, M.elements);

    // ── Front face  (z = +0.5)  brightness 1.0
    gl.uniform4f(u_FragColor, rgba[0]*1.0, rgba[1]*1.0, rgba[2]*1.0, rgba[3]);
    drawTriangle3D([ -0.5,-0.5, 0.5,   0.5,-0.5, 0.5,   0.5, 0.5, 0.5]);
    drawTriangle3D([ -0.5,-0.5, 0.5,   0.5, 0.5, 0.5,  -0.5, 0.5, 0.5]);

    // ── Back face   (z = -0.5)  brightness 0.8
    gl.uniform4f(u_FragColor, rgba[0]*0.8, rgba[1]*0.8, rgba[2]*0.8, rgba[3]);
    drawTriangle3D([  0.5,-0.5,-0.5,  -0.5,-0.5,-0.5,  -0.5, 0.5,-0.5]);
    drawTriangle3D([  0.5,-0.5,-0.5,  -0.5, 0.5,-0.5,   0.5, 0.5,-0.5]);

    // ── Left face   (x = -0.5)  brightness 0.9
    gl.uniform4f(u_FragColor, rgba[0]*0.9, rgba[1]*0.9, rgba[2]*0.9, rgba[3]);
    drawTriangle3D([ -0.5,-0.5,-0.5,  -0.5,-0.5, 0.5,  -0.5, 0.5, 0.5]);
    drawTriangle3D([ -0.5,-0.5,-0.5,  -0.5, 0.5, 0.5,  -0.5, 0.5,-0.5]);

    // ── Right face  (x = +0.5)  brightness 0.9
    gl.uniform4f(u_FragColor, rgba[0]*0.9, rgba[1]*0.9, rgba[2]*0.9, rgba[3]);
    drawTriangle3D([  0.5,-0.5, 0.5,   0.5,-0.5,-0.5,   0.5, 0.5,-0.5]);
    drawTriangle3D([  0.5,-0.5, 0.5,   0.5, 0.5,-0.5,   0.5, 0.5, 0.5]);

    // ── Top face    (y = +0.5)  brightness 1.0
    gl.uniform4f(u_FragColor, rgba[0]*1.0, rgba[1]*1.0, rgba[2]*1.0, rgba[3]);
    drawTriangle3D([ -0.5, 0.5, 0.5,   0.5, 0.5, 0.5,   0.5, 0.5,-0.5]);
    drawTriangle3D([ -0.5, 0.5, 0.5,   0.5, 0.5,-0.5,  -0.5, 0.5,-0.5]);

    // ── Bottom face (y = -0.5)  brightness 0.7
    gl.uniform4f(u_FragColor, rgba[0]*0.7, rgba[1]*0.7, rgba[2]*0.7, rgba[3]);
    drawTriangle3D([  0.5,-0.5, 0.5,  -0.5,-0.5, 0.5,  -0.5,-0.5,-0.5]);
    drawTriangle3D([  0.5,-0.5, 0.5,  -0.5,-0.5,-0.5,   0.5,-0.5,-0.5]);
  }
}
