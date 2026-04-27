// Triangle.js – 2D and 3D triangle draw utilities

var g_triangleBuffer = null;

// ── drawTriangle3D(vertices) ─────────────────────────────────────────
// Draws one triangle using XYZ (3 floats per vertex, 9 floats total)
function drawTriangle3D(vertices) {
  if (g_triangleBuffer === null) {
    g_triangleBuffer = gl.createBuffer();
    if (!g_triangleBuffer) { console.log('Failed to create buffer'); return; }
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, g_triangleBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);
  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(a_Position);
  gl.drawArrays(gl.TRIANGLES, 0, 3);
}
