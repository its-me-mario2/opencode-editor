import type { BlendMode } from '@opencode/shared';
import { getBlendFragmentShader, VERTEX_SHADER_SOURCE } from './shaders';

export class BlendRenderer {
  private gl: WebGL2RenderingContext;
  private programCache: Map<string, WebGLProgram>;
  private quadVAO: WebGLVertexArrayObject | null;

  constructor(gl: WebGL2RenderingContext) {
    this.gl = gl;
    this.programCache = new Map();
    this.quadVAO = this.createQuad();
  }

  composite(baseTex: WebGLTexture, blendTex: WebGLTexture, mode: BlendMode, opacity: number): void {
    const gl = this.gl;
    const program = this.getOrCreateProgram(mode);

    gl.useProgram(program);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, baseTex);
    gl.uniform1i(gl.getUniformLocation(program, 'u_baseTex'), 0);

    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, blendTex);
    gl.uniform1i(gl.getUniformLocation(program, 'u_blendTex'), 1);

    gl.uniform1f(gl.getUniformLocation(program, 'u_opacity'), opacity);

    gl.bindVertexArray(this.quadVAO);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }

  private getOrCreateProgram(mode: BlendMode): WebGLProgram {
    const cached = this.programCache.get(mode);
    if (cached) return cached;

    const gl = this.gl;
    const vs = this.compileShader(gl.VERTEX_SHADER, VERTEX_SHADER_SOURCE);
    const fs = this.compileShader(gl.FRAGMENT_SHADER, getBlendFragmentShader(mode));
    const program = gl.createProgram()!;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      const info = gl.getProgramInfoLog(program);
      gl.deleteProgram(program);
      throw new Error(`Blend shader link error for ${mode}: ${info}`);
    }

    this.programCache.set(mode, program);
    return program;
  }

  private compileShader(type: number, source: string): WebGLShader {
    const gl = this.gl;
    const shader = gl.createShader(type)!;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const info = gl.getShaderInfoLog(shader);
      gl.deleteShader(shader);
      throw new Error(`Shader compile error: ${info}`);
    }
    return shader;
  }

  private createQuad(): WebGLVertexArrayObject | null {
    const gl = this.gl;
    const vertices = new Float32Array([
      -1, -1, 0, 0,
       1, -1, 1, 0,
      -1,  1, 0, 1,
      -1,  1, 0, 1,
       1, -1, 1, 0,
       1,  1, 1, 1,
    ]);

    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    const vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 16, 0);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 16, 8);

    gl.bindVertexArray(null);
    return vao;
  }

  dispose(): void {
    for (const program of this.programCache.values()) {
      this.gl.deleteProgram(program);
    }
    this.programCache.clear();
  }
}
