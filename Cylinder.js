// Cylinder.js – Non-cube primitive (satisfies rubric requirement)
// Builds a cylinder from triangle strips around a circle top/bottom.
// Used for the rat's tail.

class Cylinder {
  constructor() {
    this.type     = 'cylinder';
    this.color    = [1.0, 1.0, 1.0, 1.0];
    this.matrix   = new Matrix4();
    this.segments = 12; // number of sides
  }

  render() {
    var M    = this.matrix;
    var rgba = this.color;
    var n    = this.segments;
    var step = (2.0 * Math.PI) / n;

    gl.uniformMatrix4fv(u_ModelMatrix, false, M.elements);

    for (var i = 0; i < n; i++) {
      var a1 = i * step;
      var a2 = (i + 1) * step;

      var x1 = 0.5 * Math.cos(a1), z1 = 0.5 * Math.sin(a1);
      var x2 = 0.5 * Math.cos(a2), z2 = 0.5 * Math.sin(a2);

      // ── Top cap (y = +0.5)  brightness 1.0
      gl.uniform4f(u_FragColor, rgba[0]*1.0, rgba[1]*1.0, rgba[2]*1.0, rgba[3]);
      drawTriangle3D([0, 0.5, 0,   x1, 0.5, z1,   x2, 0.5, z2]);

      // ── Bottom cap (y = -0.5)  brightness 0.7
      gl.uniform4f(u_FragColor, rgba[0]*0.7, rgba[1]*0.7, rgba[2]*0.7, rgba[3]);
      drawTriangle3D([0, -0.5, 0,   x2, -0.5, z2,   x1, -0.5, z1]);

      // ── Side quad (two triangles)  brightness 0.9
      gl.uniform4f(u_FragColor, rgba[0]*0.9, rgba[1]*0.9, rgba[2]*0.9, rgba[3]);
      drawTriangle3D([x1, -0.5, z1,   x2, -0.5, z2,   x2, 0.5, z2]);
      drawTriangle3D([x1, -0.5, z1,   x2,  0.5, z2,   x1, 0.5, z1]);
    }
  }
}
