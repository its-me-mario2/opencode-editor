import type { Clip, TransformProperties, BlendMode } from '@opencode/shared';
import { BlendRenderer } from './blending';
import { COMPOSITE_FRAGMENT_SHADER, VERTEX_SHADER_SOURCE } from './shaders';

export interface FrameBuffer {
  tex: WebGLTexture;
  fbo: WebGLFramebuffer;
  width: number;
  height: number;
}

export class WebGLCompositor {
  private gl: WebGL2RenderingContext;
  private blendRenderer: BlendRenderer;
  private mainProgram: WebGLProgram;
  private quadVAO: WebGLVertexArrayObject | null;
  private frameBuffers: FrameBuffer[];

  constructor(canvas: HTMLCanvasElement) {
    this.gl = canvas.getContext('webgl2', {
      alpha: true,
      premultipliedAlpha: true,
      preserveDrawingBuffer: true,
    })!;

    this.blendRenderer = new BlendRenderer(this.gl);
    this.mainProgram = this.createMainProgram();
    this.quadVAO = this.createQuad();
    this.frameBuffers = [];
  }

  initialize(width: number, height: number): void {
    const gl = this.gl;
    gl.viewport(0, 0, width, height);

    this.frameBuffers = [];
    for (let i = 0; i < 16; i++) {
      this.frameBuffers.push(this.createFrameBuffer(width, height));
    }
  }

  renderLayers(
    layers: { texture: WebGLTexture; opacity: number; blendMode: BlendMode }[],
  ): void {
    const gl = this.gl;

    if (layers.length === 0) return;

    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    if (layers.length === 1) {
      this.renderTextureToScreen(layers[0]!.texture);
      return;
    }

    let currentFB = 0;
    this.renderToFB(this.frameBuffers[currentFB]!, () => {
      this.renderTextureToFB(layers[0]!.texture);
    });

    for (let i = 1; i < layers.length; i++) {
      const nextFB = (currentFB + 1) % 2;
      this.renderToFB(this.frameBuffers[nextFB]!, () => {
        this.blendRenderer.composite(
          this.frameBuffers[currentFB]!.tex,
          layers[i]!.texture,
          layers[i]!.blendMode,
          layers[i]!.opacity,
        );
      });
      currentFB = nextFB;
    }

    this.blitToScreen(this.frameBuffers[currentFB]!.tex);
  }

  renderClip(
    clip: Clip,
    texture: WebGLTexture,
    canvasWidth: number,
    canvasHeight: number,
  ): WebGLTexture {
    const gl = this.gl;
    const fb = this.getScratchFB();

    this.renderToFB(fb, () => {
      this.applyTransform(clip.transform, canvasWidth, canvasHeight);
      this.renderTextureToScreen(texture);
    });

    return fb.tex;
  }

  createTextureFromFrame(frame: VideoFrame | ImageBitmap): WebGLTexture {
    const gl = this.gl;
    const tex = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, frame);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.bindTexture(gl.TEXTURE_2D, null);
    return tex;
  }

  deleteTexture(tex: WebGLTexture): void {
    this.gl.deleteTexture(tex);
  }

  private applyTransform(transform: TransformProperties, canvasW: number, canvasH: number): void {
    const gl = this.gl;
    gl.useProgram(this.mainProgram);
    gl.uniform2f(
      gl.getUniformLocation(this.mainProgram, 'u_translate'),
      transform.position.x / canvasW * 2,
      -transform.position.y / canvasH * 2,
    );
    gl.uniform2f(
      gl.getUniformLocation(this.mainProgram, 'u_scale'),
      transform.scale.x,
      transform.scale.y,
    );
    gl.uniform1f(
      gl.getUniformLocation(this.mainProgram, 'u_rotation'),
      (transform.rotation * Math.PI) / 180,
    );
    gl.uniform2f(
      gl.getUniformLocation(this.mainProgram, 'u_anchor'),
      transform.anchor.x * 2 - 1,
      -(transform.anchor.y * 2 - 1),
    );
  }

  private renderTextureToScreen(tex: WebGLTexture): void {
    const gl = this.gl;
    gl.useProgram(this.mainProgram);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.uniform1i(gl.getUniformLocation(this.mainProgram, 'u_texture'), 0);
    gl.bindVertexArray(this.quadVAO);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }

  private renderTextureToFB(tex: WebGLTexture): void {
    const gl = this.gl;
    gl.useProgram(this.mainProgram);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.uniform1i(gl.getUniformLocation(this.mainProgram, 'u_texture'), 0);
    gl.bindVertexArray(this.quadVAO);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }

  private renderToFB(fb: FrameBuffer, renderFn: () => void): void {
    const gl = this.gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb.fbo);
    gl.viewport(0, 0, fb.width, fb.height);
    renderFn();
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }

  private blitToScreen(tex: WebGLTexture): void {
    const gl = this.gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    this.renderTextureToScreen(tex);
  }

  private createFrameBuffer(width: number, height: number): FrameBuffer {
    const gl = this.gl;
    const tex = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    const fbo = gl.createFramebuffer()!;
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    return { tex, fbo, width, height };
  }

  private getScratchFB(): FrameBuffer {
    return this.frameBuffers[0]!;
  }

  private createMainProgram(): WebGLProgram {
    const gl = this.gl;
    const vs = this.compileShader(gl.VERTEX_SHADER, VERTEX_SHADER_SOURCE);
    const fs = this.compileShader(gl.FRAGMENT_SHADER, COMPOSITE_FRAGMENT_SHADER);
    const program = gl.createProgram()!;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw new Error(`Main compositor shader link error: ${gl.getProgramInfoLog(program)}`);
    }
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
    this.blendRenderer.dispose();
    this.gl.deleteProgram(this.mainProgram);
    for (const fb of this.frameBuffers) {
      this.gl.deleteTexture(fb.tex);
      this.gl.deleteFramebuffer(fb.fbo);
    }
  }
}
